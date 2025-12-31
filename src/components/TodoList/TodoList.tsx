import { useMemo } from 'react';
import { useTodoContext } from '../../context/TodoContext';
import { TodoItem } from '../TodoItem/TodoItem';
import type { Todo } from '../../types/todo';
import styles from './TodoList.module.css';

interface TodoListProps {
  onEditTodo: (todo: Todo) => void;
}

export const TodoList = ({ onEditTodo }: TodoListProps) => {
  const { state } = useTodoContext();

  const filteredAndSortedTodos = useMemo(() => {
    let filtered = state.todos;

    if (state.filter.searchText) {
      const searchLower = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          todo.description?.toLowerCase().includes(searchLower)
      );
    }

    if (state.filter.category) {
      filtered = filtered.filter((todo) => todo.category === state.filter.category);
    }

    if (state.filter.priority) {
      filtered = filtered.filter((todo) => todo.priority === state.filter.priority);
    }

    if (!state.filter.showCompleted) {
      filtered = filtered.filter((todo) => !todo.completed);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (state.filter.sortBy) {
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [state.todos, state.filter]);

  if (filteredAndSortedTodos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>TODOがありません。新しいTODOを追加してください。</p>
      </div>
    );
  }

  return (
    <div className={styles.todoList}>
      {filteredAndSortedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onEdit={onEditTodo} />
      ))}
    </div>
  );
};
