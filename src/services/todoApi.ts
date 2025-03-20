import { TodoItem } from '../types/todo';
import { getAccessToken, refreshAccessToken } from './auth';
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
const mapTodoItemToGoogleTask = (todo: Partial<TodoItem>, includeId: boolean = false): any => {
    const task: any = {};

    // IDを含める場合（更新操作で必要）
    if (includeId && todo.id) task.id = todo.id;

    if (todo.title !== undefined) task.title = todo.title;
    if (todo.notes !== undefined) task.notes = todo.notes;
    if (todo.due !== undefined) task.due = todo.due;
    if (todo.completed !== undefined) {
        task.status = todo.completed ? 'completed' : 'needsAction';

        // 完了の場合は完了日を設定
        if (todo.completed) {
            task.completed = new Date().toISOString();
        } else {
            // 未完了の場合、completedフィールドを削除
            task.completed = null;
        }
    }

    return task;
};

// エラーハンドリング用のラッパー関数
const handleApiError = async (error: any, retryFn?: () => Promise<any>): Promise<any> => {
    console.error('Google Tasks API Error:', error);

    // 401認証エラーとトークンリフレッシュの処理
    if (error.result && error.result.error && error.result.error.code === 401 && retryFn) {
        try {
            // トークンを更新
            console.log('Access token expired, attempting to refresh...');
            await refreshAccessToken();

            // GAPIクライアントを再初期化
            await initGapiClient();

            // 元の操作をリトライ
            console.log('Retrying operation with new token...');
            return await retryFn();
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('認証の更新に失敗しました。再度ログインしてください。');
        }
    }

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
        // window.gapiが利用可能か確認
        if (!window.gapi || !window.gapi.client || !window.gapi.client.tasks) {
            console.error('GAPI client or tasks API not available in fetchDefaultTaskList');
            // フォールバックとしてデフォルトIDを生成（実際のAPIリクエスト時にエラーになる可能性あり）
            const fallbackId = 'default';
            setDefaultTaskListId(fallbackId);
            return fallbackId;
        }

        // タスクリスト一覧を取得
        const response = await window.gapi.client.tasks.tasklists.list();

        if (!response.result.items || response.result.items.length === 0) {
            // タスクリストが見つからない場合、新しいタスクリストを作成する
            // 注: このサンプルでは実装していませんが、実際のアプリでは
            // create API呼び出しでタスクリストを作成できます
            throw new Error('タスクリストが見つかりません');
        }

        // デフォルトのタスクリスト（通常は先頭のもの）のIDを保存して返す
        const taskListId = response.result.items[0].id;
        setDefaultTaskListId(taskListId);
        return taskListId;

    } catch (error) {
        console.error('Error fetching task list:', error);
        // エラーが発生した場合でもアプリが動作できるようにフォールバックIDを返す
        const fallbackId = 'default';
        setDefaultTaskListId(fallbackId);
        return fallbackId;
    }
};

// Google Tasks APIを使ってTODO一覧を取得する
export const fetchTodos = async (): Promise<TodoItem[]> => {
    try {
        // GAPIクライアントを初期化
        try {
            await initGapiClient();
        } catch (initError) {
            console.error('Failed to initialize GAPI client:', initError);
            // GAPI初期化エラーの場合はキャッシュを確認
            const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
            if (cachedTodos) {
                console.warn('GAPI初期化エラー: キャッシュからTodoを読み込みます');
                return JSON.parse(cachedTodos);
            }
            throw new Error('Google API の初期化に失敗しました。再度ログインしてください。');
        }

        // window.gapiが利用可能か確認
        if (!window.gapi || !window.gapi.client || !window.gapi.client.tasks) {
            console.error('GAPI client or tasks API not available');
            // APIが利用できない場合はキャッシュを確認
            const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
            if (cachedTodos) {
                console.warn('Tasks API利用不可: キャッシュからTodoを読み込みます');
                return JSON.parse(cachedTodos);
            }
            throw new Error('Google Tasks APIが利用できません。再度ログインしてください。');
        }

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
        console.error('Error fetching todos:', error);

        // エラー時にはキャッシュから読み込む
        const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
        if (cachedTodos) {
            console.warn('APIから取得できないため、キャッシュからTodoを読み込みます');
            return JSON.parse(cachedTodos);
        }

        // キャッシュもない場合は空の配列を返す（アプリのクラッシュを防ぐため）
        if (error instanceof Error) {
            throw new Error(`Todoの取得に失敗しました: ${error.message}`);
        }
        throw new Error('Todoの取得に失敗しました。原因不明のエラーです。');
    }
};

