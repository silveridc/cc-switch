# 交接文档：旧前端（v3.20.4）复活 + Web 版 + Linux 无头单二进制

> 写给下一位接手的 AI/工程师。读完这一份就能接着干，不需要翻历史对话。
> 所有"已验证"的结论都标了复现命令；标"未验证/推断"的不要当事实用。

**当前状态（2026-10-21 收尾；2026-10-22 追加 §11 只读评审 + §12 本地干净克隆实测与新工作流 + §13 桌面版旧 UI；2026-10-24 追加 §13.9 无头二进制重编与 CLI 侧复验；2026-10-25 追加 §13.10 EL9 产物重编 + §13.11 本机 WSL 实部署 + §14 浏览器导入导出 + §15 链接归属 + §16 格式化与 EL9 二次重编部署；2026-10-30 追加 §17 上游盘点 + §18 合上游 v4.0.22；2026-11-01 追加 §19 本机 release 单二进制试玩；2026-11-05 追加 §20 桌面版 release 产物 + 一起沙箱没挡住真实库的事故 + §20.5 直接部署真实环境 + §20.6 会话页崩溃按 §13.8 ① 修好 + §20.7 浏览器版重编与 Inno 安装包）**：
- 旧前端已在真浏览器里跑通：E2E **16/16**（`stream_check.rs:48` 改动后重编二进制、重启服务又跑了两遍，§3.5）。
- Rust 全量单测 **3763 通过 / 0 失败 / 11 ignored**（要带 `NO_PROXY=127.0.0.1,localhost`，之前那两个"失败"
  是本机 Windows 系统代理造成的假失败，根因与对照实验见 §3.5 备注）。
- 6 条 v3 命令移植完成，Windows + Linux（原生二进制 / 容器）**双侧都有 HTTP 实测**；成本倍率已按用户拍板
  处理完（**只补命令 + 加说明**，§6.1），不再有等功能决策。
- 部署产物两条路都已重编复验（见下方 ✅）。`src-legacy/` 仍与 tag `v3.20.4` 逐字节一致（§2 的核验命令）。
  **但 §13.7 之后这条要打折**：CSS 构建配置修好了，EL9 二进制 / 容器镜像 / 旧 UI 的 MSI 都还是修复前产物，得重编（§13.7 影响面）。
  **Windows 侧的无头单二进制（§13.9）与 EL9 原生单二进制（§13.10）已按修复后重编并复验**；还欠容器镜像与 MSI。
- 本机现场已清理（§6.3），只剩 `.e2e-home` 与在跑的 14515。
- **改动集已提交并推送**（`0912b6c1`，578 个文件），push 触发的 `ci.yml` **六个 job 全绿**（§12.5）。
  新增的 `build-artifacts.yml` 只注册未运行，等手动 dispatch。

**剩下**：① §11 里那 5 条行为决策 + 仓库卫生的 ⑩⑪，仍等你拍板；② **§13 这批改动还没提交**
（`Cargo.toml`/`Cargo.lock`/`package.json`/`tauri.legacy.conf.json`/`tools/desktop-cdp-check.mjs`/
`src/bin/server.rs → src/headless_main.rs` 改名/本文档），推送与否等你说；
③ §13.6 末尾那条"两套 UI 的 MSI 同名"要不要区分，是交付形态决策，等你拍板；
④ 要不要给 `ci.yml` 补一条 **headless 特性的 clippy**（这次就是它抓不到 `headless/server.rs:181` 的空转换，§13.6）——
动现有 CI 门，也等你拍板；
⑤ ~~**§13.8 会话管理页必崩**~~ **2026-11-05 已按推荐的 ①（传输层补字段）修好并真机复验**，
桌面版当场就能开会话页了；web/无头侧同一份适配，**`dist-legacy` 与 Windows 无头 exe 也已于 11-05 13:05 重编并 19/19 复验**；剩下 EL9 单二进制与容器镜像仍是修复前产物，见 §20.6 / §20.7；
⑥ §13.7 修完 CSS 之后，**EL9 单二进制 / 容器镜像 / 旧 UI 的 MSI 全是修复前的产物**，要不要现在重编三连
→ **Windows 无头 release（§13.9）与 EL9 原生单二进制（§13.10，就是要丢服务器的那个文件）都已重编并复验**；
剩下的只有容器镜像 `:dev`、旧 UI 的 MSI、桌面 release `target/release/cc-switch.exe`。
（`src-legacy/tailwind.legacy.config.cjs` 那个已废弃的 `postcss.legacy.config.cjs` 删不删也算在 ⑥ 里。）
（功能活至此**全部做完**：桌面版旧 UI 已落地并真机验证，见 §13。）
（`deploy/Dockerfile.old-glibc` 这个 zig 废案**已按用户指示删除**，连配套的 `tools/wsl-oldglibc-build.sh` 一起。）
> ✅ 部署产物**两条路都已在 2026-10-21 重编并复验**：EL9 原生单二进制（§5.6，sha256 `a6d2346d…`）
> 与容器镜像 `localhost/cc-switch-server:dev`（id `03e4b1ffea13`）。两者的页面资源与本地
> `pnpm build:legacy:web` 产物**逐字节一致**（`assets/index-0hufZJV7.js` md5 `36d6ce687c924c223f220fa06fcb8d38`），
> 倍率两条命令在 Linux 侧也已实测。发布前想再确认一遍就跑 `tools/wsl-el9-copy-check.sh`。
> **2026-10-24 更新**：EL9 原生单二进制又重编了一次（§13.10），sha256 以那里的 `11931503…` 为准，
> `a6d2346d…` 是 §13.7 CSS 修复之前的产物。
> **2026-10-25 最终（以这条为准）**：EL9 单二进制再重编并**已装进本机 WSL 的 14515 服务**（§16.2/§16.3），
> sha256 `1377a492…`（39,044,280 B）取代 `11931503…`；这一版同时含 §14（浏览器导入导出）与 §15（链接归属），
> 在隔离实例上跑 `io-e2e` **11/11**、`links-e2e` **3/3**、`browser-e2e` **16/16**。旧二进制留了备份，见 §16.3。
> **2026-10-30 / 11-01 再看一眼**：上游已合到 **v4.0.22**（§18，分支 `zhaoyj7/merge-upstream-4.0.22-20261030` = `ef595e0a`，已推送），
> 本机 Windows 上跑的是**合并后的 release 单二进制**（§19，sha256 `84061cc9…`，`browser-e2e` 16/16 就在它上面跑的）；
> **WSL 14515 那个服务还是合并前的 `1377a492…`（v4.0.15 / DB v23）**，两边现在不是一个版本。
> **2026-11-05 桌面版（看这里，§20）**：Windows 桌面旧 UI 的 release 产物重编好了 —— `target/release/cc-switch.exe`
> sha256 `90514e95…`（47,406,080 B）+ MSI `1834f39b…`（**没装，也不建议装**，identifier 和官方版同名）；
> 先在 `.ci-sandbox/desktop-play` 沙箱 home 上复验过（种子=用户真实库 v20 的完整副本），`desktop-cdp-check` 13/13；
> 11-05 11:06 又按用户要求**直接部署到真实环境**（不设沙箱变量，pid 728，§20.5：真实库合法迁到 v24，回退文件已留）。
> 同一节还记了一起**沙箱没挡住真实库**的事故（`.ps1` 中文注释吞掉环境变量赋值 → 真实库被迁 v24 并裁剪日志），
> **已用应用自己的 01:57:57 备份逐字节回滚**（sha256 `69a869f1…`），`~/.claude` 全程没动过。
> **同日 12:20 用户真点出 §13.8 那个会话管理页崩溃**（切换本身两次都成功），12:47 按 §13.8 ① 修好重编交付，
> 新 exe sha256 `c476b97e…`，会话页 194 条消息正常显示、`desktop-cdp-check` 13/13 —— 细节 §20.6。
> **同日 13:34 浏览器版也重编好了**（`dist-legacy` → `index-tuveGerf.js` + 内嵌它的 `cc-switch-server.exe` `9ff95c03…`，
> `tools/browser-e2e.mjs` 加了 3 条会话页断言，**19/19**），并新增一个 **Inno Setup 安装包**
> `installer/Output/cc-switch-legacy-4.0.22-x64-setup.exe`（13.5 MB，`71091f85…`，AppId/显示名/目录都和官方版不同，
> 装+卸都在本机真验过）—— 细节 §20.7。EL9 产物与容器镜像仍是修复前的。
> §19 那个 14540 无头服务此刻**没在跑**。

---

## 1. 任务目标（用户原始意图，未变）

1. 仓库 `D:\projects\ccs` 是 `https://github.com/zhaoyj7/cc-switch.git` 的克隆，当前代码是 **v4.0.15** 后端。
2. 把 **v3.20.4 的旧前端**从 git 历史里复活出来，做成能在**浏览器**里跑的版本。
3. 产出一个 **"onlybackend" 无头单二进制**，部署到**没有显示器的 Linux 服务器**：同一个可执行文件同时提供 API 和页面。
4. 旧 UI 需要的功能要**移植到最新 v4.0.15 后端**上。
5. 用 WSL2 + Rust 做真机验证。

## 2. 硬约束（用户明确说过，违反会被打回）

| 约束 | 说明 |
| --- | --- |
| `src-legacy/` 必须与 v3.20.4 **逐字节一致** | 所有适配只能发生在 vite 配置和 `web/transport/*` shim 里。禁止就地改 `src-legacy` 任何一行。**核验命令**（2026-10-20 实测：两边各 462 个文件，`diff -r` 退出码 0）：`TMPD=$(mktemp -d) && git archive v3.20.4 src \| tar -x -C "$TMPD" && diff -r "$TMPD/src" src-legacy`（Git Bash / WSL 都能跑；`v3.20.4` 是本仓库的 tag） |
| **不要**改用户的 WSL `/root/.gitconfig` | 里面有 `http.proxy = http://127.0.0.1:7890`，会让 cargo fetch 挂掉。绕过方式：每次调用加 `--config "http.proxy=\"\""` |
| 极简主义 | 不要顺手重构、不要加无关的抽象/mapper/wrapper、不要为假想的未来需求设计 |
| 每个结论要有证据 | 性能/正确性类的主张必须带实测证据；静默失败类的工作要附一个守卫测试 |
| 行为差异要报告、不要自己拍板 | 发现 v3/v4 行为或文案不一致，按 `文件:行号` 报给用户，由用户决定 |
| 绝不手改 lock 文件 | `package-lock.json` / `Cargo.lock` 只能由工具生成 |
| 注释默认不写 | 只在"为什么"不显然处写一行中文注释，不解释"做了什么" |
| 前端改动要真机验证 | 用真实无头 Chrome 走 CDP（`tools/browser-e2e.mjs`），不要只靠 typecheck/单测 |

## 3. 已完成且已验证的部分

### 3.1 旧前端复活（Windows 侧）
- `src-legacy/` = `git show v3.20.4` 抽出的完整旧前端源码。
- 构建配置：`vite.legacy.config.ts`（root=`src-legacy`，outDir=`dist-legacy`，`@/` 指向 `src-legacy/`）、`tsconfig.legacy.json`、`tailwind.legacy.config.cjs`、`postcss.legacy.config.cjs`。
- `package.json` 新增脚本：`dev:legacy`、`build:legacy`、`dev:legacy:web`、`build:legacy:web`、`typecheck:legacy`。
- `--mode web`（或 `CC_UI_TRANSPORT=web`）时，9 个 `@tauri-apps/*` 说明符被 alias 到 `web/transport/*.ts`：
  `api/core`、`api/event`、`api/window`、`api/app`、`api/path`、`plugin-dialog`、`plugin-log`、`plugin-process`、`plugin-updater`。

### 3.2 无头后端（v4 侧新增）
- `src-tauri/src/bin/server.rs`：CLI `--bind/--port/--token/--data-dir`，非 loopback 绑定强制要求 token。
- `src-tauri/src/headless/`：
  - `server.rs` — axum 路由：`POST /api/invoke`、`GET /api/events`(SSE)、`GET /api/health`、`GET /api/meta`、`/*path`(内嵌前端)。`require_token` 保护除 health 外的 `/api/*`。
  - `events.rs` — 事件桥，只转发旧前端真正监听的 **8** 个事件名。
  - `assets.rs` — `rust-embed` 内嵌 `../dist-legacy`，实现单二进制。
  - `bootstrap.rs` / `stubs.rs` — `tauri::test` MockRuntime 装配 + 无头空实现。
- `src-tauri/src/compat.rs` — `AppHandle` 等类型别名，桌面/无头共用一份上层代码。
- `src-tauri/src/setup.rs`、`lightweight_headless.rs`、`tray_headless.rs`、`tray_panel_headless.rs` — 无头替身。
- `src-tauri/src/command_handler.rs` — 命令注册表。
- `src-tauri/build.rs` 改动：**非 desktop 特性时**跳过 capability 扫描（否则 capabilities 引用的 opener/dialog 权限在无头下不存在，编译失败）。
- `src-tauri/Cargo.toml` 改动：Linux 的 `webkit2gtk` / `gtk` 改成 optional，只由 `desktop` 特性经 `dep:` 拉入。

### 3.3 Web transport shim（`web/`）
- `web/client.ts` — token 从 URL query 读取，存 localStorage key **`cc-switch-web-token`**；SSE 用 `EventSource('/api/events?token=...')`。
- `web/transport/core.ts` — `invoke` 走 HTTP；内含 `RESULT_ADAPT`，把 v4 的「结果+失败列表」结构解包成旧前端期望的裸数组（3 条 skill 命令，见 §6.1）。

### 3.4 移植的 6 条 v3 命令（`src-tauri/src/commands/`）
`get_stream_check_config`、`save_stream_check_config`、`stream_check_all_providers`、
`update_toml_common_config_snippet`、`get_default_cost_multiplier`、`set_default_cost_multiplier`。
- 逐条对照 `git show v3.20.4:...` 移植，行为保持一致（含 `category == "official"` 跳过、`proxy_targets_only` 过滤）。
- **一处有意的偏离**：`stream_check_all_providers` 里 v3 的 `db.get_current_provider()` 换成了
  `mode::current::provider_for(..., Purpose::InUse)`（`commands/stream_check.rs:48`）。
  原因不是风格：`mode/current.rs` 有一个源码扫描守卫测试
  `current_provider_is_read_through_provider_for`，禁止在 `mode::current` 之外直接读当前供应商；
  照抄 v3 会让 `cargo test --lib` 红。语义等价（接管中真正跑流量的那家）。
- **故意没移植**：v3 的 `save_stream_check_log` 和 `model_used` —— v4 的结构体/表里没有对应字段。
- `services/stream_check.rs` 的 `StreamCheckConfig` 重新加了 `#[derive(Serialize, Deserialize)] #[serde(rename_all="camelCase")]`，配置落到 settings 键值表（v4 已删掉 `stream_check_config` 表）。
- 倍率那两条只读写 `proxy_config.default_cost_multiplier` 列，**不进任何计费计算**（决策见 §6.1）。
- 完整清单与逐条实机验证记录在 **`tools/cmd-compat.md`**（尤其第五、六节）。

### 3.5 已跑通的验证（证据）
| 验证项 | 结果 | 复现 |
| --- | --- | --- |
| 浏览器 E2E | **16/16 通过**，无 console error | `node tools/browser-e2e.mjs`（真机 Chrome 走 CDP） |
| 6 条移植命令 | Windows + Linux 双侧 HTTP 实测通过 | `curl -X POST http://127.0.0.1:14515/api/invoke -d '{"cmd":"...","args":{...}}'`（字段名是 **`cmd`**，见 `headless/server.rs:45`） |
| SSE 事件桥 | 后端 `emit` → 浏览器收到帧 | `tools/browser-e2e.mjs` 里的 `create_profile`+`apply_profile` 断言 |
| token 门禁 | 非 loopback 无 token 被拒 | `tools/wsl-el9-public.sh` |
| 重启持久化 | 数据在容器重建/重启后保留 | `tools/wsl-el9-persistence.sh`（**必须用命名 volume**） |
| 容器产出的页面字节 | 与本地构建**逐字节一致** | `tools/wsl-el9-verify.sh` |
| **EL9 原生单二进制（无容器）** | **宿主直接跑通**：health/meta/页面 md5 一致/DB 读写往返/SIGTERM 干净退出 | `tools/wsl-el9-native-build.sh` + `tools/wsl-el9-native-smoke.sh`（详见 §5.6） |
| 交接前的最终复跑（2026-10-19） | 浏览器 E2E **10/10 再次通过**（23 次 invoke 全成功、SSE 两帧到达、无应用级报错） | `node tools/browser-e2e.mjs` |
| 倍率两条命令（HTTP） | 往返 + 校验错误都对：`"1"` → 设 `1.5` → `"1.5"`；`-2`/`abc`/`""` 各自报本地化错误 | `curl -X POST http://127.0.0.1:14515/api/invoke -d '{"cmd":"set_default_cost_multiplier","args":{"appType":"claude","value":"1.5"}}'` |
| 倍率不进计费 | 上游守卫测试仍然绿（把列改回可写之后依然绿） | `tools/rust.cmd test --lib --features test-hooks ignores_legacy_multiplier` |
| 面板文案（真浏览器） | 设置→使用统计→成本定价 的表头实际渲染成 **「默认倍率（v4 计费不使用）」**，同一行的输入框读到库里真实的 `1.75` | `node tools/browser-e2e.mjs`（第 12–14 项断言） |
| 供应商表单文案（真浏览器） | 编辑弹窗里 `#cost-multiplier` / `#pricing-model-source` 下方两行 Hint 已换成「v4 不再使用/只读全局」 | 同上（第 10–11 项断言） |
| Rust 全量单测（Windows MSVC） | **3763 通过 / 0 失败 / 11 ignored（41.63s，exit 0）** —— 命令：`set NO_PROXY=127.0.0.1,localhost` 后 `tools/rust.cmd test --lib --features test-hooks` | 之前那篇记录的「3761 通过 / 2 失败」两个失败**都是本机代理造成的假失败**，带上 `NO_PROXY` 后全绿；根因与三组对照见下方备注 |
| `stream_check.rs:48` 改动后的复跑（2026-10-20） | 三道门 `gate1=0 gate2=0 gate3=0`；`test --lib --features test-hooks stream_check` **13 通过 / 0 失败**（含守卫测试 `current_provider_is_read_through_provider_for`）；重编无头二进制并重启后浏览器 E2E **16/16 再次通过**（25 次 invoke 全成功） | `tools\rust.cmd test --lib --features test-hooks stream_check` + `node tools/browser-e2e.mjs` |
| `proxyTargetsOnly` 过滤语义未被改动破坏（HTTP） | 临时探测目标 `127.0.0.1:18099` + 两个测试供应商：`proxyTargetsOnly=true` 只返回正在跑流量的那家 `['e2e-probe-p']`，`false` 返回全部 `['e2e-idle-p','e2e-probe-p']`，无 panic、无 500 | 一次性 Node 探针，**现场已回收**（§6.3）；重跑办法：起一个监听 18099 的空 HTTP 服务 → `create_provider` 两家指向它 → `switch_provider` 到其中一家 → `stream_check_all_providers` 带/不带 `proxyTargetsOnly` 对比 `results` 里的 id |
| `src-legacy` 未被污染（硬约束） | 与 tag `v3.20.4` 的 `src/` **逐字节一致**：两边各 462 个文件，`diff -r` 退出码 **0** | 命令见 §2 表第一行（`git archive v3.20.4 src \| tar -x` + `diff -r`） |
| **EL9 原生产物重编（2026-10-21 00:06）** | `build-status=0`，cargo release 7m58s；产物 `/root/ccs-deploy/cc-switch-server-el9`（39048248 B，**sha256 `a6d2346dd9f5c6330f3e13dae173c2394da5eee32b53210b19a1660584d3a171`**）；verneed 最高 `GLIBC_2.34`、`hypot@GLIBC_2.2.5`，无 2.35+ | `tools/wsl-el9-native-build.sh`（**必须带 `--http-proxy=false`**，见 §9）+ `/root/ccs-el9-native.log` |
| 重编后的 EL9 二进制仍原生可跑 + 新命令可用 | 裸跑冒烟全绿：health/meta、`index.html` md5 与本地一致、`stream_check` 配置往返、**倍率 `"1"`→设 `2.5`→读回 `"2.5"`、`-1` 被拒**（`无效倍率: -1 - 倍率不能为负数`）、SIGTERM 干净退出 | `tools/wsl-el9-native-smoke.sh /root/ccs-deploy/cc-switch-server-el9`（脚本已加倍率那一段） |
| EL9 二进制里**嵌的是新 UI**（不是"命令加了页面还是旧的"） | 服务出去的 `assets/index-0hufZJV7.js` md5 `36d6ce687c924c223f220fa06fcb8d38`，与本地 `dist-legacy` **完全一致**；四种语言的「v4 不使用倍率」文案各命中 1 次；同一二进制上倍率 `"1"`→`3.25` | `tools/wsl-el9-copy-check.sh`（新增的守卫脚本，可当发布前检查用） |
| **容器镜像重编（2026-10-21）** | `build-status=0`，`localhost/cc-switch-server:dev` → id `03e4b1ffea13`；用新镜像重建 `ccs-e2e` 后：页面资源 md5 同样 `36d6ce68…`（**PAGE-MATCH=yes**）、4 语言文案各命中 1 次、倍率 `"1"`→`2.5`→`-1` 报本地化错误、SSE 两帧到达、`stream_check` 打出 `operational/77ms` | `tools/wsl-podman-build.sh` + `tools/wsl-el9-container-test.sh`（两个脚本都已加 `--http-proxy=false` / 新增断言） |
| 新镜像的重启持久化与令牌门 | 容器重启后配置与供应商都还在（`4/1/2500`、`el9-local`）；对外监听时 `authRequired=true`、无令牌 invoke **401**、带令牌正常 | `tools/wsl-el9-persistence.sh`、`tools/wsl-el9-public.sh`（2026-10-21 在新镜像上复跑） |

> 那两个"失败"的定位过程（2026-10-20 提出 → **2026-10-21 根因确认，带 `NO_PROXY` 后全量 3763/0 绿**）：
> - `proxy::error::tests::describe_reqwest_error_keeps_cause_and_drops_url`（`src/proxy/error.rs:270`）：
>   测试「绑一个随机端口→释放→期望连接被拒」，实际收到 **502（`connection: close`、`content-length: 0`）**。
>   **根因 = 本机的 Windows 系统代理**（HKCU `ProxyEnable=1`、`ProxyServer=127.0.0.1:7890`）。
>   reqwest 0.12 的 `Client::new()` 除了读 `*_proxy` 环境变量，还会读 Windows 注册表里的系统代理，
>   所以那个"已经释放的端口"的请求其实被交给 127.0.0.1:7890，代理对不可达上游回了 502。三组对照实测：
>   ① 裸跑（Git Bash/cmd 里**没有**任何 `*_PROXY`）→ FAIL，报 `status: 502`；
>   ② `NO_PROXY=127.0.0.1,localhost` 再跑 → **PASS**；
>   ③ `HTTP_PROXY=http://127.0.0.1:7890` 再跑 → FAIL（与 ① 同一条 502）。
>   旁证：`curl -x http://127.0.0.1:7890 http://127.0.0.1:11813/v1/responses` → **502**，
>   而 `curl --noproxy '*'` 同一个地址 → 连接被拒。`src/proxy/error.rs` 与 `Cargo.toml` 的 reqwest 行都没动过。
>   **以后跑这套测试就带上**：`NO_PROXY=127.0.0.1,localhost tools\rust.cmd test --lib --features test-hooks`。
>   （Linux/容器侧没这个问题：容器里没注册表，WSL 那个 127.0.0.1:7890 也够不着，见 §9 的 `--http-proxy=false`。）
> - `proxy::server::tests::responses_websocket_handshake_is_answered_with_upgrade_required`：
>   全量并发跑时报 `10053 连接被主机中的软件中止`，**单独跑（`-- --exact --test-threads=1`）通过** → 并发 flake。
>   2026-10-21 那次带 `NO_PROXY` 的**默认并发全量跑里它是通过的**，所以它是偶发（负载/端口时机），
>   与代理那条无关；真复现时先用 `--test-threads=1` 隔离，别改测试逻辑。

### 3.6 旧前端的文案覆盖层（`web/i18n/`，新增机制）
`src-legacy` 不许改一个字，但有些文案必须讲清楚（§6.1）。做法是**构建期别名**：
`vite.legacy.config.ts` 里的 `I18N_OVERRIDES` 把 `src-legacy/i18n/index.ts` 的
`"./locales/xx.json"` 相对说明符换成 `web/i18n/xx.ts`，后者 `import` 原始 JSON 再用
`withCopyOverrides(messages, {"a.b.c": "新文案"})` 深拷贝覆盖指定路径。
- vite 的 `resolve.alias` 对**相对**说明符同样生效（`find` 用 `^\.\/locales\/zh\.json$` 这种锚定正则）。
- 别名是**无条件**加的（桌面/ web 两种模式都覆盖）：旧 UI 在本仓库里永远配 v4 后端，说明与传输方式无关。
- 只有 4 个 locale 文件走这条路（`en/ja/zh/zh-TW`），全仓库只有 `i18n/index.ts` 引它们，别名字面量不会
  误伤别的 import。
- 加新覆盖项 = 往 `web/i18n/<locale>.ts` 的对象里加一行，键名用组件里 `t(...)` 的**实际渲染键**
  （面板表头是 `settings.globalProxy.defaultCostMultiplierLabel`，`…Hint` 那个键组件里没用到）。

## 4. 部署产物（`deploy/`）
- `Dockerfile` — 3 阶段：`node:22.12.0-slim`（`npm install -g pnpm@10.12.3` → `pnpm install --frozen-lockfile` → `pnpm build:legacy:web`）→ `rust:1-bookworm`（装 `pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev`，`cargo build --release --no-default-features --features headless --bin cc-switch-server`）→ `debian:bookworm-slim` 运行层。
- `Dockerfile.el9-native` — 产出**可在 CentOS Stream 9 原生直接跑**的单二进制（§5.6 已闭环）。
- `cc-switch-server.service` — systemd 单元（`DynamicUser`、`StateDirectory=cc-switch`、`ProtectSystem=strict`、`EnvironmentFile=-/etc/cc-switch/server.env`）。
- `.dockerignore` — 排除 `node_modules/.git/dist/dist-legacy/src-tauri/target/.e2e-*`，**保留** `src-tauri/gen` 和 `src-tauri/icons`（tauri-build 需要）。

## 5. Linux / CentOS Stream 9 调查结论（本次会话的主要未决点）

用户环境：**WSL2 里的 CentOS Stream 9**，已装 podman（用户同意装的）。
用户问"我这个 centos9 不行吗"，答案是**分两半**：

