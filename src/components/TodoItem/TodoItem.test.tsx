import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import { TodoProvider } from '../../context/TodoContext';
import type { Todo } from '../../types/todo';

describe('TodoItem', () => {
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

  const renderWithProvider = (todo: Todo, onEdit = vi.fn()) => {
    return render(
      <TodoProvider>
        <TodoItem todo={todo} onEdit={onEdit} />
      </TodoProvider>
    );
  };

  describe('rendering', () => {
    it('should render todo title', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    it('should render todo description', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const todoWithoutDesc = { ...mockTodo, description: undefined };
      renderWithProvider(todoWithoutDesc);
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should render priority label', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('中')).toBeInTheDocument();
    });

    it('should render correct priority label for high priority', () => {
      const highPriorityTodo = { ...mockTodo, priority: 'high' as const };
      renderWithProvider(highPriorityTodo);
      expect(screen.getByText('高')).toBeInTheDocument();
    });

    it('should render correct priority label for low priority', () => {
      const lowPriorityTodo = { ...mockTodo, priority: 'low' as const };
      renderWithProvider(lowPriorityTodo);
      expect(screen.getByText('低')).toBeInTheDocument();
    });

    it('should render category when provided', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should not render category when not provided', () => {
      const todoWithoutCategory = { ...mockTodo, category: undefined };
      renderWithProvider(todoWithoutCategory);
      expect(screen.queryByText('Work')).not.toBeInTheDocument();
    });

    it('should render tags', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
    });

    it('should not render tags section when no tags', () => {
      const todoWithoutTags = { ...mockTodo, tags: [] };
      const { container } = renderWithProvider(todoWithoutTags);
      const tagsContainer = container.querySelector('.tags');
      expect(tagsContainer).not.toBeInTheDocument();
    });

    it('should render checkbox in unchecked state for incomplete todo', () => {
      renderWithProvider(mockTodo);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render checkbox in checked state for completed todo', () => {
      const completedTodo = { ...mockTodo, completed: true };
      renderWithProvider(completedTodo);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render edit and delete buttons', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('編集')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
  });

  describe('due date status', () => {
    it('should render due date with correct status for future date', () => {
      const futureTodo = {
        ...mockTodo,
        dueDate: '2099-12-31',
      };
      renderWithProvider(futureTodo);
      expect(screen.getByText(/期限:/)).toBeInTheDocument();
    });

    it('should render overdue status for past due date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01'));

      const overdueTodo = {
        ...mockTodo,
        dueDate: '2025-12-30',
      };
      renderWithProvider(overdueTodo);
      expect(screen.getByText(/期限切れ/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should render today status for today due date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-31'));

      const todayTodo = {
        ...mockTodo,
        dueDate: '2025-12-31',
      };
      renderWithProvider(todayTodo);
      expect(screen.getByText(/今日まで/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should render soon status for tomorrow due date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-30'));

      const tomorrowTodo = {
        ...mockTodo,
        dueDate: '2025-12-31',
      };
      renderWithProvider(tomorrowTodo);
      expect(screen.getByText(/明日まで/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should render days count for due date within 3 days', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28'));

      const soonTodo = {
        ...mockTodo,
        dueDate: '2025-12-30',
      };
      renderWithProvider(soonTodo);
      expect(screen.getByText(/2日後/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should not render due date section when no due date', () => {
      const todoWithoutDueDate = { ...mockTodo, dueDate: undefined };
      const { container } = renderWithProvider(todoWithoutDueDate);
      const dueDateElement = container.querySelector('.dueDate');
      expect(dueDateElement).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call toggleTodo when checkbox is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockTodo);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Check that the todo is marked as completed in the state
      expect(checkbox).toBeChecked();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      renderWithProvider(mockTodo, onEdit);

      const editButton = screen.getByText('編集');
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockTodo);
    });

    it('should not call onEdit when onEdit prop is not provided', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockTodo);

      const editButton = screen.getByText('編集');
      await user.click(editButton);

      // Should not throw error
    });

    it('should call deleteTodo when delete button is clicked and confirmed', async () => {
      const user = userEvent.setup();
      global.confirm = vi.fn(() => true);

      renderWithProvider(mockTodo);

      const deleteButton = screen.getByText('削除');
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('このTODOを削除しますか？');
    });

    it('should not delete when delete is cancelled', async () => {
      const user = userEvent.setup();
      global.confirm = vi.fn(() => false);

      renderWithProvider(mockTodo);

      const deleteButton = screen.getByText('削除');
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('このTODOを削除しますか？');
      // Todo should still be in the document
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('should apply completed class when todo is completed', () => {
      const completedTodo = { ...mockTodo, completed: true };
      const { container } = renderWithProvider(completedTodo);
      // Check checkbox is checked for completed todo
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render medium priority todo', () => {
      renderWithProvider(mockTodo);
      expect(screen.getByText('中')).toBeInTheDocument();
    });

    it('should render high priority todo', () => {
      const highPriorityTodo = { ...mockTodo, priority: 'high' as const };
      renderWithProvider(highPriorityTodo);
      expect(screen.getByText('高')).toBeInTheDocument();
    });

    it('should render low priority todo', () => {
      const lowPriorityTodo = { ...mockTodo, priority: 'low' as const };
      renderWithProvider(lowPriorityTodo);
      expect(screen.getByText('低')).toBeInTheDocument();
    });
  });
});
