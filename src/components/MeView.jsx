import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaCalendarAlt, FaBell, FaPalette, FaUserCircle, FaMoon, FaSun, FaListUl } from 'react-icons/fa';

const MeView = ({ theme, onToggleTheme, tasks, todos, onImportReminders }) => {
    const completedCount = todos.filter(t => t.done).length;
    const menuItems = [
        { icon: <FaUserCircle />, label: 'Profile' },
        { icon: <FaCalendarAlt />, label: 'Calendar Integrations' },
        { icon: <FaListUl />, label: 'Apple Reminders', isToggle: true },
        { icon: <FaBell />, label: 'Notifications' },
        {
            icon: <FaPalette />,
            label: 'Appearance',
            isTheme: true
        },
        { icon: <FaCog />, label: 'Settings' },
    ];

    const [importReminders, setImportReminders] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedLists, setSelectedLists] = useState(['Home']);

    const reminderLists = ['Home', 'Work', 'Shopping', 'Personal'];

    const handleToggleReminders = () => {
        if (!importReminders) {
            setIsImporting(true);
            setTimeout(() => {
                onImportReminders();
                setImportReminders(true);
                setIsImporting(false);
            }, 1200);
        } else {
            setImportReminders(false);
        }
    };

    const toggleList = (list) => {
        setSelectedLists(prev =>
            prev.includes(list) ? prev.filter(l => l !== list) : [...prev, list]
        );
    };

    return (
        <div style={{ padding: '0 40px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-color)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>Felix</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Pro Plan</p>
                </div>
            </div>

            {/* Stats Summary Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                <div style={{ background: '#ffe4b3', padding: '16px 12px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#2d2d2d' }}>3</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, color: '#2d2d2d' }}>Streak</span>
                </div>
                <div style={{ background: '#b5eadd', padding: '16px 12px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#2d2d2d' }}>{completedCount}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, color: '#2d2d2d' }}>Done</span>
                </div>
                <div style={{ background: '#D6CCFF', padding: '16px 12px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#2d2d2d' }}>{Math.round(tasks.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60)}h</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, color: '#2d2d2d' }}>Focus</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {menuItems.map((item, index) => (
                    <div key={item.label}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px',
                                background: 'var(--surface-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: item.label === 'Apple Reminders' && importReminders ? '16px 16px 0 0' : '16px',
                                width: '100%',
                                boxSizing: 'border-box',
                                transition: 'border-radius 0.3s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ color: 'var(--primary)', fontSize: '26px', display: 'flex' }}>{item.icon}</span>
                                <span style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-main)' }}>{item.label}</span>
                            </div>

                            {item.isTheme ? (
                                <button
                                    onClick={onToggleTheme}
                                    style={{
                                        background: 'var(--bg-color)',
                                        padding: '8px 16px',
                                        borderRadius: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'var(--text-main)',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        border: '1px solid var(--border-color)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {theme === 'light' ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
                                </button>
                            ) : item.isToggle ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {isImporting && <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>Syncing...</span>}
                                    <div
                                        onClick={handleToggleReminders}
                                        style={{
                                            width: '44px',
                                            height: '24px',
                                            background: importReminders ? 'var(--primary)' : '#E0E0E0',
                                            borderRadius: '12px',
                                            position: 'relative',
                                            cursor: isImporting ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.3s ease'
                                        }}
                                    >
                                        <motion.div
                                            animate={{ x: importReminders ? 22 : 2 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '2px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>&gt;</div>
                            )}
                        </motion.div>

                        {/* List Selection UI (Visible when toggled on) */}
                        <AnimatePresence>
                            {item.label === 'Apple Reminders' && importReminders && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{
                                        background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        borderTop: 'none',
                                        borderRadius: '0 0 16px 16px',
                                        overflow: 'hidden',
                                        padding: '0 20px'
                                    }}
                                >
                                    <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sync these lists</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {reminderLists.map(list => (
                                                <div
                                                    key={list}
                                                    onClick={() => toggleList(list)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '12px 0',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: selectedLists.includes(list) ? '600' : '400' }}>{list}</span>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '6px',
                                                        border: selectedLists.includes(list) ? 'none' : '2px solid var(--border-color)',
                                                        background: selectedLists.includes(list) ? 'var(--primary)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}>
                                                        {selectedLists.includes(list) && <div style={{ width: '6px', height: '10px', border: 'solid white', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)', marginBottom: '2px' }} />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                                            Auto-syncs every few minutes. One-way from Apple to Tiimo.
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)', fontSize: '12px' }}>
                Version 1.0.0 • Made with ❤️
            </div>
        </div>
    );
};

export default MeView;