### 5.1 不能在 EL9 上原生编译（已实测）
- 根因：`tauri` 和 `tauri-runtime` 在 Linux 上把 `gtk` + `webkit2gtk` 声明为**非可选**依赖；`muda` 也带 `gtk3`。
- `glib-sys 0.18` 要求 `glib-2.0 >= 2.70`，EL9 只有 **2.68.4**。
- EL9 任何仓库都**没有** `webkit2gtk-4.1`（用 `repoquery --whatprovides 'pkg-config(webkit2gtk-4.1)'` 确认过）。
- 我对 `Cargo.toml` 做的 optional 化是**正确但不够**：headless 的 Linux resolve 里仍然有 gtk/webkit2gtk/glib（经 `tauri-runtime` 进来）。

### 5.2 容器构建（已验证可用；后来 §5.6 的原生路线也通了，两条并列可选）
在 EL9 上用 podman 跑 `deploy/Dockerfile` 编出二进制。两个 EL9 特有的坑：
- `-p` 端口映射不可用 —— 缺 `containernetworking-plugins`。**用 `--network=host`**。
- 匿名 `VOLUME /data` 在容器重建后数据丢失。**必须用命名 volume**。
- 首次启动的 DB 迁移很慢，就绪探测别用 `curl -s -m 1` 快速重试，要 `sleep 1` 轮询。

### 5.3 产物拷回 EL9 宿主直接跑：只差一个符号（**已复测，证据如下**）
复现：`MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-gap.sh /root/ccs-deploy/cc-switch-server`
（`/root/ccs-deploy/cc-switch-server` 是用 `podman cp ccs-e2e:/usr/local/bin/cc-switch-server` 拷出来的，39 MB，stripped）
- 宿主：`CentOS Stream 9`，`glibc-2.34-273.el9`、`glib2-2.68.4-20.el9`、`gtk3-3.24.31-12.el9`。
- DT_NEEDED 共 13 项：`liblzma libssl libcrypto libgobject-2.0 libgtk-3 libgdk-3 libgdk_pixbuf-2.0
  libgio-2.0 libglib-2.0 libgcc_s libm libc ld-linux`。**没有 webkit/libsoup**（`--as-needed` 掉了），
  所以运行期不需要装 webkit —— 但**需要 gtk3**，EL9 自带。
- `.gnu.version_r`：`libc.so.6` 最高只要 **GLIBC_2.34**（EL9 满足）；`libm.so.6` 多要一条 **GLIBC_2.35**。
- 全二进制里需要 GLIBC_2.35+ 的符号**只有 1 个**：
  `367: ... FUNC GLOBAL DEFAULT UND hypot@GLIBC_2.35`（来自 Rust std `f64::hypot` 调 libm）。
- 符号级比对（`tools/wsl-el9-symcheck.sh`）：129 个 UND 里，EL9 找不到的除 `hypot` 外全是 **WEAK**
  （`pidfd_spawnp`/`pidfd_getpid`/`posix_spawn_file_actions_addchdir`/`ZSTD_trace_*`/`__gmon_start__`/`_ITM_*`），
  ld.so 对 WEAK 缺失是容忍的 → **`hypot` 是唯一硬阻塞**。
- 真实 exec 报错：`/lib64/libm.so.6: version 'GLIBC_2.35' not found (required by ...)`，退出码 1。

### 5.3.1 已试过的取巧办法：LD_PRELOAD **不行**（别再试）
`tools/hypot-shim.c` + `tools/hypot-shim.map` 编出的预加载库确实导出了 `hypot@@GLIBC_2.35`，
但 exec 仍报同样的错。原因：`_dl_check_map_versions` 在装载阶段校验
「`libm.so.6` 这个对象是否提供版本串 GLIBC_2.35」，这是**按 DT_NEEDED 目标对象**查的，
不看别的对象能不能供符号。**任何 preload / 注入类方案都绕不过 verneed 记录。**
结论：只能在**链接期**让这个引用根本不产生。

### 5.4 尝试过并失败的老 glibc 路线
- **zig / cargo-zigbuild**（`Dockerfile.old-glibc`，`--target x86_64-unknown-linux-gnu.2.34`）：
  `zig: error: version '.2.34' in target triple ... is invalid`，来自 `ring 0.17.14` 和 `aws-lc-sys 0.36.0` 的 build script；另有 `__time64_t` unknown type。
  （附带踩坑：zig 0.13.0 的下载资产名是旧的 `zig-linux-x86_64-*`，要用 **0.14.1**；openssl-sys 找不到头文件要 `ENV CFLAGS="-I/usr/include/x86_64-linux-gnu"`。）
- **Fedora 35 当构建工具链**（本次会话最后一步，**已实测**）：
  - EOL 但**仓库还活着**，`dnf` 能解析并安装成功。
  - `glibc 2.34`（正好等于 EL9）、`gtk3 3.24.34`、`glib 2.70.5`（满足 gtk-rs 下限）。
  - **但 `webkit2gtk-4.1` 没有任何 provider**，只有 `webkitgtk4-devel`（= 4.0）。
  - 实测确认：`--no-default-features --features headless` 的构建日志里确实有
    `Compiling webkit2gtk v2.0.2`（见 EL9 上的 `/root/ccs-el9-native.log`），
    它的 build script 要 `pkg-config webkit2gtk-4.1` → **Fedora 35 这条路确定不通**，不用再试。

### 5.5 让 EL9 原生可跑的候选
1. **就用容器**（零 hack，**已验证可用**）：EL9 上 `podman run --network=host -v ccs-data:/data`，或直接发 Debian 运行镜像。
2. **链接期自己定义 `hypot`**（在本 crate 加 build.rs + C）：可行但要往代码库里塞不显眼的 hack，精度还得自己实现。
3. **在 Debian 容器里链接 EL9 的 glibc** —— **探针已验证通过，且不改任何业务代码**：
   `tools/wsl-el9lib-link-probe.sh` 把 EL9 宿主的 `/lib64` 只读挂进 Debian 构建容器，
   复制成 `/link/libm.so`、`/link/libc.so`，再用 `rustc -C link-arg=-L/link` 编一个调用
   `f64::hypot` 的小程序。结果（实测输出）：
   - `.gnu.version_r` 里 `libm.so.6` 的需求从 GLIBC_2.35 变成 **GLIBC_2.34/2.2.5**，`grep -c GLIBC_2.35` = **0**；
   - 引用变成 `UND hypot@GLIBC_2.2.5`；
   - 产物在 **CentOS Stream 9 宿主上 `EXIT=0` 正常执行**（`hypot=5.0e300`），`ldd` 无 not found。
   → 已按此写出正式构建文件 **`deploy/Dockerfile.el9-native`**：用
   `FROM quay.io/centos/centos:stream9 AS el9lib` + `COPY --from=el9lib /usr/lib64/lib{c,m}.so.6`
   取 EL9 的 glibc（不依赖会变的 rpm 下载 URL），`ENV RUSTFLAGS="-C link-arg=-L/el9lib"`，
   并内置一条**守卫**：构建末尾 `! readelf -V … | grep -q 'GLIBC_2\.3[5-9]'`，
   谁以后又把 GLIBC_2.35+ 引回来就直接构建失败。
   驱动脚本：`tools/wsl-el9-native-build.sh`（build → `podman cp` 出二进制 → 打 verneed 与 hypot 引用）。
   复现探针：`tools/wsl-el9-link-order-probe.sh`（在 Debian 容器里用最小 cargo 项目对比三种链接方式）：

   | 链接方式 | verneed 最高 | hypot 引用 |
   | --- | --- | --- |
   | A. 默认（基线） | **GLIBC_2.35** | `hypot@GLIBC_2.35` |
   | B. `RUSTFLAGS="-C link-arg=-L<EL9 glibc>"` | GLIBC_2.34 | `hypot@GLIBC_2.2.5` ✅ |
   | C. 覆盖 Debian 的 `libm.so` 链接脚本为 `GROUP ( <EL9 libm> )` | GLIBC_2.34 | `hypot@GLIBC_2.2.5` ✅ |

   → `-L` 这条路在 **cargo 链接路径下确实生效**（不是只在裸 rustc 下生效），方案 3 成立。

   **重要修正（实测）**：真实全量产物用 **B（`RUSTFLAGS=-C link-arg=-L/el9lib`）没有生效** ——
   守卫照样抓到 `367: ... UND hypot@GLIBC_2.35`。原因：真实构建里 gtk-sys / webkit2gtk-sys 等
   build script 会先 emit `-L /usr/lib/x86_64-linux-gnu`，Debian 的 `libm.so` 链接器脚本先被命中。
   最小探针（无其它 `-L`）之所以通过，是因为只有我们那一条 `-L`。**已改用 C 组做法**：
   直接把 `/usr/lib/x86_64-linux-gnu/libm.so` 覆盖成 `GROUP ( /el9lib/libm.so.6 )`，与搜索顺序无关。
   只覆盖 libm 即可：产物对 `libc.so.6` 的版本需求最高就是 GLIBC_2.34（EL9 满足），越界的只有 hypot。
   守卫已拆成独立一步，失败时会打印 offending 符号 + 完整 verneed，重跑 `tools/wsl-el9-native-build.sh` 即可自诊断。
   ⚠️ 上面 C 组在真实产物上的闭环**已完成并通过**（2026-10-19 23:00 前后实测，见 §5.6）：
   守卫是构建的最后一步，**所以 `podman build` 成功 = GLIBC_2.35+ 需求确实被消掉了**。

### 5.6 EL9 原生单二进制：已闭环可用（2026-10-19 实测）

拿 §5.5 方案 3（覆盖 `libm.so` 链接脚本）编出的产物，**不套容器**直接跑在 CentOS Stream 9 宿主上：

```
$ /root/ccs-deploy/cc-switch-server-el9 --bind 127.0.0.1 --port 14521 --data-dir /tmp/ccs-el9-native-data
ready=yes  alive=yes
health : {"app":"cc-switch","version":"4.0.15","authRequired":false}
meta   : {"version":"4.0.15","homeDir":"/root","os":"linux","arch":"x86_64","authRequired":false}
index  : 665 B，md5 a328e2015378cf75144f94e367c093e7 == 本地 dist-legacy/index.html
invoke : get_stream_check_config -> {"timeoutSecs":8,"maxRetries":1,"degradedThresholdMs":6000}
         save_stream_check_config(11/2/3333) -> null
         get_stream_check_config -> {"timeoutSecs":11,"maxRetries":2,"degradedThresholdMs":3333}
退出   : 收到 SIGTERM 正常清理（"退出清理完成：客户端已指回直连，代理已停止"）
```
- 二进制 39,020,504 B；verneed 里 `libm.so.6` 只剩 `GLIBC_2.2.5` + `GLIBC_2.29`，
  `hypot@GLIBC_2.2.5`；`libc.so.6` 最高 `GLIBC_2.34`。**全二进制再无 GLIBC_2.35+ 需求。**
- glib 运行时 2.68（编译期 2.74）**没有造成 symbol lookup error** —— §5.3 的符号级比对预言成立。
- 复现：`tools/wsl-el9-native-build.sh`（构建+抽出+verneed） → `tools/wsl-el9-native-smoke.sh`（裸跑功能冒烟）。
  注意 `/api/invoke` 的字段是 **`cmd`** 不是 `command`（`headless/server.rs:45`）；首次启动要跑 DB 迁移，
  就绪探测要 `sleep 1` 轮询，别用 `curl -m 1` 快速重试。

**2026-10-21 重编复验**（加了 2 条倍率命令 + 4 语言新文案之后）：
- 产物换成 39,048,248 B、sha256 `a6d2346dd9f5c6330f3e13dae173c2394da5eee32b53210b19a1660584d3a171`；
  verneed 结论不变（`libc` 最高 `GLIBC_2.34`、`hypot@GLIBC_2.2.5`，无 2.35+），Dockerfile 里那道
  readelf 守卫仍然绿。
- 裸跑冒烟**多了倍率那一段**且通过：`"1"` → 设 `2.5` → 读回 `"2.5"` → `-1` 报「无效倍率…倍率不能为负数」。
- 判断"部署的到底是不是新包"要看页面资源：`index.html` md5 从 `a328e201…` 变成 `38295f78…`，
  而 `assets/index-0hufZJV7.js` 的 md5 `36d6ce687c924c223f220fa06fcb8d38` 与本地 `dist-legacy` **逐字节一致**。
  这条检查已固化成 `tools/wsl-el9-copy-check.sh`（发布前跑一次即可）。
- 构建命令现在**必须带 `--http-proxy=false`**（已写进脚本），否则 `pnpm install` 会被 WSL 宿主那个
  `127.0.0.1:7890` 代理拖死，见 §9。

**所以 CentOS 9 的答案现在是四条**：
1. 想要**一个文件、不要容器** → `deploy/Dockerfile.el9-native` 产物，已在 EL9 宿主原生验证可跑（§5.6）。
2. 想要**镜像部署** → `deploy/Dockerfile` + podman（早先已验证，注意 `--network=host` 与命名卷）。
3. **放弃 EL9 原生**，明确要求宿主 glibc ≥ 2.35（Debian 12 / Ubuntu 22.04）。
4. ~~加 glibc shim 到宿主~~ / **LD_PRELOAD**：**已证明无效**，见 §5.3.1。

> 补充：EL9 宿主自带 gtk3，产物运行期**不需要** webkit（§5.3）。glib 运行时 2.68 vs 编译期 2.74 也
> **不构成阻塞** —— §5.3 的符号级比对已经证明：除 hypot 外，EL9 的 glib/gtk so 提供了本二进制需要的
> 全部强符号；§5.6 的宿主裸跑冒烟（health/meta/页面 md5/DB 往返/SIGTERM）已把这条预言坐实。

## 6. 待决策 / 待收尾

### 6.1 【已决策并实施】默认成本倍率：只补命令 + 加说明（`tools/cmd-compat.md` 第五节有背景）

2026-10-20 用户选定**走法 1**：把 `get/set_default_cost_multiplier` 两条命令补回来（面板不再报错），
并在 UI 上写明 v4 计费不使用这个值；**不动**上游的计费链路。已实施，证据见 §3.5。

**为什么这样切是对的（v3.20.4 语义已逐行核实，比想象的窄）**：
- v3 里生效的只有一条路：**代理接管**计费。`proxy/response_processor.rs:642` 调
  `logger.resolve_pricing_config(provider_id, app_type)`，实现在 `proxy/usage/logger.rs:350-379`：
  读 `proxy_config.default_cost_multiplier`（按 app 一行；`claude-desktop` 继承 `claude`），
  供应商级 `providers.cost_multiplier` 可覆盖，解析失败回落 1 并打 `[USG-003]` warn。
- 作用点只有一个：`proxy/usage/calculator.rs:104` `let total_cost = base_total * cost_multiplier;`
- **会话导入那条路 v3 就写死了 1**：`services/session_usage.rs:843`，另外 `session_usage_mcode.rs:60`、
  `calculator.rs:217` 也直接传 `Decimal::ONE`。所以「还原 v3 语义」≠「还原全链路」。
- v4 是**有意**停用：`proxy/usage/logger.rs:405` 传 `Decimal::ONE`，并有守卫测试
  `proxy/response_processor.rs:1232 test_log_usage_ignores_legacy_multiplier_and_provider_overrides`。
- **上游自己就把这类字段定性为「原样往返、不参与计算」**：`src-tauri/src/provider.rs:507-511` 给
  `costMultiplier` / 供应商级 `pricingModelSource` 的注释是「已停用……只为与旧版设备同步时原样往返保留」。
  本次做法与上游口径一致。

**实际落地的东西**：
- 后端：DAO `get/set_default_cost_multiplier`（`database/dao/proxy.rs:124,145`，含
  `validate_cost_multiplier`：空/非数字/负数各自报本地化 `AppError`）、命令 + `*_internal` +
  `*_test_hook`（`commands/proxy.rs:341-400`）、注册进 `command_handler.rs:240-241`，
  单测 `test_default_cost_multiplier_round_trip` / `..._validation`。
- 前端：`web/i18n/` 覆盖三处文案（机制见 §3.6）——面板表头 + 供应商表单的两行 Hint。
  供应商表单那两个字段（`costMultiplier`、供应商级 `pricingModelSource`）本来就能往返、不报错，
  但原文案「实际成本 = 基础成本 × 倍率」「选择按请求模型还是返回模型进行定价匹配」是**错的**，一并改掉。
- **没做**（用户没选走法 2，别自作主张接回去）：把倍率重新乘进 `logger.rs` / `calculator.rs`。

### 6.2 桌面版仍指向 v4 UI（**已拍板并已实施，见 §13**）

> **2026-10-22 更新**：用户拍板"桌面端跑旧 ui 就行了"，按本节第 1 条建议的形态落地——
> 没有覆盖 `tauri.conf.json`，而是加了 `src-tauri/tauri.legacy.conf.json` + 三个 npm script
> （`build:legacy:desktop` / `tauri:legacy:dev` / `tauri:legacy:build`），两套 UI 都能出包。
> 实施过程、复验数字和真机 CDP 结果在 **§13**；本节下面 1/2/3 条保留作决策依据，不再重复维护。

`src-tauri/tauri.conf.json` 的 `frontendDist: ../dist`、`devUrl: http://localhost:3000` 还是 v4 前端。

**先把一条过时结论纠正掉**：早先这里写着"要让桌面版跑旧 UI，需要一个不被 alias 吞掉的真实 tauri 导入路径"——
**不成立**。`vite.legacy.config.ts:38` 的 shim 别名是**按 mode 开关**的
（`webTransport = mode === "web" || CC_UI_TRANSPORT === "web"`），默认模式不装别名，`@tauri-apps/*` 走真包。
实测证据（2026-10-21）：`pnpm exec vite build --config vite.legacy.config.ts --outDir ../dist-legacy-desktop`
**exit 0，13.04s**，产物 `assets/index-xVfo7ZYQ.js` 4,626.87 kB，里面有 4 处 `__TAURI_INTERNALS__`
（说明真的链进了官方 JS 包，不是 shim）；`web/i18n` 的新文案也在（`v4 计费不使用` / `unused in v4 billing` 各 1 处，
证明 §3.6 的别名是两种模式都生效）。顺带：产物里有个 `__vite-browser-external-*.js` 空壳 chunk，
`export {}`、没人引，是无害的死重量。

所以剩下的只有三件事，而且第一件是**决策不是体力**：
1. **要不要让桌面版换成旧 UI**：这等于改变桌面交付形态（v4 UI 就没入口了）。建议不要直接覆盖
   `tauri.conf.json`，而是加一条 `tauri.legacy.conf.json` + 一个 npm script，两套 UI 都能出包 —— **等你点头再做**。
2. 改哪几行（`src-tauri/tauri.conf.json:7-9`，实测现值）：`build.frontendDist` `../dist` → `../dist-legacy`、
   `build.devUrl` `http://localhost:3000` → `http://localhost:3001`（`vite.legacy.config.ts:59` 就是 3001，
   v4 的 `vite.config.ts:28` 是 3000，两边都 `strictPort`，**两套 dev server 能并存**）、
   `beforeDevCommand` `pnpm run dev:renderer` → `pnpm run dev:legacy`。生产侧还要让
   `build:legacy`（桌面模式，产物在 `dist-legacy`）先于 `tauri build` 跑。
3. 真机验证：v3 UI 调的命令名与 v4 后端是否都对得上，只有在 webview 里点一遍才知道。
   可行做法：`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<现挑空闲端口>` 起 `pnpm tauri dev`，
   再把 `tools/browser-e2e.mjs` 的 CDP 断言指过去（**注意 §9 那条固定端口的坑，别再用 9333**）。
   已知风险点：§3.4 的 6 条命令是**为旧 UI 补的**，其余命令名两边一致性只做过静态比对（`tools/cmd-diff.json`），
   没有运行时覆盖。

### 6.3 现场清理（2026-10-20 收尾后已更新）
- 还在跑的后台进程：只剩 Windows `cc-switch-server`（端口 **14515**，2026-10-20 用 `.e2e-home` 数据目录重启过，
  debug 构建的 rust-embed **按请求读盘**，改完 `dist-legacy` 不用重编二进制）、
  EL9 容器 `ccs-e2e`（**14517**，无 token）和 `ccs-pub`（**14518**，token `el9-e2e-token`）。
  启动方式（日志落在 `tools/e2e-server.log` / `tools/e2e-server.err.log`）：
  `Start-Process D:\projects\ccs\src-tauri\target\debug\cc-switch-server.exe -ArgumentList '--bind','127.0.0.1','--port','14515','--data-dir','D:\projects\ccs\.e2e-home'`
- **已清掉**：Node 探测目标（`127.0.0.1:18099`，PID 40268，`taskkill /PID 40268 /F`）；
  `proxyTargetsOnly` 冒烟用的两个测试供应商 `e2e-probe-p` / `e2e-idle-p`（`delete_provider`，
  删前用 `switch_provider` 把 claude 指回 `claude-official`）；累积的 7 条 `e2e-sse` profile（`delete_profile`，
  现在 `list_profiles` 为 0）。四个应用的倍率都是 `"1"`。
- `tools/browser-e2e.mjs` 已改成**用完即删**自己创建的 profile（事件帧断言后补一次 `delete_profile`），
  所以重复跑不再攒垃圾；改完复跑仍 **16/16**。
- **别人留下的 headless Chrome 在监听 9333**（`D:/projects/newapi/tmp-e2e/chrome-profile2`，PID 25520）。
  那是另一个项目的进程，**不要杀**；`tools/browser-e2e.mjs` 已改成自己挑空闲端口（§9）。
- 临时文件（2026-10-20 收尾）**已清**：仓库根下本会话/前几会话的 `.log` 与一次性探针产物
  （`.e2e-gate3.json`、`.e2e-gate4.json`、`.e2e-probe-target.mjs`、`.e2e-sse-frame.txt`、`.probe.json`、
  `.rt-*.log`、`.rusttest*.log` 等约 40 个）已全部删除，`%TEMP%\ccs-e2e-profile-*` / `ccs-probe-*` 也删了。
  **仍在**的只有：`.e2e-home/`（14515 那个服务正在用的数据目录，删了服务就没数据）、
  `tools/e2e-server.log` / `tools/e2e-server.err.log`（那个服务的活动日志）、
  `tools/wsl-el9-link-order-probe.sh` 等 `tools/wsl-*probe.sh`（§8 的复现脚本，**不是**垃圾）。
- `tools/lib.rs.bak` **先别删**：2101 行，跟 `git show HEAD:src-tauri/src/lib.rs` **不一致**，
  而现在的 `src-tauri/src/lib.rs` 只有 1146 行（拆模块后的版本）。它很可能是拆分前的快照，
  真要清理请先逐段确认内容已经都在 `setup.rs` / `compat.rs` / `lightweight_headless.rs` 里。
- WSL 侧现在的状态（2026-10-21 重编后）：
  **别删**的是产物 —— `/root/ccs-deploy/cc-switch-server-el9`（sha256 `a6d2346d…`，就是要交付的那个文件）、
  镜像 `localhost/cc-switch-server:el9`（`d8cdebfa6aef`）与 `:dev`（`03e4b1ffea13`）。
  在跑的容器：`ccs-e2e`（14517，无 token）、`ccs-pub`（14518，token `el9-e2e-token`），都已是新镜像。
  可删的日志/临时目录：`/root/ccs-el9-native.log`、`/root/ccs-podman-build.log`、`/tmp/pb.out`、
  `/tmp/ccs-el9-native-data`、`/tmp/el9-sse.txt`、`/root/hypot-out/`、`/root/probe.sh`、`/root/lp.sh`、
  `/tmp/libhypot-shim.so`。之前那个 `podman create` 没起起来的 `great_jackson` 已删。
  `container-test` 脚本为 stream_check 起的 `python3 -m http.server 18099` 现在会在脚本结尾 `pkill` 掉。
- `tools/hypot-shim.c` / `tools/hypot-shim.map` 是 **LD_PRELOAD 反例**的存档（§5.3.1 证据），
  不是要接进构建的代码，别误用。
- 整个改动**尚未提交**（`git status` 有大量 M 和 ??，见 §7）。

## 7. 改动清单速查

**新增（未跟踪）**：`.dockerignore`、`deploy/`、`dist-legacy/`（**2026-10-22 起改为 ignore，不入库**，见 §12.4）、`postcss.legacy.config.cjs`、`tailwind.legacy.config.cjs`、`tsconfig.legacy.json`、`vite.legacy.config.ts`、`src-legacy/`、`web/`、`tools/`、`.github/workflows/build-artifacts.yml`、
`src-tauri/src/headless_main.rs`（无头 bin 入口，**2026-10-22 从 `src-tauri/src/bin/server.rs` 改名过来，原因见 §13.6**）、`src-tauri/src/command_handler.rs`、`src-tauri/src/compat.rs`、`src-tauri/src/headless/`、`src-tauri/src/lightweight_headless.rs`、`src-tauri/src/setup.rs`、`src-tauri/src/tray_headless.rs`、`src-tauri/src/tray_panel_headless.rs`

**修改**：`package.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/build.rs`、`src-tauri/src/lib.rs`，以及 `src-tauri/src/commands/*`、`services/*`、`proxy/*`、`database/dao/settings.rs` 等一批（完整列表 `git status --porcelain`）。

**2026-10-20 增量（成本倍率走法 1）**：
- 后端：`database/dao/proxy.rs`（DAO + 校验 + 2 个单测）、`commands/proxy.rs`（2 条命令 + internal + test_hook）、
  `command_handler.rs:240-241`（注册）、`commands/stream_check.rs:48`（改用 `mode::current::provider_for`，见 §3.4）。
- 前端：新增 `web/i18n/{copy-overrides,zh,zh-TW,en,ja}.ts`，`vite.legacy.config.ts` 加 `I18N_OVERRIDES` 别名（§3.6）。
- 验证：`tools/browser-e2e.mjs` 新增 6 项断言（供应商表单 2 行 Hint、倍率命令往返、面板表头、面板读到的值、复位），
  并把 CDP 端口从固定 9333 改成运行时挑空闲端口；`tools/rust.cmd` 的注释改成 ASCII（§9）。

**2026-10-21 增量（重编产物 + 定位假失败，无业务代码改动）**：
- 构建脚本：`tools/wsl-el9-native-build.sh`、`tools/wsl-podman-build.sh` 加 `--http-proxy=false`
  （后者补 `exit $st`，原来失败也返回 0）；`tools/wsl-el9-native-smoke.sh` 加倍率命令一段；
  `tools/wsl-el9-container-test.sh` 加「页面 md5 与本地一致 + 4 语言文案 + 倍率往返」一段并在结尾 pkill 探针服务。
- 新增脚本：`tools/wsl-el9-copy-check.sh`（发布前守卫：产物内嵌 UI 是否就是最新构建）、
  `tools/wsl-npm-egress-probe.sh`（容器三种网络模式下的外连对照，用来区分"断网"和"代理注进容器"）、
  `tools/wsl-github-egress-probe.sh`（github 直连性对照，见 §9 那条前提）。
