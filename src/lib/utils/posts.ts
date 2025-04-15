import { getCollection } from "astro:content";

/**
 * すべてのブログ記事を取得する
 * @returns ソート済みの記事配列
 */
export async function getAllPosts() {
  const posts = await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  return posts.sort((a, b) => {
    const dateA =
      a.data.date instanceof Date ? a.data.date : new Date(a.data.date);
    const dateB =
      b.data.date instanceof Date ? b.data.date : new Date(b.data.date);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * ファイル名からスラッグを取得する
 * @param id ファイルID
 * @returns スラッグ
 */
export function getSlugFromId(id: string): string {
  return id.replace("blog/", "").replace(".md", "").replace(".mdx", "");
}

/**
 * ページネーション用にデータを分割する
 * @param items アイテム配列
 * @param page ページ番号
 * @param pageSize ページサイズ
 * @returns ページネーションされたデータ
 */
export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    pagination: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      hasNextPage: start + pageSize < items.length,
      hasPrevPage: page > 1,
    },
  };
}
