import { useState } from 'react';
import { TodoProvider } from './context/TodoContext';
import { TodoForm } from './components/TodoForm/TodoForm';
import { TodoList } from './components/TodoList/TodoList';
import { TodoFilter } from './components/TodoFilter/TodoFilter';
import { CategoryManager } from './components/CategoryManager/CategoryManager';
import type { Todo } from './types/todo';
import './App.css';

function AppContent() {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TODO App</h1>
      </header>
      <main className="app-main">
        <TodoForm editingTodo={editingTodo} onCancelEdit={handleCancelEdit} />
        <CategoryManager />
        <TodoFilter />
        <TodoList onEditTodo={handleEditTodo} />
      </main>
    </div>
  );
}

function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;
