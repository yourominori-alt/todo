import { useState } from 'react';
import type { FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTodoContext } from '../../context/TodoContext';
import styles from './CategoryManager.module.css';

export const CategoryManager = () => {
  const { state, addCategory, deleteCategory } = useTodoContext();
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3b82f6');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert('カテゴリ名を入力してください');
      return;
    }

    const existingCategory = state.categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.trim().toLowerCase()
    );

    if (existingCategory) {
      alert('同じ名前のカテゴリが既に存在します');
      return;
    }

    addCategory({
      id: uuidv4(),
      name: categoryName.trim(),
      color: categoryColor,
    });

    setCategoryName('');
    setCategoryColor('#3b82f6');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`カテゴリ「${name}」を削除しますか？`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className={styles.categoryManager}>
      <h2>カテゴリ管理</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="カテゴリ名"
            className={styles.input}
          />
          <input
            type="color"
            value={categoryColor}
            onChange={(e) => setCategoryColor(e.target.value)}
            className={styles.colorPicker}
          />
          <button type="submit" className={styles.addBtn}>
            追加
          </button>
        </div>
      </form>

      {state.categories.length > 0 ? (
        <div className={styles.categoryList}>
          {state.categories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div
                  className={styles.colorBox}
                  style={{ backgroundColor: category.color }}
                />
                <span className={styles.categoryName}>{category.name}</span>
              </div>
              <button
                onClick={() => handleDelete(category.id, category.name)}
                className={styles.deleteBtn}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>カテゴリがありません</p>
      )}
    </div>
  );
};
