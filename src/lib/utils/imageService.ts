/**
 * 画像URL最適化ユーティリティ
 * Notion APIから取得した画像URLをより最適化された形式に変換します
 */

/**
 * Notion画像URLをWebP形式に変換する
 *
 * @param url 元の画像URL
 * @param width 希望する幅（オプション）
 * @returns 最適化されたURL
 */
export function optimizeNotionImageUrl(url: string, width?: number): string {
  try {
    const imageUrl = new URL(url);

    // Notionホストされた画像の場合
    if (
      imageUrl.hostname.includes("notion.so") ||
      imageUrl.hostname.includes("amazonaws.com")
    ) {
      // 画像サイズのパラメータを追加
      if (width) {
        // Notionは幅の指定をサポートしている場合がある
        imageUrl.searchParams.set("width", width.toString());
      }

      // タイムスタンプを追加してキャッシュを回避
      imageUrl.searchParams.set("t", Date.now().toString());

      return imageUrl.toString();
    }

    // その他の外部画像URLの場合はそのまま返す
    return url;
  } catch (e) {
    console.warn("画像URL最適化エラー:", e);
    return url; // エラーの場合は元のURLを返す
  }
}

/**
 * 画像のプリロードを行う
 *
 * @param url 画像URL
 */
export function preloadImage(url: string): void {
  if (typeof window !== "undefined") {
    const img = new Image();
    img.src = url;
  }
}
