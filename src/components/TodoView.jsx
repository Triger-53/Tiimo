import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TodoView = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
    const [newTodo, setNewTodo] = useState('');
    const [todoExpanded, setTodoExpanded] = useState(true);
    const [completedExpanded, setCompletedExpanded] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        onAddTodo(newTodo);
        setNewTodo('');
    };

    const todoItems = todos.filter(t => !t.done);
    const completedItems = todos.filter(t => t.done);

    const SectionHeader = ({ title, count, expanded, onToggle }) => (
        <div
            onClick={onToggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 4px 8px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}
        >
            <span style={{ fontSize: '10px', background: 'transparent', padding: '2px 0', opacity: 0.6 }}>
                {title} ({count})
            </span>
            {expanded ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
        </div>
    );

    const TodoCard = ({ todo }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                background: 'var(--surface-color)',
                padding: '16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
            }}
        >
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: todo.done ? 'var(--surface-hover)' : 'var(--bg-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)'
            }}>
                {todo.icon || '📌'}
            </div>

            <span style={{
                fontSize: '16px',
                fontWeight: '600',
                flex: 1,
                color: todo.done ? 'var(--text-muted)' : 'var(--text-main)',
                textDecoration: todo.done ? 'line-through' : 'none'
            }}>
                {todo.title}
            </span>

            <div
                onClick={(e) => { e.stopPropagation(); onToggleTodo(todo.id); }}
                style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: todo.done ? 'none' : '2px solid var(--border-color)',
                    background: todo.done ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                }}
            >
                {todo.done && <FaCheck size={14} color="white" />}
            </div>
        </motion.div>
    );

    return (
        <div style={{ padding: '0 24px 120px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
                <SectionHeader
                    title="To-do"
                    count={todoItems.length}
                    expanded={todoExpanded}
                    onToggle={() => setTodoExpanded(!todoExpanded)}
                />
                <AnimatePresence>
                    {todoExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            {todoItems.map(todo => <TodoCard key={todo.id} todo={todo} />)}
                        </motion.div>
                    )}
                </AnimatePresence>

                <SectionHeader
                    title="Completed"
                    count={completedItems.length}
                    expanded={completedExpanded}
                    onToggle={() => setCompletedExpanded(!completedExpanded)}
                />
                <AnimatePresence>
                    {completedExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            {completedItems.map(todo => <TodoCard key={todo.id} todo={todo} />)}
                        </motion.div>
                    )}
                </AnimatePresence>

                {todos.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        No todos yet. Add one below!
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '20px', position: 'sticky', bottom: '20px' }}>
                <div style={{
                    padding: '16px 20px',
                    borderRadius: '24px',
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--bg-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaPlus size={12} color="var(--primary)" />
                    </div>
                    <input
                        type="text"
                        placeholder="Add new task..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            flex: 1,
                            fontSize: '16px',
                            fontWeight: '600',
                            outline: 'none',
                            color: 'var(--text-main)'
                        }}
                    />
                </div>
            </form>
        </div>
    );
};

export default TodoView;
