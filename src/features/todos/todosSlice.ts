import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TodoItem } from '../../types/todo';

export interface TodosState {
  items: TodoItem[];
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: string | null;
}

const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
  syncStatus: 'idle',
  lastSyncTime: null,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    fetchTodosStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTodosSuccess: (state, action: PayloadAction<TodoItem[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.lastSyncTime = new Date().toISOString();
      state.syncStatus = 'synced';
    },
    fetchTodosFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.syncStatus = 'error';
    },
    addTodoStart: (state) => {
      state.syncStatus = 'syncing';
    },
    addTodoSuccess: (state, action: PayloadAction<TodoItem>) => {
      state.items.push(action.payload);
      state.syncStatus = 'synced';
      state.lastSyncTime = new Date().toISOString();
    },
    updateTodoStart: (state) => {
      state.syncStatus = 'syncing';
    },
    updateTodoSuccess: (state, action: PayloadAction<TodoItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.syncStatus = 'synced';
      state.lastSyncTime = new Date().toISOString();
    },
    deleteTodoStart: (state) => {
      state.syncStatus = 'syncing';
    },
    deleteTodoSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.syncStatus = 'synced';
      state.lastSyncTime = new Date().toISOString();
    },
    setSyncStatus: (state, action: PayloadAction<TodosState['syncStatus']>) => {
      state.syncStatus = action.payload;
    },
  },
});

export const {
  fetchTodosStart,
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodoStart,
  addTodoSuccess,
  updateTodoStart,
  updateTodoSuccess,
  deleteTodoStart,
  deleteTodoSuccess,
  setSyncStatus,
} = todosSlice.actions;

export default todosSlice.reducer;