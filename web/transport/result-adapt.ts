// 旧前端（src-legacy，v3.20.4 冻结）与新后端（v4）响应形状不一致的地方，统一在这一层抹平。
// web 版和桌面版两个 core 替身共用这张表，见 core.ts / desktop-core.ts。

/** v4 会话消息块在线上的最小形状（`model.rs` 的 `tag = "type"` + camelCase 字段）。 */
type WireBlock = {
  type: string;
  text?: string;
  title?: string;
  rawName?: string;
  preview?: string;
  image?: { mediaType?: string; size?: number };
};

type WireMessage = {
  content?: string;
  blocks?: WireBlock[];
};

/**
 * `project_content`（`src-tauri/src/session_manager/model.rs`）的等价实现：
 * v4 有 blocks 时不再下发 content，而旧前端只会读 content。
 */
export const projectContent = (blocks: WireBlock[]): string => {
  const parts: string[] = [];
  for (const block of blocks) {
    let part = "";
    switch (block.type) {
      case "text":
        part = block.text ?? "";
        break;
      case "tool_call":
        part = block.title
          ? `[Tool: ${block.rawName ?? ""}] ${block.title}`
          : `[Tool: ${block.rawName ?? ""}]`;
        break;
      case "tool_result":
        part = block.preview ?? "";
        break;
      case "image":
        part = `[Image: ${block.image?.mediaType ?? ""} ${block.image?.size ?? 0}]`;
        break;
      case "event":
        part = block.text ?? "";
        break;
      default:
        // thinking / step 不进正文，与后端一致
        continue;
    }
    if (part.trim() !== "") parts.push(part);
  }
  return parts.join("\n\n");
};

const withSessionContent = (result: unknown): unknown =>
  (result as WireMessage[]).map((message) =>
    typeof message.content === "string" || !Array.isArray(message.blocks)
      ? message
      : { ...message, content: projectContent(message.blocks) },
  );

/**
 * 少数命令 v4 把返回结构改了（包了一层、或省掉了旧前端依赖的字段）。
 * 旧前端不能改，所以在这里补回 v3 契约。明细见 tools/cmd-compat.md 第二节、交接文档 §13.8。
 */
const RESULT_ADAPT: Record<string, (result: unknown) => unknown> = {
  check_skill_updates: (result) =>
    (result as { updates?: unknown }).updates ?? [],
  discover_available_skills: (result) =>
    (result as { skills?: unknown }).skills ?? [],
  install_skills_from_zip: (result) =>
    (result as { installed?: unknown }).installed ?? [],
  get_session_messages: withSessionContent,
};

export const adaptInvokeResult = <T>(cmd: string, result: T): T => {
  const adapt = RESULT_ADAPT[cmd];
  return adapt ? (adapt(result) as unknown as T) : result;
};
