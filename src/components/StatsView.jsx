import { motion } from 'framer-motion';
import { FaFire, FaCheckCircle, FaChartLine } from 'react-icons/fa';

const StatsView = ({ tasks, todos }) => {
    const completedTasks = tasks.filter(t => t.done).length; // assuming we track done in tasks (we technically delete them now, might need to change that logic later for real stats)
    // For now, let's just mock some stats or use the current length

    const totalFocusTime = tasks.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    return (
        <div style={{ padding: '0 40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-main)' }}>Your Stats</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: '#ffe4b3', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.4)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaFire size={24} color="#d97706" />
                    </div>
                    <div>
                        <span style={{ fontSize: '32px', fontWeight: '800', display: 'block', color: '#2d2d2d' }}>3</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.7, color: '#2d2d2d' }}>Day Streak</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ background: '#b5eadd', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.4)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaCheckCircle size={24} color="#059669" />
                    </div>
                    <div>
                        <span style={{ fontSize: '32px', fontWeight: '800', display: 'block', color: '#2d2d2d' }}>{todos.filter(t => t.done).length}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.7, color: '#2d2d2d' }}>Todos Completed</span>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ marginTop: '20px', background: 'var(--surface-color)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FaChartLine size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Focus Time</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-main)' }}>{Math.round(totalFocusTime / 60)}</span>
                    <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: '500' }}>hours planned today</span>
                </div>

                <div style={{ marginTop: '16px', height: '8px', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default StatsView;
