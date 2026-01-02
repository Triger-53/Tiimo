import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaCheck, FaMusic, FaPlus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const FocusTimer = ({ task, isOpen, onClose, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(task ? task.duration * 60 : 0);
    const [isActive, setIsActive] = useState(false);

    // Local state for checking off items
    const [checklistItems, setChecklistItems] = useState([]);

    // Mock checklist/vibe if task has no subtasks
    const defaultChecklist = [
        { id: 'c1', title: 'Get comfortable', done: true, icon: '🧘' },
        { id: 'c2', title: 'Focus on one task', done: false, icon: '✍️' },
        { id: 'c3', title: 'Celebrate progress', done: false, icon: '🎉' }
    ];

    useEffect(() => {
        if (task) {
            setTimeLeft(task.duration * 60);
            setIsActive(false);

            // Initialize checklist
            const items = (task.subtasks && task.subtasks.length > 0) ? task.subtasks : defaultChecklist;
            // Ensure we clone it to avoid mutating props directly if we were to modify objects
            setChecklistItems(JSON.parse(JSON.stringify(items)));
        }
    }, [task]);

    // Handle checklist toggles
    const toggleChecklist = (id) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, done: !item.done };
            }
            return item;
        }));
    };

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const addFiveMinutes = () => setTimeLeft(prev => prev + 300);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Track when the session started to keep start time fixed (for non-scheduled tasks)
    const [sessionStartTime, setSessionStartTime] = useState(null);

    useEffect(() => {
        if (task && isOpen) {
            setSessionStartTime(new Date());
        } else {
            setSessionStartTime(null);
        }
    }, [task, isOpen]);

    const formatTimeStr = (date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Calculate time range display
    let formattedTimeRange = '';

    if (task && task.startTime) {
        // Case 1: Scheduled Task - Show Planned Schedule (e.g. 09:00 -> 10:30)
        // We assume the user wants to see the original slot even if doing it early/late
        const [startHour, startMin] = task.startTime.split(':').map(Number);

        const startDate = new Date();
        startDate.setHours(startHour, startMin, 0, 0);

        const endDate = new Date(startDate.getTime() + task.duration * 60000);

        // Optional: If we wanted to reflect "added time" (+5), we could add difference between timeLeft and duration
        // But for "Schedule" view, keeping it fixed to the slot is cleaner and standard behavior
        formattedTimeRange = `${formatTimeStr(startDate)} → ${formatTimeStr(endDate)}`;

    } else if (sessionStartTime) {
        // Case 2: Unscheduled/Todo - Show Realtime Range (Start Now -> End Prediction)
        const endTime = new Date(Date.now() + timeLeft * 1000);
        formattedTimeRange = `${formatTimeStr(sessionStartTime)} → ${formatTimeStr(endTime)}`;
    }

    const totalTime = task ? task.duration * 60 : 1;
    const progress = Math.max(0, 1 - (timeLeft / totalTime)); // Ensure it doesn't go below 0 visually

    return (
        <AnimatePresence>
            {isOpen && task && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'var(--bg-color)',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'var(--text-main)',
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    {/* --- Header (Fixed at top) --- */}
                    <div style={{
                        flex: '0 0 auto',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'max(20px, env(safe-area-inset-top)) 24px 10px',
                        zIndex: 10,
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ width: 48 }}></div> {/* Spacer for symmetry */}

                        {/* Status/focus Pill */}
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: 'var(--surface-color)',
                                padding: '8px 16px 8px 12px',
                                borderRadius: '100px',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-main)'
                            }}>Stay Focused</div>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                background: 'var(--surface-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '50%',
                                width: '48px', height: '48px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-main)'
                            }}
                        >
                            <IoMdClose size={24} />
                        </motion.button>
                    </div>

                    {/* --- Main Content Layout --- */}
                    <div style={{
                        flex: 1,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        padding: '0 24px 20px',
                        gap: '2vh',
                        boxSizing: 'border-box'
                    }}>

                        {/* Top Area: Title & Stats */}
                        <div style={{ textAlign: 'center', flexShrink: 0, marginTop: '10px' }}>
                            <h2 style={{
                                fontSize: 'clamp(20px, 5vw, 32px)',
                                margin: '0 0 4px 0',
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                                color: 'var(--text-main)'
                            }}>{task.title}</h2>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                                margin: 0,
                                letterSpacing: '0.05em'
                            }}>
                                {formattedTimeRange.toUpperCase()}
                            </p>
                        </div>

                        {/* Visual Timer */}
                        <div style={{
                            position: 'relative',
                            height: 'min(30vh, 65vw)',
                            aspectRatio: '1 / 1',
                            minHeight: '180px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="100%" height="100%" viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)', zIndex: 10, overflow: 'visible' }}>
                                {[...Array(5)].map((_, i) => (
                                    <motion.path
                                        key={i}
                                        d="M 0 0 C 1 0 1.5 0.5 1.5 1.5 C 1.5 0.5 2 0 3 0 C 2 0 1.5 -0.5 1.5 -1.5 C 1.5 -0.5 1 0 0 0"
                                        fill="var(--primary)"
                                        initial={{
                                            x: 150 + 155 * Math.cos(i * 72 * Math.PI / 180),
                                            y: 150 + 155 * Math.sin(i * 72 * Math.PI / 180),
                                            opacity: 0,
                                            scale: 0
                                        }}
                                        animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 4 + i, ease: "easeInOut" }}
                                    />
                                ))}

                                <circle
                                    cx="150"
                                    cy="150"
                                    r="130"
                                    stroke="var(--surface-color)"
                                    strokeWidth="36"
                                    fill="none"
                                />
                                <motion.circle
                                    cx="150"
                                    cy="150"
                                    r="130"
                                    stroke="var(--primary)"
                                    strokeWidth="36"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 130}
                                    strokeDashoffset={2 * Math.PI * 130 * (1 - progress)}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress) }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                />
                            </svg>

                            <div style={{
                                position: 'absolute',
                                zIndex: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--surface-color)',
                                border: '1px solid var(--border-color)',
                                width: '70%',
                                aspectRatio: '1 / 1',
                                borderRadius: '50%',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div style={{ fontSize: 'clamp(60px, 12vh, 90px)' }}>
                                    {task.icon || '✨'}
                                </div>
                            </div>
                        </div>

                        {/* Digital Area */}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                            <div style={{
                                fontSize: 'clamp(40px, 8vh, 64px)',
                                fontWeight: 800,
                                fontFamily: "'Inter', sans-serif",
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: '-0.02em',
                                color: 'var(--text-main)'
                            }}>
                                {formatTime(timeLeft)}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addFiveMinutes}
                                    style={{
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--surface-color)',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        color: 'var(--text-main)',
                                        cursor: 'pointer',
                                        height: '48px',
                                        padding: '0 20px',
                                        borderRadius: '24px',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    +5m
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleTimer}
                                    style={{
                                        width: '84px',
                                        height: '64px',
                                        background: 'var(--text-main)',
                                        borderRadius: '32px',
                                        color: 'var(--bg-color)',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-md)'
                                    }}
                                >
                                    {isActive ? <FaPause size={24} /> : <FaPlay size={24} style={{ marginLeft: '4px' }} />}
                                </motion.button>

                                <div style={{ width: 44 }}></div> {/* Balance for +5m button */}
                            </div>
                        </div>

                        {/* Checklist Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                minHeight: 0,
                                marginTop: '10px',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                padding: '10px 0 40px',
                                overflowY: 'auto',
                                flex: 1,
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {checklistItems.map((item, index) => (
                                        <motion.div
                                            key={item.id || index}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => toggleChecklist(item.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '16px',
                                                background: item.done ? 'var(--surface-hover)' : 'var(--surface-color)',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                border: '1px solid var(--border-color)',
                                                transition: 'all 0.2s ease',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '20px',
                                                    flexShrink: 0,
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    {item.icon || '📌'}
                                                </div>
                                                <span style={{
                                                    fontSize: '15px',
                                                    fontWeight: 600,
                                                    color: item.done ? 'var(--text-muted)' : 'var(--text-main)',
                                                    textDecoration: item.done ? 'line-through' : 'none'
                                                }}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '8px',
                                                border: item.done ? 'none' : '2px solid var(--border-color)',
                                                background: item.done ? 'var(--primary)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white',
                                                flexShrink: 0,
                                                transition: 'all 0.2s ease'
                                            }}>
                                                {item.done && <FaCheck size={12} />}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {checklistItems.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 0' }}>
                                            No subtasks for this session
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FocusTimer;
