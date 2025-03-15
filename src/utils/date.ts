// 日付関連のユーティリティ関数

/**
 * 日付を相対表示または具体的な日付形式で表示する
 * @param dateString ISO形式の日付文字列
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // 今日の場合
  if (date.toDateString() === today.toDateString()) {
    return '今日';
  }
  
  // 明日の場合
  if (date.toDateString() === tomorrow.toDateString()) {
    return '明日';
  }
  
  // それ以外の場合は日付を表示
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};