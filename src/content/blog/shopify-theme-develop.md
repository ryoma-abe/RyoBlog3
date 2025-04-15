---
title: Shopifyテーマ開発の基礎から応用まで
date: 2023-01-05
tags: ["Shopify", "eコマース", "Web開発"]
description: Shopifyのテーマ開発に関する基礎知識から応用テクニックまでを解説します
---

# Shopify テーマ開発の基礎から応用まで

Shopify は、オンラインストアを簡単に作成できる e コマースプラットフォームです。カスタムテーマの開発によって、独自のブランディングを実現できます。

## 開発環境のセットアップ

```bash
# Shopify CLIのインストール
npm install -g @shopify/cli @shopify/theme

# 新しいテーマの作成
shopify theme init my-custom-theme

# 開発サーバーの起動
shopify theme dev
```

## Liquid テンプレート言語

Shopify のテーマは、Liquid というテンプレート言語を使用します。

```liquid
{% comment %}商品の表示{% endcomment %}
<div class="product">
  <h2>{{ product.title }}</h2>
  <p>{{ product.price | money }}</p>

  {% if product.available %}
    <span class="available">在庫あり</span>
  {% else %}
    <span class="sold-out">売り切れ</span>
  {% endif %}

  <div class="description">
    {{ product.description }}
  </div>
</div>
```

## Sections と Blocks

Shopify のモダンなテーマでは、Sections と Blocks を使用してストアのカスタマイズ性を高めています。

```liquid
{% schema %}
{
  "name": "商品紹介",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "見出し",
      "default": "おすすめ商品"
    },
    {
      "type": "collection",
      "id": "featured_collection",
      "label": "コレクションを選択"
    }
  ]
}
{% endschema %}

<h2>{{ section.settings.heading }}</h2>
```

Shopify のテーマ開発をマスターすることで、魅力的で機能的なオンラインストアを構築できます。
