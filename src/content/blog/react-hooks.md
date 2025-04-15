---
title: Reactフックの使い方完全ガイド
date: 2023-10-15
tags: ["React", "JavaScript"]
description: React Hooksを使いこなすための完全ガイド
---

# React フックの使い方完全ガイド

React のフックは、関数コンポーネントでステート管理やライフサイクルなどの機能を使えるようにする仕組みです。

## よく使われるフック

### useState

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>増やす</button>
    </div>
  );
}
```

### useEffect

```jsx
useEffect(() => {
  // マウント時やdependenciesが変更された時に実行される
  document.title = `カウント: ${count}`;

  return () => {
    // クリーンアップ関数
  };
}, [count]); // 依存配列
```

## カスタムフックの作り方

自分だけのフックを作成することで、ロジックを再利用できます。
