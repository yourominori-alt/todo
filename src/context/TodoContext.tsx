import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { TodoState, Todo, Category, TodoFilter } from '../types/todo';
import { todoReducer, initialState } from './TodoReducer';
import type { TodoAction } from './TodoReducer';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';

interface TodoContextType {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  setFilter: (filter: Partial<TodoFilter>) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodoContext = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within TodoProvider');
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider = ({ children }: TodoProviderProps) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage(state);
    }
  }, [state, isInitialized]);

  const addTodo = (todo: Todo) => {
    dispatch({ type: 'ADD_TODO', payload: todo });
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } });
  };

  const deleteTodo = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  const toggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  const addCategory = (category: Category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const setFilter = (filter: Partial<TodoFilter>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const value: TodoContextType = {
    state,
    dispatch,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addCategory,
    deleteCategory,
    setFilter,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