- 新增结论（§6.2）：旧 UI 的**桌面模式构建本身是通的**
  （`pnpm exec vite build --config vite.legacy.config.ts --outDir ../dist-legacy-desktop` exit 0 / 13s，
  产物里 4 处 `__TAURI_INTERNALS__`，新文案也在），桌面版没接过去只是 `tauri.conf.json` 还指着 v4。
  临时产物 `dist-legacy-desktop/` 已删，`dist-legacy/`（web 版）未被覆盖，md5 仍是 `36d6ce68…`。
- 删除：`tools/wsl-oldglibc-build.sh`（zig 废案的配套脚本，`deploy/Dockerfile.old-glibc` 已删）。
- 测试结论：全量单测在 `NO_PROXY=127.0.0.1,localhost` 下 **3763 通过 / 0 失败**（§3.5）。

**2026-10-22 增量（只读评审 → 干净克隆实测 → 加 CI；代码只动了格式与一处宏正确性）**：
- 新增 §11：两个只读子代理审计 + 我逐条按 `文件:行号` 复核的提交前评审。§10 第 6 项是索引。
- 今天新跑的复核（不是引用旧结论）：`src-legacy/` 与 tag `v3.20.4` 的 `diff -r` 退出码 0 / 两边各 462 文件 /
  10-19 01:00 之后无新 mtime；`src-legacy` 里 shim 与 i18n 泄漏 0 处；`allow(dead_code)` 抑制器 13 处；
  `Cargo.lock` 变更规模 485 增 / 189 删。
- 新实测（§11.3 ⑨）：rust-embed 缺目录是**硬编译错误**，最小 crate `cargo check --offline` 与真 crate 都复现了，
  实现在 `rust-embed-impl-8.13.0/src/lib.rs:487-489`。
- 新增 §12：干净克隆 A/B（`.ci-sandbox/`）、现有 CI 三门的本机预跑、新工作流说明、`.gitignore` 实际改动。
- **代码改动（就这两类，都为满足现有 CI 门）**：
  1. `cargo fmt --all`：19 个文件 / 29 处 hunk 的**纯格式**修正（改动集本来不满足 `ci.yml` 的 fmt 门）。
  2. `src-tauri/src/command_handler.rs`：宏体里 355 处 `crate::` → `$crate::`，
     消掉 clippy 的 `crate_in_macro_def`（`-D warnings` 会把它判成 error）。两个调用点都在本 crate，
     展开指向同一批函数，`cargo check --lib` 与 headless 侧都 exit 0。
  其余 §11 列的行为差异**一条都没动**。
- 新增文件：`tools/ci-local-clean-clone.sh`（干净克隆 A/B 复现脚本）、
  `.github/workflows/build-artifacts.yml`（`workflow_dispatch` 五选一：all / dist-legacy / headless-el9 / container / desktop）。
- `.gitignore`：补 `dist-legacy/`、`dist-legacy-desktop/`、`.ci-sandbox/`、`.e2e-home/` 与 `tools/` 下的一次性证据（§12.4）。

**2026-10-22 增量（桌面版跑旧 UI 落地，完整记录在 §13；这一批**未提交**）**：
- 新增 `src-tauri/tauri.legacy.conf.json`（只覆盖 `build.*` 与 `bundle.createUpdaterArtifacts:false`，两套 UI 并存谁也没被覆盖）。
- `package.json` +3 个 script：`build:legacy:desktop`、`tauri:legacy:dev`、`tauri:legacy:build`。
- `src-tauri/Cargo.toml`：删掉 `desktop` 特性里不存在的 `tauri/dbus`（§13.2，这是 §11.1 ① 的真身）；
  加 `[package] default-run = "cc-switch"`；无头 bin 入口 `src/bin/server.rs` → `src/headless_main.rs`（后两条见 §13.6）。
- `src-tauri/Cargo.lock`：由 `cargo` 自己重新解析回 **tauri 2.10.3**（不是手改），与上游的差量从 485 增/189 删缩到 132 增/15 删（§13.2）。
- 新增 `tools/desktop-cdp-check.mjs`：挂到 WebView2 的 CDP 端口上，对桌面旧 UI 做启动页断言 + 命令级调用（§13.4，零依赖）。
- `src-tauri/src/headless/server.rs:181`：`cmd: cmd.into()` → `cmd,`（空转换，headless 特性下的 clippy 盲区，§13.6）。

## 8. 复现命令

```bat
:: Windows 侧三道门（必须用 tools\rust.cmd；.cmd 里不要写中文注释，代码页会烂）
tools\gates.cmd
:: 全量 Rust 单测（NO_PROXY 是必需的，原因见 §3.5 / §9）
set NO_PROXY=127.0.0.1,localhost
tools\rust.cmd test --lib --features test-hooks
:: 倍率两条命令的真实往返（body 字段名是 cmd）
curl -X POST http://127.0.0.1:14515/api/invoke -H "Content-Type: application/json" -d "{\"cmd\":\"set_default_cost_multiplier\",\"args\":{\"appType\":\"claude\",\"value\":\"1.5\"}}"
curl -X POST http://127.0.0.1:14515/api/invoke -H "Content-Type: application/json" -d "{\"cmd\":\"get_default_cost_multiplier\",\"args\":{\"appType\":\"claude\"}}"
```
```bash
# 浏览器 E2E（真机 Chrome 走 CDP，含 SSE 帧断言 + 面板/表单文案断言）
node tools/browser-e2e.mjs

# 旧 UI 重新构建（debug 版无头服务直接读盘，改完文案不用重编二进制）
pnpm build:legacy:web && pnpm typecheck:legacy

# 桌面版跑旧 UI（§13）：先出 debug 单文件，再起进程做 CDP 断言
pnpm tauri build --config src-tauri/tauri.legacy.conf.json --debug --no-bundle
#   起 exe 时给 WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<现挑空闲端口>，
#   数据目录用 CC_SWITCH_DATA_DIR 隔离；要和已装实例并存必须换 identifier（§13.4 末）。
node tools/desktop-cdp-check.mjs <现挑端口>
# 桌面安装包：Windows 侧需要 vcvars64 + MSVC 工具链；WiX 现场下载、必须给进程 HTTPS_PROXY（§13.6）
pnpm tauri build --config src-tauri/tauri.legacy.conf.json --bundles msi

# WSL 侧构建（注意 --config 清空 proxy；target 目录 /root/ccs-target）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-build.sh

# EL9 容器构建 / 用新镜像重建容器并跑断言 / 验证 / 持久化 / 公网 token
# （顺序重要：只 build 不重建 ccs-e2e 的话，14517 上跑的还是旧包）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-podman-build.sh
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-container-test.sh
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-verify.sh
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-persistence.sh
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-public.sh

# EL9 宿主差距实测（§5.3 / §5.3.1 的证据出处）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-gap.sh /root/ccs-deploy/cc-switch-server
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-symcheck.sh /root/ccs-deploy/cc-switch-server
# 二进制是从容器里拷出来的：
#   podman cp ccs-e2e:/usr/local/bin/cc-switch-server /root/ccs-deploy/cc-switch-server
# LD_PRELOAD 反例（证明无效，见 §5.3.1）：
#   gcc -O2 -fPIC -shared -o /tmp/libhypot-shim.so tools/hypot-shim.c -Wl,--version-script=tools/hypot-shim.map
#   LD_PRELOAD=/tmp/libhypot-shim.so /root/ccs-deploy/cc-switch-server --help

# EL9 原生单二进制：构建 + 抽出 + 裸跑冒烟（§5.6 的证据出处，构建约 15 分钟）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-native-build.sh
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-native-smoke.sh /root/ccs-deploy/cc-switch-server-el9
# 发布前守卫：产物内嵌的 UI 是不是最新构建（md5 对比 + 4 语言文案 + 倍率命令可用）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-copy-check.sh
# 构建前若 pnpm/cargo 报 ECONNREFUSED，先跑这个确认是"宿主代理被注进容器"而不是真断网（§9）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-npm-egress-probe.sh
# github 直连性对照（容器 / 宿主无代理 / 宿主带代理）——决定能不能用 --http-proxy=false
MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-github-egress-probe.sh
# 链接方式对比探针（A 基线 / B -L / C 覆盖 libm.so 链接脚本）
MSYS_NO_PATHCONV=1 wsl.exe -u root bash -c 'cp /mnt/d/projects/ccs/tools/wsl-el9-link-order-probe.sh /root/lp.sh; podman run -i --rm -v /lib64:/el9lib:ro docker.io/library/rust:1-bookworm bash -s < /root/lp.sh'
```

## 9. 踩坑备忘（省你半天）

- **`MSYS_NO_PATHCONV=1`**：Git Bash 会把 `/mnt/d/...` 当 Windows 路径改写，必须加这个前缀。
- **`wsl.exe -u root bash script`** 是非登录 shell，`cargo` 不在 PATH，脚本里要 `. "$HOME/.cargo/env"`。
- **podman 喂脚本要 `-i`**：`podman run --rm img bash -s < script.sh` 不加 `-i` 会静默什么都不跑（退出码还是 0）。
- **长构建会被工具超时腰斩**：Agent 侧单条命令上限 10 分钟，`podman build`（cargo release 7m58s + 前端层）
  会踩线；被杀时 wsl.exe 返回 **0**，看着像成功，其实镜像没 COMMIT、tag 还指着旧版本
  （2026-10-21 就被这样骗过一次）。稳妥写法是把它**脱管**给 WSL 自己跑，再读日志：
  `wsl.exe -u root bash -c 'cd /mnt/d/projects/ccs && setsid nohup bash tools/wsl-podman-build.sh > /tmp/pb.out 2>&1 < /dev/null &'`
  然后 `tail /root/ccs-podman-build.log` + `podman images` 的 Created 时间来判断真假。
- **cargo fetch 挂住** → WSL `/root/.gitconfig` 里的 `http.proxy`。别改文件，加 `--config "http.proxy=\"\""`。
- **corepack `Cannot find matching keyid`** → 用 `npm install -g pnpm@10.12.3`。
- **E2E 假失败**：Chrome 自己探测 `/favicon.ico` 会产生 404 console error，`tools/browser-e2e.mjs` 已按 `entry.url` 归因过滤。临时 profile 目录删除会 EPERM，要等 chrome `exit` 再删（已加 `maxRetries`）。
- **管道会吞退出码**：`wsl.exe ... | tr | tail` 之后要用 `${PIPESTATUS[0]}`。
- **Windows → WSL 的 14518 端口连不上**（ping 通、iptables INPUT ACCEPT、代理 env 为空），已放弃这条路，改用"字节一致"作为等价证据。
- **固定 CDP 端口会把你骗了**：`--remote-debugging-port=9333` 若已被别的 Chrome 占着（本机是另一个项目的
  `newapi/tmp-e2e/chrome-profile2`），你 spawn 的 Chrome 会退到随机端口，而脚本连上的是**那台陌生浏览器**，
  于是断言跑在别人的 profile / 别人的 localStorage 上，出现莫名其妙的外设状态（这次表现为"已经在设置页"）。
  `tools/browser-e2e.mjs` 现在用 `net.listen(0)` 现挑空闲端口；再遇到"DOM 状态与代码不符"先怀疑这条。
- **旧 UI 的语言是异步定的**：`i18n` 先用 `navigator.language`（无头 Chrome = en-US）渲染，
  设置加载完再切到库里存的简体中文。所以**任何按中文文案写的 DOM 断言都可能间歇失败**，
  要么四种语言都匹配（E2E 里的 `NOTE` 正则），要么按 `id` / `aria-controls` / lucide 图标类名定位。
- **Radix 折叠项的 `aria-controls` 在这个 UI 里就是内容元素 id**（`radix-:r1u:`），没有 `-content-pricing` 这种
  后缀可用；面板定位改用 `button:has(svg.lucide-coins)`，内容用 `getElementById(trigger.ariaControls)`。
- **`.cmd` 里不要写中文注释，也别只用 LF**：`cmd.exe` 会在多字节 + 无 CR 的 `rem` 行上吐出
  `'??' is not recognized as an internal or external command`，看着像构建失败。`tools/rust.cmd` 已改成 ASCII。
- **本机跑 Rust 单测要带 `NO_PROXY=127.0.0.1,localhost`**：reqwest 在 Windows 上除了环境变量还会读
  **注册表里的系统代理**，于是"连一个已释放的随机端口 expecting ECONNREFUSED"这类测试会被 127.0.0.1:7890
  代答成 502（详见 §3.5 那三组对照）。这不是回归，别去改测试。
- **`podman build` 默认会把宿主的代理注进构建步骤**（`--http-proxy` 默认 true）。WSL 宿主里挂着
  `http(s)_proxy=http://127.0.0.1:7890`（Windows 代理经镜像网络透传进来的），而这个地址在容器的 netns 里
  根本不存在 → 2026-10-20 那次重编就在 `pnpm install` 上以一片 `ECONNREFUSED` 失败（日志
  `/root/ccs-el9-native.log`）。容器**直连** registry 与 index.crates.io 实测都是 200
  （`tools/wsl-npm-egress-probe.sh`，三种网络模式各测一遍），所以正解是给两个构建脚本加
  `--http-proxy=false`，**不要**改成 `--network=host` 或往容器里塞代理。已改：
  `tools/wsl-el9-native-build.sh`、`tools/wsl-podman-build.sh`。
  **前提是本仓库的依赖全走 registry**（`grep -c "source=git" src-tauri/Cargo.lock` = **0**，npm 也是 registry）。
  **github 在这台机器上是直连不通的**（`tools/wsl-github-egress-probe.sh` 实测：容器 bridge 无代理
  `UND_ERR_CONNECT_TIMEOUT`、WSL 宿主清掉代理 env 后 curl `(28) Connection timed out`、带上宿主代理才 200），
  所以以后若引入 **github 之类的 git 依赖**，`--http-proxy=false` 会让它拉不下来 —— 那时要给构建显式喂一个
  **容器可达**的代理地址（宿主 `127.0.0.1:7890` 在容器 netns 里不存在，得用宿主机 IP 或 `--network=host`），
  而不是回退到默认注入。
- **构建脚本必须自己 `exit $st`**：`tools/wsl-podman-build.sh` 原来在 `tail -30` 之后就结束了，
  退出码变成 tail 的 0，`wsl.exe` 那边看着像成功。已补 `[ "$st" -ne 0 ] && exit "$st"`。
  同理，Windows 侧 `cmd ... > /dev/null 2>&1; echo exit=$?` 这种写法，最终退出码是 **echo** 的，
  要的就是这个数的时候别把 `$?` 丢掉。
- **Windows 上必须用 `tools\rust.cmd`**：仓库的 `rust-toolchain.toml` 把 GNU 工具链设成 active（本机 rustup
  的 default host 是 gnu），直接 `cargo` 会撞 `dlltool.exe: program not found`。wrapper 用
  `RUSTUP_TOOLCHAIN=1.95-x86_64-pc-windows-msvc` 覆盖它（`+toolchain` 命令行参数覆盖不了 toolchain 文件）。
- **`--no-default-features --features headless` 跑不了 `cargo test --lib`**：`lib.rs` 的 `#[cfg(test)]` 里
  import 了 desktop 才有的 `classify_exit_request`（E0432）。单测请用默认 desktop 特性跑。
- **上游那个"绑随机端口再释放、期望连接被拒"的测试在本机必现 502**（`proxy::error::tests::describe_reqwest_error_keeps_cause_and_drops_url`）：
  抢着应答的是**本机的 Windows 系统代理**（reqwest 读注册表，不是环境变量），不是回归。
  跑测试时带 `NO_PROXY=127.0.0.1,localhost` 就绿；三组对照实验见 §3.5 备注。
- **cargo/pnpm 与 `tail` 串起来会丢退出码**：`pnpm typecheck:legacy 2>&1 | tail -20` 报了 exit 0 但其实
  tsc 是 exit 2。要么 `> file 2>&1; echo exit=$?`，要么 `${PIPESTATUS[0]}`。

## 10. 建议的下一步（按性价比排序）

1. ~~EL9 原生可行性~~ —— **已解决**，见 §5.6。`deploy/Dockerfile.old-glibc`（zig 废案）**已按用户指示删除**，
   `deploy/` 现在只剩 `Dockerfile`（容器镜像）+ `Dockerfile.el9-native`（原生二进制）+ `cc-switch-server.service`。
2. ~~成本倍率决策~~ —— **已按走法 1 实施并验证**（§6.1）。
3. ~~重新构建部署产物~~ —— **2026-10-21 已完成并复验**：EL9 原生二进制（sha256 `a6d2346d…`）与
   容器镜像 `:dev`（`03e4b1ffea13`）都含新命令与新文案，页面资源与本地构建逐字节一致（§3.5 末三行、§5.6）。
   坑在构建参数：必须 `--http-proxy=false`（§9）。
4. §6.2 桌面版跑旧 UI（`tauri.conf.json` 还指向 v4 UI）。倍率文案的 alias 已经对两种模式都生效，
   这一步只差把 `frontendDist/devUrl` 指到 `dist-legacy` 并解决 tauri 说明符被 alias 吞掉的问题。
   这是**目前唯一剩下的功能活**。
5. ~~§6.3 清理~~ —— 本机现场**已清理完毕**（2026-10-20 收尾，见 §6.3）。
6. **提交前先读 §11**（2026-10-22 的只读静态评审，逐条带 `文件:行号` 与复核命令）。
   11.1 那 **5 条是行为/交付形态决策**（Cargo.lock 整栈被动升级、`app_store.rs:29-43` 环境变量优先级、
   `stream_check.rs:24` default→DB、`setup.rs:104` 的 cfg 语义、`dao/proxy.rs:136-139` 读里带写），
   11.3 那 **4 条是提交前必须处理的仓库卫生**（`.gitignore` 缺口、`assets.rs:4` 嵌入未跟踪目录、
   机器绝对路径、一次性改写脚本）。**这些我都只报告没动手改**，包括看起来该删的 `*_test_hook`（§11.2）。

   > **2026-10-22 更新**：改动集**已提交并推送**（一个 commit，578 个入口：`src-legacy/` 462 个文件、
   > `src-tauri/` 54、`tools/` 35、`web/` 15、`deploy/` 3 + 配置/文档/`.github`）。`.e2e-home/`、
   > `dist-legacy/`、`src-tauri/target/`、`.ci-sandbox/` 都靠新补的 `.gitignore` 挡在外面（§12.4），
   > 没有 `git add -A` 误带。**§11.1 / §11.2 的决策项和 §11.3 的 ⑩⑪ 仍未处理**，push 到 main 会触发
   > `ci.yml`（三门 Rust + 前端 job）——本机证据见 §12.2，push 后**六个 job 全绿**，
   > 那 3 个 vitest 本机失败在 CI（ubuntu + node 20）上不复现（实测见 §12.5）。

### 10.1 部署原生二进制到 EL9 的现成路径
`deploy/cc-switch-server.service` 的 `ExecStart=/usr/local/bin/cc-switch-server`
对 §5.6 的原生产物**同样适用**（那个 unit 本来就是给裸二进制写的）：
```bash
podman create --name x localhost/cc-switch-server:el9
podman cp x:/cc-switch-server /usr/local/bin/cc-switch-server && podman rm x
systemctl enable --now cc-switch-server
```
对外监听要在 `/etc/cc-switch/server.env` 里给 `CC_SWITCH_TOKEN`，否则程序拒绝非 loopback 绑定。

## 11. 提交前静态评审（2026-10-22，**只读**，未改任何代码）

两个只读子代理对整个未提交改动集做了审计，我**逐条按 `文件:行号` 复核**后才写在这里
（复核命令都附在下面，可直接重跑）。本轮**没有修改任何业务代码**——按 §2 的约束，行为差异只报告、由你决定。

工作区体量：42 个已跟踪文件被改（`git status --porcelain | grep '^ M'`），20 项未跟踪。

> 时间线补充：本节评审本身是只读的。之后为了过现有 CI 门（见 §12.2）实际只动了两处——
> `cargo fmt --all`（19 个文件，纯格式）与 `command_handler.rs` 的 355 处 `crate::`→`$crate::`
> （宏正确性，展开结果不变）。**§11.1 / §11.2 列的那些行为和卫生问题一律没碰**，仍等你拍板。

### 11.1 必须你拍板（会改变行为或交付形态）

**① `src-tauri/Cargo.lock` 整份 tauri 栈被动升级**（485 增 / 189 删：`git diff --numstat -- src-tauri/Cargo.lock`）
- 触发点：`Cargo.toml` 做 feature 拆分（`default = ["desktop"]`、`tauri` 改成 `default-features = false`、
  一批插件与 `gtk`/`webkit2gtk` 转 `optional` 挂到 `desktop`）。依赖图重新求解后
  `tauri 2.10.3→2.12.4`、`tauri-runtime 2.10.1→2.12.2`、`wry`、`muda`、`tray-icon`、`window-vibrancy`、
  `brotli 8→9`、`aws-lc-sys 0.36→0.37` 全涨到 semver 区间上限。
- **不是我们抬的下限**：`Cargo.toml` 里 tauri 仍然写 `"2.8.2"`（diff 里只改了 `features`/`default-features`）。
- 现在交付的 EL9 原生二进制与容器镜像**就是按这份 lock 编的**，§3.5 / §5.6 的全部实测证据都建立在它上面。
- 可选：**(a) 接受**（风险已被实测覆盖）；**(b)** `cargo update --precise` 逐项钉回原版本再全量复验
  （成本高，而且旧版本上 `tauri/test` MockRuntime 是否同样强拉 gtk/webkit 未测——§5.1 的证据是 2.12.x 的）。
- 提醒：**绝不手改 lock**（§2），要动就用 cargo 子命令让它自己写。

**② `src-tauri/src/app_store.rs:29-43` — 环境变量优先级没有 feature 门**
`get_app_config_dir_override()` 先看 `CC_SWITCH_DATA_DIR`（`:36-43`），命中就直接返回，**盖过** Store 里的
`app_config_dir_override`。这在无头场景是对的（`--data-dir` 就该赢，旁边的中文注释写了理由），
但**桌面版同样走这条路径**：桌面用户环境里恰好有这个变量时，设置页选的路径会被静默压掉。
可选：**(a) 保持**；**(b)** 给 env 分支加 `#[cfg(not(feature = "desktop"))]`；**(c)** 只在无头入口里 setenv。

**③ `src-tauri/src/commands/stream_check.rs:24`（及 `:45`）— 探测配置从 default 改成读 DB**
上游单个探测用的是 `StreamCheckConfig::default()`（见 `git diff -- src-tauri/src/commands/stream_check.rs`），
我们改成 `state.db.get_stream_check_config()?`。**这是可观察的行为变化**：桌面版在设置里改过超时/重试/并发后，
连通性检查真会按它跑（之前恒为默认值）。旧 UI 必须这样（v3 就读 DB），但桌面端属于顺带改变。

**④ `src-tauri/src/setup.rs:104` — `cfg(desktop)` 被换成 `feature = "desktop"`，两者不是一回事**
上游是 `#[cfg(desktop)]`（tauri-build 产出的 **target family** cfg，Linux 构建里恒真，
见 `git show HEAD:src-tauri/src/lib.rs` 第 532 行），我们写成 `#[cfg(feature = "desktop")]`。
同型的还有 `setup.rs:100`（`target_os = "windows"` → `all(target_os = "windows", feature = "desktop")`）。
净效果：无头二进制**不注册 Updater 插件**、不设 Windows AppUserModelID。大方向应该正是你要的
（服务器不该自检更新），但它同时改了桌面 Linux 的等价性判断，后续接手**别把这两个 cfg 混用**。

**⑤ `src-tauri/src/database/dao/proxy.rs:136-139` — 读操作里藏了一次写**
`get_default_cost_multiplier` 查不到行时调 `init_proxy_config_rows()` 补行再返回 `"1"`，
即"GET 会写库"。同文件 `get_pricing_model_source`（`:170` 起）是对照写法。
可选：**(a)** 保留自愈语义；**(b)** 改成纯读、缺行直接返回默认值。

### 11.2 建议清理（我们新增代码里的冗余）

**⑥ `src-tauri/src/commands/proxy.rs:350` / `:383` 两个 `*_test_hook` 零调用者**
全仓 `grep -rn "cost_multiplier_test_hook" --include=*.rs .` 只有这两行定义，没有调用点。
单测在 DAO 层（`src-tauri/src/database/dao/proxy.rs:933,947`），没有经过命令层。
上游这个模式是给**集成测试**用的：`import_default_config_test_hook` 被
`src-tauri/tests/golden/import_rows.rs:143`、`src-tauri/tests/mcp_commands.rs:309` 等真实调用。
（附带说明：`commands/provider.rs:157 switch_provider_test_hook` 在本仓库 HEAD 里就已经零调用，
**不是**这次改动造成的，别顺手清。）
可选：**(a)** 删掉这两个 hook（符合 §2 极简主义）；**(b)** 补一个命令层集成测试把它们用起来。

**⑦ 13 处 `#[cfg_attr(not(feature = "desktop"), allow(dead_code))]`**
`grep -rc 'cfg_attr(not(feature = "desktop"), allow(dead_code))' src-tauri/src --include=*.rs` 合计 **13**，
全部由 `tools/quiet-headless-warnings.mjs` 一次性插入，模式统一，不是逐处手写的魔法。
价值判断留给你：它们压掉的是"桌面版才用、无头版编不进"的死重，读代码时会遮住真实引用关系。

### 11.3 提交前必须处理（仓库卫生）

**⑧ `.gitignore` 缺口**（现表 34 行，有 `dist/`、`*.log`，**没有**下面这些）—— **2026-10-22 已补，见 §12.4**
- `.e2e-home/` — **12 MB** 的 E2E 数据目录：`cc-switch.db`、`.cc-switch/cc-switch.db`、
  `backups/db_backup_20261020_205749.db`、`backups/db_backup_20261021_222501.db`、`.cc-switch/settings.json`、
  `.claude/settings.json`（内含假 key `sk-e2e…` 与探针地址 `127.0.0.1:18099`）。`git add -A` 会整包带走。
- `dist-legacy-desktop/`（§6.2 验证时的临时产物，已删，但仍可能被再次生成）。
- `tools/` 下的一次性产物：`desktop-check.txt`、`headless-check.txt`、`headless-build.txt`、
  `legacy-web-build.txt`、`legacy-commands.txt`、`tree.txt`、`cmd-diff.json`、`lib.rs.bak`、
  `hypot-shim.c`、`hypot-shim.map`。**别直接删**：`hypot-shim.*` 是 §5.3.1 反例的存档，
  `cmd-diff.json` 被 §6.2 引用，`lib.rs.bak` 是拆模块前的快照（§6.3 说明为何先别删）
  → 用精确的 ignore 规则排除，而不是删文件。

