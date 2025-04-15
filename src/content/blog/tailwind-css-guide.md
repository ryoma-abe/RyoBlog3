---
title: Tailwind CSSでスタイリングを効率化する方法
date: 2023-02-10
tags: ["CSS", "Tailwind CSS", "Web開発"]
description: Tailwind CSSの基本的な使い方と効率的なスタイリング手法を解説します
---

# Tailwind CSS でスタイリングを効率化する方法

Tailwind CSS は、ユーティリティファーストの CSS フレームワークで、クラス名を直接 HTML に追加することでスタイリングを行います。

## 基本的な使い方

```html
<!-- 従来のCSSの場合 -->
<div class="card">
  <h2 class="card-title">タイトル</h2>
  <p class="card-content">内容...</p>
</div>

<!-- Tailwind CSSの場合 -->
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-bold mb-4 text-gray-800">タイトル</h2>
  <p class="text-gray-600">内容...</p>
</div>
```

## レスポンシブデザイン

Tailwind CSS ではブレークポイントのプレフィックスを使用して、レスポンシブスタイリングを簡単に実現できます。

```html
<div class="text-sm md:text-base lg:text-lg">
  画面サイズに応じて文字サイズが変わります
</div>
```

## カスタマイズ

`tailwind.config.js`ファイルを使用して、テーマ、色、フォントなどをカスタマイズできます。

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#3490dc",
        secondary: "#ffed4a",
      },
      fontFamily: {
        sans: ["Noto Sans JP", "sans-serif"],
      },
    },
  },
  variants: {},
  plugins: [],
};
```

Tailwind CSS を使用することで、CSS の記述量を減らし、一貫性のあるデザインを素早く実現できます。
