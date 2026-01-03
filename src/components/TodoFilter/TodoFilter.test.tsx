import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { TodoFilter } from './TodoFilter';
import { TodoProvider, useTodoContext } from '../../context/TodoContext';

describe('TodoFilter', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TodoProvider>{children}</TodoProvider>
  );

  const renderWithProvider = () => {
    return render(
      <TodoProvider>
        <TodoFilter />
      </TodoProvider>
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render filter title', () => {
      renderWithProvider();
      expect(screen.getByText('フィルタ・検索')).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderWithProvider();
      expect(screen.getByLabelText(/検索/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('タイトルや説明で検索')).toBeInTheDocument();
    });

    it('should render category select', () => {
      renderWithProvider();
      expect(screen.getByLabelText(/カテゴリ/)).toBeInTheDocument();
    });

    it('should render priority select', () => {
      renderWithProvider();
      expect(screen.getByLabelText(/優先度/)).toBeInTheDocument();
    });

    it('should render sort by select', () => {
      renderWithProvider();
      expect(screen.getByLabelText(/並び替え/)).toBeInTheDocument();
    });

    it('should render show completed checkbox', () => {
      renderWithProvider();
      expect(screen.getByLabelText(/完了済みを表示/)).toBeInTheDocument();
    });

    it('should render clear filters button', () => {
      renderWithProvider();
      expect(screen.getByText('フィルタをクリア')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should update search text when typing', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const searchInput = screen.getByLabelText(/検索/);
      await user.type(searchInput, 'test query');

      expect(searchInput).toHaveValue('test query');
    });

    it('should persist search text value', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const searchInput = screen.getByLabelText(/検索/);
      await user.type(searchInput, 'persistent');

      expect(searchInput).toHaveValue('persistent');
    });

    it('should clear search text when filter is cleared', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const searchInput = screen.getByLabelText(/検索/);
      await user.type(searchInput, 'test');
      await user.click(screen.getByText('フィルタをクリア'));

      expect(searchInput).toHaveValue('');
    });
  });

  describe('category filter', () => {
    it('should show "すべて" as default option', () => {
      renderWithProvider();
      const categorySelect = screen.getByLabelText(/カテゴリ/);
      expect(categorySelect).toHaveValue('');
    });

    it('should update category filter when selected', async () => {
      const user = userEvent.setup();

      // First add a category
      const { result } = renderHook(() => useTodoContext(), { wrapper });
      act(() => {
        result.current.addCategory({ id: 'cat1', name: 'Work', color: '#ff0000' });
      });

      renderWithProvider();

      const categorySelect = screen.getByLabelText(/カテゴリ/);
      await user.selectOptions(categorySelect, 'Work');

      expect(categorySelect).toHaveValue('Work');
    });

    it('should display categories from state', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      act(() => {
        result.current.addCategory({ id: 'cat1', name: 'Work', color: '#ff0000' });
        result.current.addCategory({ id: 'cat2', name: 'Personal', color: '#00ff00' });
      });

      renderWithProvider();

      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should clear category filter when filters are cleared', async () => {
      const user = userEvent.setup();

      const { result } = renderHook(() => useTodoContext(), { wrapper });
      act(() => {
        result.current.addCategory({ id: 'cat1', name: 'Work', color: '#ff0000' });
      });

      renderWithProvider();

      const categorySelect = screen.getByLabelText(/カテゴリ/);
      await user.selectOptions(categorySelect, 'Work');
      await user.click(screen.getByText('フィルタをクリア'));

      expect(categorySelect).toHaveValue('');
    });
  });

  describe('priority filter', () => {
    it('should show all priority options', () => {
      renderWithProvider();

      expect(screen.getByRole('option', { name: 'すべて' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '高' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '中' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '低' })).toBeInTheDocument();
    });

    it('should update priority filter when selected', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const prioritySelect = screen.getByLabelText(/優先度/);
      await user.selectOptions(prioritySelect, 'high');

      expect(prioritySelect).toHaveValue('high');
    });

    it('should clear priority filter when filters are cleared', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const prioritySelect = screen.getByLabelText(/優先度/);
      await user.selectOptions(prioritySelect, 'high');
      await user.click(screen.getByText('フィルタをクリア'));

      expect(prioritySelect).toHaveValue('');
    });
  });

  describe('sort by filter', () => {
    it('should show all sort options', () => {
      renderWithProvider();

      expect(screen.getByRole('option', { name: '作成日' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '期限' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '優先度' })).toBeInTheDocument();
    });

    it('should default to 作成日', () => {
      renderWithProvider();
      const sortBySelect = screen.getByLabelText(/並び替え/);
      expect(sortBySelect).toHaveValue('createdAt');
    });

    it('should update sort by when selected', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const sortBySelect = screen.getByLabelText(/並び替え/);
      await user.selectOptions(sortBySelect, 'priority');

      expect(sortBySelect).toHaveValue('priority');
    });

    it('should reset to createdAt when filters are cleared', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const sortBySelect = screen.getByLabelText(/並び替え/);
      await user.selectOptions(sortBySelect, 'priority');
      await user.click(screen.getByText('フィルタをクリア'));

      expect(sortBySelect).toHaveValue('createdAt');
    });
  });

  describe('show completed checkbox', () => {
    it('should be checked by default', () => {
      renderWithProvider();
      const checkbox = screen.getByLabelText(/完了済みを表示/);
      expect(checkbox).toBeChecked();
    });

    it('should toggle when clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const checkbox = screen.getByLabelText(/完了済みを表示/);
      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should reset to checked when filters are cleared', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const checkbox = screen.getByLabelText(/完了済みを表示/);
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(screen.getByText('フィルタをクリア'));

      expect(checkbox).toBeChecked();
    });
  });

  describe('clear filters functionality', () => {
    it('should reset all filters to default values', async () => {
      const user = userEvent.setup();

      const { result } = renderHook(() => useTodoContext(), { wrapper });
      act(() => {
        result.current.addCategory({ id: 'cat1', name: 'Work', color: '#ff0000' });
      });

      renderWithProvider();

      // Set all filters to non-default values
      await user.type(screen.getByLabelText(/検索/), 'test');
      await user.selectOptions(screen.getByLabelText(/カテゴリ/), 'Work');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'high');
      await user.selectOptions(screen.getByLabelText(/並び替え/), 'priority');
      await user.click(screen.getByLabelText(/完了済みを表示/));

      // Clear filters
      await user.click(screen.getByText('フィルタをクリア'));

      // Check all filters are reset
      expect(screen.getByLabelText(/検索/)).toHaveValue('');
      expect(screen.getByLabelText(/カテゴリ/)).toHaveValue('');
      expect(screen.getByLabelText(/優先度/)).toHaveValue('');
      expect(screen.getByLabelText(/並び替え/)).toHaveValue('createdAt');
      expect(screen.getByLabelText(/完了済みを表示/)).toBeChecked();
    });
  });

  describe('filter state integration', () => {
    it('should update context state when filters change', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      renderWithProvider();

      await user.type(screen.getByLabelText(/検索/), 'integration test');

      expect(result.current.state.filter.searchText).toBe('integration test');
    });

    it('should reflect state changes in UI', async () => {
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      renderWithProvider();

      act(() => {
        result.current.setFilter({ searchText: 'programmatic update' });
      });

      expect(screen.getByLabelText(/検索/)).toHaveValue('programmatic update');
    });

    it('should update multiple filters independently', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useTodoContext(), { wrapper });

      renderWithProvider();

      await user.type(screen.getByLabelText(/検索/), 'test');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'high');

      expect(result.current.state.filter.searchText).toBe('test');
      expect(result.current.state.filter.priority).toBe('high');
      expect(result.current.state.filter.sortBy).toBe('createdAt'); // unchanged
    });
  });
});
