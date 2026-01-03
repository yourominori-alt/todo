import { describe, it, expect, beforeEach, vi } from 'vitest';
import { todoReducer, initialState } from './TodoReducer';
import type { TodoState, Todo, Category } from '../types/todo';

describe('todoReducer', () => {
  let state: TodoState;
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

  beforeEach(() => {
    state = {
      todos: [],
      categories: [],
      filter: {
        searchText: '',
        showCompleted: true,
        sortBy: 'createdAt',
      },
    };
  });

  describe('ADD_TODO', () => {
    it('should add a new todo to empty state', () => {
      const result = todoReducer(state, {
        type: 'ADD_TODO',
        payload: mockTodo,
      });

      expect(result.todos).toHaveLength(1);
      expect(result.todos[0]).toEqual(mockTodo);
    });

    it('should add a new todo to existing todos', () => {
      state.todos = [mockTodo];

      const newTodo: Todo = {
        ...mockTodo,
        id: '2',
        title: 'Second Todo',
      };

      const result = todoReducer(state, {
        type: 'ADD_TODO',
        payload: newTodo,
      });

      expect(result.todos).toHaveLength(2);
      expect(result.todos[1]).toEqual(newTodo);
    });

    it('should preserve existing state properties', () => {
      state.categories = [{ id: 'cat1', name: 'Work', color: '#ff0000' }];
      state.filter.searchText = 'test';

      const result = todoReducer(state, {
        type: 'ADD_TODO',
        payload: mockTodo,
      });

      expect(result.categories).toEqual(state.categories);
      expect(result.filter).toEqual(state.filter);
    });
  });

  describe('UPDATE_TODO', () => {
    beforeEach(() => {
      state.todos = [mockTodo];
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update todo title', () => {
      const result = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: {
          id: '1',
          updates: { title: 'Updated Title' },
        },
      });

      expect(result.todos[0].title).toBe('Updated Title');
      expect(result.todos[0].updatedAt).toBe('2025-01-15T12:00:00.000Z');
    });

    it('should update multiple properties', () => {
      const result = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: {
          id: '1',
          updates: {
            title: 'New Title',
            description: 'New Description',
            priority: 'high',
          },
        },
      });

      expect(result.todos[0].title).toBe('New Title');
      expect(result.todos[0].description).toBe('New Description');
      expect(result.todos[0].priority).toBe('high');
    });

    it('should not modify other todos', () => {
      const secondTodo: Todo = {
        ...mockTodo,
        id: '2',
        title: 'Second Todo',
      };
      state.todos.push(secondTodo);

      const result = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: {
          id: '1',
          updates: { title: 'Updated' },
        },
      });

      expect(result.todos[1]).toEqual(secondTodo);
    });

    it('should handle non-existent todo id', () => {
      const result = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: {
          id: 'non-existent',
          updates: { title: 'Updated' },
        },
      });

      expect(result.todos[0]).toEqual(mockTodo);
    });
  });

  describe('DELETE_TODO', () => {
    beforeEach(() => {
      state.todos = [
        mockTodo,
        { ...mockTodo, id: '2', title: 'Second Todo' },
        { ...mockTodo, id: '3', title: 'Third Todo' },
      ];
    });

    it('should delete a todo by id', () => {
      const result = todoReducer(state, {
        type: 'DELETE_TODO',
        payload: '2',
      });

      expect(result.todos).toHaveLength(2);
      expect(result.todos.find((t) => t.id === '2')).toBeUndefined();
    });

    it('should handle deleting the only todo', () => {
      state.todos = [mockTodo];

      const result = todoReducer(state, {
        type: 'DELETE_TODO',
        payload: '1',
      });

      expect(result.todos).toHaveLength(0);
    });

    it('should handle non-existent todo id', () => {
      const result = todoReducer(state, {
        type: 'DELETE_TODO',
        payload: 'non-existent',
      });

      expect(result.todos).toHaveLength(3);
    });
  });

  describe('TOGGLE_TODO', () => {
    beforeEach(() => {
      state.todos = [mockTodo];
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should toggle todo from incomplete to complete', () => {
      const result = todoReducer(state, {
        type: 'TOGGLE_TODO',
        payload: '1',
      });

      expect(result.todos[0].completed).toBe(true);
      expect(result.todos[0].updatedAt).toBe('2025-01-15T12:00:00.000Z');
    });

    it('should toggle todo from complete to incomplete', () => {
      state.todos[0].completed = true;

      const result = todoReducer(state, {
        type: 'TOGGLE_TODO',
        payload: '1',
      });

      expect(result.todos[0].completed).toBe(false);
    });

    it('should not modify other todos', () => {
      const secondTodo: Todo = {
        ...mockTodo,
        id: '2',
        completed: true,
      };
      state.todos.push(secondTodo);

      const result = todoReducer(state, {
        type: 'TOGGLE_TODO',
        payload: '1',
      });

      expect(result.todos[1].completed).toBe(true);
    });

    it('should handle non-existent todo id', () => {
      const result = todoReducer(state, {
        type: 'TOGGLE_TODO',
        payload: 'non-existent',
      });

      expect(result.todos[0]).toEqual(mockTodo);
    });
  });

  describe('ADD_CATEGORY', () => {
    const mockCategory: Category = {
      id: 'cat1',
      name: 'Work',
      color: '#ff0000',
    };

    it('should add a new category to empty state', () => {
      const result = todoReducer(state, {
        type: 'ADD_CATEGORY',
        payload: mockCategory,
      });

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0]).toEqual(mockCategory);
    });

    it('should add a new category to existing categories', () => {
      state.categories = [mockCategory];

      const newCategory: Category = {
        id: 'cat2',
        name: 'Personal',
        color: '#00ff00',
      };

      const result = todoReducer(state, {
        type: 'ADD_CATEGORY',
        payload: newCategory,
      });

      expect(result.categories).toHaveLength(2);
      expect(result.categories[1]).toEqual(newCategory);
    });
  });

  describe('DELETE_CATEGORY', () => {
    beforeEach(() => {
      state.categories = [
        { id: 'cat1', name: 'Work', color: '#ff0000' },
        { id: 'cat2', name: 'Personal', color: '#00ff00' },
      ];
    });

    it('should delete a category by id', () => {
      const result = todoReducer(state, {
        type: 'DELETE_CATEGORY',
        payload: 'cat1',
      });

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].id).toBe('cat2');
    });

    it('should handle non-existent category id', () => {
      const result = todoReducer(state, {
        type: 'DELETE_CATEGORY',
        payload: 'non-existent',
      });

      expect(result.categories).toHaveLength(2);
    });
  });

  describe('SET_FILTER', () => {
    it('should update search text', () => {
      const result = todoReducer(state, {
        type: 'SET_FILTER',
        payload: { searchText: 'test query' },
      });

      expect(result.filter.searchText).toBe('test query');
    });

    it('should update multiple filter properties', () => {
      const result = todoReducer(state, {
        type: 'SET_FILTER',
        payload: {
          searchText: 'test',
          category: 'Work',
          priority: 'high',
          showCompleted: false,
        },
      });

      expect(result.filter.searchText).toBe('test');
      expect(result.filter.category).toBe('Work');
      expect(result.filter.priority).toBe('high');
      expect(result.filter.showCompleted).toBe(false);
    });

    it('should preserve unmodified filter properties', () => {
      state.filter.sortBy = 'priority';

      const result = todoReducer(state, {
        type: 'SET_FILTER',
        payload: { searchText: 'test' },
      });

      expect(result.filter.sortBy).toBe('priority');
    });
  });

  describe('LOAD_STATE', () => {
    it('should completely replace state', () => {
      const newState: TodoState = {
        todos: [mockTodo],
        categories: [{ id: 'cat1', name: 'Work', color: '#ff0000' }],
        filter: {
          searchText: 'loaded',
          category: 'Work',
          priority: 'high',
          showCompleted: false,
          sortBy: 'priority',
        },
      };

      const result = todoReducer(state, {
        type: 'LOAD_STATE',
        payload: newState,
      });

      expect(result).toEqual(newState);
    });
  });

  describe('initialState', () => {
    it('should have correct initial structure', () => {
      expect(initialState.todos).toEqual([]);
      expect(initialState.categories).toEqual([]);
      expect(initialState.filter).toEqual({
        searchText: '',
        showCompleted: true,
        sortBy: 'createdAt',
      });
    });
  });

  describe('unknown action', () => {
    it('should return unchanged state for unknown action', () => {
      const result = todoReducer(state, {
        type: 'UNKNOWN_ACTION' as any,
      });

      expect(result).toEqual(state);
    });
  });
});
