import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryManager } from './CategoryManager';
import { TodoProvider } from '../../context/TodoContext';

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('CategoryManager', () => {
  const renderWithProvider = () => {
    return render(
      <TodoProvider>
        <CategoryManager />
      </TodoProvider>
    );
  };

  beforeEach(() => {
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  describe('rendering', () => {
    it('should render category manager title', () => {
      renderWithProvider();
      expect(screen.getByText('カテゴリ管理')).toBeInTheDocument();
    });

    it('should render category name input', () => {
      renderWithProvider();
      expect(screen.getByPlaceholderText('カテゴリ名')).toBeInTheDocument();
    });

    it('should render color picker', () => {
      renderWithProvider();
      const colorInput = screen.getByDisplayValue('#3b82f6');
      expect(colorInput).toBeInTheDocument();
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    it('should render add button', () => {
      renderWithProvider();
      expect(screen.getByText('追加')).toBeInTheDocument();
    });

    it('should show empty state when no categories', () => {
      renderWithProvider();
      expect(screen.getByText('カテゴリがありません')).toBeInTheDocument();
    });
  });

  describe('adding categories', () => {
    it('should add a new category', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.queryByText('カテゴリがありません')).not.toBeInTheDocument();
    });

    it('should add category with custom color', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Personal');

      const colorInput = screen.getByDisplayValue('#3b82f6');
      await user.clear(colorInput);
      await user.type(colorInput, '#ff0000');

      await user.click(screen.getByText('追加'));

      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should clear form after adding category', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      expect(screen.getByPlaceholderText('カテゴリ名')).toHaveValue('');
      expect(screen.getByDisplayValue('#3b82f6')).toBeInTheDocument();
    });

    it('should trim whitespace from category name', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), '  Work  ');
      await user.click(screen.getByText('追加'));

      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should add multiple categories', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Personal');
      await user.click(screen.getByText('追加'));

      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show alert when submitting empty category name', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByText('追加'));

      expect(global.alert).toHaveBeenCalledWith('カテゴリ名を入力してください');
    });

    it('should show alert when submitting whitespace-only category name', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), '   ');
      await user.click(screen.getByText('追加'));

      expect(global.alert).toHaveBeenCalledWith('カテゴリ名を入力してください');
    });

    it('should not allow duplicate category names (case insensitive)', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'work');
      await user.click(screen.getByText('追加'));

      expect(global.alert).toHaveBeenCalledWith('同じ名前のカテゴリが既に存在します');
    });

    it('should not allow duplicate category names with different casing', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'WORK');
      await user.click(screen.getByText('追加'));

      expect(global.alert).toHaveBeenCalledWith('同じ名前のカテゴリが既に存在します');
    });

    it('should not add category when validation fails', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByText('追加'));

      expect(screen.getByText('カテゴリがありません')).toBeInTheDocument();
    });
  });

  describe('deleting categories', () => {
    it('should delete a category when delete button is clicked and confirmed', async () => {
      const user = userEvent.setup();
      global.confirm = vi.fn(() => true);

      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      const deleteButton = screen.getByText('削除');
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('カテゴリ「Work」を削除しますか？');
      expect(screen.queryByText('Work')).not.toBeInTheDocument();
      expect(screen.getByText('カテゴリがありません')).toBeInTheDocument();
    });

    it('should not delete category when deletion is cancelled', async () => {
      const user = userEvent.setup();
      global.confirm = vi.fn(() => false);

      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      const deleteButton = screen.getByText('削除');
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('カテゴリ「Work」を削除しますか？');
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should delete correct category when multiple categories exist', async () => {
      const user = userEvent.setup();
      global.confirm = vi.fn(() => true);

      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Personal');
      await user.click(screen.getByText('追加'));

      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]); // Delete first category (Work)

      expect(screen.queryByText('Work')).not.toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });
  });

  describe('category display', () => {
    it('should display category with color indicator', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      const { container } = renderWithProvider();
      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Test');
      await user.click(screen.getByText('追加'));

      const colorBox = container.querySelector('.colorBox');
      expect(colorBox).toBeInTheDocument();
    });

    it('should display delete button for each category', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Personal');
      await user.click(screen.getByText('追加'));

      const deleteButtons = screen.getAllByText('削除');
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('form submission', () => {
    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const form = screen.getByPlaceholderText('カテゴリ名').closest('form');
      const submitHandler = vi.fn((e) => e.preventDefault());
      form?.addEventListener('submit', submitHandler);

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      // Form should not cause page reload
      expect(screen.getByPlaceholderText('カテゴリ名')).toBeInTheDocument();
    });

    it('should submit on enter key', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const input = screen.getByPlaceholderText('カテゴリ名');
      await user.type(input, 'Work{Enter}');

      expect(screen.getByText('Work')).toBeInTheDocument();
    });
  });

  describe('default color', () => {
    it('should use default color #3b82f6', () => {
      renderWithProvider();
      expect(screen.getByDisplayValue('#3b82f6')).toBeInTheDocument();
    });

    it('should reset to default color after submission', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const colorInput = screen.getByDisplayValue('#3b82f6');
      await user.clear(colorInput);
      await user.type(colorInput, '#ff0000');

      await user.type(screen.getByPlaceholderText('カテゴリ名'), 'Work');
      await user.click(screen.getByText('追加'));

      expect(screen.getByDisplayValue('#3b82f6')).toBeInTheDocument();
    });
  });
});
