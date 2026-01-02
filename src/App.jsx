import { useState } from 'react';
import { format } from 'date-fns';
import { FaHome, FaList, FaRegChartBar, FaUser, FaPlus, FaMagic, FaMicrophone } from 'react-icons/fa';
import { motion } from 'framer-motion';
import TaskCard from './components/TaskCard';
import AddModal from './components/AddModal';
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
    { id: 1, title: 'Buy groceries', done: false },
    { id: 2, title: 'Call mom', done: false },
  ]);
  const [activeTask, setActiveTask] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('my-day');

  // Simple sorting by time (string comparison works for 24h format if padded)
  const sortedTasks = [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddTodo = (title) => {
    setTodos(prev => [...prev, { id: Date.now(), title, done: false }]);
  };

  const handleToggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleDeleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAIActions = (response) => {
    const actions = response.actions || [];

    // Handle Tasks Actions
    setTasks(prevTasks => {
      let newTasks = [...prevTasks];
      actions.forEach(action => {
        if (!action.startTime && action.type === 'create') return; // Skip non-timed creates here, handled in todos

        if (action.type === 'create') {
          // eslint-disable-next-line no-unused-vars
          const { type, subtasks, ...taskData } = action;
          const expandedSubtasks = Array.isArray(subtasks)
            ? subtasks.map(t => ({ id: Math.random(), title: t, done: false }))
            : [];
          newTasks.push({ ...taskData, subtasks: expandedSubtasks, id: Date.now() + Math.random() });
        } else if (action.type === 'update') {
          newTasks = newTasks.map(t => t.id === action.id ? { ...t, ...action.updates } : t);
        } else if (action.type === 'delete') {
          newTasks = newTasks.filter(t => t.id !== action.id);
        }
      });
      return newTasks;
    });

    // Handle Todo Actions (Anytime tasks)
    setTodos(prevTodos => {
      let newTodos = [...prevTodos];
      actions.forEach(action => {
        // If it's a create action WITHOUT a startTime, it's a Todo/Anytime task
        if (action.type === 'create' && !action.startTime) {
          newTodos.push({ id: Date.now() + Math.random(), title: action.title, done: false });
        }
        // Todo updates/deletes logic if needed
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

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'my-day': return 'My Day';
      case 'to-do': return 'To-do List';
      case 'stats': return 'Statistics';
      case 'me': return 'Me';
      default: return 'Tiimo';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="brand">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)' }}></div>
          TiimoClone
        </div>

        <div className="nav-links">
          <button
            onClick={() => setCurrentView('my-day')}
            className={`nav-item ${currentView === 'my-day' ? 'active' : ''}`}
          >
            <FaHome size={20} /><span className="nav-text">My Day</span>
          </button>

          <button
            onClick={() => setCurrentView('to-do')}
            className={`nav-item ${currentView === 'to-do' ? 'active' : ''}`}
          >
            <FaList size={20} /><span className="nav-text">To-do</span>
          </button>

          <button
            onClick={() => setCurrentView('stats')}
            className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
          >
            <FaRegChartBar size={20} /><span className="nav-text">Stats</span>
          </button>

          <button
            onClick={() => setCurrentView('me')}
            className={`nav-item ${currentView === 'me' ? 'active' : ''}`}
          >
            <FaUser size={20} /><span className="nav-text">Me</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="date-display">
            <h1>{getHeaderTitle()}</h1>
            <p>{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ddd' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{ width: '100%', borderRadius: '50%' }} />
          </div>
        </header>

        {currentView === 'my-day' && (
          <div className="timeline-container">
            {/* Anytime Section / Top of My Day */}
            {todos.length > 0 && (
              <div style={{ marginBottom: '32px', padding: '0 20px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Anytime</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {todos.filter(t => !t.done).map(todo => (
                    <div key={todo.id} style={{
                      minWidth: '150px',
                      background: 'white',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginBottom: 8 }}></div>
                      {todo.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sortedTasks.map((task, index) => (
              <div key={task.id} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '50px', paddingTop: '24px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-muted)' }}>{task.startTime}</span>
                  {index !== sortedTasks.length - 1 && (
                    <div style={{ flex: 1, width: '2px', background: 'rgba(0,0,0,0.05)', margin: '8px 0' }}></div>
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 20 }} onClick={() => handleTaskClick(task)}>
                  <TaskCard task={task} isActive={index === 0} />
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                <h2>No tasks yet</h2>
                <p>Tap the sparkle button to plan your day!</p>
              </div>
            )}

            <div className="fab-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <motion.button
                className="fab flex-center"
                onClick={() => setIsVoiceOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ background: '#ff6b6b' }}
              >
                <FaMicrophone />
              </motion.button>

              <motion.button
                className="fab flex-center"
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaMagic />
              </motion.button>
            </div>
          </div>
        )}

        {currentView === 'to-do' && (
          <TodoView
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}

        {currentView === 'stats' && <StatsView tasks={tasks} todos={todos} />}
        {currentView === 'me' && <MeView />}
      </main>

      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTasks={tasks}
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
