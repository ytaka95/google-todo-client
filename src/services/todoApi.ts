import { TodoItem } from '../types/todo';
import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const TODOS_STORAGE_KEY = 'google_todos';

// ローカルストレージからTODOを取得
const getStoredTodos = (): TodoItem[] => {
  const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
  return storedTodos ? JSON.parse(storedTodos) : [];
};

// ローカルストレージにTODOを保存
const storeTodos = (todos: TodoItem[]): void => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
};

// TODO一覧を取得する
export const fetchTodos = async (): Promise<TodoItem[]> => {
  // 本来はGoogle Tasks APIからデータを取得するが、
  // 現在の実装ではローカルストレージから取得する
  
  // デモデータ（初回のみ）
  const storedTodos = getStoredTodos();
  if (storedTodos.length === 0) {
    const demoTodos: TodoItem[] = [
      {
        id: uuidv4(),
        title: 'プロジェクト計画の作成',
        notes: '次週のミーティング用に資料を準備する',
        completed: false,
        due: new Date(Date.now() + 86400000).toISOString(), // 1日後
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: '買い物リスト',
        notes: '卵、牛乳、パン',
        completed: false,
        due: new Date(Date.now() + 172800000).toISOString(), // 2日後
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    storeTodos(demoTodos);
    return demoTodos;
  }
  
  return storedTodos;
};

// 新しいTODOを追加する
export const addTodo = async (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> => {
  // 本来はGoogle Tasks APIにデータを送信するが、
  // 現在の実装ではローカルストレージに保存する
  const now = new Date().toISOString();
  const newTodo: TodoItem = {
    id: uuidv4(),
    ...todoData,
    createdAt: now,
    updatedAt: now,
  };
  
  const todos = getStoredTodos();
  todos.push(newTodo);
  storeTodos(todos);
  
  return newTodo;
};

// TODOを更新する
export const updateTodo = async (id: string, todoData: Partial<Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TodoItem> => {
  // 本来はGoogle Tasks APIにデータを送信するが、
  // 現在の実装ではローカルストレージを更新する
  const todos = getStoredTodos();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    throw new Error(`Todo with id ${id} not found`);
  }
  
  const updatedTodo: TodoItem = {
    ...todos[index],
    ...todoData,
    updatedAt: new Date().toISOString(),
  };
  
  todos[index] = updatedTodo;
  storeTodos(todos);
  
  return updatedTodo;
};

// TODOを削除する
export const deleteTodo = async (id: string): Promise<string> => {
  // 本来はGoogle Tasks APIにリクエストを送信するが、
  // 現在の実装ではローカルストレージから削除する
  const todos = getStoredTodos();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  
  if (filteredTodos.length === todos.length) {
    throw new Error(`Todo with id ${id} not found`);
  }
  
  storeTodos(filteredTodos);
  
  return id;
};