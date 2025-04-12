
---

## ✅ `getAllPosts()` には何が入ってるの？

`getAllPosts()` は、`astro:content` の `getCollection("blog")` を使っているので、  
指定したコレクション（この場合は `"blog"`）の **すべての記事データ**が入っています。

つまり…

```ts
const posts = await getAllPosts();
```

この `posts` には、各記事について **以下のような構造**のオブジェクトが配列で入ってます 👇

```ts
{
  id: "my-first-post.md",
  slug: "my-first-post",
  body: "...記事の中身...",
  collection: "blog",
  data: {
    title: "こんにちは世界",
    date: "2024-04-10",
    tags: ["フロントエンド", "AI"],
    draft: false,
    description: "この記事は…",
    // その他、frontmatterに書いた情報
  },
  render: [Function], // HTMLに変換するための関数
}
```

---

## 📦 つまり「記事全体」って？

- `slug`：URL に使える記事の識別子
- `data`: frontmatter（タイトル、日付、タグ、下書きフラグなど）
- `render()`：HTML コンテンツを表示するための関数（`.astro`で使うやつ）
- `body`：Markdown の生テキスト（使いたければ）

---

## 🔁 まとめると：

- `getAllPosts()` は `"blog"` コレクションにある**すべての投稿のメタ情報＋中身**を返す。
- `getSortedPosts()` で日付順に並び替えたバージョンが欲しいときも便利。
- `getAllPosts(true)` とすると「下書きも含めた全記事」が取得できる。s

---