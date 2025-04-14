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
    Astro: "bg-purple-600",
    HTML: "bg-orange-600",
    CSS: "bg-blue-600",
    JavaScript: "bg-yellow-600",
    TypeScript: "bg-blue-700",
    React: "bg-sky-500",
    Vue: "bg-emerald-600",
    "Next.js": "bg-black",
    "Nuxt.js": "bg-green-700",
    サンプル: "bg-indigo-600",
    テスト: "bg-gray-600",
    MDX: "bg-pink-600",
    画像: "bg-red-500",
    画像最適化: "bg-amber-600",
    ブログ: "bg-cyan-600",
  };

  // タグに対応する色がある場合はその色を返し、なければデフォルト色を返す
  return tagColorMap[tag] || "bg-gray-600";
}
