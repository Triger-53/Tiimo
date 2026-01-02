import { motion } from 'framer-motion';
import { FaCog, FaCalendarAlt, FaBell, FaPalette, FaUserCircle } from 'react-icons/fa';

const MeView = () => {
    const menuItems = [
        { icon: <FaUserCircle />, label: 'Profile' },
        { icon: <FaCalendarAlt />, label: 'Calendar Integrations' },
        { icon: <FaBell />, label: 'Notifications' },
        { icon: <FaPalette />, label: 'Appearance' },
        { icon: <FaCog />, label: 'Settings' },
    ];

    return (
        <div style={{ padding: '0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ddd', overflow: 'hidden' }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Felix</h2>
                    <p style={{ margin: '4px 0 0', color: '#888' }}>Free Plan</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {menuItems.map((item, index) => (
                    <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                            background: 'white',
                            border: '1px solid rgba(0,0,0,0.05)',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--text-main)',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <span style={{ color: 'var(--primary)', fontSize: '20px' }}>{item.icon}</span>
                        {item.label}
                    </motion.button>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', color: '#aaa', fontSize: '12px' }}>
                Version 1.0.0 • Made with ❤️
            </div>
        </div>
    );
};

export default MeView;
