// src/lib/utils/tags.ts
import { getAllPosts } from "../api/blog";

// タグ一覧を取得
export async function getAllTags(includeDrafts = false) {
  const posts = await getAllPosts(includeDrafts);
  const allTags = posts.flatMap((post) => post.data.tags || []);
  return [...new Set(allTags)];
}

// タグの出現回数を取得
export async function getTagCounts(includeDrafts = false) {
  const posts = await getAllPosts(includeDrafts);
  const tagCounts: Record<string, number> = {};

  posts.forEach((post) => {
    if (post.data.tags && Array.isArray(post.data.tags)) {
      post.data.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return tagCounts;
}

// 手動で定義するタグカラー
export const tagColors: Record<string, string> = {
  HTML: "bg-orange-400",
  CSS: "bg-blue-400",
  JavaScript: "bg-yellow-400",
  React: "bg-cyan-400",
  Astro: "bg-purple-400",
  AI: "bg-pink-400",
  その他: "bg-gray-400", // fallback
};

// タグ名から色を取得（定義がなければ "その他" を使う）
export function getTagColor(tag: string): string {
  return tagColors[tag] || tagColors["その他"];
}
