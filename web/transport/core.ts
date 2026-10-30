// 替代 @tauri-apps/api/core：invoke 走 HTTP，语义与 Tauri 对齐
// （成功返回命令的 Ok 载荷，失败 reject 后端返回的错误值）
import { invoke as request } from "../client";
import { downloadSqlFile, pickSqlFile, takePickedSql } from "./files";
import { forkUrl, rewriteUpstreamLinks } from "./links";

// 少数命令在浏览器里本该由页面自己完成：把它们留在服务端只会返回
// "无头模式不支持"，而这里的等价实现是完整可用的。
const LOCAL_COMMANDS: Record<
  string,
  (args: Record<string, unknown>) => Promise<unknown>
> = {
  open_external: async ({ url }) => {
    window.open(forkUrl(String(url ?? "")), "_blank", "noopener,noreferrer");
    return null;
  },
  open_file_dialog: () => pickSqlFile(),
  save_file_dialog: async ({ defaultName }) =>
    String(defaultName ?? "cc-switch-export.sql"),
  // 导入：内容在点"选择文件"那一步就读进内存了，这里按文件名认领
  import_config_from_file: async ({ filePath }) =>
    request("import_config_sql", {
      content: takePickedSql(String(filePath ?? "")),
    }),
  // 导出：服务端只产出 SQL 文本，落盘交给浏览器下载
  export_config_to_file: async ({ filePath }) => {
    const name = String(filePath ?? "cc-switch-export.sql");
    const { sql } = await request<{ sql: string }>("export_config_sql");
    downloadSqlFile(name, sql);
    return {
      success: true,
      message: "SQL exported successfully",
      filePath: name,
    };
  },
};

/**
 * v4 后端把这几条 Skills 命令的返回值从数组包成了「结果 + 失败列表」，
 * 而旧前端（src-legacy 要求逐字节不动）按数组用。旧前端没有展示 failures 的
 * 界面，这里只取它认识的那部分，形状差异在这一层抹平。
 * 明细见 tools/cmd-compat.md 第二节。
 */
const RESULT_ADAPT: Record<string, (result: unknown) => unknown> = {
  check_skill_updates: (result) =>
    (result as { updates?: unknown }).updates ?? [],
  discover_available_skills: (result) =>
    (result as { skills?: unknown }).skills ?? [],
  install_skills_from_zip: (result) =>
    (result as { installed?: unknown }).installed ?? [],
};

export async function invoke<T = unknown>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const local = LOCAL_COMMANDS[cmd];
  if (local) return (await local(args ?? {})) as Promise<T>;
  const adapt = RESULT_ADAPT[cmd];
  if (!adapt) return request<T>(cmd, args);
  return adapt(await request(cmd, args)) as unknown as T;
}

/** 前端用 isTauri() 判断"运行在壳里"，web 版的窗口/事件能力都由 shim 提供，语义等价。 */
export function isTauri(): boolean {
  return true;
}

export function isTauriContext(): boolean {
  return true;
}

// 这个模块就是 web 传输层的入口别名，页面一 import 它就把上游链接接管掉。
rewriteUpstreamLinks();
