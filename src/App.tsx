import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Search, X } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Filter = 'all' | 'active' | 'completed';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('editorial-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('active');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('editorial-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e?: FormEvent | KeyboardEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo(e);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  const filteredTodos = todos.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'active') return matchesSearch && !t.completed;
    if (filter === 'completed') return matchesSearch && t.completed;
    return matchesSearch;
  });

  const totalCount = todos.length;
  const activeCount = todos.filter(t => !t.completed).length;
  const progress = totalCount > 0 ? Math.round(((totalCount - activeCount) / totalCount) * 100) : 0;

  const currentDate = new Date();
  const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = currentDate.getDate();
  const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-text-primary selection:bg-brand/10 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="lg:w-[280px] lg:h-screen lg:fixed lg:left-0 lg:top-0 border-b lg:border-b-0 lg:border-r border-border p-8 lg:p-[60px_40px] flex flex-row lg:flex-col justify-between items-center lg:items-start z-20 bg-background/95 backdrop-blur-sm lg:bg-background">
        <div className="font-sans text-[10px] lg:text-[12px] uppercase tracking-[0.2em] font-bold leading-relaxed">
          {month} {day} <br />
          <span className="opacity-40">{weekday}</span>
        </div>
        <div className="vertical-text text-[80px] font-black tracking-[-4px] opacity-10 pointer-events-none hidden lg:block uppercase heading-editorial select-none">
          {filter}
        </div>
        <div className="lg:hidden text-[20px] font-black tracking-[-1px] opacity-20 heading-editorial uppercase">
          {filter}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px] p-6 sm:p-10 lg:p-[60px_80px] flex flex-col max-w-7xl mx-auto w-full">
        <header className="mb-12 lg:mb-20">
          <ul className="flex gap-4 sm:gap-6 mb-6">
            {(['all', 'active', 'completed'] as Filter[]).map((f) => (
              <li key={f}>
                <button
                  onClick={() => setFilter(f)}
                  className={`meta-label pb-1 border-b-2 transition-all cursor-pointer ${
                    filter === f ? 'opacity-100 border-brand' : 'opacity-40 border-transparent hover:opacity-60'
                  }`}
                >
                  {f}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-[64px] sm:text-[100px] lg:text-[140px] leading-[0.8] tracking-[-3px] lg:tracking-[-7px] heading-editorial">
              Tasks
            </h1>
            
            <div className="relative group max-w-xs w-full lg:mb-2">
              <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-secondary opacity-50" />
              <input
                type="text"
                placeholder="SEARCH ARCHIVE"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-border pl-5 py-2 text-[10px] uppercase font-bold tracking-[0.1em] focus:outline-none focus:border-brand transition-all placeholder:text-text-secondary/20"
              />
            </div>
          </div>
        </header>

        <section className="flex-1">
          <AnimatePresence mode="popLayout">
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="border-b-2 border-brand pb-8 mb-10 pt-2"
              >
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="WHAT NEEDS TO BE DONE?"
                  className="w-full bg-transparent text-2xl sm:text-3xl font-light tracking-tight focus:outline-none placeholder:text-text-secondary/10 placeholder:uppercase"
                />
                <div className="flex justify-between items-center mt-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Press Enter to Archive</span>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => { setIsAdding(false); setInputValue(''); }}
                      className="meta-label opacity-40 hover:opacity-100 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={() => addTodo()}
                      className="meta-label hover:text-brand transition-all font-bold"
                    >
                      Post Task
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="flex flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo, idx) => (
                  <motion.li
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`group border-b border-border py-5 sm:py-6 flex items-center transition-all active:bg-brand/5 ${
                      todo.completed ? 'opacity-40' : ''
                    }`}
                  >
                    <span className="task-number w-10 shrink-0 select-none">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-1 text-left min-w-0 py-1"
                    >
                      <h3 className={`text-xl sm:text-2xl tracking-[-0.5px] transition-all break-words leading-tight ${
                        todo.completed ? 'line-through' : ''
                      }`}>
                        {todo.text}
                      </h3>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-4 opacity-0 lg:group-hover:opacity-100 transition-all focus-within:opacity-100">
                      <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest opacity-30">
                        {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-3 sm:p-2 text-text-secondary/40 hover:text-red-600 transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.li>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary/30">
                    {searchQuery ? "No results in archive" : "End of tasks"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-10 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="stats meta-label text-text-secondary/60">
            {activeCount} OF {totalCount} TASKS REMAINING &nbsp; / &nbsp; {progress}% DAY PROGRESS
          </div>
          
          <div className="flex items-center gap-6">
            {todos.some(t => t.completed) && (
              <button
                onClick={clearCompleted}
                className="meta-label opacity-40 hover:opacity-100 transition-all border-b border-transparent hover:border-brand"
              >
                Clear Archive
              </button>
            )}
            
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl active:scale-95"
            >
              {isAdding ? <X size={24} /> : <Plus size={24} />}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
