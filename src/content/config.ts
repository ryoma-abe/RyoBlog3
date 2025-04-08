// src/content/config.ts
import { defineCollection, z } from "astro:content";

// ブログ記事のスキーマ定義
const blogSchema = z.object({
  // 必須フィールド
  title: z.string(),

  // 任意フィールド
  date: z.string().optional(),
  author: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
});

// コレクションの定義
const blogCollection = defineCollection({
  type: "content",
  schema: blogSchema,
});

// エクスポート
export const collections = {
  blog: blogCollection,
};

// スキーマもエクスポート（型定義で使用するため）
export const schemas = {
  blog: blogSchema,
};
