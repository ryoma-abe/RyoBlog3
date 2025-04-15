---
title: CSSグリッドレイアウト入門
date: 2023-09-20
tags: ["CSS", "Web開発"]
description: CSSグリッドレイアウトの基本から応用までを解説します
---

# CSS グリッドレイアウト入門

CSS グリッドレイアウトは、二次元のグリッドベースのレイアウトシステムで、Web ページのデザインを柔軟に構築できます。

## 基本的な使い方

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
}

.grid-item {
  background-color: #f0f0f0;
  padding: 20px;
  text-align: center;
}
```

## グリッドエリアの定義

```css
.grid-container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar content content"
    "footer footer footer";
}

.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.content {
  grid-area: content;
}
.footer {
  grid-area: footer;
}
```

## レスポンシブデザイン

メディアクエリと組み合わせることで、異なる画面サイズに対応したレイアウトを実現できます。
