import { TodoItem } from '../types/todo';
import { getAccessToken } from './auth';
import { initGapiClient } from './auth';

// ローカルキャッシュのキー
const TODOS_CACHE_KEY = 'google_todos_cache';
const DEFAULT_TASKLIST_ID_KEY = 'default_tasklist_id';

// デフォルトのタスクリストIDをローカルストレージから取得
const getDefaultTaskListId = (): string | null => {
  return localStorage.getItem(DEFAULT_TASKLIST_ID_KEY);
};

// デフォルトのタスクリストIDをローカルストレージに保存
const setDefaultTaskListId = (id: string): void => {
  localStorage.setItem(DEFAULT_TASKLIST_ID_KEY, id);
};

// Google Tasks API のレスポンスをTodoItemに変換する関数
const mapGoogleTaskToTodoItem = (task: any): TodoItem => {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes || '',
    completed: task.status === 'completed',
    due: task.due,
    createdAt: task.updated, // Google Tasksでは作成日時が直接提供されない
    updatedAt: task.updated
  };
};

// TodoItemをGoogle Tasks API形式に変換する関数
const mapTodoItemToGoogleTask = (todo: Partial<TodoItem>): any => {
  const task: any = {};
  
  if (todo.title !== undefined) task.title = todo.title;
  if (todo.notes !== undefined) task.notes = todo.notes;
  if (todo.due !== undefined) task.due = todo.due;
  if (todo.completed !== undefined) {
    task.status = todo.completed ? 'completed' : 'needsAction';
  }
  
  return task;
};

// エラーハンドリング用のラッパー関数
const handleApiError = (error: any): never => {
  console.error('Google Tasks API Error:', error);
  // API固有のエラーメッセージがある場合はそれを使用
  if (error.result && error.result.error) {
    throw new Error(`Google Tasks API: ${error.result.error.message}`);
  }
  throw error;
};

// デフォルトのタスクリストIDを取得する
export const fetchDefaultTaskList = async (): Promise<string> => {
  // ローカルに保存されたIDがあればそれを使用
  const cachedId = getDefaultTaskListId();
  if (cachedId) return cachedId;
  
  try {
    // GAPIクライアントを初期化
    await initGapiClient();
    
    // タスクリスト一覧を取得
    const response = await window.gapi.client.tasks.tasklists.list();
    
    if (!response.result.items || response.result.items.length === 0) {
      throw new Error('タスクリストが見つかりません');
    }
    
    // デフォルトのタスクリスト（通常は先頭のもの）のIDを保存して返す
    const taskListId = response.result.items[0].id;
    setDefaultTaskListId(taskListId);
    return taskListId;
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Google Tasks APIを使ってTODO一覧を取得する
export const fetchTodos = async (): Promise<TodoItem[]> => {
  try {
    // GAPIクライアントを初期化
    await initGapiClient();
    
    // アクセストークンの確認
    const token = getAccessToken();
    if (!token) {
      throw new Error('アクセストークンがありません。再ログインしてください。');
    }
    
    // デフォルトのタスクリストIDを取得
    const taskListId = await fetchDefaultTaskList();
    
    // タスク一覧を取得
    const response = await window.gapi.client.tasks.tasks.list({
      tasklist: taskListId,
      showCompleted: true,
      maxResults: 100 // 必要に応じて調整
    });
    
    // レスポンスからTodoItemの配列を作成
    const tasks = response.result.items || [];
    const todoItems = tasks.map(mapGoogleTaskToTodoItem);
    
    // ローカルキャッシュに保存
    localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todoItems));
    
    return todoItems;
    
  } catch (error) {
    // エラー時にはキャッシュから読み込む
    const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
    if (cachedTodos) {
      console.warn('APIから取得できないため、キャッシュからTodoを読み込みます');
      return JSON.parse(cachedTodos);
    }
    return handleApiError(error);
  }
};

// 新しいTODOを追加する
export const addTodo = async (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> => {
  try {
    // GAPIクライアントを初期化
    await initGapiClient();
    
    // アクセストークンの確認
    const token = getAccessToken();
    if (!token) {
      throw new Error('アクセストークンがありません。再ログインしてください。');
    }
    
    // デフォルトのタスクリストIDを取得
    const taskListId = await fetchDefaultTaskList();
    
    // Google Tasks API形式に変換
    const taskResource = mapTodoItemToGoogleTask(todoData);
    
    // タスクを作成
    const response = await window.gapi.client.tasks.tasks.insert({
      tasklist: taskListId,
      resource: taskResource
    });
    
    // 作成されたタスクをTodoItem形式に変換して返す
    const newTodo = mapGoogleTaskToTodoItem(response.result);
    
    // キャッシュを更新
    const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
    const todos = cachedTodos ? JSON.parse(cachedTodos) : [];
    todos.push(newTodo);
    localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todos));
    
    return newTodo;
    
  } catch (error) {
    return handleApiError(error);
  }
};

// TODOを更新する
export const updateTodo = async (id: string, todoData: Partial<Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TodoItem> => {
  try {
    // GAPIクライアントを初期化
    await initGapiClient();
    
    // アクセストークンの確認
    const token = getAccessToken();
    if (!token) {
      throw new Error('アクセストークンがありません。再ログインしてください。');
    }
    
    // デフォルトのタスクリストIDを取得
    const taskListId = await fetchDefaultTaskList();
    
    // Google Tasks API形式に変換
    const taskResource = mapTodoItemToGoogleTask(todoData);
    
    // タスクを更新
    const response = await window.gapi.client.tasks.tasks.update({
      tasklist: taskListId,
      task: id,
      resource: taskResource
    });
    
    // 更新されたタスクをTodoItem形式に変換
    const updatedTodo = mapGoogleTaskToTodoItem(response.result);
    
    // キャッシュを更新
    const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
    if (cachedTodos) {
      const todos = JSON.parse(cachedTodos);
      const index = todos.findIndex((todo: TodoItem) => todo.id === id);
      if (index !== -1) {
        todos[index] = updatedTodo;
        localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todos));
      }
    }
    
    return updatedTodo;
    
  } catch (error) {
    return handleApiError(error);
  }
};

// TODOを削除する
export const deleteTodo = async (id: string): Promise<string> => {
  try {
    // GAPIクライアントを初期化
    await initGapiClient();
    
    // アクセストークンの確認
    const token = getAccessToken();
    if (!token) {
      throw new Error('アクセストークンがありません。再ログインしてください。');
    }
    
    // デフォルトのタスクリストIDを取得
    const taskListId = await fetchDefaultTaskList();
    
    // タスクを削除
    await window.gapi.client.tasks.tasks.delete({
      tasklist: taskListId,
      task: id
    });
    
    // キャッシュを更新
    const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
    if (cachedTodos) {
      const todos = JSON.parse(cachedTodos);
      const filteredTodos = todos.filter((todo: TodoItem) => todo.id !== id);
      localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(filteredTodos));
    }
    
    return id;
    
  } catch (error) {
    return handleApiError(error);
  }
};