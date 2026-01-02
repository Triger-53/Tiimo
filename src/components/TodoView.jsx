import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaTrash } from 'react-icons/fa';

const TodoView = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
    const [newTodo, setNewTodo] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        onAddTodo(newTodo);
        setNewTodo('');
    };

    return (
        <div style={{ padding: '0 40px 100px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>To-do List</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnimatePresence>
                    {todos.map(todo => (
                        <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            layout
                            style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                textDecoration: todo.done ? 'line-through' : 'none',
                                opacity: todo.done ? 0.6 : 1,
                                border: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                onClick={() => onToggleTodo(todo.id)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--primary)',
                                    background: todo.done ? 'var(--primary)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {todo.done && <FaCheck size={12} color="white" />}
                            </div>

                            <span style={{ fontSize: '16px', fontWeight: '500', flex: 1 }}>{todo.title}</span>

                            <button
                                onClick={() => onDeleteTodo(todo.id)}
                                style={{ color: '#ff6b6b', opacity: 0.6, padding: '8px' }}
                            >
                                <FaTrash />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    <div style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        borderRadius: '16px',
                        border: '2px dashed #ccc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <FaPlus color="#888" />
                        <input
                            type="text"
                            placeholder="Add new to-do..."
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                flex: 1,
                                padding: '8px 0',
                                fontSize: '16px',
                                fontWeight: '500',
                                outline: 'none',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TodoView;
