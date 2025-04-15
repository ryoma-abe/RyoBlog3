---
title: Next.js入門：Reactベースのフレームワーク
date: 2023-03-15
tags: ["Next.js", "React", "Web開発"]
description: Next.jsの基本的な使い方と主要機能について解説します
---

# Next.js 入門：React ベースのフレームワーク

Next.js は、React ベースのフルスタックフレームワークで、サーバーサイドレンダリング、静的サイト生成など多くの機能を提供します。

## プロジェクトのセットアップ

```bash
# プロジェクトの作成
npx create-next-app@latest my-next-app
cd my-next-app

# 開発サーバーの起動
npm run dev
```

## ルーティングシステム

Next.js は、ファイルベースのルーティングシステムを採用しています。

```jsx
// pages/index.js - ホームページ（/）
export default function Home() {
  return <h1>ホームページ</h1>;
}

// pages/about.js - アバウトページ（/about）
export default function About() {
  return <h1>アバウトページ</h1>;
}

// pages/posts/[id].js - 動的ルーティング（/posts/1, /posts/2など）
import { useRouter } from 'next/router';

export default function Post() {
  const router = useRouter();
  const { id } = router.query;

  return <h1>ポスト {id}</h1>;
}
```

## データフェッチング

Next.js には、様々なデータフェッチング方法が用意されています：

- **getStaticProps** - ビルド時にデータを取得（SSG）
- **getServerSideProps** - リクエスト時にデータを取得（SSR）
- **getStaticPaths** - 動的ルーティングのパスを生成

Next.js を使用することで、高性能で SEO に優れた Web アプリケーションを効率的に構築できます。
