import { motion } from 'framer-motion';

const TaskCard = ({ task, isActive }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`task-card ${isActive ? 'active' : ''}`}
            style={{
                backgroundColor: task.color || '#F0F0F0',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                fontSize: '32px',
                background: 'rgba(255,255,255,0.4)',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {task.icon || '📝'}
            </div>

            <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#2d2d2d' }}>{task.title}</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '14px', fontWeight: '500' }}>
                    {task.startTime} • {task.duration} min
                </p>
            </div>

            {isActive && (
                <motion.div
                    layoutId="active-ring"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        border: '3px solid #2d2d2d',
                        borderRadius: '16px',
                        pointerEvents: 'none'
                    }}
                />
            )}
        </motion.div>
    );
};

export default TaskCard;
