import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="flex min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <Dashboard />
    </div>
  );
}

export default App;
