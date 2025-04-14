---
title: Astroでブログを作る
date: "2023-11-15"
tags: ["Astro", "ブログ"]
description: Astroを使ったブログサイトの作り方
---

# Astro でブログを作る方法

Astro を使うと、高速で優れたブログサイトを簡単に構築できます。

## 特徴

- **高速**: 最小限の JavaScript でページを提供します
- **マークダウンサポート**: MDX でマークダウンとコンポーネントを組み合わせられます
- **コンテンツコレクション**: 型安全なコンテンツ管理が可能です

## コード例

```javascript
// src/pages/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
```
