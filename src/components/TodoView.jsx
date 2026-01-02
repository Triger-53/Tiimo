import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaChevronDown, FaTimes, FaCaretUp, FaCaretDown, FaCircle } from 'react-icons/fa';
import TaskCard from './TaskCard';

const TodoView = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onAddClick }) => {
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (id) => {
        setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const categories = [
        {
            id: 'high',
            title: 'HIGH',
            items: todos.filter(t => t.priority === 'high' && !t.done),
            color: '#FFEFEC',
            icon: <FaCaretUp color="#E57373" size={14} />,
            placeholder: 'Add high priority task'
        },
        {
            id: 'medium',
            title: 'MEDIUM',
            items: todos.filter(t => t.priority === 'medium' && !t.done),
            color: '#FFF4E5',
            icon: <FaCircle color="#FFB74D" size={8} />,
            placeholder: 'Add medium priority task'
        },
        {
            id: 'low',
            title: 'LOW',
            items: todos.filter(t => t.priority === 'low' && !t.done),
            color: '#EEF4FF',
            icon: <FaCaretDown color="#64B5F6" size={14} />,
            placeholder: 'Add low priority task'
        },
        {
            id: 'general',
            title: 'TO-DO',
            items: todos.filter(t => (!t.priority || t.priority === 'none') && !t.done),
            color: '#F5F5F5',
            icon: null,
            placeholder: 'Add a to-do'
        }
    ];

    const completedItems = todos.filter(t => t.done);

    return (
        <div className="todo-view" style={{ padding: '0 20px 100px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    🎉 0 / 0
                </div>
                <FaPlus size={18} style={{ opacity: 0.4, cursor: 'pointer' }} onClick={onAddClick} />
            </div>

            <h1 className="serif" style={{ fontSize: '42px', textAlign: 'center', margin: '20px 0 30px', fontWeight: 500 }}>
                To-do
            </h1>

            {/* Priority Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {categories.map((cat) => {
                    const isCollapsed = collapsedSections[cat.id];
                    return (
                        <div key={cat.id}>
                            <div
                                onClick={() => toggleSection(cat.id)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
                            >
                                <div style={{
                                    padding: '8px 16px',
                                    background: cat.color,
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px'
                                }}>
                                    {cat.icon && <span>{cat.icon}</span>}
                                    {cat.title} ({cat.items.length})
                                    <motion.span
                                        animate={{ rotate: isCollapsed ? -90 : 0 }}
                                        style={{ display: 'inline-flex', alignItems: 'center' }}
                                    >
                                        <FaChevronDown size={10} style={{ opacity: 0.5 }} />
                                    </motion.span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                                    >
                                        {cat.items.map(item => (
                                            <div key={item.id} onClick={() => onToggleTodo(item.id)}>
                                                <TaskCard task={item} isSmall={true} />
                                            </div>
                                        ))}

                                        {/* Dotted Placeholder Area */}
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onAddClick}
                                            style={{
                                                border: '2px dashed var(--border-color)',
                                                borderRadius: '20px',
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                color: '#C0BCB7',
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                transition: 'all 0.2s',
                                                minHeight: '60px',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <span style={{ opacity: 0.6 }}>{cat.placeholder}</span>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.03)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#C0BCB7'
                                            }}>
                                                <FaPlus size={14} />
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {/* Completed Section (Optional, but good for UX) */}
                {completedItems.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <div
                            onClick={() => toggleSection('completed')}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer', opacity: 0.6 }}
                        >
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>COMPLETED ({completedItems.length})</span>
                            <FaChevronDown size={10} />
                        </div>
                        <AnimatePresence>
                            {!collapsedSections['completed'] && (
                                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {completedItems.map(item => (
                                        <div key={item.id} onClick={() => onToggleTodo(item.id)}>
                                            <TaskCard task={{ ...item, color: '#f0f0f0' }} isSmall={true} />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoView;