**⑨ `src-tauri/src/headless/assets.rs:4` — `#[folder = "../dist-legacy"]` 嵌入的是未跟踪目录（已实测：干净克隆**必编不过**）**
rust-embed 在**编译期**读盘，目录不存在就直接报 `error: #[derive(RustEmbed)] folder '...dist-legacy' does not exist`。
`dist-legacy/`（5.4 MB 前端产物）当前未被跟踪，所以 clone 后不跑前端构建就一定编不出无头版。
实测证据（2026-10-22，最小复现，不是推断）：临时 crate 里
`#[derive(rust_embed::RustEmbed)] #[folder = "../definitely-missing"]` + `cargo check --offline`
→ **exit 1**，报错文本就是上面那句；实现在 `rust-embed-impl-8.13.0/src/lib.rs:487-489`（`!exists() && !allow_missing`）。
可选：**(a)** 把 `dist-legacy/` 纳入版本库（构建产物入库，上游风格一般拒绝）；
**(b)** 明确 ignore + 把"先 `pnpm build:legacy:web` 再 `cargo build --no-default-features --features headless`"
写进 `deploy/` 与 README（**推荐**，这就是现在 §8 的实际步骤，只是没写在给外人看的地方）。
**别用 `#[allow_missing = true]` 糊过去**（`rust-embed-impl-8.13.0/src/lib.rs:444,521` 支持它）：
那只会让它编过但资源为空，页面全 404，属于把显式失败换成静默失败。
→ **2026-10-22 走的是 (b)**：`dist-legacy/` 已加进 `.gitignore`，构建顺序写进 §12.1 的实测与
新工作流（`deploy/Dockerfile*` 本来就自带前端构建，不受影响）。

**⑩ 机器相关路径与陈旧路径**
- `tools/rust.cmd:3-5`：`C:\Program Files\Microsoft Visual Studio\18\...`、`C:\Users\admin\.cargo\bin`、
  `D:\projects\ccs\src-tauri`；`tools/gates.cmd:3-5` 同样写死 `D:\projects\ccs\...` 与日志绝对路径。换机器即失效。
- `tools/wsl-el9-runtest.sh:7`：`BIN=/root/cc-switch-server-el9`，与 §6.3 及其他脚本用的
  `/root/ccs-deploy/cc-switch-server-el9` **不一致**（旧位置）。

**⑪ 一次性改写脚本＝地雷**
- `tools/extract-setup.mjs:105-118`：往 `src-tauri/src/lib.rs` **重写**内容（把 setup 闭包搬进 `setup.rs`）。
- `tools/quiet-headless-warnings.mjs:10-28`：按**硬编码行号**往 20 个文件插 `#[cfg(...)]`（带锚点字符串校验）。
两者"跑一次就完事"，**现在重跑会插坏或错位**。要么不提交，要么在文件头写明"存档、禁止重跑"。

### 11.4 复核过的、确认没问题的（今天新跑的，不是引用旧结论）
- `src-legacy/` 不变量：与 tag `v3.20.4` 的 `src/` **462 个文件 `diff -r` 退出码 0**，
  且 `find src-legacy -type f -newermt '2026-10-19 01:00'` = **0**（本轮确实没动过）。
  复现：`rm -rf /tmp/a && mkdir /tmp/a && git archive v3.20.4 src | tar -x -C /tmp/a && diff -r /tmp/a/src src-legacy`
- shim / i18n 泄漏：`grep -rn "web/transport\|web/i18n\|@tauri-apps/api/core.js" src-legacy` = **0 处**。
- 倍率命令的注释与实际一致：`commands/proxy.rs:359-364` 声明"只读写这一列、v4 计费不消费"，
  与 §6.1 核实过的 `proxy/usage/logger.rs` 传 `Decimal::ONE` + 守卫测试相符。

## 12. 本地干净克隆实测 + GitHub Actions（2026-10-22）

### 12.1 干净克隆 A/B 实测（`tools/ci-local-clean-clone.sh`，沙箱 `.ci-sandbox/repo`）
做法：tar 复制工作树（排除 `.git node_modules dist dist-legacy* src-tauri/target .e2e-home *.log`，
2182 个文件）→ `pnpm install --frozen-lockfile --offline`（9s，480 包全走本地 store）→
`pnpm build:legacy:web`（14s）→ 在沙箱**自己的 target 目录**（1.4 GB，确认没蹭主仓缓存）跑 cargo check。

结果（全部是这轮实测，不是引用旧结论）：
- **前端可复现**：沙箱产物 `assets/index-0hufZJV7.js` md5 `36d6ce687c924c223f220fa06fcb8d38`，
  与主仓现有 `dist-legacy` 同一个 md5，也和两个已交付产物内嵌的页面一致 → 构建确定性成立。
- **反向对照**（把沙箱的 `dist-legacy` 移走）：
  `cargo check --no-default-features --features headless --lib --bin cc-switch-server` → **exit 101**，
  报错原文 `error: #[derive(RustEmbed)] folder 'D:\projects\ccs\.ci-sandbox\repo\src-tauri\../dist-legacy' does not exist.`
  → §11.3 ⑨ 在**真 crate** 上成立（此前只是最小 crate 探针）。
- **正向**（放回去，同一份依赖图）：**exit 0**（39s）。
- 顺带一条给 CI 的事实：无头构建**不需要** `../dist`（沙箱刻意没复制 `dist/`，仍编得过），
  所以 headless job 只要保证 `dist-legacy` 先出来就行。
- 复现命令：`bash tools/ci-local-clean-clone.sh`（日志 `tools/ci-local-clean-clone.log`、
  `tools/ci-local-negative.log`、`tools/ci-local-positive.log`）。
- 这轮踩的三个本机坑（已写进脚本注释）：`.cmd` 必须 **CRLF**（LF 版报
  "The syntax of the command is incorrect."）；Git Bash 里 `cmd.exe /c` 会被 MSYS 当路径转换，要写 `//c`；
  heredoc 里的 `>nul` 会被 MSYS 改写成 `>/dev/null`。

### 12.2 提交前必须过的**现有** CI 门（`ci.yml` 在 push 到 main 就会跑）
- `cargo fmt --check`：审计发现改动集**不干净**（19 个文件 / 29 处 hunk，含 `bin/server.rs`、
  `app_store.rs`、`commands/config.rs`、`headless/*.rs` 等）→ 已 `cargo fmt --all` 修正，
  现在 `cargo fmt --check --all` **exit 0 / 0 处 diff**。这 19 个文件的 HEAD 版本单独跑 rustfmt 是干净的，
  说明格式漂移是本次改动引入的，不是上游遗留。**纯格式，无行为改动。**
- `pnpm typecheck:legacy`：**exit 0**（已作为守卫加进新工作流）。
- **前端三门实测**（`package.json` 被我们改了，push 到 main 一定会触发 `frontend` job）：
  `pnpm typecheck` **exit 0**、`pnpm format:check` **exit 0**（"All matched files use Prettier code style!"）、
  `pnpm test:unit` **exit 1**（5 文件 / 7 用例失败）。
  **已用 A/B 证明这 7 个与我们的改动无关**：`git diff -- package.json` 只加了 5 条 script，
  依赖与 `pnpm-lock.yaml` 一行没动，`src/`、`tests/`、`vite.config.ts`、`vitest.config.ts` 也都没碰。
  把失败的那 5 个文件单独重跑 → 只剩 **3** 个稳定失败（另外 4 个是并发抢 CPU 的时序抖动）；
  再在**纯净 HEAD 沙箱**里跑同一批（`.ci-sandbox/head-baseline`，`git archive HEAD` + `pnpm install --frozen-lockfile --offline`）
  → **同样 3 failed / 104 passed**，失败用例名逐条相同：
  `rememberedChoice.test.ts > keeps working when storage is unavailable`、
  `UsageDashboard.test.tsx > draws the request log with the columns picked in settings`、
  `UsageDashboard.test.tsx > wires the tabs to the tabpanel and supports arrow / Home / End keys`。
  → 结论：**本机 Node 26 环境下的既有失败**，不是本次改动引入。CI 用的是 ubuntu + node 20，
  push 后那一跑**实测是绿的**（§12.5：`Unit tests` step 08:19:31→08:23:34 success）；
  别把它们算到这次改动头上，也别顺手去"修"。
- `cargo clippy -- -D warnings`：**第一跑就抓到一处真问题**，就在我们新增的
  `src-tauri/src/command_handler.rs:9`（整个文件 5-407 行就是那个 `#[macro_export] macro_rules!`）——
  宏体里 355 处 `crate::` 会被 clippy 判为 `crate_in_macro_def`：`crate` 在导出宏里指向的是
  **调用方**的 crate，不是定义方。已全量改成 `$crate::`（`sed -i 's/\bcrate::/$crate::/g'`，
  替换 355 处、残留 0 处），改完 `cargo check --lib` **exit 0 / 15.03s**。
  两个调用点 `lib.rs:509`、`headless/bootstrap.rs:97` 都在本 crate 内，展开结果与改前指向同一批函数，
  所以这是**修正确性而非改行为**；但要记住：这类"宏里写 `crate::`"的坑只有 clippy 会报，
  `cargo check` 不报——别把 gates 当成唯一门槛。
- **修正后全部复跑一遍**（2026-10-22，均走 `tools/rust.cmd`，MSVC 1.95）：
  `cargo clippy -- -D warnings` **exit 0 / 48.25s**、`cargo check --lib` **exit 0**、
  `cargo check --no-default-features --features headless --lib --bin cc-switch-server` **exit 0**、
  `cargo test --lib --features test-hooks` **exit 0**：
  `3763 passed; 0 failed; 11 ignored; finished in 41.01s`（这条同样要带
  `NO_PROXY=127.0.0.1,localhost`，理由见 §3.5 备注；长任务用 `powershell Start-Process` 脱离终端跑，
  日志落盘后再读，别信管道里的即时 exit code）。
- 工具链一致性：`rust-toolchain.toml` 的 `channel = "1.95"` 与本机 `tools/rust.cmd` 强制的
  `1.95-x86_64-pc-windows-msvc` 同版本，所以本机 rustfmt/clippy 的判定和 CI 用的是同一套。
  顺带：本机 msvc toolchain 原本**没装 clippy 组件**（`rustup component add clippy` 补上，
  否则 `cargo clippy` 直接报"not installed"，容易误判成代码问题）。
- **桌面特性等价性已核对**（这是 §11.1 ① 那批 Cargo.toml 改动最该验的一条）：
  `tauri 2.12.4` 的 `[features].default = ["wry","compression","common-controls-v6","dynamic-acl","x11","dbus"]`
  （registry 里 `tauri-2.12.4/Cargo.toml`），与我们 `desktop` 特性逐条列出的完全对齐，
  外加上游本来就显式声明的 `tray-icon`/`image-png`；`protocol-asset`/`macos-private-api` 改成常驻
  （`build.rs` 的 capability 校验需要）。→ **拆特性没让桌面构建丢任何默认特性**，
  这条不再是风险，只有 headless 侧是新的特性组合。

### 12.3 新工作流 `.github/workflows/build-artifacts.yml`（手动触发，`target` 五选一）
`workflow_dispatch` 的 `target` 选项：`all` / `dist-legacy` / `headless-el9` / `container` / `desktop`。
不挂 push/PR：桌面与容器构建各自要拉几百 MB 依赖，成本不该摊给每次提交。

- `preflight`：`git archive v3.20.4 src | tar -x` + `diff -r src-legacy` + 文件数比对，
  **四个构建 job 全部 `needs: preflight`** —— 把 §2 的第一原则变成 CI 守卫，而不是靠人记得。
- `dist-legacy`：corepack 装 pnpm（读 `packageManager: pnpm@10.12.3`）、node 22（与
  `deploy/Dockerfile` 的 `node:22.12.0-slim` 对齐）→ `pnpm install --frozen-lockfile` →
  `typecheck:legacy` → `build:legacy:web` → 打印文件数与 index js 的 md5 → 上传 artifact。
- `headless-el9`：`docker build -f deploy/Dockerfile.el9-native` →
  `docker create` + `docker cp /out/cc-switch-server` → **守卫**（`readelf -V` 最高 GLIBC 需求必须 ≤ 2.34，
  `readelf -d` 的 DT_NEEDED 里不许出现 webkit/libsoup）→ **在 `quay.io/centos/centos:stream9` 最小容器里实测**：
  先"裸 EL9 不装任何包"跑 `--help` 把缺什么写进日志（不致命，这正是要观察的事实），再
  `dnf install gtk3 curl` 后起服务，验 `/api/health`、`/api/invoke` 的 `get_default_cost_multiplier`、
  首页 `<title>`、SIGTERM 退出码 → 上传单二进制。
- `container`：`docker build -f deploy/Dockerfile` → 带 `CC_SWITCH_TOKEN` 起容器 →
  health / 倍率 set+get（`Authorization: Bearer`，见 `headless/server.rs:105-128`）/ 首页 title →
  **无 token 必须 401** → `docker save` 上传 tar。
- `desktop`：`windows-2022`(msi) + `ubuntu-22.04`(appimage,deb,rpm) 矩阵，系统依赖照抄 `release.yml`；
  **它构建的是 `tauri.conf.json` 现值 = v4 UI**，§6.2 还没拍板，别把这个 job 当成"旧 UI 上桌面已完成"；
  `--config '{"bundle":{"createUpdaterArtifacts":false}}'` 关掉更新签名产物（这条流没有私钥，
  不关会停在 "A public key has been found, but no private key"）。
- 缓存：pnpm store 用 `pnpm store path --silent` 探测（与 `ci.yml` 同法，别写死路径）；
  Rust 用 `shared-key: backend` 蹭 `ci.yml` backend job 的依赖缓存。
- YAML 已本地校验：`python -c "yaml.safe_load(...)"` 通过，5 个 job、无 tab、dispatch 选项 5 个。
  **注意：这些 job 还没在 GitHub 上真跑过**，第一次跑大概率还要修（apt 包名、EL9 容器里 curl 可用性、
  bundling 工具下载）。

### 12.4 `.gitignore` 实际补了什么（2026-10-22）
贴在文件末尾的一块：`dist-legacy/`（前端产物，构建顺序见 §12.1）、`dist-legacy-desktop/`
（§6.2 桌面模式验证的临时产物）、`.ci-sandbox/`（本地干净克隆沙箱，含 1.4 GB `target/`）、
`.e2e-home/`（14515 在用的 E2E 数据目录：`cc-switch.db`、`backups/db_backup_*.db`、
`.claude/settings.json` 里的假 key `sk-e2e…`），以及 `tools/` 下那批一次性落盘证据
（`tools/*.txt`、`cmd-diff.json`、`lib.rs.bak`、`hypot-shim.c`、`hypot-shim.map`）。
- `*.log` 本来就在表里，所以 `tools/e2e-server.log`、本轮新增的 `tools/ci-local-*.log`、
  `tools/ci-clippy*.log` 自动不入库。
- **仍然入库**的 `tools/` 内容：`cmd-compat.md`（§5/§6.1 引用的证据文档）、`cmd-diff.mjs`、
  全部 `wsl-*.sh`、`browser-e2e.mjs`、`ci-local-clean-clone.sh`，以及 §11.3 ⑪ 点名的
  `extract-setup.mjs` / `quiet-headless-warnings.mjs`——按"整包提交"它们进了版本库，
  **重跑会插坏**这条风险没有消失，只是被 §11.3 ⑪ 记录在案；要摘出去随时说。
- 提交前的 staging 预览（`git add -A --dry-run`）：**578 个条目** =
  `src-legacy` 462 + `src-tauri` 54 + `tools` 35 + `web` 15 + `deploy` 3 + 配置/`docs`/`.github`/`.gitignore`/`.dockerignore`。
  `.e2e-home/`、`dist-legacy/`、`src-tauri/target/` 都不在里面。

### 12.5 push 后 CI 实测（2026-10-22，run `39746762224`）——**全绿**
`git -c http.proxy=http://127.0.0.1:7890 push origin main` → `77c6dc79..0912b6c1`，一个 commit
`578 files changed, 124067 insertions(+), 1657 deletions(-)`。
push 到 main 触发 `ci.yml` run #1：<https://github.com/zhaoyj7/cc-switch/actions/runs/39746762224>
**6 个 job 全部 `success`**（结论从 API 逐 step 读，不是看页面印象：
`curl -x http://127.0.0.1:7890 .../actions/runs/39746762224/jobs` 再按 `steps[].conclusion` 汇总）：
- `Detect changed areas` success——`package.json` + `src-tauri/**` + `.github/workflows/**` 都改到，两侧 job 都被拉起。
- `Frontend Checks` success：typecheck 24s、format:check 9s、**Unit tests 08:19:31→08:23:34 绿**、`build:renderer` 15s。
  → §12.2 那 3 个本机失败在 CI（ubuntu + node 20）**不复现**。"本机 Node 26/Windows 专属"从推断升级为实测，
  这也解释了为什么 §12.2 说"别顺手去修"是对的。
- `Backend Checks` 三平台矩阵（windows-latest / ubuntu-22.04 / macos-latest）全绿：
  `Check Rust formatting` 各 4-5s、`Clippy`（`-D warnings`）分别 4m31s / 3m11s / 3m54s、`Run tests` 14m25s / 6m35s / 9m39s。
  两条以前只有本机证据的事，现在拿到跨平台证据：
  ① **本机 clippy 只能在 Windows/MSVC 上跑**，`#[cfg(unix)]` 与 macOS 分支从来没被 lint 过——CI 补上了这个盲区，
  没有额外 lint 冒出来（`$crate` 那处修完在三个平台上都干净）。
  ② 本机 `cargo test` 那两个"失败"归因于系统代理（§3.5）；CI 没带 `NO_PROXY` 也全绿，**反证了那条根因判断**。
- `Backend Checks (Windows + WSL2 home)` success，两个 ignored 契约测试分别 4s / 25s。

`.github/workflows/build-artifacts.yml` 已被 GitHub 注册成 `state: active`（能列出来就说明 YAML 过了它的解析），
本地复验：`python3 -c "yaml.safe_load(...)"` → 5 个 job（`preflight/dist-legacy/headless-el9/container/desktop`）、
dispatch 选项 5 个、文件里 0 个 tab。**但它自己的 job 一次都没跑过**——只有手动 dispatch 才跑，我没替你点
（CI 分钟数是共享资源）。要试先跑最便宜的那条：`target=dist-legacy`（单 ubuntu job，装依赖 + 构建 + md5，约 3-5 分钟）。

EL9 那道 glibc 门做了**离线判定表实测**（不必等构建产物就能验它的逻辑）：
```bash
for v in 2.5 2.17 2.23 2.27 2.28 2.31 2.33 2.34 2.35 2.36 2.38 2.39 2.40 2.41 2.42 3.0 ""; do
  case "GLIBC_$v" in GLIBC_2.3[5-9]*|GLIBC_2.[4-9][0-9]*|GLIBC_[3-9]*) echo "$v REJECT";; *) echo "$v accept";; esac
done
```
→ **≤ 2.34 全 accept、≥ 2.35 全 REJECT**，含真实存在的 2.40/2.41/2.42（Ubuntu 24.04/25.04 就是这几个版本）。
`sort -uV` 取最高值也没问题：`2.2.5/2.3.4/2.27/2.14/2.34`→`2.34`；`2.2.5/2.34/2.35/2.4`→`2.35`；
`2.2.5/2.40/2.9`→`2.40`（逐数字段比较，不会被"字典序里 `2.9` 最大"骗过去——这正是这道门最容易写错的地方）。
表里唯一暴露的洞：**`max` 为空串时 `case` 一条都不匹配 → 这道门形同不存在**（`readelf` 挂了或 grep 没命中就会静默放行）。
已补 `[ -n "$max" ] || exit 1`（`.github/workflows/build-artifacts.yml:147`）——按 §2 的约束，守卫本身失效比误报更危险。

## 13. 桌面版跑旧 UI：实施记录（2026-10-22，用户拍板"就这样做"）

### 13.1 落地形态：两套 UI 并存，谁都没被覆盖
新增 `src-tauri/tauri.legacy.conf.json`（只含 `build` + `bundle.createUpdaterArtifacts:false`），
`tauri.conf.json` **一行没动**；`@tauri-apps/cli` 的 `-c/--config` 支持**多个** JSON/文件按顺序深合并
（`pnpm tauri build --help` 原文："Configurations are merged in the order they are provided"），
所以旧 UI 桌面版 = 基本配置 + 这份覆盖。三条脚本（`package.json`）：
- `build:legacy:desktop` = `vite build --config vite.legacy.config.ts --outDir ../dist-legacy-desktop`
- `tauri:legacy:dev` / `tauri:legacy:build` = `tauri dev|build --config src-tauri/tauri.legacy.conf.json`
产物目录分开（`dist-legacy` = web 版、`dist-legacy-desktop` = 桌面版），因为 `vite.legacy.config.ts:38`
的 shim 别名按 mode 开关，两种模式的 JS 不是同一份东西。

`createUpdaterArtifacts` 在 legacy 配置里关掉是**刻意的**：这条流没有 minisign 私钥，开着会停在
"A public key has been found, but no private key"（`release.yml` 那套私钥注入只服务正式发版）。
——这句话在 §13.6 的 STEP4 里拿到了**正面实测**：base 配置（没关它）本机就在打完包之后停在这句报错上。

`tauri:legacy:build` 不带 `--bundles` 时会打**全部**类型（Windows 上 msi + nsis），两种都要现场从 GitHub
拖打包工具（WiX 41 MB / NSIS），本机直连不通就更慢；只想验打包就手动加 `--bundles msi`（§13.6 有 HTTPS_PROXY 那条）。

### 13.2 桌面构建被什么挡住：`tauri/dbus`（§11.1 ① 的真身）
第一跑 `tauri build` 直接 exit 1：
```
Error Found version mismatched Tauri packages. Make sure the NPM package and Rust crate versions
are on the same major/minor releases: tauri (v2.12.4) : @tauri-apps/api (v2.10.1)
```
**这就是 §11.1 ① 那批 Cargo.lock 整栈升级的后果**，而且根因在我们自己的 Cargo.toml：
`desktop` 特性里写了 `tauri/dbus`，而 `dbus` 这个特性在 tauri **2.10.3 里不存在**
（2.10.3 的 `[features].default = wry, compression, common-controls-v6, dynamic-acl, x11`，
`cargo metadata` 报的可用特性里没有它）。写一个不存在的特性名，cargo 的解法是**把 tauri 升到满足该特性的最新版本**，
于是 `tauri`/`tauri-utils`/`tao`/`wry`/`muda`/`*-plugin-*` 整条栈被抬到 2.12.x，而 JS 侧仍是 2.10.1
（我们从没动过 `package.json` 的依赖），CLI 的版本一致性检查就把构建钉死了。

修法（删掉一行 + 恢复上游锁，不手改 lock）：
```bash
sed -i '/"tauri\/dbus",/d' src-tauri/Cargo.toml        # 唯一的实质改动
git show 77c6dc79:src-tauri/Cargo.lock > src-tauri/Cargo.lock
cargo metadata --format-version 1 --filter-platform x86_64-pc-windows-msvc   # 只 "Adding" 新依赖
```
`cargo update -p tauri --precise 2.10.3 --dry-run` 在删除前的报错也直接印证了同一条因果链
（"package `cc-switch` depends on `tauri` with feature `dbus` but `tauri` does not have that feature"）。
删除后两条解析路径都停在上游版本：`tauri = 2.10.3`（默认特性）与 headless（`--no-default-features
--features headless`）都是 2.10.3；`tauri/test` 在 2.10.3 就有，无头版不受影响。
**Cargo.lock 的 diff 从 485 增/189 删缩到 132 增/15 删**，剩下的几乎全是新增依赖（rust-embed、sha2、unicase…），
§11.1 ① 由"要不要接受整栈升级"变成了"无需决策"。
Cargo.toml 里补了一行注释说明特性名必须存在于锁定版本，免得下次又踩。

### 13.3 复验（tauri 回到 2.10.3 之后，全部走 `tools/rust.cmd`）
| 步骤 | 结果 |
| --- | --- |
| `pnpm tauri build --config … --debug --no-bundle` | **exit 0**，`Finished dev profile in 3m 01s`，产物 `src-tauri/target/debug/cc-switch.exe` |
| `cargo check --no-default-features --features headless --lib --bin cc-switch-server` | **exit 0** |
| `cargo clippy -- -D warnings`（与 `ci.yml` 同参数） | **exit 0**，`Finished in 1m 02s` |
| `cargo fmt --check --all` | **exit 0** |
| `cargo test --lib --features test-hooks` | **3763 passed / 0 failed / 11 ignored，44.64s** |
| `pnpm build:legacy:desktop` | **exit 0**，12.30s，`index-xVfo7ZYQ.js` 4,626.87 kB（与 §6.2 早前那次同 hash） |
> 注意 `ci.yml` 的 clippy/nextest 是在 **2.12.4** 下绿的，2.10.3 这套版本组合**CI 还没跑过**，
> 所以 §13.3 这行本地复验是推送前的必要条件，别省。

### 13.4 真机验证：`tools/desktop-cdp-check.mjs`，13/13
`tauri build --debug` 出来的 exe 页面资源是**编译期嵌进去的**（`http://tauri.localhost/`），不依赖 dev server，
所以可以直接双击使用。验证方法：用 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<现挑端口>`
起进程，再用 Node 连 WebView2 的 CDP（不是另起 Chrome；端口现挑的理由见 §9）。
CDP `/json/list` 先给出一个硬证据：**页面 title = "Claude Code 供应商切换器"**，即 v3.20.4 的 `index.html`；
`document.body.innerText` 里能读到 `Claude Official / No Routing Support / In Use` 这些旧版列表行。
命令逐条 `__TAURI_INTERNALS__.invoke`（参数照旧 UI 的调用写）：
`get_providers{app}`、`get_current_provider{app}`、`get_config_status{app}`、`get_settings`、
`get_stream_check_config`、`get_default_cost_multiplier{appType}`、`get_common_config_snippet{appType}`、
`get_claude_desktop_status` 全 **PASS**（后三条就是 §3.4 补的那批），并且
**无未捕获异常 / 无 console.error** → 说明 dialog/process/log/updater 这些插件的 ACL 与注册都没缺
（`capabilities/default.json` 现有权限覆盖了旧 UI 用到的窗口/对话框/进程操作）。
两次踩坑记录：① 探针一开始传 `{}` 少参数，报的是 "missing required key app"，那是**探针的错**不是应用的错；
② JS 里 `e && e.message ?? e` 是语法错误（`??` 不能和 `&&` 混写不加括号），会把整条 evaluate 打挂。
- 探针跑的是**只读命令**；旧 UI 一旦点"启用/切换"会写真实的 `~/.claude/settings.json`。
- **`CC_SWITCH_DATA_DIR` 只隔离数据库，不隔离设备级设置**（2026-10-22 实测纠正，之前这里写错了）：
  `AppSettings::settings_path()` 走的是 `get_home_dir()/.cc-switch/settings.json`（`settings.rs:688-694`），
  **没有**经过 `app_config_dir` 那套 override（`app_store.rs:37` 的 `CC_SWITCH_DATA_DIR` 只管 `cc-switch.db`）。
  所以带隔离数据目录跑起来的实例，读和写的都是**你机器上那份真的 `settings.json`**：
  实测第一次起完该文件 mtime = `10-22 22:00`，正好是那次启动的时刻（写盘入口 `save_settings_file`，`settings.rs:922`；
  **哪条启动路径触发这次写没查，属推断**）。内容没被盖掉：`language=zh`、`currentProviderClaude=default`、
  `enableLocalProxy=true`、`preferredTerminal=wt`、`whatsNewSeenVersion=4.0.12` 这些用户值都还在（32 个键）。
  但**别把它当无害**：想要真隔离得连 `HOME`/`USERPROFILE` 一起改。
- 隔离标识：与已安装实例并存要靠换 `identifier`——`tauri-plugin-single-instance` 在 Windows 上的互斥体名
  就是 `{identifier}-sim`（`platform_impl/windows.rs:67`），不换的话第二个进程只会把**第一个**窗口叫到前台然后退出。
  验证期用 `--config src-tauri/tauri.legacy.test.json`（一次性文件，**已删，不入库**；内容就一行
  `{"identifier": "com.ccswitch.desktop.legacytest"}`，要复现再建一次即可）换 id，别把正式 id 的构建改掉。

**复跑（2026-10-22 第二次，用户要求"再起看看"）**：先确认进程确实不在了（`Get-Process` 里没有任何
`cc-switch`，连装好的正式版也没在跑），重起即可（`.ci-sandbox/launch-legacy-desktop.ps1`，ASCII 标签理由见 §13.6 末）：
```powershell
$env:CC_SWITCH_DATA_DIR = "D:\projects\ccs\.ci-sandbox\desktop-home"
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=9417"   # 端口现挑，别用 9333
$env:NO_PROXY = "127.0.0.1,localhost"
Start-Process -FilePath "D:\projects\ccs\src-tauri\target\debug\cc-switch.exe" `
  -WorkingDirectory "D:\projects\ccs\src-tauri" -WindowStyle Normal -PassThru
```
起完 `node tools/desktop-cdp-check.mjs 9417` → **13/13 通过**（同 §13.4 那张表），
`/json/list` 的 title 仍是 `Claude Code 供应商切换器`，视口 `innerWidth×innerHeight = 1100×620`。

