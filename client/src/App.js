import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './pages/components/Sidebar';
import Dashboard from './pages/Dashboard';

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault(); // Prevent default browser behavior
        setIsSidebarVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900">
      {isSidebarVisible && <Sidebar />}
      <Dashboard />
    </div>
  );
}

export default App;
