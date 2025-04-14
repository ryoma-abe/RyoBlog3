// src/lib/utils/tags.ts
import { getNotionPosts } from "../api/notion.ts";

// タグ一覧を取得
export async function getAllTags() {
  const posts = await getNotionPosts();
  const allTags = posts.flatMap((post) => {
    const tags = (post.properties.Tags as any)?.multi_select || [];
    return tags.map((tag: { name: string }) => tag.name);
  });
  return [...new Set(allTags)];
}

// タグの出現回数を取得
export async function getTagCounts() {
  const posts = await getNotionPosts();
  const tagCounts: Record<string, number> = {};

  posts.forEach((post) => {
    const tags = (post.properties.Tags as any)?.multi_select || [];
    tags.forEach((tag: { name: string }) => {
      tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
    });
  });

  return tagCounts;
}

// 手動で定義するタグカラー
export const tagColors: Record<string, string> = {
  HTML: "bg-orange-600",
  CSS: "bg-blue-600",
  JavaScript: "bg-yellow-700",
  React: "bg-cyan-600",
  Astro: "bg-purple-600",
  AI: "bg-pink-600",
  Shopify: "bg-green-600",
  コラム: "bg-indigo-600",
  開発環境: "bg-indigo-600",
  その他: "bg-gray-600", // fallback
};

// タグ名から色を取得（定義がなければ "その他" を使う）
export function getTagColor(tag: string): string {
  return tagColors[tag] || tagColors["その他"];
}
