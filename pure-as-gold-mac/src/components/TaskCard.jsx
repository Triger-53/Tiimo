import { motion } from 'framer-motion';

const TaskCard = ({ task, isActive, isSmall }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`task-card ${isActive ? 'active' : ''}`}
            style={{
                backgroundColor: '#F0F0F0',
                padding: isSmall ? '12px 16px' : '20px',
                borderRadius: isSmall ? '20px' : '16px',
                marginBottom: isSmall ? '8px' : '16px',
                display: 'flex',
                alignItems: 'center',
                gap: isSmall ? '12px' : '16px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isSmall ? 'none' : 'var(--shadow-sm)',
                border: isSmall ? '1px solid rgba(0,0,0,0.03)' : 'none'
            }}
        >
            <div style={{
                fontSize: isSmall ? '20px' : '32px',
                background: task.color || 'rgba(255,255,255,0.4)',
                width: isSmall ? '36px' : '56px',
                height: isSmall ? '36px' : '56px',
                borderRadius: isSmall ? '12px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {task.icon || '📝'}
            </div>

            <div style={{ flex: 1 }}>
                <h3 style={{
                    margin: '0',
                    fontSize: isSmall ? '15px' : '18px',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    lineHeight: 1.2
                }}>{task.title}</h3>
                {!isSmall && (
                    <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>
                        {task.startTime} • {task.duration} min
                    </p>
                )}
            </div>

            {isActive && !isSmall && (
                <motion.div
                    layoutId="active-ring"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        border: '3px solid var(--text-main)',
                        borderRadius: '16px',
                        pointerEvents: 'none'
                    }}
                />
            )}
        </motion.div>
    );
};

export default TaskCard;