**但用户看不到窗口，这条最值得记**："13/13 通过"**不代表窗口露出来了**，两者完全独立：
- 证据：`.ci-sandbox/desktop-legacy.out.log` 最后一行是 `静默启动模式：主窗口已隐藏`
  （`setup.rs:983-990`，同时 `set_skip_taskbar(true)`），而 `tauri.conf.json` 的主窗口本来就是
  `"visible": false`，Windows 侧靠 `on_page_load` 里那句 `webview.window().show()`（`lib.rs:443-453`）——
  那句被 `!settings.silent_startup` 挡掉了。于是页面在跑、CDP 全绿、屏幕上什么都没有。
- 根因是**你机器上的真设置**：`~/.cc-switch/settings.json` 里 `"silentStartup": true`（配合
  `showInTray`/`minimizeToTrayOnClose`/`launchOnStartup` 都是 true，即"开机自启 + 只待托盘"）。
  这条设置**不受 `CC_SWITCH_DATA_DIR` 隔离**（见上一条），所以沙箱实例也照它执行。
- 把窗口叫出来的两个办法（都验证过）：① **再启动一次同一个 exe**，第二个进程会走 single-instance 回调
  （`lib.rs:420-436`：`set_skip_taskbar(false)` + `unminimize` + `show` + `set_focus`）然后自己退出，
  实测 `HWND=400110 VISIBLE=True TITLE=[CC Switch] RECT=453,215,1569,874`、第二个 PID 6 秒后已消失；
  ② Win32 硬来：`ShowWindow(SW_MINIMIZE)` → `SW_RESTORE` → 敲一次 ALT → `BringWindowToTop` + `SetForegroundWindow`，
  之后 `GetForegroundWindow()` 才等于目标句柄（直接 `SetForegroundWindow` 会被前台锁挡掉，实测叫不动）。
- 以后要"看得见地"跑：要么临时把 `silentStartup` 设成 false（那是改用户设置，得先问），要么照 ① 起两次。

顺手点了设置页，两条新事实：
- **旧 UI 的设置页 Tab 不吃 `el.click()`**：`document.querySelectorAll("button")[1].click()` 连发两次截图字节数完全一样
  （43,586 = 没换页），要按 `pointerdown → mousedown → pointerup → mouseup → click` 全序列打到
  `document.elementFromPoint(x,y)` 上才切到"通用"页（截图 41,647）。以后写 CDP 探针点这个 UI 得照这个来。
- **"关于"页会打真网络、并且有能改机器的按钮**：本页一打开就去查新版本，实测拿到了
  `检测到新版本：4.0.18` 和 `Claude Code 2.1.300→2.1.308`、`Codex 0.162.1→0.163.0`，
  按钮是 `更新到 v4.0.18` / `全部升级（2）` / 每行一个 `升级`。**这些别点**：前者会走 updater 流程，
  后者会去升用户机器上的 Claude Code / Codex CLI。这一页只截了图，没触发任何升级。

### 13.5 已知遗留
- `pnpm tauri:legacy:dev`（dev server + 3001）这条路径**没测过**，测的是 build 产物。
- CLI 打印的 `Built application at: …\target\debug\server.exe` **不是"日志难看"，是打包真会坏**：
  同一个 `bin_path` 既用来打印、也用来 rename/喂给 bundler，`--bundles msi` 就在这一步炸。
  根因与修复见 §13.6（已修，桌面 MSI 与 base 配置都复验过）。
- 桌面版的旧 UI **只做过启动页 + 命令级验证**，没逐个面板点过（§3.4 那 6 条之外的一致性仍是静态比对结论）。
  → 2026-10-23 已经开始逐个点：CSS 静默丢失（§13.7，已修）、会话管理页必崩（§13.8，待拍板）。
  剩下那些面板（路由 / 认证 / 高级 / 使用统计 / Skills / 提示词 / MCP）同样没点过，**默认按"可能有同类问题"看待**。

### 13.6 桌面打包被"第二个 bin"打断：根因、修复、复验（2026-10-22）

**症状**（两条，都在 release 编完之后才出现，所以 `Finished release profile` 是绿的别被骗）：
1. 不带 `mainBinaryName`：`Built application at: …\target\release\server.exe` → `failed to bundle project The system cannot find the file specified. (os error 2)`
2. 带 `mainBinaryName: "cc-switch"`：`failed to rename app binary D:\…\target\release\server.exe (os error 2)`
（`server.exe` 这个文件从头到尾不存在；`cargo metadata` 里也只有 `cc-switch` 和 `cc-switch-server` 两个 bin。）

**根因**（读了 CLI/bundler 源码，不是猜；源码从 `static.crates.io` 拉的对齐版本：`tauri-cli-2.10.1`、`tauri-bundler-2.8.1`）：
- `tauri-cli/src/interface/rust.rs:963-1002`：候选二进制不止来自 `Cargo.toml`，还会**扫 `src-tauri/src/bin/*.rs`**，
  文件名去后缀直接当 bin 名 → 我们那份无头入口 `src/bin/server.rs` 变成候选 `server`。
- `tauri-cli/src/interface/rust.rs:907-913`：主二进制取 `find(|b| b.main())`，而 `main` 由
  "bin 名 == 包名"或 `package > default-run` 决定（`:954`、`:997-1003`）——**CLI 自己的报错文案就在建议加 `default-run`**。
- `tauri-bundler/src/bundle/windows/msi/mod.rs:919-931`：WIX 的 wxs 会为**每一个"非主二进制"**生成一个
  `<File Source="target/release/<name>.exe">` 组件。所以 `server` 就算不被当主二进制，也会作为"要一起打包的二进制"
  被写进安装脚本，`light.exe` 找不到文件就报 `LGHT0103`。

**决定性证据**（手工复跑 light，绕开 bundler 的吞错误输出）：
```
D:\projects\ccs\src-tauri\target\release\wix\x64\main.wxs(145) : error LGHT0103 :
  The system cannot find the file 'D:\projects\ccs\src-tauri\target\release\server.exe'.
```
同一次生成的 `main.wxs` 里：`:141` 的**主**二进制已经是正确的 `cc-switch.exe`（说明 `default-run` 生效了），
`:144-145` 多出一个 `<Component Id="server">` —— 这就是残留候选。

**两处修复**（都在 `src-tauri/Cargo.toml`，代码零改动）：
1. `[package] default-run = "cc-switch"`（`:10-12`）——把主二进制钉死。
2. `git mv src-tauri/src/bin/server.rs → src-tauri/src/headless_main.rs`，并把 `[[bin]] path` 改成新路径（`:55-59`）
   ——让 `src/bin/` 目录消失，CLI 就扫不出幽灵候选。放在 `src/` 顶层而不是 `src/headless/` 里，
   是为了避开同名的库模块文件 `src/headless/server.rs`（重名会让人以为 bin 入口就是那个模块）。

**顺带钉死的一条脆弱点**（**别顺手改**）：主 bin 上的 `required-features = ["desktop"]` 现在是**有用的**。
`rust.rs:944-952` 会按 `--features` 过滤声明的 bin，而我们平时不传 `--features`（走 cargo 的 default），
于是两个声明的 bin 都被过滤掉，主二进制改由"`src/main.rs` 兜底扫描 + `default-run`"给出——恰好只剩一个候选。
若哪天给 `tauri build` 加 `--features desktop`，`cc-switch-server` 会重新出现在"非主二进制"里，
`light.exe` 就会改成抱怨 `cc-switch-server.exe` 找不到。真要长期稳，办法是把无头入口拆成独立 crate。

**打包环境坑**（与代码无关，但会挡住本地复现）：
- WiX 由 bundler 现场下载 `wix314-binaries.zip`（`msi/mod.rs:39-41`，sha256 `6ac824e1…`），
  走 `ureq::Proxy::try_from_env()`（`src/utils/http_utils.rs:67-71`）→ **给进程设 `HTTPS_PROXY` 才会用代理**；
  本机直连 `objects.githubusercontent.com` 8 秒超时（实测：带 `-x` 7.27s 下完 41.3 MB，不带就 `(28)`），
  所以第一次尝试是卡死在下载阶段。解压缓存目录 `C:\Users\admin\AppData\Local\tauri\WixTools314`，第二次跑不再下载。
- `--bundles msi` 每次都会先跑 `beforeBuildCommand`（vite ~12-14s），并且 Cargo.toml 一改 release 就全量重编（实测 6m18s / 6m37s）。
- **`.ps1` 也别写中文**（§9 那条".cmd 里不要写中文注释"的同族坑，这次代价更大）：PowerShell 5.1 按 ANSI 代码页读无 BOM 的
  UTF-8 脚本，某些中文字节序列会把解析器打崩——实测报 `At …gates-after-move.ps1:25 char:25 / The string is missing the terminator: '`，
  **整个脚本一行都没执行**（我等了半天才从 `tools/*.err.log` 里看到）。写标签用 ASCII 就好。

**复验**：见下表（脚本 `.ci-sandbox/legacy-msi-retry4.ps1`，日志 `tools/msi4.log`，PID 记在 `.ci-sandbox/msi4.pid`；
STEP1 单独跑在 `legacy-msi-retry3.ps1` / `tools/msi3.log`）。

| 步骤 | 命令 | 结果 |
| --- | --- | --- |
| STEP1 | `cargo check --no-default-features --features headless --lib --bin cc-switch-server` | **exit 0**，1.61s（新路径编得过） |
| STEP2 | `cargo build --no-default-features --features headless --bin cc-switch-server` | **exit 101**：`failed to remove file …\target\debug\cc-switch-server.exe` + `Access is denied. (os error 5)`——那个 debug 产物正被 §6.3 留在 14515 的 e2e 实例**运行中占着**（Windows 不允许覆盖在跑的 exe）。**不是代码问题**；STEP1 的 check 已足够证明新路径可编，所以 STEP2 从复验里去掉（要重编它得先停 14515 那个进程）。 |
| STEP3 | `pnpm tauri build --config src-tauri/tauri.legacy.conf.json --bundles msi` | **exit 0**：`Finished release profile in 6m 42s` → `Built application at: …\release\cc-switch.exe` → candle → light → `Finished 1 bundle at: …\bundle\msi\CC Switch_4.0.15_x64_en-US.msi`，**16,572,416 字节**（23:01:21），已复制到 `.ci-sandbox/legacy-CC Switch_4.0.15_x64_en-US.msi`。**没装过**（不想动用户机器上的正式实例），只验到"安装包产出来了"。 |
| STEP4 | `pnpm tauri build --bundles msi`（base 配置 = v4 UI，护住 `release.yml` 与 `build-artifacts.yml` 的 desktop job） | **MSI 照样打出来**（`Finished 1 bundle at:`，17,092,608 字节，23:08:29），**exit 1 的原因不是打包**：`A public key has been found, but no private key. Make sure to set 'TAURI_SIGNING_PRIVATE_KEY'`——base 配置留着 `createUpdaterArtifacts: true`，本机没有签名私钥。**CI 两边都不用改**：`release.yml:191-192` 上了 secret，`build-artifacts.yml:324-330` 早就用 `--config '{"bundle":{"createUpdaterArtifacts":false}}'` 关掉并注明了同一条报错。 |

> 两条顺带结论：
> ① **打包会把 exe 改掉，导致下一次 `tauri build` 全量重编 release**（日志里 `Info Patching … with bundle type information: msi`
> 之后，STEP4 又 `Compiling cc-switch` 跑了 6m42s）。本地连着打两种包时别把这段时间当成"缓存没命中的异常"。
> ② STEP4 的 exit 1 是**打完包之后**才发生的，看日志要看到最后一行，别在 `Finished 1 bundle at:` 就下结论。
> ③ 这个坑与 config 无关（幽灵候选来自目录扫描），所以**新工作流的 `desktop` job 本来也会以同样方式失败**
> ——`build-artifacts.yml:329` 走的正是 `pnpm tauri build --bundles msi`。现在被这两处修复顺带堵掉了；
> 但注意这条工作流**仍然一次都没真跑过**（§12.5 末），STEP3/4 是本机等价命令的实测。

**挪文件之后重跑的 Rust 门**（`tools/gates4.log` + `.ci-sandbox/gates-headless-fix.ps1`，全部 `tools/rust.cmd` 等价环境）：

| 门 | 结果 |
| --- | --- |
| `cargo fmt --check --all` | **exit 0**（两次，改动前后各一次） |
| `cargo clippy -- -D warnings`（default = desktop，与 `ci.yml` 同参数） | **exit 0** |
| `cargo clippy --no-default-features --features headless --lib --bins -- -D warnings` | 第一次 **exit 101**，修完 **exit 0**（39.38s）——见下面那条 CI 盲区 |
| `cargo check --no-default-features --features headless --lib --bin cc-switch-server` | **exit 0**（7.57s） |
| `cargo test --lib --features test-hooks` | **3763 passed / 0 failed / 11 ignored，40.06s**（与 §13.3 那次同数） |

> **新发现的 CI 盲区**（这条不在 §11 的 11 条里，是这次多跑出来的）：`ci.yml` 的 clippy 用 default 特性跑，
> 而 `src-tauri/src/headless/server.rs` **只在 `headless` 特性下编译**，所以里面的
> `useless_conversion` 永远抓不到。实测报错点在改文件之前就在：
> `src-tauri/src/headless/server.rs:181` `cmd: cmd.into()`——`InvokeRequest.cmd` 的类型就是 `String`
> （`tauri-2.10.3/src/webview/mod.rs:134`），`cmd` 本身也是 `String`，`.into()` 是空转换。
> 已按 §11.2（"我们新增代码里的冗余"）删成 `cmd,`，headless 侧 clippy 转绿；行为零变化。
> 要长期堵住这个盲区，得给 `ci.yml` 补一条 headless 特性的 clippy（改现有 CI 门，**等你点头**）。
>
> 产物绝对路径备查：单文件 exe `D:\projects\ccs\src-tauri\target\release\cc-switch.exe`（43 MB）；
> 旧 UI 安装包已转出打包目录 `D:\projects\ccs\.ci-sandbox\legacy-CC Switch_4.0.15_x64_en-US.msi`
> （16,572,416 字节，在 STEP4 的同名文件覆盖它之前 copy 出来的——就是下面那条同名坑）。

**还发现一件要你先拍板的（不改代码）**：两套 UI 的桌面产物**文件名完全一样**——
`productName`/`version` 没区分，MSI 都是 `CC Switch_4.0.15_x64_en-US.msi`，后打的会盖掉先打的
（我在脚本里先把旧 UI 那份 `Copy-Item` 到 `.ci-sandbox/` 才敢跑 STEP4）。
要并存得动 `tauri.legacy.conf.json` 的 `productName`（连带升级码/安装标识），这属于交付形态决策，等你说话。

---

## 13.7 旧 UI 的 CSS 一直是"按新 UI 扫出来的"：一个静默的构建配置 bug（2026-10-23 已修）

**症状**（用户截图原话："那几个空白是什么"）：顶栏三处渲染不出来——
① 最右侧"添加新供应商"按钮变成一个**没有加号的白圆**（只剩投影）；② "Claude 本地路由"开关的轨道**完全看不见**；
③ 任何用到新 UI 没用过的颜色的地方（徽章、警告条、成功/危险按钮）都会掉色。

**证据链**（每一步都是实测，不是推断）：
- DOM：`button[aria-label="添加新供应商"]` 的 class 里有 `bg-orange-500`，但 computed
  `background-color: rgba(0,0,0,0)`、`color: rgb(255,255,255)`，两个 `+` 的 `<path>` stroke 都是白
  → **白底白字**，圆形的可见部分其实只有 `shadow-lg`。
- CSS：`dist-legacy*/assets/index-*.css` 里搜不到 `.bg-orange-500`、`.bg-emerald-500`、`.bg-gray-200`、
  `.text-yellow-600`，**却搜得到** `.bg-control-off[data-state=unchecked]{…}`——这个类只出现在
  `src/components/ui/switch.tsx`（新 UI），`src-legacy/` 里一个都没有。→ 打包时 Tailwind 扫的是 `./src/**`。
- 根因：`vite.legacy.config.ts` 里写的是 `css.postcss: "./postcss.legacy.config.cjs"`。
  **vite 的 `css.postcss` 传字符串时按"去这个目录找配置文件"解释，不是配置文件路径**，于是没找到任何东西，
  退回根目录 `postcss.config.cjs`（`tailwindcss: {}` 不带 config）→ Tailwind 自动发现
  `tailwind.config.cjs`，而它的 `content` 是 `["./src/index.html","./src/**/*.{js,ts,jsx,tsx}"]`。
  也就是说 `tailwind.legacy.config.cjs`（content 指向 `./src-legacy/**`）**从来没生效过**。

**量化**（一次性脚本 `.ci-sandbox/tw-missing.cjs`：抽 `src-legacy` 字符串字面量里的 class 候选，逐个查 CSS 里有没有对应选择器）：

| | class 候选 | CSS 里不存在 | 占比 |
|---|---|---|---|
| 修复前 | 664 | **262** | 39.5% |
| 修复后 | 664 | 33 | 5.0% |

剩下 33 个逐条核过，全是**脚本误报或本来就不该有**：带 `:`/`.` 的转义类（`focus-visible:ring-2`、
`space-y-1.5` 用 `-F` 直接搜都在）；`animate-in`/`fade-in-0` 来自 `tailwindcss-animate`，而
**v3.20.4 自己的 `tailwind.config.cjs` 就是 `plugins: []`**（`git show v3.20.4:tailwind.config.cjs`），
旧版从来没生成过这些类，属忠实复现；其余是 `fill-opacity=`、`top-level` 这类被误当 class 的普通字符串。
顺带核了一件重要的事：`diff <(git show v3.20.4:tailwind.config.cjs) tailwind.legacy.config.cjs` **只差 `content` 一行**。

**修复**（`vite.legacy.config.ts`，只动这一处）：`css.postcss` 改成内联
`plugins: [tailwindcss({ config: path.resolve(__dirname, "tailwind.legacy.config.cjs") }), autoprefixer()]`，
并把 `postcss.legacy.config.cjs` 里那个字符串路径废弃（**待决定：这个文件删掉还是留着当备用**）。

**影响面（比桌面版大得多）**：`dist-legacy`（web 版）和 `dist-legacy-desktop` 现在产出**同一份 CSS**
（同名 `index-Bxf3F2jj.css`，91.65 kB）——反过来说，**之前那两份内嵌的页面都带着这个 bug**：
§5.6 的 EL9 单二进制、容器镜像 `localhost/cc-switch-server:dev`、以及 §13.6 那个
`.ci-sandbox/legacy-CC Switch_4.0.15_x64_en-US.msi` 全是修复前的产物，**要重编再发**
（web 侧走 `pnpm build:legacy:web` + `tools/wsl-el9-copy-check.sh` 那条链）。
之前 §3.5 的 E2E 16/16 抓不到它，因为断言的是**行为和文案**，颜色掉了不影响通过——这是个盲区。

**复验**：桌面 debug 重编（`pnpm tauri build --config src-tauri/tauri.legacy.conf.json --debug --no-bundle`，
1m18s，exit 0）后真机截图：加号是**橙色圆 + 白色加号**，开关轨道是**灰色**（`.ci-sandbox/after-cssfix-full.png`、
`after-header-left.png`、`after-header-right.png`）。

## 13.8 会话管理页在 v4 后端上必崩：有 blocks 时不下发 `content`（**2026-11-05 已按 ① 修好，见 §20.6**）

**症状**：整页换成根错误边界，文案"界面遇到了问题 / 重新加载界面"，日志里
`TypeError: Cannot read properties of undefined (reading 'slice')`（`.ci-sandbox/desktop-home/logs/cc-switch.log`，
连打 4 次）。

**链路**（两边都读了源码）：
- v4：`src-tauri/src/session_manager/model.rs:11-36` 的 `SessionMessage.content` 是 `#[serde(default)]`，
  而下面**手写的 `Serialize`（`model.rs:38+`）在 `blocks` 非空时直接跳过 `content`**，
  注释写得很清楚："有 blocks 时省略 content（它只是 blocks 的投影，大会话里约占 payload 的四分之一）"。
- v3 前端（逐字节冻结，不能改）：`src-legacy/components/sessions/SessionManagerPage.tsx:384-396` 把
  `msg.content` 原样传给 `src-legacy/components/sessions/utils.ts:225-232` 的
  `formatSessionMessagePreview(content) => content.slice(0, maxLength)` → `undefined.slice` 炸。
- 对照 v3 后端：`git show v3.20.4:src-tauri/src/session_manager/mod.rs:31-37` 的 `SessionMessage`
  是 `content: String` **必发**。所以这是 v4 那次"blocks 化"重构改掉了旧 UI 依赖的字段。
- 实测 payload：`invoke("get_session_messages", {providerId:"claude", sourcePath:"…\.claude\projects\D--projects-newapi\1182e655-….jsonl"})`
  → 2157 条消息，键只有 `role,ts,id,turnId,blocks`（部分多 `injected`/`meta`），**没有 `content`**。

**触发条件**：`currentView === "sessions"` 才挂载那个页面（`src-legacy/App.tsx:1099-1104` 是个 switch），
所以正常是"点开会话管理就白屏"。我这次**一启动就白屏**，原因很具体：那次重建没换 `identifier`，
用的是正式 id `com.ccswitch.desktop` → WebView2 复用了你**正式版那份 profile**，
`localStorage["cc-switch-last-view"]` 里留着 `"sessions"`（正式版上次停在这一页）。已经把该键改回原值了。
> 这条顺带说明 §13.4 那个"换 identifier 只为并存"的隔离**还多挡了一层东西**：不换的话旧 UI 会读写
> 正式版的 WebView2 profile（localStorage 那一层，`settings.json` 那层本来就隔离不了，见 §13.4）。

**三条路，我没动代码**：
| | 做法 | 代价 |
|---|---|---|
| ① 传输层补字段（推荐）**← 2026-11-05 按这条做了，见 §20.6** | legacy 构建里把 `@tauri-apps/api/core` 包一层：web mode 已有 shim，桌面 mode 也加同一个 alias，`invoke("get_session_messages")` 回来后从 `blocks` 拼纯文本填进 `content` | 一处小改；src-legacy 零改动、后端零改动、不影响新 UI；**同一个改动顺手修掉 web 版/无头版页面的同一个崩溃** |
| ② 后端为旧客户端始终下发 `content` | 需要区分"谁在调"（参数/头/新命令），动共享命令的响应 | 破坏 v4 那次省 1/4 payload 的优化意图，改动面最大 |
| ③ 记为已知限制 | 旧 UI 里"会话管理"不可用 | 用户能感知的功能缺失，§11 要加一条 |

**另外**：这个崩溃暴露了 §3.4 命令兼容清单的方法论盲区——那份清单只核了**命令存不存在**，
没核**响应体字段还在不在**。要补的话，值得拿旧 UI 每个 `invoke()` 的返回值形状做一次实测对照
（`src-legacy/lib/api/*.ts` 就是现成的调用点清单）。

## 13.9 无头单二进制重编 + CLI 侧真机复验（2026-10-24，用户："跑一下cli端我看看"）

**做了什么**：§13.7 的 CSS 修复只改了构建配置，产物里只有桌面 debug 版重编过。这次把 **Windows 无头
release 二进制**重编（`dist-legacy` 编译期内嵌，`headless/assets.rs:4` 的 `#[folder = "../dist-legacy"]`），
起起来，命令行面 + HTTP API 面 + 真浏览器页面三面都验了一遍，然后开真实 Chrome 窗口交给用户点。

