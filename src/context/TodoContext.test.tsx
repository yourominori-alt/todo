import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TodoProvider, useTodoContext } from './TodoContext';
import type { Todo, Category } from '../types/todo';
import * as localStorageUtils from '../utils/localStorage';

describe('TodoContext', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    dueDate: '2025-12-31',
    category: 'Work',
    tags: ['test'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockCategory: Category = {
    id: 'cat1',
    name: 'Work',
    color: '#ff0000',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TodoProvider>{children}</TodoProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('useTodoContext', () => {
    it('should throw error when used outside TodoProvider', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTodoContext());
      }).toThrow('useTodoContext must be used within TodoProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should provide context when used within TodoProvider', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(result.current.addTodo).toBeDefined();
    });
  });

  describe('TodoProvider initialization', () => {
    it('should start with initial state when no saved state exists', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      expect(result.current.state.todos).toEqual([]);
      expect(result.current.state.categories).toEqual([]);
      expect(result.current.state.filter.searchText).toBe('');
    });

    it('should load saved state from localStorage on mount', async () => {
      const savedState = {
        todos: [mockTodo],
        categories: [mockCategory],
        filter: {
          searchText: 'test',
          showCompleted: true,
          sortBy: 'createdAt' as const,
        },
      };

      vi.spyOn(localStorageUtils, 'loadFromLocalStorage').mockReturnValue(savedState);

      const { result } = renderHook(() => useTodoContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.todos).toHaveLength(1);
      });

      expect(result.current.state.todos[0]).toEqual(mockTodo);
      expect(result.current.state.categories[0]).toEqual(mockCategory);
    });
  });

  describe('addTodo', () => {
    it('should add a new todo', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      expect(result.current.state.todos).toHaveLength(1);
      expect(result.current.state.todos[0]).toEqual(mockTodo);
    });

    it('should save to localStorage after adding todo', async () => {
      const saveToLocalStorageSpy = vi.spyOn(localStorageUtils, 'saveToLocalStorage');
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.state).toBeDefined();
      });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      await waitFor(() => {
        expect(saveToLocalStorageSpy).toHaveBeenCalled();
      });
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      act(() => {
        result.current.updateTodo('1', { title: 'Updated Title' });
      });

      expect(result.current.state.todos[0].title).toBe('Updated Title');
    });

    it('should update multiple properties', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      act(() => {
        result.current.updateTodo('1', {
          title: 'New Title',
          priority: 'high',
          completed: true,
        });
      });

      expect(result.current.state.todos[0].title).toBe('New Title');
      expect(result.current.state.todos[0].priority).toBe('high');
      expect(result.current.state.todos[0].completed).toBe(true);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo by id', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      expect(result.current.state.todos).toHaveLength(1);

      act(() => {
        result.current.deleteTodo('1');
      });

      expect(result.current.state.todos).toHaveLength(0);
    });

    it('should not affect other todos', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });
      const secondTodo: Todo = { ...mockTodo, id: '2', title: 'Second Todo' };

      act(() => {
        result.current.addTodo(mockTodo);
        result.current.addTodo(secondTodo);
      });

      act(() => {
        result.current.deleteTodo('1');
      });

      expect(result.current.state.todos).toHaveLength(1);
      expect(result.current.state.todos[0].id).toBe('2');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      expect(result.current.state.todos[0].completed).toBe(false);

      act(() => {
        result.current.toggleTodo('1');
      });

      expect(result.current.state.todos[0].completed).toBe(true);

      act(() => {
        result.current.toggleTodo('1');
      });

      expect(result.current.state.todos[0].completed).toBe(false);
    });
  });

  describe('addCategory', () => {
    it('should add a new category', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addCategory(mockCategory);
      });

      expect(result.current.state.categories).toHaveLength(1);
      expect(result.current.state.categories[0]).toEqual(mockCategory);
    });

    it('should add multiple categories', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });
      const secondCategory: Category = {
        id: 'cat2',
        name: 'Personal',
        color: '#00ff00',
      };

      act(() => {
        result.current.addCategory(mockCategory);
        result.current.addCategory(secondCategory);
      });

      expect(result.current.state.categories).toHaveLength(2);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category by id', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addCategory(mockCategory);
      });

      expect(result.current.state.categories).toHaveLength(1);

      act(() => {
        result.current.deleteCategory('cat1');
      });

      expect(result.current.state.categories).toHaveLength(0);
    });
  });

  describe('setFilter', () => {
    it('should update search text filter', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.setFilter({ searchText: 'test query' });
      });

      expect(result.current.state.filter.searchText).toBe('test query');
    });

    it('should update multiple filter properties', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.setFilter({
          searchText: 'test',
          category: 'Work',
          priority: 'high',
          showCompleted: false,
        });
      });

      expect(result.current.state.filter.searchText).toBe('test');
      expect(result.current.state.filter.category).toBe('Work');
      expect(result.current.state.filter.priority).toBe('high');
      expect(result.current.state.filter.showCompleted).toBe(false);
    });

    it('should preserve unmodified filter properties', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.setFilter({ sortBy: 'priority' });
      });

      act(() => {
        result.current.setFilter({ searchText: 'test' });
      });

      expect(result.current.state.filter.sortBy).toBe('priority');
      expect(result.current.state.filter.searchText).toBe('test');
    });
  });

  describe('localStorage persistence', () => {
    it('should save state to localStorage after state changes', async () => {
      const saveToLocalStorageSpy = vi.spyOn(localStorageUtils, 'saveToLocalStorage');
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.state).toBeDefined();
      });

      act(() => {
        result.current.addTodo(mockTodo);
      });

      await waitFor(() => {
        expect(saveToLocalStorageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            todos: expect.arrayContaining([mockTodo]),
          })
        );
      });
    });
  });
});
