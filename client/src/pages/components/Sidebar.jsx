import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faVideo, 
  faPlus, 
  faTimes, 
  faBook, 
  faMusic, 
  faBriefcase, 
  faGlobe,
  faWindowMinimize,
  faWindowMaximize
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [agenda, setAgenda] = useState('');
  const [timing, setTiming] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'study', name: 'Study', icon: faBook },
    { id: 'music', name: 'Music', icon: faMusic },
    { id: 'business', name: 'Business', icon: faBriefcase },
    { id: 'general', name: 'General Knowledge', icon: faGlobe },
  ];

  const handleCreateRoom = (e) => {
    e.preventDefault();
    // Generate a unique room code for WebRTC connection
    const roomCode = Math.random().toString(36).substring(7);
    console.log({ roomName, agenda, timing, selectedCategory, roomCode });
    setShowCreateModal(false);
  };

  const MacOSButtons = () => (
    <div className="flex gap-2 mb-4">
      <button className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600">
        <FontAwesomeIcon icon={faTimes} className="hidden" />
      </button>
      <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600">
        <FontAwesomeIcon icon={faWindowMinimize} className="hidden" />
      </button>
      <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600">
        <FontAwesomeIcon icon={faWindowMaximize} className="hidden" />
      </button>
    </div>
  );

  return (
    <div className="sidebar h-screen bg-gray-900 text-white p-4 flex flex-col">
      <MacOSButtons />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">VibeCall</h1>
        <p className="text-gray-400 text-sm">Connect with like-minded people</p>
      </div>

      <div className="flex-grow">
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Join a Room</h2>
            <input
              type="text"
              placeholder="Enter room code"
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
            <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faVideo} />
              Join
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create a Room
          </button>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Focus Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-3"
                >
                  <FontAwesomeIcon icon={category.icon} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div>
            <h3 className="font-medium">User Details</h3>
            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 p-6 rounded-lg w-96 relative z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Room</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Agenda/Purpose</label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timing</label>
                <input
                  type="datetime-local"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 