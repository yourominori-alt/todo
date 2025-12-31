export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type SortBy = 'dueDate' | 'priority' | 'createdAt';

export interface TodoFilter {
  searchText: string;
  category?: string;
  priority?: Priority;
  showCompleted: boolean;
  sortBy: SortBy;
}

export interface TodoState {
  todos: Todo[];
  categories: Category[];
  filter: TodoFilter;
}
