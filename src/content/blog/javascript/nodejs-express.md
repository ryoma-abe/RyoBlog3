---
title: Node.jsとExpressでRESTful APIを構築する
date: 2023-04-10
tags: ["Node.js", "Express", "API"]
description: Node.jsとExpressを使ってRESTful APIを構築する方法を解説します
---

# Node.js と Express で RESTful API を構築する

Node.js と Express を使うと、シンプルで高速な RESTful API を簡単に構築できます。

## 基本的なセットアップ

```javascript
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// JSONデータを受け取るためのミドルウェア
app.use(express.json());

// 簡単なルーティング
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

## CRUD 操作の実装

```javascript
// ユーザーデータ（実際にはデータベースを使用します）
let users = [
  { id: 1, name: "山田太郎", email: "yamada@example.com" },
  { id: 2, name: "鈴木花子", email: "suzuki@example.com" },
];

// ユーザー一覧の取得
app.get("/api/users", (req, res) => {
  res.json(users);
});

// 特定のユーザーの取得
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send("User not found");
  res.json(user);
});

// ユーザーの作成
app.post("/api/users", (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});
```

## エラーハンドリング

適切なエラーハンドリングは、安全で信頼性の高い API には不可欠です。

これらの基本をマスターすれば、堅牢な RESTful API を構築できるようになります。
