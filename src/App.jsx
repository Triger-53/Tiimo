import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  FaPlus, FaMagic, FaMicrophone,
  FaRegCheckSquare, FaRegCalendarAlt, FaCircleNotch, FaRegSmile, FaTimes
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import TaskCard from './components/TaskCard';
import AddModal from './components/AddModal';
import TodayView from './components/TodayView';
import FocusTimer from './components/FocusTimer';
import TodoView from './components/TodoView';
import StatsView from './components/StatsView';
import MeView from './components/MeView';
import VoiceModal from './components/VoiceModal';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Morning Routine', startTime: '08:00', duration: 30, icon: '🌅', color: '#ffc8c3' },
    { id: 2, title: 'Deep Work', startTime: '09:00', duration: 90, icon: '💻', color: '#9baee0' },
    { id: 3, title: 'Lunch Break', startTime: '12:30', duration: 45, icon: '🥗', color: '#b5eadd' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [todos, setTodos] = useState([
    { id: 1, title: 'Buy groceries', done: false, icon: '🛒', priority: 'medium' },
    { id: 2, title: 'Call mom', done: false, icon: '📞', priority: 'high' },
    { id: 3, title: 'Wash car', done: false, icon: '🚗', priority: 'low' },
  ]);
  const [activeTask, setActiveTask] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('today');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const sortedTasks = [...tasks].sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));

  const handleAddTodo = (title, icon = '📌', priority = 'none') => {
    setTodos(prev => [...prev, { id: Date.now(), title, done: false, icon, priority }]);
  };

  const handleToggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleDeleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAIActions = (response) => {
    const actions = Array.isArray(response) ? response : (response?.actions || []);

    setTasks(prevTasks => {
      let newTasks = [...prevTasks];
      actions.forEach(action => {
        if (action.type === 'clear_all') {
          newTasks = [];
          return;
        }

        const startTime = (action.startTime === 'null' || action.startTime === '') ? null : action.startTime;
        if (!startTime && action.type === 'create') return;

        if (action.type === 'create') {
          const { type, subtasks, ...taskData } = action;
          const expandedSubtasks = Array.isArray(subtasks)
            ? subtasks.map(t => ({ id: Math.random(), title: t, done: false }))
            : [];
          newTasks.push({
            ...taskData,
            startTime: startTime,
            duration: action.duration || 30,
            subtasks: expandedSubtasks,
            id: Date.now() + Math.random()
          });
        } else if (action.type === 'update') {
          newTasks = newTasks.map(t => t.id === action.id ? { ...t, ...action.updates } : t);
        } else if (action.type === 'delete') {
          newTasks = newTasks.filter(t => t.id !== action.id);
        }
      });
      return newTasks;
    });

    setTodos(prevTodos => {
      let newTodos = [...prevTodos];
      actions.forEach(action => {
        if (action.type === 'clear_all') {
          newTodos = [];
          return;
        }

        const startTime = (action.startTime === 'null' || action.startTime === '') ? null : action.startTime;

        if (action.type === 'create' && !startTime) {
          newTodos.push({
            id: Date.now() + Math.random(),
            title: action.title,
            done: false,
            icon: action.icon || '📌',
            priority: action.priority || 'none'
          });
        }
        if (action.type === 'update' && action.id) {
          newTodos = newTodos.map(t => t.id === action.id ? { ...t, ...action.updates } : t);
        }
        if (action.type === 'delete' && action.id) {
          newTodos = newTodos.filter(t => t.id !== action.id);
        }
      });
      return newTodos;
    });
  };

  const handleTaskClick = (task) => {
    setActiveTask(task);
    setIsTimerOpen(true);
  };

  const handleTaskComplete = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsTimerOpen(false);
  };

  const handleImportReminders = () => {
    const mockReminders = [
      { id: Date.now() + 1, title: 'Check emails (from Home)', done: false, icon: '📱', priority: 'medium', source: 'Apple Reminders' },
      { id: Date.now() + 2, title: 'Buy milk (from Shopping)', done: false, icon: '🛒', priority: 'high', source: 'Apple Reminders' },
      { id: Date.now() + 3, title: 'Morning Gym (from Personal)', done: false, icon: '💪', startTime: '08:00', duration: 45, color: '#E3F2FD', source: 'Apple Reminders' },
    ];

    // Separate into tasks (with time) and todos (without)
    const newTasks = mockReminders.filter(r => r.startTime);
    const newTodos = mockReminders.filter(r => !r.startTime);

    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
    }
    setTodos(prev => [...prev, ...newTodos]);
  };

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Dynamic Main Header based on View */}
      {currentView !== 'today' && currentView !== 'to-do' && currentView !== 'stats' && (
        <header className="header" style={{ padding: '40px 24px 20px' }}>
          <div className="date-display">
            <h1 className="serif" style={{ fontSize: '32px' }}>{
              currentView === 'me' ? 'Profile' : 'Tiimo'
            }</h1>
            <p>{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="main-content" style={{ paddingTop: currentView === 'today' || currentView === 'to-do' ? 0 : '10px' }}>
        {currentView === 'today' && (
          <TodayView
            tasks={tasks}
            todos={todos}
            onTaskClick={handleTaskClick}
            onAddClick={() => setIsModalOpen(true)}
          />
        )}

        {currentView === 'to-do' && (
          <TodoView
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onAddClick={() => setIsModalOpen(true)}
          />
        )}

        {currentView === 'stats' && <StatsView />}
        {currentView === 'me' && (
          <MeView
            theme={theme}
            onToggleTheme={toggleTheme}
            tasks={tasks}
            todos={todos}
            onImportReminders={handleImportReminders}
          />
        )}
      </main>

      {/* Bottom Floating Actions */}
      {currentView !== 'me' && (
        <div className="fab-container">
          <motion.button
            className="fab flex-center voice-fab"
            onClick={() => setIsVoiceOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaMicrophone size={24} />
          </motion.button>

          <motion.button
            className="fab flex-center add-fab"
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPlus size={24} />
          </motion.button>
        </div>
      )}

      {/* Navigation (Sticky Bottom Navigation) */}
      <nav className="bottom-nav">
        <button
          onClick={() => setCurrentView('to-do')}
          className={`nav-item ${currentView === 'to-do' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <FaRegCheckSquare size={24} />
          </div>
          <span className="nav-text">To-do</span>
        </button>

        <button
          onClick={() => setCurrentView('today')}
          className={`nav-item ${currentView === 'today' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <div style={{ position: 'relative' }}>
              <FaRegCalendarAlt size={24} />
              <span style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -40%)',
                fontSize: '9px',
                fontWeight: 'bold',
                color: currentView === 'today' ? 'var(--primary)' : 'var(--text-muted)'
              }}>{format(new Date(), 'd')}</span>
            </div>
          </div>
          <span className="nav-text">Today</span>
        </button>

        <button
          onClick={() => setCurrentView('stats')}
          className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <FaCircleNotch size={24} />
          </div>
          <span className="nav-text">Focus</span>
        </button>

        <button
          onClick={() => setCurrentView('me')}
          className={`nav-item ${currentView === 'me' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <FaRegSmile size={24} />
          </div>
          <span className="nav-text">Me</span>
        </button>
      </nav>

      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTasks={tasks}
        currentTodos={todos}
        onAIActions={handleAIActions}
      />

      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentTasks={tasks}
        currentTodos={todos}
        onAIActions={handleAIActions}
      />

      <FocusTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        task={activeTask}
        onComplete={handleTaskComplete}
      />
    </div>
  );
};

export default App;
