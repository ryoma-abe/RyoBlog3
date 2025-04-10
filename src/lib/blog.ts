// src/lib/blog.ts
import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export async function getAllPosts(includeDrafts = false) {
  return await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? !data.draft || includeDrafts : true;
  });
}

export async function getSortedPosts(includeDrafts = false) {
  const posts = await getAllPosts(includeDrafts);
  return posts.sort((a, b) => {
    const dateA = new Date(a.data.date || "");
    const dateB = new Date(b.data.date || "");
    return dateB.getTime() - dateA.getTime();
  });
}
