import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Calendar, CheckSquare, Plus, Bell, Settings, Search, Edit, Trash2, X, Moon, Sun, Upload } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  // Load user preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedProfilePicture = localStorage.getItem('profilePicture');
    const savedNotifications = localStorage.getItem('notifications') === 'true';
    
    setDarkMode(savedDarkMode);
    setProfilePicture(savedProfilePicture);
    setNotificationsEnabled(savedNotifications);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Sample initial tasks
  useEffect(() => {
    const sampleTasks = [
      {
        id: 1,
        title: 'Complete project proposal',
        description: 'Finish the client project proposal document',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-01-15',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 2,
        title: 'Team meeting',
        description: 'Weekly team sync meeting',
        status: 'completed',
        priority: 'medium',
        dueDate: '2024-01-12',
        createdAt: new Date('2024-01-08')
      },
      {
        id: 3,
        title: 'Update documentation',
        description: 'Update API documentation for new features',
        status: 'pending',
        priority: 'low',
        dueDate: '2024-01-20',
        createdAt: new Date('2024-01-09')
      }
    ];
    setTasks(sampleTasks);
    setFilteredTasks(sampleTasks);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.priority.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchTerm, tasks]);

  const handleLogout = () => {
    logout();
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const task = {
      id: Date.now(),
      ...newTask,
      status: 'pending',
      createdAt: new Date()
    };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowAddTask(false);
    
    if (notificationsEnabled) {
      showNotification('Task Added', `"${task.title}" has been added to your tasks`);
    }
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? { ...editingTask } : task
    );
    setTasks(updatedTasks);
    setEditingTask(null);
    
    if (notificationsEnabled) {
      showNotification('Task Updated', `"${editingTask.title}" has been updated`);
    }
  };

  const handleDeleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    if (notificationsEnabled) {
      showNotification('Task Deleted', `"${task.title}" has been removed`);
    }
  };

  const handleToggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        if (notificationsEnabled) {
          showNotification(
            `Task ${newStatus === 'completed' ? 'Completed' : 'Reopened'}`,
            `"${task.title}" has been marked as ${newStatus}`
          );
        }
        return { ...task, status: newStatus };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const toggleNotifications = () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    localStorage.setItem('notifications', newStatus);
    
    if (newStatus) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showNotification('Notifications Enabled', 'You will now receive task notifications');
          }
        });
      } else if (Notification.permission === 'granted') {
        showNotification('Notifications Enabled', 'You will now receive task notifications');
      }
    } else {
      showNotification('Notifications Disabled', 'You will no longer receive task notifications');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setProfilePicture(imageUrl);
        localStorage.setItem('profilePicture', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const showNotification = (title, message) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/vite.svg',
        badge: '/vite.svg'
      });
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => 
      task.status === 'pending' && 
      new Date(task.dueDate) < new Date() &&
      task.dueDate
    ).length
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark-mode' : 'gradient-bg-light'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckSquare className="text-white" size={24} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gradient'}`}>
                  TaskFlow
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Productivity reimagined
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`search-input ${darkMode ? 'dark-input' : ''}`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notification Button */}
              <button 
                onClick={toggleNotifications}
                className={`p-2 rounded-xl transition-colors ${
                  notificationsEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : `${darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }`}
                title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
              >
                <Bell size={20} />
              </button>

              {/* Settings Button */}
              <button 
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Settings"
              >
                <Settings size={20} />
              </button>
              
              {/* User Profile */}
              <div className={`flex items-center space-x-3 rounded-xl p-2 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="relative">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="text-white" size={16} />
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {user?.username}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`btn flex items-center space-x-2 ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
                    : 'btn-secondary hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                } transition-all duration-200`}
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className={`card ${darkMode ? 'dark-card' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Hello, {user?.username}! 👋
              </h2>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                You have <span className="font-semibold text-blue-600">{stats.pending} tasks</span> to complete. 
                {searchTerm && <span> Found {filteredTasks.length} matching tasks.</span>}
              </p>
            </div>
            <button 
              onClick={() => setShowAddTask(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: CheckSquare, label: 'Total Tasks', value: stats.total, gradient: 'from-blue-500' },
            { icon: Calendar, label: 'Pending', value: stats.pending, gradient: 'from-yellow-500' },
            { icon: CheckSquare, label: 'Completed', value: stats.completed, gradient: 'from-green-500' },
            { icon: Calendar, label: 'Overdue', value: stats.overdue, gradient: 'from-red-500' }
          ].map((stat, index) => (
            <div key={index} className={`card ${darkMode ? 'dark-card' : ''} hover:transform hover:scale-105 transition-all duration-300`}>
              <div className={`w-16 h-16 rounded-2xl ${stat.gradient} flex items-center justify-center shadow-lg mb-4`}>
                <stat.icon className="text-white" size={32} />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {stat.label}
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tasks List */}
        <div className={`card ${darkMode ? 'dark-card' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Tasks {searchTerm && `(${filteredTasks.length} results)`}
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear search
              </button>
            )}
          </div>
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {searchTerm ? 'No tasks found matching your search.' : 'No tasks yet. Create your first task!'}
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : `border-gray-300 hover:border-green-500 ${darkMode ? 'border-gray-500' : ''}`
                      }`}
                    >
                      {task.status === 'completed' && <CheckSquare size={14} />}
                    </button>
                    <div>
                      <h4 className={`font-semibold ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : darkMode 
                            ? 'text-white' 
                            : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        } ${darkMode ? 'bg-opacity-20' : ''}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-blue-400 hover:bg-gray-600' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit Task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-red-400 hover:bg-gray-600' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md ${darkMode ? 'dark-card' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Add New Task
              </h3>
              <button
                onClick={() => setShowAddTask(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={`input resize-none ${darkMode ? 'dark-input' : ''}`}
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className={`btn flex-1 ${
                    darkMode 
                      ? 'bg-gray-600 text-white hover:bg-gray-500' 
                      : 'btn-secondary'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md ${darkMode ? 'dark-card' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Edit Task
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className={`input resize-none ${darkMode ? 'dark-input' : ''}`}
                  rows="3"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                  className={`input ${darkMode ? 'dark-input' : ''}`}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className={`btn flex-1 ${
                    darkMode 
                      ? 'bg-gray-600 text-white hover:bg-gray-500' 
                      : 'btn-secondary'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md ${darkMode ? 'dark-card' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Profile Picture
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="text-white" size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="profile-upload"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="btn btn-secondary flex items-center space-x-2 cursor-pointer"
                    >
                      <Upload size={16} />
                      <span>{profilePicture ? 'Change' : 'Upload'} Photo</span>
                    </label>
                    {profilePicture && (
                      <button
                        onClick={() => {
                          setProfilePicture(null);
                          localStorage.removeItem('profilePicture');
                        }}
                        className="text-sm text-red-600 hover:text-red-700 mt-2"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Appearance
                </h4>
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Dark Mode
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                    </p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      darkMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                      darkMode ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Notifications
                </h4>
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Push Notifications
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Get notified about task updates
                    </p>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                      notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Account Settings */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Account
                </h4>
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Username
                    </p>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {user?.username}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Email
                    </p>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn btn-primary w-full"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;