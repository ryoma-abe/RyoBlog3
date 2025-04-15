---
title: Dockerの基本と実践的な使い方
date: 2023-06-05
tags: ["Docker", "インフラ"]
description: Dockerの基本概念から実践的な使い方まで、開発環境の構築方法を解説します
---

# Docker の基本と実践的な使い方

Docker はコンテナ技術を使って、アプリケーションとその依存関係をパッケージングするプラットフォームです。

## Docker の基本概念

- **イメージ** - アプリケーションとその実行環境を含む不変のテンプレート
- **コンテナ** - イメージから作成された実行インスタンス
- **Dockerfile** - イメージをビルドするための指示書

## 基本的なコマンド

```bash
# イメージのビルド
docker build -t myapp:latest .

# コンテナの起動
docker run -p 8080:80 myapp:latest

# 実行中のコンテナの確認
docker ps

# コンテナの停止
docker stop <container_id>
```

## Docker Compose の活用

複数のコンテナを管理するには、Docker Compose を使用します。

```yaml
# docker-compose.yml
version: "3"
services:
  web:
    build: .
    ports:
      - "8080:80"
  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: example
```

Docker を使いこなすことで、開発環境の構築や本番環境へのデプロイがスムーズになります。