// 新しいTODOを追加する
export const addTodo = async (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> => {
    const executeAddTodo = async (): Promise<TodoItem> => {
        // GAPIクライアントを初期化
        await initGapiClient();

        // アクセストークンの確認
        const token = getAccessToken();
        if (!token) {
            throw new Error('アクセストークンがありません。再ログインしてください。');
        }

        // tasksクライアントの初期化確認
        if (!window.gapi?.client?.tasks) {
            throw new Error('GAPIのtasksクライアントが初期化されていません。');
        }

        // tasksクライアントの初期化確認
        if (!window.gapi?.client?.tasks) {
            throw new Error('GAPIのtasksクライアントが初期化されていません。');
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

        // サーバーから最新データを取得して同期する
        try {
            // 全てのタスクを再取得
            const updatedTodos = await fetchTodos();
            // キャッシュを更新
            localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(updatedTodos));

            // ただし、今追加したタスクのデータは返す必要があるので、
            // 再取得したデータから該当タスクを見つける
            const updatedTodo = updatedTodos.find(todo => todo.id === newTodo.id) || newTodo;
            return updatedTodo;
        } catch (syncError) {
            console.warn('Failed to sync after adding todo:', syncError);
            // 同期に失敗した場合は元のデータで古い方法でキャッシュ更新
            const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
            const todos = cachedTodos ? JSON.parse(cachedTodos) : [];
            todos.push(newTodo);
            localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todos));

            return newTodo;
        }
    };

    try {
        return await executeAddTodo();
    } catch (error) {
        return handleApiError(error, executeAddTodo);
    }
};

// TODOを更新する
export const updateTodo = async (id: string, todoData: Partial<Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TodoItem> => {
    const executeUpdateTodo = async (): Promise<TodoItem> => {
        // GAPIクライアントを初期化
        await initGapiClient();

        // アクセストークンの確認
        const token = getAccessToken();
        if (!token) {
            throw new Error('アクセストークンがありません。再ログインしてください。');
        }

        // デフォルトのタスクリストIDを取得
        const taskListId = await fetchDefaultTaskList();

        // Google Tasks API形式に変換（IDを含める）
        const taskResource = mapTodoItemToGoogleTask({...todoData, id}, true);

        // 先に現在のタスクを取得
        try {
            if (!window.gapi?.client?.tasks) {
                throw new Error('GAPIのtasksクライアントが初期化されていません。');
            }

            const currentTask = await window.gapi.client.tasks.tasks.get({
                tasklist: taskListId,
                task: id
            });

            // 既存のタスクが取得できなかった場合はエラー
            if (!currentTask.result) {
                throw new Error(`タスクID: ${id} が見つかりません`);
            }

            // 現在のタスクの状態も反映（特に必要なフィールドは既存データから継承）
            if (!taskResource.title && currentTask.result.title) {
                taskResource.title = currentTask.result.title;
            }
        } catch (error) {
            console.error('Failed to fetch current task state:', error);
            // 取得に失敗しても更新は続行（エラーはスローしない）
        }

        // tasksクライアントの初期化確認
        if (!window.gapi?.client?.tasks) {
            throw new Error('GAPIのtasksクライアントが初期化されていません。');
        }

        // デバッグ用にリクエスト情報をログ出力
        console.log('Updating task with ID:', id);
        console.log('Task resource:', JSON.stringify(taskResource, null, 2));

        // タスクを更新
        const response = await window.gapi.client.tasks.tasks.update({
            tasklist: taskListId,
            task: id,
            resource: taskResource
        });

        // 更新されたタスクをTodoItem形式に変換
        const updatedTodo = mapGoogleTaskToTodoItem(response.result);

        // サーバーから最新データを取得して同期する
        try {
            // 全てのタスクを再取得
            const updatedTodos = await fetchTodos();
            // キャッシュを更新
            localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(updatedTodos));

            // ただし、今更新したタスクのデータは返す必要があるので、
            // 再取得したデータから該当タスクを見つける
            const refreshedTodo = updatedTodos.find(todo => todo.id === id) || updatedTodo;
            return refreshedTodo;
        } catch (syncError) {
            console.warn('Failed to sync after updating todo:', syncError);
            // 同期に失敗した場合は元のデータで古い方法でキャッシュ更新
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
        }
    };

    try {
        return await executeUpdateTodo();
    } catch (error) {
        return handleApiError(error, executeUpdateTodo);
    }
};

// TODOを削除する
export const deleteTodo = async (id: string): Promise<string> => {
    const executeDeleteTodo = async (): Promise<string> => {
        // GAPIクライアントを初期化
        await initGapiClient();

        // アクセストークンの確認
        const token = getAccessToken();
        if (!token) {
            throw new Error('アクセストークンがありません。再ログインしてください。');
        }

        // tasksクライアントの初期化確認
        if (!window.gapi?.client?.tasks) {
            throw new Error('GAPIのtasksクライアントが初期化されていません。');
        }

        // デフォルトのタスクリストIDを取得
        const taskListId = await fetchDefaultTaskList();

        // タスクを削除
        await window.gapi.client.tasks.tasks.delete({
            tasklist: taskListId,
            task: id
        });

        // サーバーから最新データを取得して同期する
        try {
            // 全てのタスクを再取得
            const updatedTodos = await fetchTodos();
            // キャッシュを更新
            localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(updatedTodos));
        } catch (syncError) {
            console.warn('Failed to sync after deleting todo:', syncError);
            // 同期に失敗した場合は元のデータで古い方法でキャッシュ更新
            const cachedTodos = localStorage.getItem(TODOS_CACHE_KEY);
            if (cachedTodos) {
                const todos = JSON.parse(cachedTodos);
                const filteredTodos = todos.filter((todo: TodoItem) => todo.id !== id);
                localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(filteredTodos));
            }
        }

        return id;
    };

    try {
        return await executeDeleteTodo();
    } catch (error) {
        return handleApiError(error, executeDeleteTodo);
    }
};
