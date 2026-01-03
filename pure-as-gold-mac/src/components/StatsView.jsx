import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaTimes } from 'react-icons/fa';

const StatsView = () => {
    const [duration, setDuration] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    // Sync timeLeft when duration changes (only if not active)
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(duration * 60);
        }
    }, [duration, isActive]);

    // Timer logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStartStop = () => {
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
    };

    const handleDrag = (e) => {
        if (!isDragging || isActive || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - centerX;
        const y = clientY - centerY;

        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        // Map angle 0-360 to 0-60 mins
        let newDur = Math.round((angle / 360) * 60);
        if (newDur >= 60) newDur = 0; // Top point is 0, not 60, for initial state 

        setDuration(Math.max(0, Math.min(60, newDur)));
    };

    const handleDragStart = () => !isActive && setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDrag);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDrag);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, isActive]);

    // Visual calculations
    const radius = 125;
    const circumference = 2 * Math.PI * radius;
    const currentProgress = isActive ? (timeLeft / (duration * 60)) : 1;
    const activePercent = (duration / 60);
    const displayPercent = isActive ? activePercent * currentProgress : activePercent;

    // Rotation for the arrow tip
    const arrowRotation = (displayPercent * 360) - 90;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 40px',
            height: '100%',
            background: '#FDFDFB',
            userSelect: 'none'
        }}>
            <h1 className="serif" style={{ fontSize: '42px', marginTop: '40px', marginBottom: '60px', color: '#1a1a1a', fontWeight: '500' }}>Focus</h1>

            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '320px',
                    height: '320px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isActive ? 'default' : (isDragging ? 'grabbing' : 'grab')
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                {/* Background Ring - Neutral Gray */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#F0F0F0',
                    opacity: 0.5
                }} />

                {/* SVG Progress & Ticks */}
                <svg width="320" height="320" viewBox="0 0 300 300" style={{ position: 'absolute', transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <defs>
                        <mask id="tickMask">
                            <rect x="0" y="0" width="300" height="300" fill="white" />
                            {[...Array(120)].map((_, i) => (
                                <line
                                    key={i}
                                    x1="150" y1="25" x2="150" y2="45"
                                    stroke="black"
                                    strokeWidth="1.5"
                                    transform={`rotate(${i * 3} 150 150)`}
                                />
                            ))}
                        </mask>
                    </defs>

                    {/* Progress Arc */}
                    {displayPercent > 0 && (
                        <circle
                            cx="150"
                            cy="150"
                            r={radius}
                            fill="none"
                            stroke="#B6A5FF"
                            strokeWidth="42"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - displayPercent)}
                            strokeLinecap="round"
                            style={{ transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.1s ease' }}
                        />
                    )}

                    {/* Ticks overlay */}
                    {displayPercent > 0 && (
                        <circle
                            cx="150"
                            cy="150"
                            r={radius}
                            fill="none"
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="42"
                            mask="url(#tickMask)"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - displayPercent)}
                            strokeLinecap="round"
                            style={{ transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.1s ease' }}
                        />
                    )}

                    {/* Leading Edge Arrow (Matching Main Style) */}
                    {displayPercent > 0 && displayPercent < 0.99 && (
                        <motion.g
                            animate={{
                                rotate: (displayPercent * 360),
                                x: 150 + radius * Math.cos(((displayPercent * 360) - 90) * Math.PI / 180),
                                y: 150 + radius * Math.sin(((displayPercent * 360) - 90) * Math.PI / 180)
                            }}
                            transition={{ duration: isActive ? 1 : 0.1, ease: isActive ? "linear" : "easeOut" }}
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

                {/* Markers & Labels */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none' }}>
                    {[15, 30, 45, 60].map(val => {
                        const angle = (val / 60) * 360 - 90;
                        const x = 150 + 85 * Math.cos((angle * Math.PI) / 180);
                        const y = 150 + 85 * Math.sin((angle * Math.PI) / 180);
                        return (
                            <span key={val} style={{
                                position: 'absolute',
                                left: `${x}px`,
                                top: `${y}px`,
                                transform: 'translate(-50%, -50%)',
                                color: '#A0A0A0',
                                fontSize: '16px',
                                fontWeight: '600',
                            }}>{val}</span>
                        );
                    })}
                </div>

                {/* Center Content */}
                <div style={{ zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
                    <div className="serif" style={{ fontSize: isActive ? '72px' : '96px', color: '#1a1a1a', lineHeight: 1, fontWeight: '500' }}>
                        {isActive ? formatTime(timeLeft).split(':')[0] : duration}
                    </div>
                    {isActive ? (
                        <div style={{ fontSize: '32px', color: '#1a1a1a', opacity: 0.6, fontWeight: '700' }}>
                            :{formatTime(timeLeft).split(':')[1]}
                        </div>
                    ) : (
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', marginTop: '4px', letterSpacing: '1px' }}>MINS</div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: 'auto', marginBottom: '40px' }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartStop}
                    style={{
                        padding: '18px 56px',
                        borderRadius: '100px',
                        background: isActive ? '#1a1a1a' : '#EAE6E1',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '20px',
                        fontWeight: '800',
                        color: isActive ? '#FFF' : '#1a1a1a',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    {isActive ? <>Pause <FaPause size={16} /></> : <>Start <FaPlay size={16} /></>}
                </motion.button>

                {isActive && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleReset}
                        style={{
                            width: '62px',
                            height: '62px',
                            borderRadius: '50%',
                            background: '#F0F0F0',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#1a1a1a'
                        }}
                    >
                        <FaTimes size={20} />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default StatsView;
