import type { TodoState, Todo, Category, TodoFilter } from '../types/todo';

export type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<TodoFilter> }
  | { type: 'LOAD_STATE'; payload: TodoState };

export const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };

    case 'UPDATE_TODO': {
      const updatedTodos = state.todos.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : todo
      );
      return {
        ...state,
        todos: updatedTodos,
      };
    }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    case 'TOGGLE_TODO': {
      const toggledTodos = state.todos.map((todo) =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
          : todo
      );
      return {
        ...state,
        todos: toggledTodos,
      };
    }

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
};

export const initialState: TodoState = {
  todos: [],
  categories: [],
  filter: {
    searchText: '',
    showCompleted: true,
    sortBy: 'createdAt',
  },
};
