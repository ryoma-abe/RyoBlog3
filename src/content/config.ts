import { defineCollection, z } from "astro:content";

// ブログコレクションのスキーマを定義
export const collections = {
  blog: defineCollection({
    // コンテンツ型を指定
    type: "content",
    // スキーマを定義（シンプルに保持）
    schema: z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()),
      description: z.string(),
      draft: z.boolean().optional().default(false),
    }),
  }),
};
