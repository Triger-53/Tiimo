import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaCalendarAlt, FaBell, FaPalette, FaUserCircle, FaMoon, FaSun, FaListUl } from 'react-icons/fa';
// Import the Expo Calendar module (Works for Reminders too)
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native'; // Native alerts needed for mobile

const MeView = ({ theme, onToggleTheme, tasks, todos, onImportReminders }) => {
    const completedCount = todos.filter(t => t.done).length;

    const [importReminders, setImportReminders] = useState(() => {
        return localStorage.getItem('importReminders') === 'true';
    });
    const [isImporting, setIsImporting] = useState(false);

    // State to hold the ACTUAL lists found on the iPhone
    const [iosLists, setIosLists] = useState([]);
    // State to hold the IDs of lists selected by the user
    const [selectedListIds, setSelectedListIds] = useState(() => {
        const saved = localStorage.getItem('selectedListIds');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => {
        localStorage.setItem('importReminders', importReminders);
    }, [importReminders]);

    useEffect(() => {
        localStorage.setItem('selectedListIds', JSON.stringify(selectedListIds));
    }, [selectedListIds]);

    const menuItems = [
        { icon: <FaUserCircle />, label: 'Profile' },
        { icon: <FaCalendarAlt />, label: 'Calendar Integrations' },
        { icon: <FaListUl />, label: 'Apple Reminders', isToggle: true },
        { icon: <FaBell />, label: 'Notifications' },
        { icon: <FaPalette />, label: 'Appearance', isTheme: true },
        { icon: <FaCog />, label: 'Settings' },
    ];

    // --- LOGIC: Fetch Lists from iPhone ---
    const fetchIosLists = async () => {
        try {
            const { status } = await Calendar.requestRemindersPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission needed to access Reminders');
                return false;
            }

            // Fetch all calendars that are of type 'REMINDER'
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);

            // Format them for our UI
            const formattedLists = calendars.map(cal => ({
                id: cal.id,
                title: cal.title,
                color: cal.color
            }));

            setIosLists(formattedLists);

            // Auto-select the default 'Reminders' list if no selection exists
            if (selectedListIds.length === 0) {
                const defaultList = formattedLists.find(l => l.title === 'Reminders') || formattedLists[0];
                if (defaultList) setSelectedListIds([defaultList.id]);
            }
            return true;
        } catch (error) {
            console.log("Error fetching lists:", error);
            // Fallback for web/testing so UI doesn't break
            setIosLists([
                { id: '1', title: 'Home (Demo)', color: '#FF0000' },
                { id: '2', title: 'Work (Demo)', color: '#00FF00' }
            ]);
            return true;
        }
    };

    // --- LOGIC: Import actual tasks ---
    const syncReminders = async () => {
        if (selectedListIds.length === 0) return;

        // Fetch reminders looking back 24h and forward 48h (adjust as needed)
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Start of today
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 2); // Next 48 hours

        try {
            const reminders = await Calendar.getRemindersAsync(
                selectedListIds,
                null, // status: null = all, or Calendar.ReminderStatus.INCOMPLETE
                startDate,
                endDate
            );

            // Pass the raw data up to your main app to format/save
            onImportReminders(reminders);
            console.log(`Imported ${reminders.length} reminders`);
        } catch (e) {
            console.log("Sync failed", e);
        }
    };

    // --- HANDLER: Toggle Switch ---
    const handleToggleReminders = async () => {
        if (!importReminders) {
            setIsImporting(true);

            // 1. Get Permissions & Lists
            const success = await fetchIosLists();

            if (success) {
                setImportReminders(true);
                // 2. Initial Sync
                await syncReminders();
            }
            setIsImporting(false);
        } else {
            setImportReminders(false);
            // Optional: clear imported reminders from app state here
        }
    };

    // --- HANDLER: Toggle Specific List ---
    const toggleList = (listId) => {
        setSelectedListIds(prev => {
            const newSelection = prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId];

            // Trigger a re-sync whenever list selection changes
            // Use setTimeout to allow state to update first, or use useEffect on selectedListIds
            setTimeout(() => syncReminders(), 100);

            return newSelection;
        });
    };

    // Auto-sync when selection changes (Alternative to the setTimeout above)
    useEffect(() => {
        if (importReminders && selectedListIds.length > 0) {
            syncReminders();
        }
    }, [selectedListIds]);


    return (
        <div style={{ padding: '0 40px', paddingBottom: '100px' }}>
            {/* Header & Stats (Kept exactly as is) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-color)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>Pure As Gold</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Pro Plan</p>
                </div>
            </div>

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

                        {/* List Selection UI (Populated by Real Data now) */}
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
                                            {/* MAP OVER IOS LISTS INSTEAD OF HARDCODED ARRAY */}
                                            {iosLists.map(list => (
                                                <div
                                                    key={list.id}
                                                    onClick={() => toggleList(list.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '12px 0',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: selectedListIds.includes(list.id) ? '600' : '400' }}>
                                                        {list.title}
                                                    </span>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '6px',
                                                        border: selectedListIds.includes(list.id) ? 'none' : '2px solid var(--border-color)',
                                                        background: selectedListIds.includes(list.id) ? 'var(--primary)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}>
                                                        {selectedListIds.includes(list.id) && <div style={{ width: '6px', height: '10px', border: 'solid white', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)', marginBottom: '2px' }} />}
                                                    </div>
                                                </div>
                                            ))}
                                            {iosLists.length === 0 && <div style={{ padding: '10px', color: 'gray', fontSize: '12px' }}>No lists found or permissions denied.</div>}
                                        </div>
                                        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                                            Syncing iPhone Reminders to Timeline...
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
