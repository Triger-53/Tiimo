import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaPlus, FaTimes, FaRegClock, FaSun, FaMoon } from 'react-icons/fa';
import { FiSunrise } from 'react-icons/fi';
import { format } from 'date-fns';
import TaskCard from './TaskCard';

const TodayView = ({ tasks, todos, onTaskClick, onAddClick }) => {
    const morningTasks = tasks.filter(t => t.startTime && t.startTime < '12:00');
    const dayTasks = tasks.filter(t => t.startTime && t.startTime >= '12:00' && t.startTime < '18:00');
    const eveningTasks = tasks.filter(t => t.startTime && t.startTime >= '18:00');

    // State to track collapsed sections (default all expanded)
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (id) => {
        setCollapsedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const sections = [
        {
            id: 'anytime',
            title: 'ANYTIME',
            count: todos.length,
            icon: <FaRegClock size={14} />,
            tasks: todos,
            type: 'todo',
            placeholder: 'Anytime today works',
            color: '#FCF6F0'
        },
        {
            id: 'morning',
            title: 'MORNING',
            count: morningTasks.length,
            icon: <FiSunrise size={14} />,
            tasks: morningTasks,
            type: 'task',
            placeholder: "What's on your morning list?",
            color: '#FFEFEC'
        },
        {
            id: 'day',
            title: 'DAY',
            count: dayTasks.length,
            icon: <FaSun size={14} />,
            tasks: dayTasks,
            type: 'task',
            placeholder: "What's happening today?",
            color: '#EEF4FF'
        },
        {
            id: 'evening',
            title: 'EVENING',
            count: eveningTasks.length,
            icon: <FaMoon size={14} />,
            tasks: eveningTasks,
            type: 'task',
            placeholder: "End the day your way",
            color: '#F1EDFF'
        }
    ];

    return (
        <div className="today-view" style={{ padding: '0 20px 100px' }}>
            {/* Plan Header */}
            <div style={{ textAlign: 'center', margin: '40px 0 30px' }}>
                <h1 className="serif" style={{ fontSize: '42px', margin: 0, fontWeight: 500 }}>
                    {format(new Date(), 'EEEE')}
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {format(new Date(), 'MMMM do, yyyy')}
                </p>
            </div>

            {/* Plan Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: '#F7F4FF',
                    borderRadius: '24px',
                    padding: '24px',
                    position: 'relative',
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}
            >
                <div style={{ zIndex: 1, maxWidth: '60%' }}>
                    <h3 className="serif" style={{ fontSize: '22px', margin: '0 0 8px' }}>Plan your week</h3>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}>
                        Tell us a few things you'd like to get done this week
                    </p>
                </div>

                {/* Tiimo Character Illustration */}
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #A899FF 0%, #D1C4FF 100%)',
                        borderRadius: '50% 50% 45% 45%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#333', borderRadius: '50%' }}></div>
                            <div style={{ width: '6px', height: '6px', background: '#333', borderRadius: '50%' }}></div>
                        </div>
                        {/* Hands */}
                        <div style={{ position: 'absolute', bottom: '-5px', left: '-10px', width: '25px', height: '12px', background: 'white', borderRadius: '10px', transform: 'rotate(-20deg)', border: '1px solid rgba(0,0,0,0.1)' }}></div>
                        <div style={{ position: 'absolute', bottom: '0px', right: '-15px', width: '30px', height: '12px', background: 'white', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
                    </div>
                </div>

                <button style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.4 }}>
                    <FaTimes size={18} />
                </button>
            </motion.div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sections.map((section) => {
                    const isCollapsed = collapsedSections[section.id];
                    return (
                        <div key={section.id}>
                            <div
                                onClick={() => toggleSection(section.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}
                            >
                                <div style={{
                                    padding: '8px 16px',
                                    background: section.color,
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px'
                                }}>
                                    {section.icon && <span>{section.icon}</span>}
                                    {section.title} ({section.count})
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
                                        {section.tasks.map(item => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                onClick={() => onTaskClick(item)}
                                            >
                                                <TaskCard task={item} isSmall={true} />
                                            </motion.div>
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
                                            {section.placeholder}
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
            </div>
        </div>
    );
};

export default TodayView;
