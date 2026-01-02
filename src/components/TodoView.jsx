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
            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
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
                padding: '12px 16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                border: '1px solid rgba(255,255,255,0.03)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '12px',
                background: todo.done ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0
            }}>
                {todo.icon || '📌'}
            </div>

            <span style={{
                fontSize: '15px',
                fontWeight: '500',
                flex: 1,
                color: todo.done ? 'var(--text-muted)' : 'var(--text-main)',
                textDecoration: todo.done ? 'line-through' : 'none'
            }}>
                {todo.title}
            </span>

            <div
                onClick={(e) => { e.stopPropagation(); onToggleTodo(todo.id); }}
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: todo.done ? 'none' : '2px solid rgba(255,255,255,0.2)',
                    background: todo.done ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                }}
            >
                {todo.done && <FaCheck size={10} color="white" />}
            </div>
        </motion.div>
    );

    return (
        <div style={{ padding: '0 20px 100px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        No todos yet. Add one below!
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <FaPlus color="var(--text-muted)" size={14} />
                    <input
                        type="text"
                        placeholder="Add new task..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            flex: 1,
                            fontSize: '15px',
                            fontWeight: '500',
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
