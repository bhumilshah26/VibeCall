import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100 transition-colors">
      <Dashboard />
    </div>
  );
}

export default App;
