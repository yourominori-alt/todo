import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './localStorage';
import type { TodoState } from '../types/todo';

describe('localStorage utilities', () => {
  const mockState: TodoState = {
    todos: [
      {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        completed: false,
        priority: 'high',
        dueDate: '2025-12-31',
        category: 'Work',
        tags: ['urgent', 'important'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    categories: [
      {
        id: 'cat1',
        name: 'Work',
        color: '#ff0000',
      },
    ],
    filter: {
      searchText: 'test',
      category: 'Work',
      priority: 'high',
      showCompleted: true,
      sortBy: 'createdAt',
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveToLocalStorage', () => {
    it('should save state to localStorage', () => {
      saveToLocalStorage(mockState);

      const saved = localStorage.getItem('todo-app-state');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(mockState);
    });

    it('should overwrite existing data', () => {
      const firstState: TodoState = {
        ...mockState,
        todos: [],
      };

      saveToLocalStorage(firstState);
      saveToLocalStorage(mockState);

      const saved = localStorage.getItem('todo-app-state');
      const parsed = JSON.parse(saved!);
      expect(parsed.todos).toHaveLength(1);
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => saveToLocalStorage(mockState)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should load state from localStorage', () => {
      localStorage.setItem('todo-app-state', JSON.stringify(mockState));

      const loaded = loadFromLocalStorage();
      expect(loaded).toEqual(mockState);
    });

    it('should return null when no data exists', () => {
      const loaded = loadFromLocalStorage();
      expect(loaded).toBeNull();
    });

    it('should return null when data is corrupted', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorage.setItem('todo-app-state', 'invalid json');

      const loaded = loadFromLocalStorage();
      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle getItem errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const loaded = loadFromLocalStorage();
      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      getItemSpy.mockRestore();
    });
  });

  describe('clearLocalStorage', () => {
    it('should remove state from localStorage', () => {
      localStorage.setItem('todo-app-state', JSON.stringify(mockState));

      clearLocalStorage();

      const saved = localStorage.getItem('todo-app-state');
      expect(saved).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearLocalStorage()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });
});
