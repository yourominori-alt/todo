import type { Todo } from '../../types/todo';
import { useTodoContext } from '../../context/TodoContext';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
}

export const TodoItem = ({ todo, onEdit }: TodoItemProps) => {
  const { toggleTodo, deleteTodo } = useTodoContext();

  const handleToggle = () => {
    toggleTodo(todo.id);
  };

  const handleDelete = () => {
    if (window.confirm('このTODOを削除しますか？')) {
      deleteTodo(todo.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(todo);
    }
  };

  const getPriorityLabel = () => {
    const labels = { high: '高', medium: '中', low: '低' };
    return labels[todo.priority];
  };

  const getDueDateStatus = () => {
    if (!todo.dueDate) return null;

    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', label: '期限切れ' };
    } else if (diffDays === 0) {
      return { status: 'today', label: '今日まで' };
    } else if (diffDays === 1) {
      return { status: 'soon', label: '明日まで' };
    } else if (diffDays <= 3) {
      return { status: 'soon', label: `${diffDays}日後` };
    }
    return { status: 'normal', label: dueDate.toLocaleDateString('ja-JP') };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div className={`${styles.todoItem} ${todo.completed ? styles.completed : ''} ${styles[`priority-${todo.priority}`]}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className={styles.checkbox}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{todo.title}</h3>
          <span className={`${styles.priority} ${styles[`priority-${todo.priority}`]}`}>
            {getPriorityLabel()}
          </span>
        </div>
        {todo.description && <p className={styles.description}>{todo.description}</p>}
        {dueDateStatus && (
          <div className={`${styles.dueDate} ${styles[`dueDate-${dueDateStatus.status}`]}`}>
            期限: {dueDateStatus.label}
          </div>
        )}
        <div className={styles.metadata}>
          {todo.category && <span className={styles.category}>{todo.category}</span>}
          {todo.tags.length > 0 && (
            <div className={styles.tags}>
              {todo.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleEdit} className={styles.editBtn}>
          編集
        </button>
        <button onClick={handleDelete} className={styles.deleteBtn}>
          削除
        </button>
      </div>
    </div>
  );
};