| 项 | 结果 | 复现命令 / 证据 |
|---|---|---|
| release 重编 | `Finished 'release' profile [optimized] target(s) in 5m 41s`；产物 `src-tauri/target/release/cc-switch-server.exe` **41,938,432 B**，sha256 `e48abf7f5c60ce47e9d652b5b453dea813d11da2c184133ec5261b0745b3d2c8` | `tools/rust.cmd build --release --no-default-features --features headless --bin cc-switch-server`（MSVC env 在 `rust.cmd` 里；detached 跑，日志 `.ci-sandbox/headless-release.{out,err}.log`） |
| 内嵌页面是修好的那份 | `GET /` 引的是 `assets/index-Bxf3F2jj.css`；`GET /assets/index-Bxf3F2jj.css` 里 **`.bg-orange-500{` 命中 1 次**（修复前 0 次） | `bash .ci-sandbox/cli-demo.sh <端口>`（脚本里这一段是 `grep -c -F '.bg-orange-500{'`，必须 `-F`，选择器带 `.`） |
| 页面真的上色了 | `button[aria-label="Add New Provider"]` computed `background-color: rgb(249,115,22)`（§13.7 修复前是 `rgba(0,0,0,0)` 白底白字） | `node .ci-sandbox/cli-shot.mjs http://127.0.0.1:<端口>/ .ci-sandbox/cli-page-main.png "<页内表达式>"` → 截图 `.ci-sandbox/cli-page-full.png`（带首启介绍弹窗）、`cli-page-main.png`（关掉弹窗） |
| CLI 面 | `--help` 五个选项都在；**`--bind 0.0.0.0` 不带 token 直接拒绝**（`监听地址 0.0.0.0 不是本机回环，必须用 --token…`，exit 1）；未知参数报错并回打用法 | 直接跑 exe；`headless_main.rs:80-90` 是那段守卫 |
| HTTP API 面 | `health`/`meta` OK；倍率 `"1"`→设 `2.5`→读回 `"2.5"`、`-1` 报 `无效倍率: -1 - 倍率不能为负数 (Invalid multiplier…)`；`save_stream_check_config` 写入 `{20,2,900}` 后 `get` 读回同值 | 同上脚本 |
| 真浏览器 E2E | **16/16 全通过**（21 次 `/api/invoke` 全 2xx、SSE 两帧 `provider-switched`/`profile-applied`、控制台无应用级报错） | `node tools/browser-e2e.mjs http://127.0.0.1:<端口>/` |
| 沙箱真隔离（这次做对了） | E2E 跑完，用户真实 `~/.claude/settings.json`（mtime **10-20 22:49**）与 `~/.cc-switch/settings.json`（**10-22 22:00**）**一个都没变**；被写的只有 `.ci-sandbox/cli-home/` 里的 `.cc-switch/settings.json`、`cc-switch.db`、`model-pricing.json` | 起服务时同时给 `CC_SWITCH_TEST_HOME`（`config.rs:78-88`，没有 cfg 门，就是给测试/调试用的 home 覆盖）和 `--data-dir`。**验一眼就看 `/api/meta` 的 `homeDir`**——它是真的还是沙箱路径，骗不了人 |

**两个要记的坑**：

1. **`/api/meta` 的 `homeDir` 是隔离的唯一可见证据**。只给 `--data-dir` 时 `homeDir` 仍是 `C:\Users\admin`
   （§13.4 已经写明 `settings.json` 跟着 home 走，不跟 data dir 走）。这次第一版启动脚本就漏了，
   靠 `meta` 才发现。
2. **一个没定位到根因的 PowerShell 现象**（结论只能是"这条路径不可信"，别当规律用）：同一个 `.ps1`
   里 `$env:CC_SWITCH_TEST_HOME = $dataDir` 紧接 `Start-Process`，起出来的服务 `homeDir` 是真实用户目录
   （3/3 复现）；把上面那行**中文注释**删掉就正常（2/2）；可"中文注释 + 下一行赋值"单独做成最小复现
   又是正常的。所以别猜原因，**起完服务必查 `/api/meta`**。用 bash 直接带 env 起（`CC_SWITCH_TEST_HOME=… ./cc-switch-server.exe … &`）
   这次是好的（`.ci-sandbox/cli-server.out.log`）。

**§13.8 那个崩溃在 web / 无头侧同样存在（这次是实测，之前只是推断）**：
- 往沙箱 home 放一条合成会话（`.ci-sandbox/cli-home/.claude/projects/D--synthetic/synthetic-session.jsonl`，
  两行：一行 `type:"user"`、一行 `type:"assistant"` 带 `content:[{type:"text",…}]`），
  `node .ci-sandbox/sessions-payload-probe.mjs <端口> '<jsonl 绝对路径>'` →
  **2 条消息、键只有 `role,ts,id,turnId,blocks`、"有 content 的条数" = 0**。
- 页面上把 `localStorage["cc-switch-last-view"]` 设成 `sessions` 再刷新 → 直接落到错误边界
  （`Something went wrong in the interface … Reload interface`），截图 `.ci-sandbox/cli-sessions-crash.png`，
  复现脚本 `.ci-sandbox/cli-sessions-crash.mjs`。
- 顺带读到一条有用的边界：`session_manager::load_transcript` 会校验 `sourcePath` 必须在
  "home 推出来的会话根目录"底下，越界直接 `Session root not found for provider claude: …`（HTTP 500）。
  所以无头服务不会被你塞的任意路径读出别处的 jsonl。
→ ①/②/③ 那张代价表里"① 顺手修掉 web 版/无头版"一栏，现在按实测算。

**本机现场（2026-10-24 01:30 左右）**：
- 在跑：`cc-switch-server.exe` **PID 43696**，`127.0.0.1:14536`，`--data-dir` 与 `CC_SWITCH_TEST_HOME`
  都指 `.ci-sandbox/cli-home`（`.e2e-home` 的一份拷贝，12 MB）。用户的 Chrome 已开在
  `http://127.0.0.1:14536/`（可见窗口标题 `Claude Code 供应商切换器`）。
- 之前那次"桌面 debug 版"（PID 43088 / 9428）已经不在了；桌面上现在只有正式版 `CC Switch` 和用户自己开的东西。
- 试错期间起过的另外 3 个无头实例（14531/14534/14535）都已 `Stop-Process` 掉，只剩 14536 这一个。
- `.ci-sandbox/cli-home/.claude/projects/D--synthetic/` 那条合成会话**已删**（留着会让用户一点开"会话管理"
  就看到 §13.8 那个错误边界，误以为是新 bug）。

## 13.10 EL9 原生单二进制按修复后重编（2026-10-24，用户："build起来我丢服务器上玩玩"）

**要交付的就是这一个文件**（Linux 服务器上直接跑，不需要容器、不需要显示器）：

| 项 | 值 |
|---|---|
| WSL 侧 | `/root/ccs-deploy/cc-switch-server-el9`（38,998,072 B） |
| Windows 侧拷贝 | `D:\projects\ccs\.ci-sandbox\cc-switch-server-el9`（同 sha256，方便 scp 出去） |
| sha256 | `11931503e52037746d234e2084edda178e9e47c29dd9c6d5db8fed942b638e29` |
| glibc 需求 | verneed 最高 **GLIBC_2.34**，`hypot@GLIBC_2.2.5`（EL9 满足；构建最后一步的守卫通过） |
| 镜像 | `localhost/cc-switch-server:el9` → `bb3b9903c5e1`（旧的 `d8cdebfa6aef` 已被顶掉） |
| 命令 | `MSYS_NO_PATHCONV=1 wsl.exe -u root bash /mnt/d/projects/ccs/tools/wsl-el9-native-build.sh`（10 分钟级，**必须 detached**） |

**CSS 修复确实在这个 Linux 产物里**（不是只看"构建成功"）：冒烟脚本新加了一条守卫，直接查内嵌资源——
```
== 内嵌 CSS 里的 .bg-orange-500（0 = §13.7 那个 bug 复发）==
CSS=assets/index-Bxf3F2jj.css
1
```
容器里 `pnpm build:legacy:web` 生成的 `index.html` 与本地 `dist-legacy/index.html` **md5 一致**
（`f8ea95858ce7cb80ca570f95cfe52fe4`，665 B），所以 §13.7 那条 `vite.legacy.config.ts` 的修复走的是同一条链。
其余冒烟项：`ready=yes alive=yes`、`save/get_stream_check_config` 往返 `{11,2,3333}`、
倍率 `"1"`→`2.5`→`-1` 报本地化错误、SIGTERM 干净退出（`tools/wsl-el9-native-smoke.sh <bin> <端口>`，这次用 14523）。

**顺手改的两处**：
- `tools/wsl-el9-native-smoke.sh`：加了上面那段 CSS 守卫（§13.7 的回归守卫，改断言不用重编，因为它跑的是产物）。
- `.dockerignore`：补 `.ci-sandbox`。这个目录现在 **1.9 GB**（`.ci-sandbox/repo` 那份干净克隆 1.5 GB），
  不加就会整个塞进 podman 构建上下文，`COPY . .` 慢到像卡死。

**还欠的（⑥ 剩下的部分）**：容器镜像 `localhost/cc-switch-server:dev`（`deploy/Dockerfile` 那条 3 阶段链，
`tools/wsl-podman-build.sh`）与旧 UI 的 MSI、`target/release/cc-switch.exe`（桌面 release，10-22 23:08）
都还是 §13.7 修复前的产物。

## 13.11 部署到本机 WSL 试跑（2026-10-25，用户："帮我部署到 wsl 上吧 我要试一下"）

装的就是 §13.10 那个 EL9 原生单二进制 + 仓库自带的 systemd 单元，**没有改单元本体**：

```bash
install -m 755 /root/ccs-deploy/cc-switch-server-el9 /usr/local/bin/cc-switch-server   # sha256 11931503…
install -m 644 deploy/cc-switch-server.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now cc-switch-server
```

| 项 | 结果 |
|---|---|
| 服务状态 | `active (running)`，`Main PID` 稳定，`Memory ~10 MB`，监听 `127.0.0.1:14515` |
| **Windows 直接可达** | 这台 WSL 是 **`wslinfo --networking-mode` = `mirrored`** → 单元默认只绑回环也照样能从 Windows 打开 `http://127.0.0.1:14515/`，不需要 token、不需要 `netsh portproxy`、不需要 SSH 隧道。NAT 模式的机器上这条不成立（要么 `ssh -L`，要么 `--bind 0.0.0.0` + `CC_SWITCH_TOKEN`） |
| 隔离 | 加了个 drop-in `sandbox-home.conf`：`Environment=CC_SWITCH_TEST_HOME=/var/lib/cc-switch/home`。**原因很具体**：这台 WSL 的 `/root/.claude` 与 `/root/.cc-switch` 是真实在用的，单元只给 `CC_SWITCH_DATA_DIR` 挡不住 `~/.claude`（§13.4）。`/api/meta` 回 `homeDir=/var/lib/cc-switch/home` 就是生效的证据 |
| 页面 | 内嵌 CSS 仍是修好的那份：`/` 引 `assets/index-Bxf3F2jj.css`，里面 `.bg-orange-500{` 命中 1 次 |
| 真浏览器 | 从 Windows 打这台 WSL 服务跑 `tools/browser-e2e.mjs` → **16/16**（含 SSE 两帧、倍率往返、定价面板文案） |
| 日志 | `journalctl -u cc-switch-server -f`；启动行 `无头服务已启动：http://127.0.0.1:14515/（派发窗口 main）` |

**一个没复现起来的失败，别当已解决**：第一次 `systemctl start`（15:59:19）报
`cc-switch-server 启动失败: 创建命令派发载体失败: Read-only file system (os error 30)`，
之后 `systemctl restart` 起来了。为定位做了两件事：
1. 用 `systemd-run` 把单元里每条沙箱指令单独放开跑了一遍（`.ci-sandbox/wsl-sandbox-bisect.sh`）——
   **连完整那套（`DynamicUser` + `ProtectSystem=strict` + `ProtectHome=read-only` + `PrivateTmp`）都能起**，
   所以不是某一条沙箱的锅。
2. 把 `/var/lib/cc-switch` 整个删掉模拟"服务器首次部署"，`systemctl start` —— **正常起来**。
→ 结论只能写成"首次启动偶发一次 `Read-only file system`，出现在 `bootstrap.rs:104` 的
`WebviewWindowBuilder::build()`（那句错误文案就是它的 map_err），没能复现第二次"。
下次真在服务器上撞到，先记 `journalctl -u cc-switch-server -b` 的完整上下文再动单元配置，别急着删沙箱项。

## 14. 浏览器侧的 SQL 备份导入/导出打通（2026-10-25，用户："为什么我不能导入备份"）

### 14.1 现象与根因（两条，缺一不可）

用户控制台给出的原文错误：
```
[useImportExport] Failed to open file dialog Error: 无头模式（服务器）没有桌面环境，不支持文件选择对话框
[useImportExport] Failed to export config Error: 无头模式（服务器）没有桌面环境，不支持保存文件对话框
```
1. v3 前端的导入导出全靠原生对话框：`src-legacy/lib/api/settings.ts:119-133` 里 `openFileDialog()`→`open_file_dialog`、
   `saveFileDialog()`→`save_file_dialog`，而无头侧这两个是 `src-tauri/src/headless/stubs.rs:78-91` 的 `no_gui()` 占位。
2. **就算把对话框糊过去也是错的**：对话框返回的是*浏览器那台机器*的路径，而 `import_config_from_file` 是在*服务器*上
   按路径读文件。远程部署时这是两个不同的文件系统——所以必须换成"传内容"，光做 UI 桥不够。

### 14.2 改了哪些文件（`src-legacy` 仍然逐字节等于 v3.20.4）

| 位置 | 改动 |
|---|---|
| `src-tauri/src/commands/import_export.rs` | 抽出 `enum SqlSource { Path(PathBuf), Text(String) }` + `run_import()`；新增 `export_config_sql`（返回 `{sql}` 文本）与 `import_config_sql(content)`。两条旧命令的桌面语义不动。`Text` 分支同样先 `trim_start_matches('\u{feff}')`，与 `database/backup.rs:141` 读文件的处理对齐 |
| `src-tauri/src/command_handler.rs:142` | 在共享宏的命令表里注册这两条（桌面/无头同一张表，不会分叉） |
| `web/transport/files.ts`（新） | `pickSqlFile()` 用 `<input type=file accept=".sql">` 把内容读进内存、只留一份；`takePickedSql(name)` 按文件名认领；`downloadSqlFile()` 交给浏览器下载 |
| `web/transport/core.ts` | `LOCAL_COMMANDS` 里给 `open_file_dialog`/`save_file_dialog`/`import_config_from_file`/`export_config_to_file` 装上浏览器侧实现：导入=认领内存内容后调 `import_config_sql`，导出=调 `export_config_sql` 后触发下载 |

复用同一条 `run_with_database_restore_lock` + `skill_state_write_guard` + `run_post_import_sync`，
所以浏览器导入和桌面导入走的是同一份还原/同步逻辑，没有第二套实现。
桌面端不受影响：`LOCAL_COMMANDS` 只在 `--mode web` 的别名链里生效，`stubs.rs` 只在 `not(feature="desktop")` 时编译。

### 14.3 验证（都是这次实测的，不是引用旧结论）

| 项 | 结果 |
|---|---|
| `git archive v3.20.4 src` ↔ `src-legacy` | 逐字节一致 |
| `tsc -p tsconfig.legacy.json --noEmit` | 通过 |
| `cargo check --no-default-features --features headless` + `cargo check`（桌面默认） | 两边都通过 |
| HTTP 直调两条新命令 | `export_config_sql` 返回 `-- CC Switch SQLite 导出` 开头的文本；`import_config_sql` 喂非备份 → 500 + `仅支持导入由 CC Switch 导出的 SQL 备份文件。 (Only SQL backups exported by CC Switch are supported.)`（`database/backup.rs:291`，校验在任何写入之前） |
| **真浏览器 11/11**（`.ci-sandbox/io-e2e.mjs http://127.0.0.1:14540/ run`） | `create_profile` → UI 点"导出 SQL 备份" → 下载目录里出现 `cc-switch-export-*.sql`（29,892 B，含这条 profile）→ `delete_profile` 确认库里没了 → UI 点"选择 SQL 文件"（CDP 把文件喂进 `<input>`）→ 页面显示 `📄 io-import.sql` → 同一个按钮变"导入"，点它 → `list_profiles` 又看到 `io-roundtrip`（**上传的内容确实被应用**）+ 面板 `Import Successful!` → 负例选 `io-junk.sql`（`drop table providers;`）→ 面板给出上面那句拒绝 → 库里数据没被破坏 |

### 14.4 浏览器自动化这次踩到的三件事（写死在这儿，下次别重新调查）

- **全新浏览器配置进来先弹「Welcome to CC Switch」**：那个 `div.fixed.inset-0`（`bg-black/50 backdrop-blur-sm`）铺满全屏，
  页头齿轮点了没反应，`document.elementFromPoint()` 只会返回它。 harness 必须先点 "Got it"。
- **`<input type=file>` 需要真实用户激活**：`dispatchEvent` 合成的 `MouseEvent` 不算（Chrome 立刻 fire `cancel`），
  要用 CDP 的 `Input.dispatchMouseEvent`；接收文件则是
  `Page.setInterceptFileChooserDialog` → `Page.fileChooserOpened` → `DOM.setFileInputFiles{backendNodeId}`，实测可用。
- **harness 里那个"喂文件"的监听器必须一次性摘掉**：留着的话第二次的 `fileChooserOpened` 会被上一个监听器
  用**上一个文件**覆写（差点测成"选了 io-junk.sql 结果导入的是 io-import.sql"）。

### 14.5 顺手撞见、但**没有**动的东西（要拍板）

- `open_zip_file_dialog`（Skills 页"导入已有"选 ZIP）和 `save_markdown_dialog`（会话管理导出 Markdown）
  在无头下仍然是 `no_gui()` 报错。同一套上传/下载桥能做，但这是两个新的功能决定，不在"导入备份"这次的范围里。
- 关于页的 CLI 安装在这台 systemd 服务上必失败：`npm error syscall mkdir / npm error path /.npm / errno ENOENT`。
  原因是单元的 `DynamicUser` 让 `HOME` 为空，npm 拿不到 cache 目录。**不是移植引入的**（桌面端有 `HOME`），
  修法是给单元加 `Environment=HOME=/var/lib/cc-switch/home`（或 npm 的 `cache` 配置），但这属于部署形态决定。
- 你截图那台服务控制台里的两个噪音，同样没动：`/favicon.ico` 404（无头服务器没有 icon 路由）、
  图表 `width(-1)/height(-1)` 警告（v3 图表在容器宽度为 0 时算出负数，不影响渲染但会刷屏）。

### 14.6 产物与现场（本次会话结尾的真实状态）

- 这次改动**尚未提交**，未提交集在 §11.3 那份之上又多了 4 个文件：
  `src-tauri/src/commands/import_export.rs`、`src-tauri/src/command_handler.rs`、`web/transport/core.ts`、新文件 `web/transport/files.ts`。
- ~~14515 上你正在用的那个 WSL 服务，装的还是 §13.10 的旧二进制（sha256 `11931503…`）~~ →
  **已被 §16.3 替换**：现在跑的是 `1377a492…`，§14 与 §15 都在里面。
- Windows 侧用于验证的调试实例：`.ci-sandbox/io-home`（`CC_SWITCH_TEST_HOME`）+ `127.0.0.1:14540`，
  起法见 `.ci-sandbox/launch-io.ps1`。它跑的是 debug 构建，rust-embed 在 debug 下**按磁盘读** `dist-legacy`，
  所以那次 11/11 验证的就是当前源码编译出来的前端。

## 15. 把项目链接换成本 fork（2026-10-25，用户："能不能把项目链接换成我这个版本的，要不然用户下载到原版就用不了了"）

### 15.1 先说一个会改变所有 URL 的事实

`git remote -v` 里写的是 `https://github.com/zhaoyj7/cc-switch.git`，但 GitHub API 对这个仓库返回
**301 → `https://github.com/silveridc/cc-switch`**（`fork: true`，parent `farion1231/cc-switch`，MIT，`main`，
pushed 2026-10-22）。所以这次统一换成 **`silveridc`**，不是 `zhaoyj7`。

另一个前置条件没解决，**换链接本身不产生"可下载的 fork"**：
`GET /repositories/1424583558/releases` 现在是空数组。也就是说关于页/README 点"查看全部版本"会进到一个
空的发布列表。真要给用户下载，得先用 §12.3 那条 `build-artifacts.yml` 产出物、再手动建成 GitHub Release。

### 15.2 ①「仓库门面」：改了 12 个文件，全是文本

| 文件 | 改了什么 |
|---|---|
| `README.md` / `README_DE.md` / `README_JA.md` / `README_ZH.md` | 各自 4 处 `github.com/farion1231/cc-switch` → `silveridc`（徽章的**点击落点** 9/10/12 行 + 399~403 行那条指向 `blob/main/docs/guides/...` 的站长指南） |
| `.github/ISSUE_TEMPLATE/{bug_report,doc_issue,feature_request,question,config}.yml` | 16 处：FAQ/已有 issue 的检索入口、`security/advisories/new`、`discussions` |
| `.github/CODEOWNERS:9,13,14` | `@farion1231` → `@silveridc`（否则 fork 上开了 Code Owner 审查就是等上游来批） |
| `.github/FUNDING.yml:1` | `github: farion1231` → `github: silveridc` |
| `src-tauri/Cargo.toml:7` | `repository = "https://github.com/silveridc/cc-switch"` |

**刻意没改的**（每条都有具体理由，不是漏了）：
- `.github/workflows/sync-r2.yml:71` 里的 `"farion1231/cc-switch"` 是**仓库名比较**，不是链接：它的语义是
  "官方仓库缺 R2 secret 就必须报错"。改成 silveridc 会让**你的** fork 在没有 R2 secret 时也拒绝跳过 → 直接红。
- `img.shields.io/github/v/release|downloads/farion1231/...`（徽章上的数字来源）与 star-history / trendshift
  那两个第三方统计图：它们展示的是上游的热度事实，指到空仓库只会显示 unknown/空图。
- `authors = ["Jason Young"]`（`Cargo.toml:5`）：这是署名，MIT 条件下不该动。
- `identifier = "com.ccswitch.desktop"`、updater 的 `endpoints`+`pubkey`、`misc.rs` 的便携版下载直链、
  `ccswitch.io` 官网入口、`docs/` 那 172 个文件：用户本次只勾了 ①②，这些属于 ③④，**没动**。

### 15.3 ②「关于页链接」：只能在传输层认领，因为 `src-legacy` 是冻结的

v3 组件把地址写死在 JSX 里（`src-legacy/components/settings/AboutSection.tsx:450,456,465,910`、
`src-legacy/components/DatabaseUpgrade.tsx`），i18n 覆盖改不动 `href`。所以新增 `web/transport/links.ts`：
- `forkUrl()` 只替换仓库前缀，`/releases/tag/vX`、`/issues` 这些后缀原样保留；
- `rewriteUpstreamLinks()` 在 `web/transport/core.ts`（就是 `@tauri-apps/api/core` 的别名模块）被 import 时
  装一次：首屏改一遍，之后 MutationObserver 只按 React 新插入的**那一小片子树**改，不做全文档扫描；
- `LOCAL_COMMANDS.open_external` 打开前先过一次 `forkUrl`，覆盖 `settingsApi.openExternal(...)` 这一路。

`.ci-sandbox/links-e2e.mjs http://127.0.0.1:14540/` → **3/3**：页面上不再有上游 `a[href]`、
关于页那个链接是 `https://github.com/silveridc/cc-switch`、点 GitHub 按钮请求打开的也是它。
（脚本里把 `window.open` 换成记录器：合成点击不产生用户激活，真弹窗会被拦，那样测出来是假阴性。）

### 15.4 ② 的边界（要知道它不覆盖什么）

- **桌面 legacy MSI 不生效**：那套别名只在 `--mode web` / `CC_UI_TRANSPORT=web` 下挂，桌面版用的是真 Tauri 插件，
  关于页仍会打开上游。要给桌面也换上，得让 `vite.legacy.config.ts` 在桌面模式下也把 `@tauri-apps/api/core`
  指向一层"只改写 URL、其余原样转发"的包装——这是新决定，没替用户做。
- **v4 UI（`src/`）那 4 处没动**：`src/components/settings/AboutSection.tsx:107,113,122`、
  `src/components/shell/NewLayoutDialog.tsx`、`src/components/DatabaseUpgrade.tsx`。它们不受冻结约束，
  改起来就是字面替换，但用户勾的是"web 版那条路"，所以留着等一句话确认。

### 15.5 顺着别名机制查出来的一个真缺口：桌面 legacy 版没有那层返回值解包（**未修，等你拍板**）

`tools/cmd-compat.md` 第二节原来写的是"桌面版和 web 版共用同一个 `web/transport/core.ts` 做适配"，
**这句与代码不符**（已把该文档改成实际情况）。证据链：
1. `vite.legacy.config.ts:40` `const webTransport = mode === "web" || process.env.CC_UI_TRANSPORT === "web"`，
   `:87` `...(webTransport ? webAliases : [])` —— 九个 `@tauri-apps/*` 别名（含 `api/core`）**只在 web 模式下挂**。
2. 桌面 legacy 走的是 `package.json:14` `build:legacy:desktop`（无 `--mode web`），
   `src-tauri/tauri.legacy.conf.json:3-6` 的 `frontendDist: ../dist-legacy-desktop` +
   `beforeBuildCommand: pnpm run build:legacy:desktop` 也没设那个环境变量。
3. 于是 `RESULT_ADAPT`（`web/transport/core.ts:36-40`）在桌面版根本不参与，而旧前端
   `src-legacy/lib/api/skills.ts:201-207,285-289` 是把 `discover_available_skills` /
   `check_skill_updates` / `install_skills_from_zip` 的返回值**当数组**用的，v4 后端返回的是
   `{skills,…}` / `{updates,…}` / `{installed,skipped}`。
4. 对着**产物**验了一遍，不是只看配置：
   `grep -rl "cc-switch-web-token|/api/invoke" dist-legacy-desktop` → **0 个文件**（web 版 1 个），
   而 `install_skills_from_zip` 两边都命中 —— 桌面那份 bundle 里确实没有 transport 层。

**后果**：桌面 legacy 版（§13 那个 MSI）的 Skills 页三个入口拿到的会是对象而非数组——
"发现可安装"和"检查更新"大概率显示空列表，"从 ZIP 安装"会当成没有安装成功。
§13.4 那次 13/13 的 CDP 复验没覆盖 Skills 发现/更新这条路径，所以一直没暴露。

**为什么不自己动手**：修法要么是把 `api/core` 也做成"桌面模式下只解包、不接管 invoke"的包装别名
（改变桌面构建形态），要么是在 Rust 侧把这三条命令的返回形状退回数组（影响 v4 自己的新 UI）。
两条都不是我该替你选的，所以只报不动。要修的话，第一种只需要在 `SHIMS` 之外加一条
"两个模式都挂、但内部按 `isTauri` 分派"的 core 包装。

## 16. 代码格式化 + EL9 二次重编 + 装进服务复验（2026-10-25，用户："跑一下代码格式化"）

### 16.1 格式化：只碰这批改动自己的文件

| 工具 | 范围 | 实际改动 |
|---|---|---|
| `cargo fmt`（`cmd.exe //c "tools\rust.cmd fmt"`） | 整个 crate | **1 处**：`src-tauri/src/commands/import_export.rs:65` 的 `run_import` 签名被并成一行。改之前全仓 `cargo fmt --check` 也只报这一条，说明其余文件本来就合规 |
| prettier 3.6.2（`node node_modules/prettier/bin/prettier.cjs --write`） | `vite.legacy.config.ts`、`web/transport/core.ts`、`web/transport/files.ts`、`web/transport/links.ts` | 换行与引号对齐 |

prettier 用**默认配置**的依据：仓库里没有 `.prettierrc`（`package.json` 也没有 `prettier` 键），
而项目自带的门 `format:check`（只扫 `src/**`）在默认配置下**全绿**——所以默认值就是这里的约定。

