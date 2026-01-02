import { motion } from 'framer-motion';
import { FaCog, FaCalendarAlt, FaBell, FaPalette, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';

const MeView = ({ theme, onToggleTheme }) => {
    const menuItems = [
        { icon: <FaUserCircle />, label: 'Profile' },
        { icon: <FaCalendarAlt />, label: 'Calendar Integrations' },
        { icon: <FaBell />, label: 'Notifications' },
        {
            icon: <FaPalette />,
            label: 'Appearance',
            isTheme: true
        },
        { icon: <FaCog />, label: 'Settings' },
    ];

    return (
        <div style={{ padding: '0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-color)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>Felix</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Free Plan</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.label}
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
                            borderRadius: '16px',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '20px', display: 'flex' }}>{item.icon}</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{item.label}</span>
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
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>&gt;</div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)', fontSize: '12px' }}>
                Version 1.0.0 • Made with ❤️
            </div>
        </div>
    );
};

export default MeView;
