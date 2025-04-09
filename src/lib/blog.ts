// src/lib/blog.ts
import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

// 記事一覧を取得する関数
export async function getAllPosts(includeDrafts = false) {
  return await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? !data.draft || includeDrafts : true;
  });
}

// 日付順にソートした記事一覧を取得
export async function getSortedPosts(includeDrafts = false) {
  const posts = await getAllPosts(includeDrafts);
  return posts.sort((a, b) => {
    const dateA = new Date(a.data.date || "");
    const dateB = new Date(b.data.date || "");
    return dateB.getTime() - dateA.getTime();
  });
}

// すべてのタグを取得
export async function getAllTags(includeDrafts = false) {
  const posts = await getAllPosts(includeDrafts);
  const allTags = posts.flatMap((post) => post.data.tags || []);
  return [...new Set(allTags)];
}

// タグごとの記事数を取得
export async function getTagCounts(includeDrafts = false) {
  const posts = await getAllPosts(includeDrafts);
  const tagCounts = {};

  posts.forEach((post) => {
    if (post.data.tags && Array.isArray(post.data.tags)) {
      post.data.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return tagCounts;
}

// タグごとの色設定
export const tagColors = {
  フロントエンド: "bg-blue-500",
  バックエンド: "bg-green-500",
  デザイン: "bg-purple-500",
  AI: "bg-purple-400",
  キャリア: "bg-amber-500",
  その他: "bg-gray-500", // デフォルト
};

// 日付フォーマット関数
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