**刻意没格式化的**：`src/**`（本来合规，动了就是无关改动）、`docs/*.md` 与 `tools/cmd-compat.md`
（prettier 的 markdown 规则会重排中文表格对齐）、`.ci-sandbox/*.mjs`（被 `.gitignore` 排除，且 printWidth 80
会把那些一次性脚本拆得没法读）。

**格式化没改变行为的证据**（不是"看着没问题"）：格式化后重建
`node node_modules/vite/bin/vite.js build --config vite.legacy.config.ts --mode web`，
产物哈希仍是 `assets/index-CqlT7Op1.js` —— 内容哈希没变，说明 bundle 逐字节相同，§14.3 的 11/11 与
§15.3 的 3/3 不需要重跑；`tsc -p tsconfig.legacy.json --noEmit` 也复跑通过。

### 16.2 EL9 为什么编了第二次（有取证，不是重复劳动）

第一次产物（`4707c94b…`，20:53）里 `import_config_sql` 有 3 次、但 `silveridc` **0 次**、`farion1231` 还留着 6 次
——容器里的 `pnpm build:legacy:web` 是在 `web/transport/links.ts` 建出来之前跑的，§15 没进包。
取证工具是新加的 `.ci-sandbox/check-el9.sh <bin>`（release 的 rust-embed 是**编译期**打包，只能查二进制）：

| 项 | 第一次（20:53） | 第二次（21:59，**当前**） |
|---|---|---|
| sha256 | `4707c94b7ca2…` | **`1377a4928de8e7c16f8fc8284453ad57ff9d0afac03967db82ede3d907ea962b`** |
| 大小 / 时间 | 39,044,280 B / 20:53:28 | 39,044,280 B / 21:59:57 |
| 内嵌 bundle | `assets/index-TxT9JJfR.js` | **`assets/index-CqlT7Op1.js`**（与本地重建完全一致） |
| `import_config_sql` / `export_config_sql` | 3 / 3 | 3 / 3 |
| `备份内容已失效`（`files.ts`） | 1 | 1 |
| `silveridc` / `farion1231` | **0** / 6 | **1** / 7 |
| `bg-orange-500`（§13.7 守卫，0 = 复发） | 16 | 16 |
| glibc 需求上限 | 2.34 | 2.34（`hypot@GLIBC_2.2.5`） |
| 镜像 | `70420777abbc` | `0241a4edb6e4`（`localhost/cc-switch-server:el9`） |

`farion1231` 从 6 变 7 是对的：多出来的那个就是 `links.ts` 里的 `UPSTREAM` 常量；`silveridc` 只出现 1 次，
因为 `FORK` 常量只在 `links.ts` 里写一次，页面渲染时才替换。

**一个假判据，写死在这儿**：`echo build-status=$?` 塞进 `systemd-run` 的命令行后，`$?` 会被外层
WSL 的 `bash -c` 提前展开，所以日志末尾**永远**是 `build-status=0`。这轮就是被它骗过一次（日志只有 1 行、
镜像时间没变，却看起来"成功"）。真正的判据只有三条：`podman images` 的镜像 ID 变了、产物的 mtime 变了、
`check-el9.sh` 的标记对得上。

### 16.3 装进 14515 并在**隔离实例**上复验（不碰你正在用的库）

```bash
# 先留退路：把上一版（11931503…）备份出来
cp -n /usr/local/bin/cc-switch-server /root/ccs-deploy/cc-switch-server.prev-1193150
install -m 755 /root/ccs-deploy/cc-switch-server-el9 /usr/local/bin/cc-switch-server
systemctl restart cc-switch-server
```

| 项 | 结果 |
|---|---|
| 服务 | `active`；`/api/meta` → `homeDir=/var/lib/cc-switch/home`；`/` 200（665 B）；`/assets/index-CqlT7Op1.js` 200（4,614,931 B） |
| 备份 | `/root/ccs-deploy/cc-switch-server.prev-1193150`，sha256 `11931503…`（想回退就 `install` 回去 + restart） |
| Windows 侧拷贝 | `.ci-sandbox/cc-switch-server-el9` 已覆盖为新版（同 `1377a492…`） |
| 隔离实例 | `systemd-run --unit=ccs-el9-io --collect --setenv=CC_SWITCH_TEST_HOME=/root/e2e-io/home /root/ccs-deploy/cc-switch-server-el9 --bind 127.0.0.1 --port 14577`；`/api/meta` 回 `homeDir=/root/e2e-io/home` —— 这就是"没碰 14515 那份库"的证据 |
| `io-e2e.mjs` | **11/11**（跑的就是这个 EL9 二进制：建 profile → 导出 29,044 B → 删 → 喂回 → 库里又有 → 垃圾文件被拒） |
| `links-e2e.mjs` | **3/3**（页面上无上游 `a[href]`；关于页链接与 `open_external` 都是 `https://github.com/silveridc/cc-switch`） |
| `browser-e2e.mjs` | **16/16**（含 21 次 `/api/invoke` 全成功、SSE 两帧、倍率往返、定价面板文案） |
| 收尾 | 临时单元已 `stop` 并删掉 `/root/e2e-io`；14515 的 `list_profiles` 仍是空的（原本就是空的，没被写） |

### 16.4 这批之后的现场

- **14515 现在跑的是带 §14 + §15 的版本**（`1377a492…`），导入/导出不需要再经过文件对话框，链接也已指向 fork。
- 代码格式化**并入同一个未提交集**，没有单独提交（用户没让提交）。
- 仍然欠的产物（都还是 §13.7 修复前、也因此都没有 §14/§15）：
  容器镜像 `localhost/cc-switch-server:dev`、旧 UI 的 MSI、`target/release/cc-switch.exe`、`dist-legacy-desktop`。
- 待拍板项没变，仍是 §11、§13.6、§13.8、§14.5、§15.4、§15.5，以及 ③④ 两条本次明确没做的。

## 17. 上游现状盘点：我们落后 v4.0.22（2026-10-30，用户："pull 上游看看都改了啥"）

### 17.1 怎么拉的（下次照做）

直连 `git fetch https://github.com/farion1231/cc-switch.git` 会 `curl 28 / Connection was reset`；
本机代理当前在 **7891**（`HKCU\...\Internet Settings\ProxyServer`），一次性传入、**不写进 git config**：

```bash
git -c http.proxy=http://127.0.0.1:7891 fetch https://github.com/farion1231/cc-switch.git main:refs/upstream/main
```

只新增本地 ref `refs/upstream/main`（`7569b27a`）和 7 个 tag（`v4.0.16`…`v4.0.22`），没加 `upstream` remote、没动工作区。

### 17.2 差多少、差在哪

- 共同祖先 `77c6dc79`（= 我们两个本地提交的父提交）；`HEAD..upstream` = **303 个提交**。
- 版本 `4.0.15 → 4.0.22`（tag 日期：4.0.16 10-19、4.0.17 10-20、4.0.18 10-21、4.0.19 10-23、4.0.20 10-24、4.0.21 10-26、4.0.22 10-30）。
- 提交构成：161 fix / 87 feat / 17 docs / 15 chore / 9 refactor / 5 test / 4 style / 3 perf / 1 ci / 1 revert。
- 各版本主线（读的是上游自带的 `docs/release-notes/vX-zh.md`，不是猜的）：

| 版本 | 主要内容 |
|---|---|
| 4.0.16 | 托盘改快捷面板（可在设置里换回菜单）+ 一批 Codex/路由修复 |
| 4.0.17 | 修 4.0.16 的回归（轻量模式、WebView2 退出、托盘面板缩放） |
| 4.0.18 | Antigravity CLI（`agy`）+ macOS 授权中心多账号 |
| 4.0.19 | Kimi Code + Kimi 官方账号登录 |
| 4.0.20 | Oh My Pi 支持 + 托管 ChatGPT 账号浏览器登录 |
| 4.0.21 | 多个 Claude 官方订阅账号切换 + Codex 模型列表拖动排序 |
| 4.0.22 | DeepSeek Harness（第 14 个应用）、OMP 用量、终端参数、WebDAV 清除、Skills 打开目录/看文档、Copilot 原生接口、一批路由修复；**DB v23→v24** |

- 代码热点（base→upstream 的增删行）：`commands/misc.rs` +2566、新增 `dsh_config.rs` 2496、`services/kimi_oauth/mod.rs` 2080、
  新增 `session_usage_dsh.rs` 1552、新增 `omp_config.rs` 1408、`services/skill.rs` +810/-224、`services/provider/` 14 文件 +2347。

### 17.3 对我们这套改动的具体影响（都是对 diff 实测的，不是推断）

| 检查项 | 结论 |
|---|---|
| 注册命令数 | 349 → **376**：新增 27 条、**删除 0 条**（`get_webview_*` 那类 GUI 命令也没删）→ 旧前端 304 条的命令面一条没少 |
| 我们补的 6 条命令 | `commands/proxy.rs`、`commands/stream_check.rs`、`services/stream_check.rs` 的 `StreamCheckConfig` 字段全部未变；`database/backup.rs`、`commands/import_export.rs` **零改动** → SQL 备份格式没变，§14 的导入导出不受影响 |
| §14 依赖的 Skills 返回结构 | `SkillDiscoveryResult{skills}`（skill.rs:237）、`SkillUpdateCheckResult{updates}`（:245）、`ZipInstallResult{installed}`（:264）**字段名和形状都没变** → `RESULT_ADAPT` 继续有效 |
| `get_home_dir` / `CC_SWITCH_TEST_HOME` | `src-tauri/src/config.rs` 零改动 |
| 新 AppType | Dsh / Kimi / Agy / Omp 四个新变体（`commands/config.rs` 里补的 match 臂）——旧前端只发 v3 那几个 `appType` 字符串，不受影响 |
| §13.8 会话页崩溃 | **上游没修**：`commands/session_manager.rs` 只 +10 行，是 agy 恢复终端那条，跟 blocks/content 无关 |
| headless 能不能编过 | 全量 diff 里新增的 GUI-only API 只有 3 处 `tauri::tray::`，且都在 `lib.rs` / `tray.rs`（我们已 cfg 掉）→ **推断**风险低，但只有真跑 `cargo check --no-default-features --features headless` 才算数 |
| 合并冲突面 | 两边都改过的文件 **25 个**，最要紧的是 `src-tauri/src/lib.rs`（我们把 `generate_handler!` 抽进了 `command_handler.rs`，上游在同一区域加了 27 条命令并重构了 tray 事件）、`Cargo.toml`/`Cargo.lock`/`package.json` |

### 17.4 如果要合，建议的顺序（未执行，等一句话）

1. **不要在现在这个工作区直接合**——这里压着 28 项未提交改动（§16.4）。先开 `zhaoyj7/merge-upstream-4.0.22-<日期>` 分支，把那批改动提交或 stash 后再合。
2. 冲突优先解 `lib.rs`：把上游新注册的 27 条按原顺序补进 `src-tauri/src/command_handler.rs` 的共享宏，桌面/无头才不会被拉开。
3. `Cargo.lock` 直接 `cargo update -p`/重建，不手改（上游新增依赖：tokio `process`、`prost 0.14`、`subtle 2.6`）。
4. DB v23→v24 是**加列**（`add_column_if_missing`，不是新表），旧备份仍可导入；但上游明确写了**升级后退回旧版本会打不开**。
5. 编译与验收照旧：`cargo check` 两个特性档 → `tsc -p tsconfig.legacy.json` → 重编 EL9 → 隔离实例上 `io-e2e` / `links-e2e` / `browser-e2e`。




## 18. 合上游 v4.0.22（2026-10-30，用户："合一下吧"）

### 18.1 怎么合的

分支 `zhaoyj7/merge-upstream-4.0.22-20261030`（**没动 main**），两步提交：

| 提交 | 内容 |
|---|---|
| `2dddd7b9` | 先把 §13–§16 的未提交改动落成一个检查点（28 个文件，1315+/423-） |
| `b0ff3759` | `merge: upstream v4.0.22 (7569b27a)` —— 590 个文件，74082+/8740- |
| `bc4d82b6` | `fix(merge)` 适配层：无头/兼容层要跟着改的部分（见 18.3） |
| `ca4a1577` | 文档：本节 + `tools/cmd-compat.md` 计数 |
| `cf9a25ba` | 第二次合上游：`7569b27a..91a76cfd`（v4.0.22 之后 8 个 fix），**零冲突**；上游只新增了 dev-dependency `tauri/test` |
| `37df985e` | `fix(merge)`：`claude_account::labels_on_disk` 只被桌面托盘用到，无头档补 `allow(dead_code)` |

合并的是 `refs/upstream/main`（`7569b27a`，比 `v4.0.22` tag 多 8 个提交），基线是共同祖先 `77c6dc79`。

### 18.2 冲突只有 4 个文件，但"文本无冲突"不等于"能编"

| 文件 | 处理 |
|---|---|
| `src-tauri/Cargo.toml` | 只差 tokio features：两边并集（`signal` + `process`） |
| `src-tauri/Cargo.lock` | 取上游那份，之后的 `cargo build` 自己补齐 |
| `src-tauri/src/commands/provider.rs` | 上游把 `update_providers_sort_order` 改成 `async`，我们换了 `compat::AppHandle`：取两者并集 |
| `src-tauri/src/lib.rs` | 我们的薄 runner（`.setup(crate::setup::setup_common)` + `app_invoke_handler!()`）vs 上游 1400 行内联闭包与 `generate_handler!`：**取我们的骨架**，把上游新增的模块声明（`kimi_config`/`kimi_session`/`tray_compat`）和 `raise_open_file_limit()` 补回；`tray_compat` 加 `#[cfg(all(windows, desktop))]`（它用的是裸 `tauri::AppHandle`/`tauri::Wry`） |

**真正的工作量在"自动合并成功但编不过"的地方**（`bc4d82b6`）：

1. **`setup.rs` 要吸收上游在启动闭包里新加的 7 处**：`raise_open_file_limit()`、`initialize_dsh_profiles`、`import_omp_providers_from_live`、轻量模式与深链接冷启动的互斥（`startup_deeplink`）、新的托盘构建写法（`tray::handle_tray_icon_event` / `native_menu_on_left_click` / `tray_compat::install`）、Kimi/Agy/Claude 三个账号管理器的注册、agy 旧启动器清理。我们原有的无头适配（日志分支、`wait_for_*_retry`、DB 版本过新直接退出）原样保留。
2. **新增 `src-tauri/src/tray_logic.rs`**：`tray_language()` 和 `provider_needs_routing()` 被上游从"只在托盘里用"变成了设置命令 / 终端 / Kimi 登录也在用，而无头档的 `tray` 是替身模块。把这两个函数连同它们的 4 个私有依赖挪进 `tray_logic`，桌面 `tray.rs` 与 `tray_headless.rs` 都从那里转出同一份实现，行为不会分叉。
3. **`command_handler.rs` 补齐上游新增的 27 条命令**（349 → 376，删除 0 条），逐条核对过模块路径，无重复。
4. **3 处 `tauri::AppHandle`**（`commands/claude_account.rs`、`commands/settings.rs` 的新签名，`commands/skill.rs` 的 `open_skill_dir`）在无头档报 `expected 1 generic argument`——tauri 的 `AppHandle<R>` 默认参数来自 `#[default_runtime(Wry)]`，只有开 `wry` 特性时才存在。前两处改成 `crate::compat::AppHandle`；`open_skill_dir` 与 `open_cc_switch_skills_dir` 一样改成桌面专属命令，并在 `headless/stubs.rs` 补同名替身。

### 18.3 验证（都在合并后的树上实测）

| 项 | 结果 |
|---|---|
| `cargo fmt --check` | 通过（合并后跑过一次 `cargo fmt`） |
| `cargo check --no-default-features --features headless` | 通过，0 warning |
| `cargo check`（桌面默认） | 通过 |
| `tsc -p tsconfig.legacy.json --noEmit` / `tsc --noEmit`（v4 UI） | 都通过 |
| `src-legacy` ↔ tag `v3.20.4` | 仍**逐字节一致**（合并没碰它） |
| 无头 debug 二进制 + 隔离 home | `{"version":"4.0.22","homeDir":"D:\projects\ccs\.ci-sandbox\io-home"}` |
| `io-e2e` | **11/11**（导出 30,644 B，往返成功，垃圾文件被拒） |
| `links-e2e` | **3/3**（关于页与 `open_external` 都指向 fork） |
| `browser-e2e` | **16/16**（21 次 invoke 全成功、SSE 两帧、倍率往返、定价面板文案） |

**第二次合并后的复验（`cf9a25ba` 之后重编了无头调试二进制）**：`cargo check` 两档、`cargo fmt --check` 仍通过，
重跑三套 E2E 仍是 **11/11 / 3/3 / 16/16**。

**没跑的**：`cargo test`（全量 3700+ 个用例，合并后没跑）；`release.yml` 的桌面打包。要推之前建议补跑一次 `cargo test`。

### 18.4 合并后的形态

- 版本号三处都是 `4.0.22`（`package.json` / `tauri.conf.json` / `Cargo.toml`），`src-tauri/Cargo.lock` 也已是 4.0.22。
- 我们 fork 的标识仍在：`silveridc` 在 4 个 README 各 4 处、`Cargo.toml:7`、`CODEOWNERS`、`FUNDING.yml` 都保留；`.github/workflows/build-artifacts.yml` 也在。
- 新增上游文件：`docs/release-notes/v4.0.16…v4.0.22`、`.github/workflows/schema-version.yml`（`pull_request_target` 上自动关掉改 `SCHEMA_VERSION` 的 PR，上游维护策略，留着无害）。

### 18.5 风险与后续（都要知道）

1. **DB v23 → v24**：上游加了 MCP/Skills 的 DeepSeek Harness 开关列。升级自动备份，但**退回旧二进制会打不开**。14515 现在是 v23 的库，装了合并后的二进制首次启动会迁移。
2. **`release.yml` 新增了 MSI 守卫**：要求 MSI 的 Property 表里有 `REBOOT=ReallySuppress`，否则构建失败（上游 #8534）。我们那条 `build-artifacts.yml` 不受影响；但如果哪天用 `release.yml` 打旧 UI 的 MSI，得先确认 `tauri.legacy.conf.json` 的 bundle 设置满足这条。
3. **EL9 单二进制与 14515 服务还是合并前的产物**（`1377a492…`，v4.0.15 后端）。要跟上的话得重编一次（约 40 分钟，`systemd-run` 那个流程，见 §16.2）再 `install` + `systemctl restart`。
4. 合并分支**已推送**到 origin（`refs/heads/zhaoyj7/merge-upstream-4.0.22-20261030` = `ef595e0a`，
   两轮上游合并 `b0ff3759` + `cf9a25ba` 都在里面），
   `main` 没动（仍是 `b7f1e6b1`）。**push 到特性分支不会触发 `ci.yml`**（它只认 push 到 main 和指向 main 的 PR），
   所以远端目前没有跑过任何 CI。push 命令要走代理（`git -c http.proxy=http://127.0.0.1:7891 push`），
   直连会在 21 秒后报 `Could not connect to server`；另外 `git push | tail` 拿到的是 `tail` 的退出码（0），
   别用它判断成败——要看 `git ls-remote`。

---

## 19. 部署到本机给用户玩（2026-11-01，用户："部署到我电脑上让我玩玩"）

**形态**：Windows 无头 **release 单二进制**（页面编译期内嵌）+ 默认浏览器打开 `http://127.0.0.1:14540/`。
不是 MSI，**不装、不覆盖、不杀**用户自己装的 `C:\Users\admin\AppData\Local\Programs\CC Switch\cc-switch.exe`
（实测当时进程列表里只有我们仓库的那个 server，用户的应用没在跑）。

### 19.1 重编与产物

| 项 | 结果 | 复现 |
| --- | --- | --- |
| release 重编 | `Finished 'release' profile [optimized] target(s) in 4m 33s` | `.ci-sandbox/build-release-io.ps1`（detached `Start-Process`，日志 `.ci-sandbox/headless-release.{out,err}.log`），里面就是 §13.9 那条 `tools/rust.cmd build --release --no-default-features --features headless --bin cc-switch-server` |
| 产物 | `src-tauri/target/release/cc-switch-server.exe` **45,644,800 B**，sha256 `84061cc9d566584ff1a27c905083a07df4d14489493cd5007aeadb68ae942452` | `sha256sum` |
| 作废 | §13.9 那个 41,938,432 B / `e48abf7f…`（2026-10-24）是**合并前 v4.0.15** 的产物，别再发出去 | mtime + 下面的内嵌核验 |

**内嵌页面核验**（release 把 `../dist-legacy` 编译期内嵌，只能 grep 二进制，不能看磁盘目录）：
`grep -aoc` 命中 `index-CqlT7Op1.js`=2、`index-Bxf3F2jj.css`=2、`import_config_sql`=3、`备份内容已失效`=1、
`silveridc`=1、`bg-orange-500` 有、`4.0.22`=13；**旧的 `index-0hufZJV7.js` 已经不在**。
也就是说 §13.7 的 CSS 修复、§14 的导入导出、§15 的链接归属、§18 的 v4.0.22 后端**全在这一个文件里**。
`dist-legacy` 本身仍是 2026-10-25 21:15 那次 `pnpm build:legacy:web` 的产物（三条标记同样命中），前端这次没重编。

### 19.2 跑起来 + 验证

- `.ci-sandbox/launch-io.ps1` 加了 `-Exe` 参数（默认还是 debug 产物），换二进制不用改脚本。
- 换人值班：先按 `ExecutablePath like 'D:\projects\ccs\src-tauri\target\debug\*'` **精确**杀掉我自己起的 debug 实例（pid 54744），
  再 `launch-io.ps1 -Exe …\target\release\cc-switch-server.exe` → pid 39236。
- `/api/meta` → `{"version":"4.0.22","homeDir":"D:\\projects\\ccs\\.ci-sandbox\\io-home","os":"windows","arch":"x86_64","authRequired":false}`；
  `GET /` 200、`GET /assets/index-CqlT7Op1.js` 200（4,614,931 B）；`POST /api/invoke` 只读两条（`is_lightweight_mode`、`list_db_backups`）正常。
- `node tools/browser-e2e.mjs http://127.0.0.1:14540/` → **16/16**。
  这条是**新增证据**：之前那两轮 16/16 跑在 debug 产物上，这次跑在 release 单二进制上（§13.9 当年只测了 CLI/HTTP 侧）。

### 19.3 「在这套里点按钮是安全的」现在是实测不是推断

数据目录是沙箱 `.ci-sandbox/io-home`（6 个供应商、235 条默认模型定价、4 个 skill 仓库、10 个 DB 备份）。
`POST /api/invoke {"cmd":"get_claude_code_config_path"}` 实测返回
`D:\\projects\\ccs\\.ci-sandbox\\io-home\\.claude\\settings.json`，`get_claude_config_status` 里 `exists:false`
——`CC_SWITCH_TEST_HOME` 把 home 整个重定向了，所以**点「启用 / 切换」写的是沙箱，不会动用户真实的 `~/.claude/settings.json`**。
（§13 时期这条只是从 `config.rs:78` 的 `test_home_override()` 推断出来的。）

⚠️ 这条断言成立的前提是**启动脚本真的把 `CC_SWITCH_TEST_HOME` 设上了**，脚本坏掉时它一声不响地退回真实 home —— §20.2 就是一起这么发生的事故。所以每次交付前都要重新探针复验，不要引用本文档的旧结论。

**仍然别点的**：关于页的 `更新到 v4.0.x` / `全部升级` / `install_update_and_restart`——那些跑的是 updater 和 CLI 升级，
属于全局影响，跟数据目录无关。

### 19.4 遗留

- 双击入口：`src-tauri/target/release/run-local.bat`（在 gitignore 的 `target/` 里，不设 PATH、不带安装）。
- `cargo test` 全量**依旧没跑**；EL9 单二进制与 14515 服务仍是合并前产物（§18.5 第 3 条）；
  容器镜像 `localhost/cc-switch-server:dev`、旧 UI 的 MSI、`target/release/cc-switch.exe`、`dist-legacy-desktop` 也都还是旧的。

### 19.5 把用户自己的配置导进这套实例（2026-11-01，用户："把我的文件导入进去我用用看看"）

**做法**（全程只读用户的原始文件，原始 DB 一个字节没动：`C:\Users\admin\.cc-switch\cc-switch.db` 仍是 11,235,328 B / mtime 2026-10-25 01:23）：

1. 复制一份用户的 DB 到临时 home `.ci-sandbox/dump-home/`，用 §19.1 那个 release 二进制起一个**临时实例**（端口 14543，`CC_SWITCH_TEST_HOME` + `--data-dir` 都指过去）；
2. 在这个临时实例上调 `export_config_sql`（应用自己的导出器，不要手写 dump），拿到 4,293,846 字符的 SQL；
3. 把这段 SQL 用 `import_config_sql` 灌进 14540（就是 §14 那条链路），返回 `{"success":true,...,"backupId":"db_backup_20261101_015834"}`；
4. 关掉临时实例并删掉 `dump-home`，只留主实例。

**结果核对**（`select count(*)` 对照，沙箱 vs 用户真实库）：`providers 9=9`、`mcp_servers 1=1`、`skills 2=2`、`settings 8=8` —— 用户的全部供应商（Claude Official / DeepSeek / 中转 / api / test / Google Official / Claude Desktop Official / existing-hermes）现在都在 14540 里，`get_providers{app:"claude"}` 实测返回的 `settingsConfig` 就是他们自己的那份。

**顺带测出的两条真实结论**（都不是我们的导入链路的问题）：

- **导出→导入往返是无损的**：导入后的沙箱库与导出源库在每张表上的行数**完全一致**（`proxy_request_logs 10897`、`usage_daily_rollups 418`、`session_log_sync 1097`）。
- **v4.0.22 首次打开 v20 的库会裁剪日志**：用户真实库有 `proxy_request_logs 16079` / `usage_daily_rollups 379`，而这份库被 v4.0.22 打开（迁移 v20→v24）之后变成 `10897 / 418`（日志最早一条的 `created_at` 也被推后了）。所以差异发生在**迁移/首次打开**那一刻，不是导入导出丢的数据 —— 给用户解释「为什么日志少了几千条」时用这条，别说成导入没导干净。

**留给用户的文件**：`C:\Users\admin\Desktop\cc-switch-my-backup-20261101.sql`（4,323,344 B，就是上面那份导出）。想复现 §14 的按钮流程，就在页面里 设置 → 备份与恢复 → 导入，选这个文件；它是从他们自己的库导出来的，导入是幂等的（会把沙箱恢复成这一刻的状态，并且再存一个 `db_backup_*`）。
⚠️ 这份 .sql 里**含明文 API token**，别把它发出去或提交进 git。

**沙箱内可回退**：导入前那一份沙箱库被自动备份成 `db_backup_20261101_015834`（在 `.ci-sandbox/io-home` 的备份列表里，页面「备份与恢复」能选回）。

---

## 20. 桌面版旧 UI 的 Windows release 产物（2026-11-05，用户："编译一下ccs我要给我电脑上用"）

