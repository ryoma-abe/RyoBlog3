// 除外対象の固定ページ一覧（記事ページ判定に使う）
const excludedPaths = [
  "/about",
  "/contact",
  "/blog",
  "/thanks",
  "/tags",
  "/sitemap",
  "/404",
  "/privacy-policy",
];

/**
 * パスの階層を数える（例: /blog/page/2 → 3）
 */
export function getPathDepth(pathname: string): number {
  return pathname.slice(1).split("/").filter(Boolean).length;
}

/**
 * パスを正規化（末尾スラッシュを除去）
 */
export function normalizePath(pathname: string): string {
  return pathname.endsWith("/") ? pathname.slice(0, -1) || "/" : pathname;
}

/**
 * ブログ記事ページ（詳細ページ）かどうか
 */
export function isArticlePage(pathname: string): boolean {
  const depth = getPathDepth(pathname);
  return depth === 1 && !excludedPaths.includes(pathname);
}

/**
 * タグページかどうか（/tags/javascript など）
 */
export function isTagPage(pathname: string): boolean {
  const parts = pathname.slice(1).split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "tags";
}

/**
 * ブログ一覧ページかどうか（/blog や /blog/page/2）
 */
export function isBlogIndexPage(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === "/blog" || normalized.startsWith("/blog/page/");
}

/**
 * ブログに関連するすべてのページかどうか
 * 一覧ページ / タグページ / 記事ページ を含む
 */
export function isBlogRelatedPage(pathname: string): boolean {
  return (
    isBlogIndexPage(pathname) || isTagPage(pathname) || isArticlePage(pathname)
  );
}
