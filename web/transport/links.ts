// src-legacy 必须逐字节等于 v3.20.4，而它的「关于」页把上游仓库地址写死在了组件里，
// 所以链接归属只能在这一层认领：程序化打开（open_external）改写一次，页面上的 <a> 改写一次。
const UPSTREAM = "https://github.com/farion1231/cc-switch";
const FORK = "https://github.com/silveridc/cc-switch";

/** 只换仓库前缀，`/releases/tag/vX`、`/issues` 这些后缀原样保留。 */
export function forkUrl(url: string): string {
  return url.startsWith(UPSTREAM) ? FORK + url.slice(UPSTREAM.length) : url;
}

const SELECTOR = `a[href^="${UPSTREAM}"]`;

function rewrite(root: Node): void {
  const anchors: HTMLAnchorElement[] = [];
  if (root instanceof HTMLAnchorElement) anchors.push(root);
  for (const a of (root as HTMLElement).querySelectorAll?.(SELECTOR) ?? [])
    anchors.push(a as HTMLAnchorElement);
  for (const a of anchors)
    if (a.href.startsWith(UPSTREAM)) a.href = forkUrl(a.href);
}

/** 首屏改一次，之后只按 React 新插入的那一小片子树改，不做全文档扫描。 */
export function rewriteUpstreamLinks(): void {
  const start = () => {
    rewrite(document.body);
    new MutationObserver((muts) => {
      for (const m of muts)
        for (const n of m.addedNodes) if (n.nodeType === 1) rewrite(n);
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
}
