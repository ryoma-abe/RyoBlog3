// src/lib/utils/tags.ts
import { getCollection } from "astro:content";

// タグ一覧を取得
export async function getAllTags() {
  const posts = await getCollection("blog");
  const allTags = posts.flatMap((post) => post.data.tags || []);
  return [...new Set(allTags)];
}

// タグの出現回数を取得
export async function getTagCounts() {
  const posts = await getCollection("blog");
  const tagCounts: Record<string, number> = {};

  posts.forEach((post) => {
    const tags = post.data.tags || [];
    tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return tagCounts;
}

// 手動で定義するタグカラー
export const tagColors: Record<string, string> = {
  HTML: "bg-orange-800/50",
  CSS: "bg-blue-800/50",
  JavaScript: "bg-yellow-700/50",
  React: "bg-cyan-800/50",
  Astro: "bg-purple-800/50",
  AI: "bg-pink-800/50",
  Shopify: "bg-green-800/50",
  コラム: "bg-indigo-800/50",
  開発環境: "bg-indigo-800/50",
  サンプル: "bg-green-700/50",
  ブログ: "bg-purple-700/50",
  MDX: "bg-blue-700/50",
  その他: "bg-gray-800/50",
};

/**
 * タグ名に基づいて適切な背景色のクラスを返す
 * @param tag タグ名
 * @returns 背景色を指定するTailwindクラス
 */
export function getTagColor(tag: string): string {
  const tagColorMap: Record<string, string> = {
    astro: "bg-purple-600",
    html: "bg-orange-600",
    css: "bg-blue-600",
    javascript: "bg-yellow-600",
    ブログ: "bg-cyan-600",
    shopify: "bg-green-800",
    column: "bg-red-800",
  };

  // タグを小文字に変換して大文字小文字を区別せずに色を取得
  const normalizedTag = tag.toLowerCase();
  return tagColorMap[normalizedTag] || "bg-gray-600";
}
