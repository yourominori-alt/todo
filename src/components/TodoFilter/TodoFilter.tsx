import { useTodoContext } from '../../context/TodoContext';
import type { Priority, SortBy } from '../../types/todo';
import styles from './TodoFilter.module.css';

export const TodoFilter = () => {
  const { state, setFilter } = useTodoContext();

  const handleSearchChange = (value: string) => {
    setFilter({ searchText: value });
  };

  const handleCategoryChange = (value: string) => {
    setFilter({ category: value || undefined });
  };

  const handlePriorityChange = (value: string) => {
    setFilter({ priority: (value as Priority) || undefined });
  };

  const handleShowCompletedChange = (checked: boolean) => {
    setFilter({ showCompleted: checked });
  };

  const handleSortByChange = (value: string) => {
    setFilter({ sortBy: value as SortBy });
  };

  const clearFilters = () => {
    setFilter({
      searchText: '',
      category: undefined,
      priority: undefined,
      showCompleted: true,
      sortBy: 'createdAt',
    });
  };

  return (
    <div className={styles.todoFilter}>
      <h2>フィルタ・検索</h2>

      <div className={styles.filterGrid}>
        <div className={styles.filterGroup}>
          <label htmlFor="search">検索</label>
          <input
            type="text"
            id="search"
            value={state.filter.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="タイトルや説明で検索"
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="category">カテゴリ</label>
          <select
            id="category"
            value={state.filter.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={styles.select}
          >
            <option value="">すべて</option>
            {state.categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="priority">優先度</label>
          <select
            id="priority"
            value={state.filter.priority || ''}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className={styles.select}
          >
            <option value="">すべて</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="sortBy">並び替え</label>
          <select
            id="sortBy"
            value={state.filter.sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            className={styles.select}
          >
            <option value="createdAt">作成日</option>
            <option value="dueDate">期限</option>
            <option value="priority">優先度</option>
          </select>
        </div>
      </div>

      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={state.filter.showCompleted}
            onChange={(e) => handleShowCompletedChange(e.target.checked)}
            className={styles.checkbox}
          />
          完了済みを表示
        </label>
      </div>

      <button onClick={clearFilters} className={styles.clearBtn}>
        フィルタをクリア
      </button>
    </div>
  );
};
