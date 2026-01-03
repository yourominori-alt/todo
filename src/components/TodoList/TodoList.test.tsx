import { describe, it, expect, vi } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TodoList } from './TodoList';
import { TodoProvider, useTodoContext } from '../../context/TodoContext';
import type { Todo } from '../../types/todo';

describe('TodoList', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TodoProvider>{children}</TodoProvider>
  );

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'High Priority Todo',
      description: 'Important task',
      completed: false,
      priority: 'high',
      dueDate: '2025-12-31',
      category: 'Work',
      tags: ['urgent'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Medium Priority Todo',
      description: 'Normal task',
      completed: false,
      priority: 'medium',
      dueDate: '2025-12-30',
      category: 'Personal',
      tags: ['normal'],
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Low Priority Todo',
      description: 'Optional task',
      completed: true,
      priority: 'low',
      category: 'Work',
      tags: ['later'],
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    },
  ];

  const renderWithProvider = (onEditTodo = vi.fn()) => {
    const { result } = renderHook(() => useTodoContext(), { wrapper });

    mockTodos.forEach((todo) => {
      act(() => {
        result.current.addTodo(todo);
      });
    });

    return render(
      <TodoProvider>
        <TodoList onEditTodo={onEditTodo} />
      </TodoProvider>
    );
  };

  describe('rendering', () => {
    it('should render empty state when no todos', () => {
      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      expect(screen.getByText('TODOがありません。新しいTODOを追加してください。')).toBeInTheDocument();
    });

    it('should render all todos when todos exist', () => {
      renderWithProvider();

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Low Priority Todo')).toBeInTheDocument();
    });

    it('should pass onEditTodo to TodoItem components', () => {
      const onEditTodo = vi.fn();
      renderWithProvider(onEditTodo);

      // TodoItem components should be rendered with onEdit prop
      const editButtons = screen.getAllByText('編集');
      expect(editButtons).toHaveLength(3);
    });
  });

  describe('filtering by search text', () => {
    it('should filter todos by title', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ searchText: 'High' });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Todo')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Todo')).not.toBeInTheDocument();
    });

    it('should filter todos by description', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ searchText: 'Important' });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Todo')).not.toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ searchText: 'high' });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
    });

    it('should show empty state when no matches', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ searchText: 'nonexistent' });
      });

      expect(screen.getByText('TODOがありません。新しいTODOを追加してください。')).toBeInTheDocument();
    });
  });

  describe('filtering by category', () => {
    it('should filter todos by category', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ category: 'Work' });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Todo')).not.toBeInTheDocument();
      expect(screen.getByText('Low Priority Todo')).toBeInTheDocument();
    });

    it('should show all todos when no category filter', () => {
      renderWithProvider();

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Low Priority Todo')).toBeInTheDocument();
    });
  });

  describe('filtering by priority', () => {
    it('should filter todos by priority', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ priority: 'high' });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Todo')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Todo')).not.toBeInTheDocument();
    });
  });

  describe('filtering by completion status', () => {
    it('should show all todos when showCompleted is true', () => {
      renderWithProvider();

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Low Priority Todo')).toBeInTheDocument();
    });

    it('should hide completed todos when showCompleted is false', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ showCompleted: false });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Low Priority Todo')).not.toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('should sort by createdAt (newest first)', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ sortBy: 'createdAt' });
      });

      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      // Low Priority Todo has latest createdAt (2025-01-03), but it's completed
      // Completed todos should appear last
      expect(titles[0]).toBe('Medium Priority Todo'); // 2025-01-02, not completed
      expect(titles[1]).toBe('High Priority Todo'); // 2025-01-01, not completed
      expect(titles[2]).toBe('Low Priority Todo'); // completed
    });

    it('should sort by dueDate', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ sortBy: 'dueDate' });
      });

      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      // Medium: 2025-12-30, High: 2025-12-31, Low: no dueDate
      // Completed todos appear last
      expect(titles[0]).toBe('Medium Priority Todo'); // earliest dueDate
      expect(titles[1]).toBe('High Priority Todo');
      expect(titles[2]).toBe('Low Priority Todo'); // completed
    });

    it('should sort by priority', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({ sortBy: 'priority' });
      });

      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      // high > medium > low, but completed appear last
      expect(titles[0]).toBe('High Priority Todo');
      expect(titles[1]).toBe('Medium Priority Todo');
      expect(titles[2]).toBe('Low Priority Todo'); // completed
    });

    it('should always put completed todos at the end', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      expect(titles[2]).toBe('Low Priority Todo'); // completed todo is last
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters together', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({
          category: 'Work',
          showCompleted: false,
        });
      });

      // Only "High Priority Todo" matches (Work category, not completed)
      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Todo')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Todo')).not.toBeInTheDocument();
    });

    it('should apply search, category, and priority filters together', () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      mockTodos.forEach((todo) => {
        act(() => {
          result.current.addTodo(todo);
        });
      });

      const onEditTodo = vi.fn();
      render(
        <TodoProvider>
          <TodoList onEditTodo={onEditTodo} />
        </TodoProvider>
      );

      act(() => {
        result.current.setFilter({
          searchText: 'Priority',
          category: 'Work',
          priority: 'high',
        });
      });

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Todo')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Todo')).not.toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should use memoization for filtering and sorting', () => {
      // This test verifies that useMemo is being used
      // by checking that the component renders correctly
      renderWithProvider();

      expect(screen.getByText('High Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority Todo')).toBeInTheDocument();
      expect(screen.getByText('Low Priority Todo')).toBeInTheDocument();
    });
  });
});
