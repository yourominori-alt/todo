import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTodoContext } from '../../context/TodoContext';
import type { Todo, Priority } from '../../types/todo';
import styles from './TodoForm.module.css';

interface TodoFormProps {
  editingTodo?: Todo | null;
  onCancelEdit?: () => void;
}

export const TodoForm = ({ editingTodo, onCancelEdit }: TodoFormProps) => {
  const { addTodo, updateTodo, state } = useTodoContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority);
      setDueDate(editingTodo.dueDate || '');
      setCategory(editingTodo.category || '');
      setTags(editingTodo.tags.join(', '));
    } else {
      resetForm();
    }
  }, [editingTodo]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setCategory('');
    setTags('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (editingTodo) {
      updateTodo(editingTodo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        category: category || undefined,
        tags: tagArray,
      });
      if (onCancelEdit) {
        onCancelEdit();
      }
    } else {
      const newTodo: Todo = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        dueDate: dueDate || undefined,
        category: category || undefined,
        tags: tagArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTodo(newTodo);
    }

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.todoForm}>
      <h2>{editingTodo ? 'TODO編集' : '新規TODO'}</h2>

      <div className={styles.formGroup}>
        <label htmlFor="title">タイトル *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="TODOのタイトル"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細な説明（任意）"
          rows={3}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="priority">優先度</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dueDate">期限</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">カテゴリ</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="カテゴリ名"
          list="category-list"
        />
        <datalist id="category-list">
          {state.categories.map((cat) => (
            <option key={cat.id} value={cat.name} />
          ))}
        </datalist>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tags">タグ（カンマ区切り）</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="タグ1, タグ2, タグ3"
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitBtn}>
          {editingTodo ? '更新' : '追加'}
        </button>
        {editingTodo && (
          <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};
