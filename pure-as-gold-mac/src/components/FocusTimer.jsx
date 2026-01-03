import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaCheck, FaMusic, FaPlus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const FocusTimer = ({ task, isOpen, onClose, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(task ? task.duration * 60 : 0);
    const [isActive, setIsActive] = useState(false);

    // Local state for checking off items
    const [checklistItems, setChecklistItems] = useState([]);

    useEffect(() => {
        if (task) {
            setTimeLeft(task.duration * 60);
            setIsActive(false);

            // Initialize checklist
            const items = (task.subtasks && task.subtasks.length > 0) ? task.subtasks : [];
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
                        background: '#FDFDFB', // Slightly warmer off-white
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                        // Removed alignItems: center from here to handle scroll container better
                        color: '#1a1a1a',
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
                        <div style={{ width: 48 }}></div> {/* Spacer to keep pill centered */}

                        {/* Status/focus Pill */}
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: '#FFFFFF',
                                padding: '8px 16px 8px 12px',
                                borderRadius: '100px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.02)',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#1a1a1a'
                            }}>Stay Focused</div>
                        </motion.div>

                        < motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                background: '#F0F0F0',
                                border: 'none',
                                borderRadius: '50%',
                                width: '48px', height: '48px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#333'
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
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 24px 40px',
                        gap: '2vh',
                        boxSizing: 'border-box'
                    }}>

                        {/* Top Area: Title & Stats */}
                        <div style={{ textAlign: 'center', flexShrink: 0, marginTop: '10px' }}>
                            <h2 style={{
                                fontSize: 'clamp(20px, 5vw, 32px)',
                                margin: '0 0 4px 0',
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                                color: '#111'
                            }}>{task.title}</h2>
                            <p style={{
                                fontSize: '13px',
                                color: '#A0A0A0',
                                fontWeight: 500,
                                margin: 0,
                                letterSpacing: '0.05em'
                            }}>
                                {formattedTimeRange.toUpperCase()}
                            </p>
                        </div>

                        {/* Visual Timer - Proportional to screen but with clear limits */}
                        <div style={{
                            position: 'relative',
                            height: 'min(32vh, 70vw)',
                            aspectRatio: '1 / 1',
                            minHeight: '160px',
                            flexShrink: 0, // Don't squash the timer
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="100%" height="100%" viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)', zIndex: 10, overflow: 'visible' }}>
                                {/* Floating sparkles like in ref image */}
                                {[...Array(5)].map((_, i) => (
                                    <motion.path
                                        key={i}
                                        d="M 0 0 C 1 0 1.5 0.5 1.5 1.5 C 1.5 0.5 2 0 3 0 C 2 0 1.5 -0.5 1.5 -1.5 C 1.5 -0.5 1 0 0 0"
                                        fill="#A694F5"
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
                                    stroke="#f0f0f07f"
                                    strokeWidth="42"
                                    fill="none"
                                />
                                <motion.circle
                                    cx="150"
                                    cy="150"
                                    r="130"
                                    stroke="#9D8EC4"
                                    strokeWidth="42"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 130}
                                    strokeDashoffset={2 * Math.PI * 130 * (1 - progress)}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress) }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                />

                                {/* Leading Edge Arrow */}
                                {progress > 0 && progress < 0.99 && (
                                    <motion.g
                                        initial={false}
                                        animate={{
                                            x: 150 + 130 * Math.cos(progress * 2 * Math.PI),
                                            y: 150 - 130 * Math.sin(progress * 2 * Math.PI),
                                            rotate: -(progress * 360) + 90
                                        }}
                                        transition={{ duration: 1, ease: 'linear' }}
                                    >
                                        <path
                                            d="M -7 0 L 5 0 M -1 -6 L 5 0 L -1 6"
                                            fill="none"
                                            stroke="#4A3B8C"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{ opacity: 0.6 }}
                                        />
                                    </motion.g>
                                )}
                            </svg>

                            {/* Inner Content - Cream Background */}
                            <div style={{
                                position: 'absolute',
                                zIndex: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#F9F1EB',
                                width: '74%',
                                aspectRatio: '1 / 1',
                                borderRadius: '50%',
                                boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ fontSize: 'min(14vh, 100px)' }}>
                                    {task.icon || '✨'}
                                </div>
                            </div>
                        </div>

                        {/* Digital Area: Time & Main Controls */}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                            <div style={{
                                fontSize: 'min(5vh, 60px)',
                                fontWeight: 700,
                                fontFamily: "'Inter', sans-serif",
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: '-0.02em',
                                color: '#1b1a1eff'
                            }}>
                                {formatTime(timeLeft)}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addFiveMinutes}
                                    style={{
                                        border: 'none', background: 'rgba(0,0,0,0.03)',
                                        fontSize: '14px', fontWeight: 700, color: '#1a1a1a',
                                        cursor: 'pointer', height: '44px', padding: '0 16px',
                                        borderRadius: '22px'
                                    }}
                                >
                                    +5m
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleTimer}
                                    style={{
                                        width: '84px', height: '58px',
                                        background: '#111',
                                        borderRadius: '100px',
                                        color: '#FFF',
                                        border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    {isActive ? <FaPause size={20} /> : <FaPlay size={20} style={{ marginLeft: '4px' }} />}
                                </motion.button>

                                <div style={{ width: '44px' }}></div>
                            </div>
                        </div>

                        {/* --- Bottom Checklist Section --- */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                width: '100%',
                                maxWidth: '440px',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                minHeight: 0,
                                marginTop: '10px',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                padding: '10px 16px 40px',
                                overflowY: 'auto',
                                flex: 1,
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                // Fade effect for top and bottom
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                                maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {checklistItems.map((item, index) => (
                                        <motion.div
                                            key={item.id || index}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => toggleChecklist(item.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '12px 14px',
                                                background: item.done ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.8)',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                border: '1px solid rgba(0,0,0,0.03)',
                                                transition: 'background 0.2s ease',
                                                backdropFilter: 'blur(12px)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '34px', height: '34px', borderRadius: '12px',
                                                    background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '16px',
                                                    flexShrink: 0,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                                }}>
                                                    {item.icon || '📌'}
                                                </div>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: item.done ? '#AAA' : '#1a1a1a',
                                                    textDecoration: item.done ? 'line-through' : 'none'
                                                }}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '22px', height: '22px', borderRadius: '7px',
                                                border: item.done ? 'none' : '2px solid #E0E0E0',
                                                background: item.done ? '#111' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white',
                                                flexShrink: 0,
                                                transition: 'all 0.2s ease'
                                            }}>
                                                {item.done && <FaCheck size={10} />}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {checklistItems.length === 0 && (
                                        <div style={{ height: '40px' }} />
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
