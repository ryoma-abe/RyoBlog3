---
title: Astroの画像最適化
slug: astro-images
date: 2023-11-05
tags: [Astro, 画像最適化]
description: Astroの画像最適化機能について解説します
---

# Astroの画像最適化

Astroには標準で画像最適化機能が組み込まれています。

## 基本的な使い方

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/my-image.png';
---

<Image src={myImage} alt="説明文" />
```

## 画像最適化の利点

- WebPやAVIFなどの最新フォーマットへの自動変換
- レスポンシブ画像の生成
- 遅延読み込みのサポート
- パフォーマンスの向上

## リモート画像の使用

リモート画像を使用する場合は以下のように記述します：

```astro
---
import { Image } from 'astro:assets';
---

<Image 
  src="https://example.com/image.jpg" 
  alt="リモート画像"
  width={800}
  height={600}
/>
```
