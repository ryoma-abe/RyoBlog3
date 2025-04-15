---
title: チームで使えるGitワークフロー
date: 2023-05-01
tags: ["Git", "開発ツール"]
description: 効率的なチーム開発のためのGitワークフローを紹介します
---

# チームで使える Git ワークフロー

効率的なチーム開発には、適切な Git ワークフローの選択が重要です。

## Gitflow

Gitflow は、feature、develop、release、master、hotfix の 5 つのブランチを使用する、体系的なブランチ戦略です。

```bash
# 新機能の開発を始める
git checkout -b feature/new-feature develop

# 開発完了後、developブランチにマージ
git checkout develop
git merge --no-ff feature/new-feature

# リリース準備
git checkout -b release/1.0.0 develop

# リリース完了後、masterとdevelopにマージ
git checkout master
git merge --no-ff release/1.0.0
git tag -a 1.0.0 -m "Version 1.0.0"
```

## GitHub Flow

GitHub フローは、master ブランチと feature ブランチのみを使用する、シンプルなワークフローです。

1. master ブランチから feature ブランチを作成
2. 変更を commit & push
3. Pull Request を作成
4. レビュー後、master にマージ

## プルリクエストのベストプラクティス

- 小さく、焦点を絞った変更にする
- 明確な説明を書く
- CI テストが通ることを確認する

適切な Git ワークフローを導入することで、コードの品質向上とチームの生産性向上を実現できます。
