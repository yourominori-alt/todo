import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('App', () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    global.scrollTo = scrollToMock;
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
    scrollToMock.mockClear();
  });

  describe('rendering', () => {
    it('should render app header', () => {
      render(<App />);
      expect(screen.getByText('TODO App')).toBeInTheDocument();
    });

    it('should render TodoForm component', () => {
      render(<App />);
      expect(screen.getByText('新規TODO')).toBeInTheDocument();
    });

    it('should render CategoryManager component', () => {
      render(<App />);
      expect(screen.getByText('カテゴリ管理')).toBeInTheDocument();
    });

    it('should render TodoFilter component', () => {
      render(<App />);
      expect(screen.getByText('フィルタ・検索')).toBeInTheDocument();
    });

    it('should render TodoList component', () => {
      render(<App />);
      // TodoList shows empty state when no todos
      expect(screen.getByText('TODOがありません。新しいTODOを追加してください。')).toBeInTheDocument();
    });

    it('should wrap components with TodoProvider', () => {
      render(<App />);
      // If TodoProvider is working, all components should render without errors
      expect(screen.getByText('TODO App')).toBeInTheDocument();
      expect(screen.getByText('新規TODO')).toBeInTheDocument();
    });
  });

  describe('todo editing workflow', () => {
    it('should switch to edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a todo first
      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.click(screen.getByText('追加'));

      // Click edit button
      const editButton = screen.getByText('編集');
      await user.click(editButton);

      // Form should show "TODO編集"
      expect(screen.getByText('TODO編集')).toBeInTheDocument();
    });

    it('should populate form with todo data when editing', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a todo
      await user.type(screen.getByLabelText(/タイトル/), 'Original Todo');
      await user.type(screen.getByLabelText(/説明/), 'Original Description');
      await user.click(screen.getByText('追加'));

      // Click edit
      await user.click(screen.getByText('編集'));

      // Form should be populated
      expect(screen.getByDisplayValue('Original Todo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
    });

    it('should scroll to top when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a todo
      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.click(screen.getByText('追加'));

      // Click edit
      await user.click(screen.getByText('編集'));

      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should exit edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a todo
      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.click(screen.getByText('追加'));

      // Enter edit mode
      await user.click(screen.getByText('編集'));
      expect(screen.getByText('TODO編集')).toBeInTheDocument();

      // Cancel edit
      await user.click(screen.getByText('キャンセル'));

      // Should return to add mode
      expect(screen.getByText('新規TODO')).toBeInTheDocument();
    });

    it('should exit edit mode after successful update', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a todo
      await user.type(screen.getByLabelText(/タイトル/), 'Original Todo');
      await user.click(screen.getByText('追加'));

      // Enter edit mode
      await user.click(screen.getByText('編集'));

      // Update todo
      await user.clear(screen.getByDisplayValue('Original Todo'));
      await user.type(screen.getByLabelText(/タイトル/), 'Updated Todo');
      await user.click(screen.getByText('更新'));

      // Should return to add mode
      expect(screen.getByText('新規TODO')).toBeInTheDocument();
    });
  });

  describe('integration tests', () => {
    it('should allow adding, editing, and deleting todos', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add todo
      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.click(screen.getByText('追加'));
      expect(screen.getByText('Test Todo')).toBeInTheDocument();

      // Edit todo
      await user.click(screen.getByText('編集'));
      await user.clear(screen.getByDisplayValue('Test Todo'));
      await user.type(screen.getByLabelText(/タイトル/), 'Updated Todo');
      await user.click(screen.getByText('更新'));
      expect(screen.getByText('Updated Todo')).toBeInTheDocument();

      // Delete todo
      await user.click(screen.getByText('削除'));
      expect(screen.queryByText('Updated Todo')).not.toBeInTheDocument();
    });

    it('should allow filtering todos by search', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add multiple todos
      await user.type(screen.getByLabelText(/タイトル/), 'First Todo');
      await user.click(screen.getByText('追加'));

      await user.type(screen.getByLabelText(/タイトル/), 'Second Todo');
      await user.click(screen.getByText('追加'));

      // Filter by search
      await user.type(screen.getByPlaceholderText('タイトルや説明で検索'), 'First');

      expect(screen.getByText('First Todo')).toBeInTheDocument();
      expect(screen.queryByText('Second Todo')).not.toBeInTheDocument();
    });

    it('should allow adding and using categories', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add category
      const categoryInput = screen.getByPlaceholderText('カテゴリ名');
      await user.type(categoryInput, 'Work');
      const addCategoryButton = screen.getAllByText('追加')[1]; // Second "追加" button (for categories)
      await user.click(addCategoryButton);

      // Add todo with category
      await user.type(screen.getByLabelText(/タイトル/), 'Work Todo');
      await user.type(screen.getByLabelText(/カテゴリ/), 'Work');
      await user.click(screen.getAllByText('追加')[0]); // First "追加" button (for todos)

      expect(screen.getAllByText('Work').length).toBeGreaterThan(0);
    });

    it('should toggle todo completion status', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add todo
      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.click(screen.getByText('追加'));

      // Toggle completion
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should hide completed todos when filter is applied', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add todo
      await user.type(screen.getByLabelText(/タイトル/), 'Test Todo');
      await user.click(screen.getByText('追加'));

      // Complete todo
      await user.click(screen.getByRole('checkbox'));

      // Hide completed
      await user.click(screen.getByLabelText(/完了済みを表示/));

      expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
    });

    it('should sort todos by priority', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add low priority todo
      await user.type(screen.getByLabelText(/タイトル/), 'Low Priority');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'low');
      await user.click(screen.getByText('追加'));

      // Add high priority todo
      await user.type(screen.getByLabelText(/タイトル/), 'High Priority');
      await user.selectOptions(screen.getByLabelText(/優先度/), 'high');
      await user.click(screen.getByText('追加'));

      // Sort by priority
      await user.selectOptions(screen.getByLabelText(/並び替え/), 'priority');

      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      expect(titles[0]).toBe('High Priority');
      expect(titles[1]).toBe('Low Priority');
    });
  });

  describe('persistence', () => {
    it('should save todos to localStorage', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.type(screen.getByLabelText(/タイトル/), 'Persistent Todo');
      await user.click(screen.getByText('追加'));

      // Check if localStorage was called (via the context)
      const saved = localStorage.getItem('todo-app-state');
      expect(saved).toBeTruthy();
    });
  });
});
