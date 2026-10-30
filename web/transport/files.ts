// 无头服务器既没有原生对话框，也读不到浏览器所在机器的文件：
// 导入用 <input type=file> 把 SQL 读进内存，导出交给浏览器下载。

/** 用户选中的备份，一次留一份，供随后的导入认领 */
let picked: { name: string; content: string } | null = null;

/** 弹出文件选择并读出 SQL 文本，返回文件名；用户取消返回 null。 */
export async function pickSqlFile(): Promise<string | null> {
  const file = await new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".sql";
    input.style.display = "none";
    const done = (value: File | null) => {
      input.remove();
      resolve(value);
    };
    input.addEventListener("change", () => done(input.files?.[0] ?? null), {
      once: true,
    });
    input.addEventListener("cancel", () => done(null), { once: true });
    document.body.appendChild(input);
    input.click();
  });
  if (!file) return null;
  picked = { name: file.name, content: await file.text() };
  return picked.name;
}

/** 旧前端把"路径"原样带回，这里按文件名认领内存里的那份内容。 */
export function takePickedSql(filePath: string): string {
  if (!picked || picked.name !== filePath) {
    throw new Error("备份内容已失效，请重新选择文件");
  }
  return picked.content;
}

export function downloadSqlFile(fileName: string, sql: string): void {
  const url = URL.createObjectURL(
    new Blob([sql], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
