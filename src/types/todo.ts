export interface TodoItem {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  due?: string; // ISO形式の日付文字列
  createdAt: string;
  updatedAt: string;
}