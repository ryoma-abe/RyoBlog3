// 静的ページやリストページとして除外したいパス一覧
const excludedPaths = ["/about", "/contact", "/blog", "/thanks", "/tags"];

/**
 * パスの階層数を数える（例: /blog/page/2 → 3）
 */
export function getPathDepth(pathname: string): number {
  return pathname.slice(1).split("/").filter(Boolean).length;
}

/**
 * 記事詳細ページかどうかを判定
 * 1階層かつ除外パスに含まれないもの（例: /my-article）
 */
export function isArticlePage(pathname: string): boolean {
  return getPathDepth(pathname) === 1 && !excludedPaths.includes(pathname);
}

/**
 * タグページかどうかを判定
 * 形式: /tags/タグ名（2階層、最初が tags）
 */
export function isTagPage(pathname: string): boolean {
  const parts = pathname.slice(1).split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "tags";
}

/**
 * ブログ一覧ページかどうかを判定
 * 対象: /blog または /blog/page/2 のような構造
 */
export function isBlogIndexPage(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === "/blog" || normalized.startsWith("/blog/page/");
}
