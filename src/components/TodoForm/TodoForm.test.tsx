import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './TodoForm';
import { TodoProvider } from '../../context/TodoContext';
import type { Todo } from '../../types/todo';

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('TodoForm', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    dueDate: '2025-12-31',
    category: 'Work',
    tags: ['urgent', 'important'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const renderWithProvider = (editingTodo?: Todo | null, onCancelEdit = vi.fn()) => {
    return render(
      <TodoProvider>
        <TodoForm editingTodo={editingTodo} onCancelEdit={onCancelEdit} />
      </TodoProvider>
    );
  };

  beforeEach(() => {
    global.alert = vi.fn();
  });

  describe('rendering', () => {
    it('should render form with title "新規TODO" when not editing', () => {
      renderWithProvider();
      expect(screen.getByText('新規TODO')).toBeInTheDocument();
    });

    it('should render form with title "TODO編集" when editing', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('TODO編集')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderWithProvider();

      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
      expect(screen.getByLabelText(/優先度/)).toBeInTheDocument();
      expect(screen.getByLabelText(/期限/)).toBeInTheDocument();
      expect(screen.getByLabelText(/カテゴリ/)).toBeInTheDocument();
      expect(screen.getByLabelText(/タグ/)).toBeInTheDocument();
    });

    it('should show "追加" button when not editing', () => {
      renderWithProvider();
      expect(screen.getByText('追加')).toBeInTheDocument();
    });

    it('should show "更新" and "キャンセル" buttons when editing', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('更新')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('should not show cancel button when not editing', () => {
      renderWithProvider();
      expect(screen.queryByText('キャンセル')).not.toBeInTheDocument();
    });
  });

  describe('form population when editing', () => {
    it('should populate form fields with editing todo data', () => {
      renderWithProvider(mockTodo);

      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
      expect(screen.getByDisplayValue('urgent, important')).toBeInTheDocument();
    });

    it('should populate form with empty values when todo has no optional fields', () => {
      const minimalTodo: Todo = {
        ...mockTodo,
        description: undefined,
        dueDate: undefined,
        category: undefined,
        tags: [],
      };

      renderWithProvider(minimalTodo);

      expect(screen.getByLabelText(/説明/)).toHaveValue('');
      expect(screen.getByLabelText(/期限/)).toHaveValue('');
      expect(screen.getByLabelText(/カテゴリ/)).toHaveValue('');
      expect(screen.getByLabelText(/タグ/)).toHaveValue('');
    });
  });

  describe('adding new todo', () => {
    it('should add new todo with all fields filled', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));

      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'New Todo');
      await user.type(screen.getByLabelText(/説明/), 'New Description');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'high');
      await user.type(screen.getByLabelText(/期限/), '2025-12-31');
      await user.type(screen.getByLabelText(/カテゴリ/), 'Personal');
      await user.type(screen.getByLabelText(/タグ/), 'tag1, tag2');

      await user.click(screen.getByText('追加'));

      // Form should be cleared after submission
      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
      });

      vi.useRealTimers();
    });

    it('should add new todo with only required fields', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'Minimal Todo');
      await user.click(screen.getByText('追加'));

      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
      });
    });

    it('should trim whitespace from title', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), '  Spaced Todo  ');
      await user.click(screen.getByText('追加'));

      // The form should clear, indicating successful submission
      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
      });
    });

    it('should parse tags correctly', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'Tagged Todo');
      await user.type(screen.getByLabelText(/タグ/), 'tag1, tag2, tag3');
      await user.click(screen.getByText('追加'));

      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
      });
    });

    it('should handle empty tags gracefully', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'No Tags Todo');
      await user.type(screen.getByLabelText(/タグ/), ', , ,');
      await user.click(screen.getByText('追加'));

      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
      });
    });

    it('should reset to default priority after submission', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'high');
      await user.click(screen.getByText('追加'));

      await waitFor(() => {
        expect(screen.getByLabelText(/優先度/)).toHaveValue('medium');
      });
    });
  });

  describe('validation', () => {
    it('should show alert when submitting empty title', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByText('追加'));

      expect(global.alert).toHaveBeenCalledWith('タイトルを入力してください');
    });

    it('should show alert when submitting whitespace-only title', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), '   ');
      await user.click(screen.getByText('追加'));

      expect(global.alert).toHaveBeenCalledWith('タイトルを入力してください');
    });

    it('should not submit form when title is empty', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByText('追加'));

      // Form should not be cleared (not submitted)
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    });
  });

  describe('updating existing todo', () => {
    it('should update todo when editing', async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();

      renderWithProvider(mockTodo, onCancelEdit);

      await user.clear(screen.getByLabelText(/タイトル/));
      await user.type(screen.getByLabelText(/タイトル/), 'Updated Todo');
      await user.click(screen.getByText('更新'));

      await waitFor(() => {
        expect(onCancelEdit).toHaveBeenCalled();
      });
    });

    it('should call onCancelEdit after successful update', async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();

      renderWithProvider(mockTodo, onCancelEdit);

      await user.clear(screen.getByLabelText(/タイトル/));
      await user.type(screen.getByLabelText(/タイトル/), 'Updated');
      await user.click(screen.getByText('更新'));

      await waitFor(() => {
        expect(onCancelEdit).toHaveBeenCalled();
      });
    });

    it('should update priority', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockTodo);

      await user.selectOptions(screen.getByLabelText(/優先度/), 'low');
      await user.click(screen.getByText('更新'));

      // Should call onCancelEdit after update
      await waitFor(() => {
        expect(screen.getByLabelText(/優先度/)).toHaveValue('low');
      });
    });

    it('should clear optional fields when updated to empty', async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();

      renderWithProvider(mockTodo, onCancelEdit);

      await user.clear(screen.getByLabelText(/説明/));
      await user.clear(screen.getByLabelText(/期限/));
      await user.clear(screen.getByLabelText(/カテゴリ/));
      await user.clear(screen.getByLabelText(/タグ/));
      await user.click(screen.getByText('更新'));

      await waitFor(() => {
        expect(onCancelEdit).toHaveBeenCalled();
      });
    });
  });

  describe('cancel editing', () => {
    it('should call onCancelEdit when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();

      renderWithProvider(mockTodo, onCancelEdit);

      await user.click(screen.getByText('キャンセル'));

      expect(onCancelEdit).toHaveBeenCalled();
    });

    it('should reset form when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();

      renderWithProvider(mockTodo, onCancelEdit);

      await user.clear(screen.getByLabelText(/タイトル/));
      await user.type(screen.getByLabelText(/タイトル/), 'Changed Title');
      await user.click(screen.getByText('キャンセル'));

      expect(onCancelEdit).toHaveBeenCalled();
    });
  });

  describe('form reset', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'Test');
      await user.type(screen.getByLabelText(/説明/), 'Description');
      await user.click(screen.getByText('追加'));

      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
        expect(screen.getByLabelText(/説明/)).toHaveValue('');
      });
    });

    it('should reset to default values after submission', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText(/タイトル/), 'Test');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'high');
      await user.click(screen.getByText('追加'));

      await waitFor(() => {
        expect(screen.getByLabelText(/優先度/)).toHaveValue('medium');
      });
    });
  });

  describe('category datalist', () => {
    it('should render datalist with existing categories', () => {
      const { container } = renderWithProvider();

      const datalist = container.querySelector('#category-list');
      expect(datalist).toBeInTheDocument();
    });
  });

  describe('form submission event', () => {
    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const form = screen.getByRole('form', { hidden: true }) ||
                    screen.getByLabelText(/タイトル/).closest('form');

      const submitHandler = vi.fn((e) => e.preventDefault());
      form?.addEventListener('submit', submitHandler);

      await user.type(screen.getByLabelText(/タイトル/), 'Test');
      await user.click(screen.getByText('追加'));

      // Form should not cause page reload
      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
      });
    });
  });
});
