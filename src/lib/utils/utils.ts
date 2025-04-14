/**
 * 日付をフォーマットする関数
 * @param dateString 日付文字列
 * @returns フォーマットされた日付
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);

    // 無効な日付の場合は元の文字列を返す
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
}
