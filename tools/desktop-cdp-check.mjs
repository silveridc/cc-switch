// 桌面版旧 UI 的真机验收：连到 WebView2 已经开出来的 CDP 端口，在页面里跑断言。
// 与 browser-e2e.mjs 的区别：那个脚本自己起无头 Chrome 打 web 版，这个连的是原生窗口。
//
// 前提：exe 用 WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<port> 启动，
//       端口必须现挑（固定端口会撞上别的项目在跑的 CDP）。
// 用法：node tools/desktop-cdp-check.mjs <port> [命令名,逗号分隔]
//
// 零依赖：Node 24 起 WebSocket / fetch 都是全局。

const PORT = Number(process.argv[2]);
if (!PORT) {
  console.error("用法: node tools/desktop-cdp-check.mjs <cdp端口>");
  process.exit(2);
}
// 旧 UI 实际会带参数调用这些命令，探针必须照抄参数，否则报的是"缺 key"而不是真故障。
const TABLE = {
  get_providers: { app: "claude" },
  get_current_provider: { app: "claude" },
  get_config_status: { app: "claude" },
  get_settings: {},
  get_stream_check_config: {},
  get_default_cost_multiplier: { appType: "claude" },
  get_common_config_snippet: { appType: "claude" },
  get_claude_desktop_status: {},
};
const NAMES = process.argv[3] ? process.argv[3].split(",") : Object.keys(TABLE);

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find(
  (t) => t.type === "page" && /(tauri\.localhost|localhost:\d+)/.test(t.url)
);
if (!page) {
  console.error("没找到应用页面 target，现有 target：", targets.map((t) => `${t.type} ${t.url}`));
  process.exit(2);
}
console.log(`连接页面：${page.url}`);

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", () => reject(new Error("CDP WebSocket 连接失败")), { once: true });
});

let msgId = 0;
const pending = new Map();
const pageErrors = [];
const consoleErrors = [];

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (msg.method === "Runtime.exceptionThrown") {
    pageErrors.push(
      msg.params.exceptionDetails?.exception?.description ??
        msg.params.exceptionDetails?.text ??
        "unknown"
    );
  }
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    consoleErrors.push(
      msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(" ")
    );
  }
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const res = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) {
    const d = res.exceptionDetails;
    throw new Error(d.exception?.description ?? d.text ?? JSON.stringify(d));
  }
  return res.result.value;
};

await send("Runtime.enable");

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

// 1) 页面确实渲染出了旧 UI，而不是白屏
const mounted = await evaluate(
  `(() => { const r = document.getElementById("root"); return { kids: r ? r.children.length : -1, title: document.title, body: document.body.innerText.length }; })()`
);
check("React 已挂载", mounted.kids > 0, JSON.stringify(mounted));
const text = await evaluate(`document.body.innerText.slice(0, 400)`);
check("正文有内容", mounted.body > 100, `innerText ${mounted.body} 字符：${text.replace(/\n/g, " / ")}`);

// 2) 走的是真实 Tauri transport，不是 web shim
const hasInternals = await evaluate(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`);
check("window.__TAURI_INTERNALS__.invoke 可用", hasInternals === true);

// 3) 旧 UI 要的命令逐条真调用（含 §3.4 移植的那几条）
for (const cmd of NAMES) {
  const args = JSON.stringify(TABLE[cmd] ?? {});
  const out = await evaluate(
    `(async () => { try {` +
      ` const v = await window.__TAURI_INTERNALS__.invoke(${JSON.stringify(cmd)}, ${args});` +
      ` return { ok: true, shape: Array.isArray(v) ? "array(" + v.length + ")" : typeof v,` +
      `   preview: JSON.stringify(v).slice(0, 160) };` +
      ` } catch (e) { return { ok: false, err: String((e && e.message) || e).slice(0, 240) }; } })()`
  );
  check(
    `invoke ${cmd}`,
    out?.ok === true,
    out?.ok ? `${out.shape} ${out.preview}` : out?.err
  );
}

// 4) 页面自己报的错：ACL 拒绝、插件缺失、未注册命令都会落在这里
check("无未捕获异常", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
check("无 console.error", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

ws.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} 通过`);
process.exit(failed ? 1 : 0);
