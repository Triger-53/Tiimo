import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSchedule } from '../utils/ai';
import { FaArrowUp, FaTimes } from 'react-icons/fa';

const AddModal = ({ isOpen, onClose, currentTasks, onAIActions }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        const now = new Date();
        const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        try {
            const actions = await generateSchedule(input, timeString, currentTasks);
            onAIActions(actions);
            setLoading(false);
            setInput('');
            onClose();
        } catch (error) {
            console.error("Failed to generate tasks:", error);
            alert("Failed to generate tasks. Please try again.");
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'black', zIndex: 40
                        }}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'var(--surface-color)',
                            zIndex: 50,
                            padding: '32px',
                            borderTopLeftRadius: '32px',
                            borderTopRightRadius: '32px',
                            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, fontSize: '24px' }}>What's on your mind?</h2>
                                <button onClick={onClose} style={{ padding: '8px' }}><FaTimes size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="e.g. I need to clean the house and study for 2 hours..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '20px',
                                        paddingRight: '60px',
                                        borderRadius: '24px',
                                        border: '2px solid transparent',
                                        background: 'var(--bg-color)',
                                        fontSize: '18px',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                />

                                <button
                                    type="submit"
                                    disabled={loading || !input}
                                    style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        right: '20px',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: input ? 1 : 0.5
                                    }}
                                >
                                    {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <FaArrowUp />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddModal;