§13 那套桌面打包在合并前跑过（debug + MSI），这一节是**合上游 v4.0.22 之后**重跑一遍并真机交给用户，外加一起**必须记下来的事故**。

### 20.1 产物

| 目标 | 命令 | 结果 |
| --- | --- | --- |
| 前端 | `pnpm build:legacy:desktop`（先 `rm -rf dist-legacy-desktop`） | `✓ built in 10.97s`；`assets/index-HLFQ5fJu.js` 4,626.87 kB、`assets/index-Bxf3F2jj.css` 91.65 kB |
| 桌面 release + MSI | `pnpm tauri build --config src-tauri/tauri.legacy.conf.json --bundles msi`（vcvars64 + `RUSTUP_TOOLCHAIN=1.95-x86_64-pc-windows-msvc`，见 `.ci-sandbox/desktop-release-run.ps1`，detached 跑） | **exit 0**，约 6 分钟；WiX 用的是本机缓存 `%LOCALAPPDATA%\tauri\WixTools314`，**这次没走网络**（§13.6 那条 `HTTPS_PROXY` 可以不再设） |

| 产物 | 大小 | sha256 |
| --- | --- | --- |
| `src-tauri/target/release/cc-switch.exe` | 47,406,080 B | `90514e95799d67b71e35b842c09551ebe5073a26be25c46b2cd7eab0335787d7` |
| `src-tauri/target/release/bundle/msi/CC Switch_4.0.22_x64_en-US.msi` | 17,997,824 B | `1834f39b3a304800cd41c880e54024977b5a128fe9616cb7c29eefec444a6e78` |

**嵌入证明**（release 是编译期把 `dist-legacy-desktop` 打进二进制的，只能 grep 二进制 + 真机验）：exe 里 `index-HLFQ5fJu.js`/`index-Bxf3F2jj.css` 各 1 次（就是上面那次 vite 输出的哈希）、`4.0.22` 10 次、`dist-legacy-desktop` 1 次；`api/invoke` 0 次（web shim 没编进桌面版，走真 Tauri IPC，`__TAURI_INTERNALS__` 在页面里可用）。CSS 里那个 `bg-orange-500` 在 exe 里 grep 不到（rust-embed 的 asset 是压缩存的），改在**运行时**验：跑起来后 `document.styleSheets` 扫到 1319 条规则，`.bg-orange-500 { … rgb(249 115 22 …) }` 在 —— §13.7 的修复确实在桌面产物里生效了。

**桌面版和 web 版的两处行为差异**（都是设计如此，不是 bug）：`silveridc` 在 exe 里 0 次、`farion1231` 3 次 —— §15 的链接归属只改 web 构建；`import_config_sql` 出现 2 次是后端命令本身，桌面版的导入/导出走的是 `open_file_dialog`/`save_file_dialog` 文件对话框，不是 §14 那条浏览器上传链路。

### 20.2 ⚠️ 事故：`.ps1` 里的中文注释把下一行代码吃掉了，结果桌面实例开的是**用户真实库**

`.ci-sandbox/launch-desktop.ps1` 最初是 Write 工具落的 **UTF-8 无 BOM** 文件，里面有一行中文注释紧贴着 `$env:CC_SWITCH_TEST_HOME = $home_`。Windows PowerShell 5.1 按 ANSI/GBK 解码这个文件，中文那行的尾字节和换行被拼成一行 —— `Get-Content` 打出来就是证据（注释和赋值同在第 6 行）：

```
6: # 只设 CC_SWITCH_TEST_HOME：DB 落在 <home>\.cc-switch，~/.claude …$env:CC_SWITCH_TEST_HOME = $home_
```

于是 **`CC_SWITCH_TEST_HOME` 根本没设上**，`Start-Process` 照样打印 `home=…`（那行用的是 `$home_` 本身），看起来一切正常。后果分两档，都实测到了：

- 早期那一版同时设了 `CC_SWITCH_DATA_DIR`（DB 进沙箱 ✓，日志/备份都落在 `.ci-sandbox/desktop-mydata`），但 `.claude`/`.codex`/`.gemini` 全解析成**真实** `C:\Users\admin\…`；
- 后来去掉 `CC_SWITCH_DATA_DIR` 只留（被吃掉的）`TEST_HOME`，**DB 也直接开到真实目录上**：01:57:57 和 02:01 两次，把用户真实库 `C:\Users\admin\.cc-switch\cc-switch.db` 从 v20 迁到 v24 并裁剪了日志（11,235,328 B → 5,705,728 B，`proxy_request_logs 16079 → 7107`，`usage_daily_rollups 379 → 459`）。

**已完全回滚**：应用自己在 01:57:57 打开真实库之前生成的 `C:\Users\admin\.cc-switch\backups\db_backup_20261105_015757.db`（11,235,328 B，`user_version=20`，`providers=9`，`logs=16079`）被原样拷回 `cc-switch.db`，恢复后 sha256 `69a869f1df929d6bccec2b76a0c80d0f0190fdcff9013e17703737bdbdfbec64` 与备份逐字节一致；被裁剪那份留档在 `.ci-sandbox/real-db-v24-pruned-20261105.db`。`C:\Users\admin\.claude\settings.json` 全程没被写过（mtime 仍是 2026-10-20 22:49），所以用户装的官方版和它的 live 配置都没受影响。

**教训（已进记忆）**：给 PowerShell 5.1 跑的 `.ps1` 一律**只写 ASCII 注释**（或存成带 BOM 的 UTF-8）；凡是靠环境变量做隔离的启动脚本，**必须让脚本自己把变量值打出来**（现在 `launch-desktop.ps1` 会打印 `testhome=[…]`），并且**启动后用命令探针复验路径**，不能只看它有没有弹窗口。

### 20.3 现在这套是这么跑的（已复验）

1. 沙箱 home：`.ci-sandbox/desktop-play/.cc-switch/cc-switch.db`，种子就是上面那份 `db_backup_20261105_015757.db` 的副本（`.ci-sandbox/desktop-play-seed.db`）—— 所以桌面版里看到的是用户**自己的** 9 个供应商和用量，真实库不参与；
2. `powershell -File .ci-sandbox\launch-desktop.ps1 -CdpPort <现挑端口>`：只设 `CC_SWITCH_TEST_HOME`（脚本全 ASCII，会自打 `testhome=[…]`）；
3. 启动后探针实测（CDP 里 invoke）：`get_config_dir{claude|codex|gemini}` 与 `get_claude_code_config_path` **全部返回 `D:\projects\ccs\.ci-sandbox\desktop-play\…`** ✓，`tools/desktop-cdp-check.mjs` **13/13**，截图确认首屏是旧 UI 的「欢迎使用 CC Switch」弹窗；
4. 跑完之后复查真实库 sha256 仍是 `69a869f1…`、`~/.claude/settings.json` mtime 仍是 10-20 —— 沙箱确实挡住了。

双击入口：`src-tauri/target/release/run-desktop-sandbox.bat`（同样只设 `CC_SWITCH_TEST_HOME`，ASCII）。⚠️ **直接双击 `cc-switch.exe` 用的就是真实 `~/.cc-switch`**，会把用户库单向迁到 v24（老版本二进制之后打不开，§18 那条 `schema.rs:463` 的「数据库版本过新」）。

顺带：§19 那个 14540 无头服务**现在没在跑**（`/api/health` 连不上，`cc-switch-server` 进程为 0），要玩浏览器版就按 §19.2 的 `launch-io.ps1` 重新拉起。

### 20.4 还没拍板/没做的

- **MSI 没装**（也不建议装）：`tauri.legacy.conf.json` 没覆盖 `productName`/`identifier`，产物仍是 `CC Switch` + `com.ccswitch.desktop`，和 `C:\Users\admin\AppData\Local\Programs\CC Switch` 那个正式版同名同标识 —— 就是 §13.6 ③ 那条待决策。同名还有一个副作用：**官方版在跑时启动我们这个 exe，`tauri-plugin-single-instance` 只会把焦点交给官方版，我们的实例直接退出**。
- `cargo test` 全量依旧没跑；EL9 单二进制、WSL 14515、容器镜像仍是合并前产物（§18.5）。

### 20.5 直接部署到用户真实环境（2026-11-05 11:06，用户："直接部署系统 我试一下cc能切换吗"）

这一节**取代 §20.3 的"现在这套是这么跑的"**：沙箱实例（pid 55628）已停，现在本机跑的是同一个 exe、**故意不做任何隔离**的真实部署。切换动作留给用户自己点，我没有 invoke 过任何 `switch_provider`。

**怎么起的**：`.ci-sandbox/deploy-desktop.ps1 -CdpPort 2192`（新脚本，全 ASCII）。里面**明确没有** `CC_SWITCH_TEST_HOME`/`CC_SWITCH_DATA_DIR`，只留 `NO_PROXY` 和 CDP 端口，并按 §20.2 的教训把两个变量原样打出来：

```
testhome=[] datadir=[]
pid=728 exe=D:\projects\ccs\src-tauri\target\release\cc-switch.exe
```

空值就是"这次真的开真实 home"的证据，不是脚本又把它吃了。

**启动前快照**（TS=`20261105_110606`，都在 gitignore 的 `.ci-sandbox/`，不会进 git）：

| 文件 | 大小 | 说明 |
| --- | --- | --- |
| `real-db-pre-deploy-20261105_110606.db` | 11,235,328 B | sha256 `69a869f1…`，与当时真实库**逐字节一致**，`user_version=20`，9 个供应商 |
| `claude-settings-pre-deploy-20261105_110606.json` | 268 B | 用户手写状态：`CLAUDE_CODE_EFFORT_LEVEL=max`、`ENABLE_TOOL_SEARCH=true`、`autoUpdatesChannel: latest`、`tui: fullscreen`、`model: haiku`，**没有** `ANTHROPIC_BASE_URL` |
| `claude-json-pre-deploy-20261105_110606.json` | 150,283 B | `~/.claude/.claude.json` |

**启动后探针复验**（CDP 2192，全部在真实 home 上）：`get_claude_code_config_path` → `C:\Users\admin\.claude\settings.json`（沙箱路径不再出现，说明隔离确实是关的）；`get_providers{app:"claude"}` → `Claude Official / 中转 / DeepSeek`；`get_current_provider` → `b0c2ce48-a598-40e2-bc1f-57b7af777ffd`（中转）；`tools/desktop-cdp-check.mjs` **13/13**。窗口起来时是最小化状态，`activate_window(restore)` 后 `362,342 1112×658` 前台；截图 `.ci-sandbox/desktop-real-restore.png`：中转卡片高亮「3 分钟前」，已使用 316445.88 / 剩余 22902524950.22 USD，DeepSeek 卡上「查询失败」—— 那是那个供应商自己的配额接口取不到，和切换链路无关。

**真实库这次是被合法迁移的**（不是事故，用户要求的就是真实环境）：`user_version` 20 → **24**，11,235,328 → 5,705,728 B，`proxy_request_logs 16079 → 7107`、`usage_daily_rollups 379 → 459`（§18 那条 `rollup_and_prune`，30 天窗口）。迁移前应用自己生成了一份 `C:\Users\admin\.cc-switch\backups\db_backup_20261105_110648.db`（11,235,328 B，v20），和上面那份快照同源，所以回退点有两个：

```bash
cp /c/Users/admin/.cc-switch/backups/db_backup_20261105_110648.db /c/Users/admin/.cc-switch/cc-switch.db   # 或 .ci-sandbox/real-db-pre-deploy-20261105_110606.db
cp .ci-sandbox/claude-settings-pre-deploy-20261105_110606.json /c/Users/admin/.claude/settings.json
```

⚠️ 迁移**单向**：现在再启动官方版那个 v4.0.15 二进制会报「数据库版本过新」（`schema.rs:463`），要回官方那条路必须先 `cp` 备份覆盖回去。

**到 11:16 为止 `~/.claude/settings.json` 仍是 sha256 `442e9788…`、mtime 11:02** —— 那次写发生在本次部署（11:06:47）**之前**，不是我这边；用户点切换之后它才会被真的写（`ANTHROPIC_BASE_URL` + token），这也是 §20.5 留那份 268 B 快照的原因。

**单实例**：此刻 `Get-Process cc-switch` 只有 pid 728（Path 指向 `target/release`），官方版没在跑，所以 §20.4 那条"启动只把焦点交给官方版"的坑这次没触发；用户如果先开官方版再开我们这个，看到的会是官方版窗口。

### 20.6 §13.8 那个会话页崩溃：用户真点出来了，按 ①（传输层补字段）修好（2026-11-05 12:20–12:48）

**用户点了什么**（真实环境日志 `~/.cc-switch/logs/cc-switch.log` 的时间线）：

| 时间 | 日志 | 含义 |
| --- | --- | --- |
| 12:18:30 / 12:18:31 | `[SWITCH] claude 直连：b0c2ce48(中转) → 515a6a2b(Claude Official)，写客户端配置` → 又切回来，两次都 `完成` | **切换本身是好的**，这就是用户问的那件事 |
| 12:18:33 | `[MODE] claude 进入路由模式失败…: 原子替换失败: …settings.json.tmp.728.…: Unable to remove the file to be replaced. (os error 1175)` | 头一次开路由失败，12:18:34 重试成功（`[MODE] claude enter：直连 → 路由`）；那份 `settings.json` 没被换坏，之后一切正常。**没动代码**，只是记一笔 |
| 12:20:04–12:28:27 | 12 次 `[frontend] react.error_boundary`（12:20×5、12:21×1、12:23×3、12:28×3），`TypeError: Cannot read properties of undefined (reading 'slice')` | 就是 §13.8 那条崩溃；用户连着试了四轮，每次点「重新加载界面」再点进会话页都会再来一组 |

我在同一个实例（CDP 2192）上点「会话管理」复现，`console.error` 抓到同一条异常，页面变成用户发来的那张错误边界截图。

**根因**（§13.8 早就定位过，这次是第二次实测）：`src-tauri/src/session_manager/model.rs:62` 手写的 `Serialize` 在 `blocks` 非空时**不下发 `content`**；旧前端 `src-legacy/components/sessions/SessionManagerPage.tsx:394` 把它交给 `src-legacy/components/sessions/utils.ts:230` 的 `content.slice(0, maxLength)` → 炸。v4 新前端 `src/components/sessions/reader/turns.ts:169-170` 是 blocks 优先、`content` 只兜底，所以只有旧前端受害。

**改法 = §13.8 的 ①**（四处，`src-legacy/` 与后端**零改动**）：

| 文件 | 改动 |
| --- | --- |
| `web/transport/result-adapt.ts`（新） | 把原来只在 web shim 里的 `RESULT_ADAPT` 抽出来共用，加 `get_session_messages`：`blocks` 非空又没有 `content` 时，按 `project_content` 的规则在 TS 侧补一份纯文本（`text` / `[Tool: rawName] title` / `tool_result.preview` / `[Image: mediaType size]` / `event.text`，thinking 与 step 不进，空段跳过，`\n\n` 连接） |
| `web/transport/desktop-core.ts`（新） | 桌面 legacy 构建的 `@tauri-apps/api/core` 替身：invoke 仍走上游 `core.invoke`，只把结果过同一张表。⚠️ **必须把 core 的导出全量转发** —— `@tauri-apps/plugin-updater` 也 `import { Resource, Channel, invoke } from '@tauri-apps/api/core'`，这条 alias 对插件包同样生效，第一次构建就是被 rollup 报 `"Resource" is not exported` 挡住的 |
| `web/transport/core.ts` | 删掉本地那张表，改成 import `adaptInvokeResult` |
| `vite.legacy.config.ts` | 非 web mode 也加一条 alias `^@tauri-apps/api/core$` → `desktop-core.ts`（web mode 仍走原来那 9 个 shim） |

**验证**（都在真实环境，不是沙箱）：

- 产物：`target/release/cc-switch.exe` 47,406,080 B，sha256 `c476b97ebcbc143d496e48a58d2220c0f7d556cb636209bf2cbd7cc1f599ec04`（取代 §20.1 的 `90514e95…`）。内嵌资源换成了 `index-DXa0Hciu.js` + `index-B-iDIF_0.js`（旧 `index-HLFQ5fJu.js` 在 exe 里 0 次），CSS 仍是 §13.7 修好的 `index-Bxf3F2jj.css`。⚠️ **只改前端时 cargo 不会因为 `dist-legacy-desktop` 变了就重跑 `generate_context!`**，这次靠 `touch src-tauri/src/lib.rs` 强制重编（`.ci-sandbox/desktop-fix-run.ps1` 里就有这一行，别再忘）。
- 重启后路由模式自己接上了：`[MODE] claude attach：路由 → 路由 … 客户端配置已重写`，代理仍是 `127.0.0.1:52778`，12:48:14 就有一条真实请求 `https://ai-api.sliveridc1.cn/v1/messages (model=gpt-6.1-sol)` 走通 —— 用户那时正在终端里用 Claude Code，没被打断。
- 会话页：14 条会话正常列出，点开那条 194 条消息的会话，正文 / 时间戳 / 工具行都在，`console.error` 一条没有（截图 `.ci-sandbox/desktop-real-sessions-fixed.png`）。
- `tools/desktop-cdp-check.mjs 2194` **13/13**。
- 现在跑的是 pid 53868（§20.5 那个 pid 728 已停）。
- 用户在修好的这个实例上又自己用了一轮：12:50:43 / 12:50:45 / 12:51:08 三条真实请求经代理转发到 `https://ai-api.sliveridc1.cn/v1/messages (model=gpt-6.1-sol)`，12:51:14 他自己把路由关回直连（`[MODE] claude exit：路由 → 直连 … 写回直连供应商 b0c2ce48…`，代理 `SRV-002 已完全停止`）。到 12:59 为止 `error_boundary` 出现 0 次（今日 13 条 ERROR 全部在 12:28:27 及之前）。

**顺带一条，免得下次当成新 bug 查**：重启后的 `~/.claude/settings.json` 与重启前 diff 只有 4 处 —— `"model": "opus"` 那行没了、三个 `*_MODEL_NAME` 从 `gpt-6-sol`/`deepseek-flash`/`gpt-6.1-terra` 变成 `gpt-6.1-sol`。这是**用户自己在 12:19–12:41 之间改了 中转 那张卡的模型映射**，重启时 ATTACH 把卡片内容重写回文件，不是我改的。

**还没做**：~~`dist-legacy`（浏览器版页面）、Windows 无头 `cc-switch-server.exe`~~ —— 这两个 **13:05–13:34 已重编并复验，见 §20.7**；EL9 单二进制、容器镜像**仍是修复前的前端**。MSI 也没重打（§20.4 那条待决策没变），但**现在多了一个 Inno Setup 安装包**，同节。

### 20.7 浏览器版重编 + Inno Setup 安装包（2026-11-05 13:05–13:34，用户："浏览器版你改一下吧 然后你可不可以拿 innosetup 做一个安装包"）

**浏览器版 = `dist-legacy` + 内嵌它的无头 exe**，两个都换成了带 §20.6 修复的前端：

| 步骤 | 结果 |
| --- | --- |
| `pnpm build:legacy:web` | `✓ built in 9.19s`；入口从修复前的 `index-CqlT7Op1.js`（10-25 那次）换成 **`index-tuveGerf.js` 4,615.48 kB**（sha256 `88c0c4be…`），CSS 仍是 §13.7 修好的 `index-Bxf3F2jj.css` |
| `tools/rust.cmd build --release --no-default-features --features headless --bin cc-switch-server` | detached 跑（`.ci-sandbox/build-release-io.ps1`），`Finished release in 4m 39s`；产物 **45,648,896 B**，sha256 `9ff95c032fb82491fbd02ee49b2dd24b64c005726cef2a141da781cc249da125` |
| 嵌入证明（rust-embed 是编译期内嵌，只能 grep 二进制） | exe 里 `index-tuveGerf.js` 2 次、`index-Bxf3F2jj.css` 2 次、**修复前的 `index-CqlT7Op1.js` 0 次** —— 换进去了。桌面版 `cc-switch.exe` 没被这次构建碰过（sha256 仍是 `c476b97e…`，§20.6 那个） |

`dist-legacy` 换了文件名就足以让 cargo 重跑 `generate_context`/rust-embed，**不需要**像 §20.6 那样 `touch lib.rs`（那是 `generate_context!` 的坑，不是 rust-embed 的）。

**起服务验证**：`.ci-sandbox/launch-browser-play.ps1`（新，全 ASCII）。它**故意不设 `CC_SWITCH_TEST_HOME`**，只给 `--data-dir D:\projects\ccs\.ci-sandbox\browser-play`：会话扫描读的是**真实** `~/.claude` 等目录，而库/日志/备份留在沙箱。脚本按 §20.2 的教训自打 `testhome=[] datadir=[…]`。

- pid 53604，`/api/health` → `200 {"app":"cc-switch","version":"4.0.22","authRequired":false}`；启动日志 `[SESSION-SYNC] 导入 4731 行 / 扫描 31 个文件`（真实转录文件）。
- ⚠️ **真实 `~/.claude/settings.json` 全程没被这个服务写过**：13:12 启动前后都是 mtime `12:51:14`、901 B、sha256 前缀 `49be920c`（那次写是 §20.6 里用户自己关路由）。沙箱库是空的 → 没有路由状态可 ATTACH，这正是选「空 `--data-dir` + 不设 TEST_HOME」的原因。

**给 `tools/browser-e2e.mjs` 加了 3 条会话页断言**（16 → 19 条，**19/19**）：

- 视图切换不靠语言：旧前端的「会话管理」图标只在主视图的图标条里（`App.tsx:1691`，而 e2e 前几步停在设置页），所以断言先用旧前端自己的持久化键 `cc-switch-last-view=sessions`（`App.tsx:150`）重载，再在会话页里点第一行（`SessionItem` 那个 `button.min-w-0`），断 `[data-index]` 消息行数 >0、每行 `textContent` 非空、且没有 `[role="alert"]`（错误边界 `FrontendErrorBoundary.tsx:37`）。第一版直接 `button:has(svg.lucide-history)` 找不到入口，就是这个原因。
- 实测：`{"sessions":34,"rendered":10,"empty":0,"boundary":null,"first":"User11/5/2026, 12:24:11 PM帮我按照RegisterCode的方式修改我的邮件模板"}`，截图 `.ci-sandbox/browser-sessions-fixed.png`。
- **证明这三条不是空断言**：直接 POST `/api/invoke get_session_messages` 拿到 317 条消息，`keys = role,ts,id,turnId,blocks`、**`content` 317/317 全部 ABSENT** —— 后端契约没变（§13.8 那条省流量的省略还在），页面却渲染出来了，只能是传输层补的那份 `content` 在起作用。

**Inno Setup 安装包**（本机 Inno 6.7.3，per-user 装在 `%LOCALAPPDATA%\Programs\Inno Setup 6`，无需管理员工具）：

| 文件 | 说明 |
| --- | --- |
| `installer/legacy-desktop.iss` | 脚本。**全 ASCII**（Inno 把无 BOM 的 UTF-8 脚本按系统 ANSI 解，中文会把向导文字弄花，和 §20.2 的 `.ps1` 是同一类坑） |
| `installer/legacy-ui-readme.txt` | 装前信息页（`InfoBeforeFile`）。**必须带 UTF-8 BOM**，否则同样按 ANSI 读出乱码。内容讲清了：数据目录和官方 CC Switch 共用、schema 升级单向（`schema.rs:463` 的「数据库版本过新」）、备份位置、点切换是真的写 `~/.claude` |
| `tools/inno.cmd` | 一条命令打完：从 `src-tauri/tauri.conf.json` 读版本号（`/DAppVersion=`），找 ISCC（per-user → Program Files → PATH），输出到 `installer/Output/`（已 gitignore） |
| `.gitignore` | `+ installer/Output/` |

产物：`installer/Output/cc-switch-legacy-4.0.22-x64-setup.exe` **14,145,138 B**，sha256 `71091f850422df91c7ba1cc7ccca2ee9d260f4192f8e095336c974beb8241e59`（`Successful compile (9.360 s)`，lzma2/max）。比 §20.1 那个 MSI（17,997,824 B）**小 3,852,686 B**。

**为什么不撞官方那份**（§13.6 ③ / §20.4 待决策在安装包这一侧绕开了）：`AppId={{0FFB04C8-EE3B-41C5-AC4A-AFF7C5A92A4D}`（自定 GUID，不是官方升级码）、显示名 `CC Switch Legacy UI`、默认目录 `{autopf}\cc-switch-legacy`、`PrivilegesRequired=lowest` + `OverridesAllowed=dialog`（应用本身是 per-user 的，不该为了写 Program Files 弹 UAC）。⚠️ **运行时标识没改**：`tauri.legacy.conf.json` 仍继承 `com.ccswitch.desktop`，所以 `~/.cc-switch`、`%LOCALAPPDATA%\com.ccswitch.desktop`（WebView2 那份）和 `tauri-plugin-single-instance` 都还是和官方版共用的 —— 那条「官方版在跑时我们这个实例直接退出」的风险**没被安装包解决**。

**真机验过装和卸**（装到 `.ci-sandbox\inno-test`，验完立刻卸，机器上没留东西）：

- `/VERYSILENT /SUPPRESSMSGBOXES /DIR=…`：目录里 `cc-switch.exe` 47,406,080 B、sha256 `c476b97e…` **与源文件逐字节一致**；时间戳保留成源文件的 12:47。
- 开始菜单 `CC Switch Legacy UI.lnk` 生成 ✓；HKCU 卸载项 `DisplayName=CC Switch Legacy UI`、`DisplayVersion=4.0.22`、`Publisher=silveridc` ✓。
- `unins000.exe /VERYSILENT` 之后：目录、快捷方式、注册表项**全部消失**（`dir exists=False / lnk exists=False / registry leftovers=[]`）。
- 安装过程**没有启动应用**（`[Run]` 那条是 `skipifsilent`），所以没碰真实库。
- WebView2 检查在 `InitializeSetup`，缺失时提示但不阻断（`Result := True`）。本机装了 Edge，没触发；顺带说明：Inno 6.7.3 的 Pascal Script **没有 `mbWarning`**（实测可用的是 `mbError`/`mbInformation`/`mbConfirmation`/`mbCriticalError`），用错会在编译期 `Unknown identifier`。
- 另一个编译期坑：`{cm:LaunchProgram,{#StringChange({#AppName},…)}}` 里再嵌 `{#…}` 会报 `Expression expected but opening brace` —— ISPP 表达式内部引用宏要用**裸名** `AppName`。

**还没做**：EL9 单二进制、容器镜像、WSL 14515 服务仍是修复前产物；MSI 没重打；安装包没入库（只入库脚本与说明）；`cargo test` 全量依旧没跑；§11 / §14.5 / §15.4-15.5 / headless clippy 那些待办不变。14552 这个验证用的无头服务**还开着**（pid 53604，`.ci-sandbox/browser-play` 那份空库），不用了就 `Stop-Process -Id 53604`。



