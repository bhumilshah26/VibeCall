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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Create Focus Room</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="isLive"
                  value="true"
                  checked={formData.isLive === true}
                  onChange={handleChange}
                />
                Live now
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="isLive"
                  value="false"
                  checked={formData.isLive === false}
                  onChange={handleChange}
                />
                Schedule
              </label>
            </div>
          </div>

          {!formData.isLive && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Time *
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faCalendar} 
                  className="absolute left-3 top-3 text-gray-400" 
                />
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required={!formData.isLive}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter room name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Goal *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faBullseye} 
                className="absolute left-3 top-3 text-gray-400" 
              />
              <input
                type="text"
                name="focusGoal"
                value={formData.focusGoal}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What will you focus on?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faFileAlt} 
                className="absolute left-3 top-3 text-gray-400" 
              />
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows="3"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the agenda or topics to cover"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
