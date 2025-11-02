import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faBullseye, faCalendar, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    focusGoal: '',
    category: '',
    agenda: '',
    scheduledAt: '',
    owner: currentUser || 'Anonymous',
    isLive: true
  });

  const categories = [
    'Study',
    'Work',
    'Focus',
    'Music',
    'Business',
    'Fitness',
    'Creative',
    'Technology',
    'Networking',
    'Language',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        // If scheduledAt provided and isLive false, keep it; otherwise null
        scheduledAt: formData.isLive ? null : formData.scheduledAt || null
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newRoom = await response.json();
        onCreateRoom(newRoom);
        onClose();
        setFormData({ name: '', focusGoal: '', category: '', agenda: '', scheduledAt: '', owner: currentUser || 'Anonymous', isLive: true });
      } else {
        const error = await response.json();
        alert(`Failed to create room: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'isLive') {
      const isLive = value === 'true';
      setFormData(prev => ({ ...prev, isLive }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl shadow-gray-900/20 dark:shadow-gray-950/50 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">Create Focus Room</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
              Room Type *
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <input
                  type="radio"
                  name="isLive"
                  value="true"
                  checked={formData.isLive === true}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-2"
                />
                Live now
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <input
                  type="radio"
                  name="isLive"
                  value="false"
                  checked={formData.isLive === false}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-2"
                />
                Schedule
              </label>
            </div>
          </div>

          {!formData.isLive && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
                Scheduled Time *
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faCalendar} 
                  className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm" 
                />
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required={!formData.isLive}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
              Room Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
              placeholder="Enter room name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
              Focus Goal *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faBullseye} 
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm" 
              />
              <input
                type="text"
                name="focusGoal"
                value={formData.focusGoal}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                placeholder="What will you focus on?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
              Agenda
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faFileAlt} 
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm" 
              />
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows="3"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all resize-none"
                placeholder="Describe the agenda or topics to cover"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-600/30 dark:hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
