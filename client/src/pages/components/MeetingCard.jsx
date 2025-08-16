import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faClock, 
  faBullseye, 
  faCopy,
  faCalendar,
  faPlay,
  faTrash,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

const MeetingCard = ({ meeting, onJoinRequest, onDeleteRoom, isOwner = false }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(meeting.code);
    // You could add a toast notification here
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${meeting.name}"? This action cannot be undone.`)) {
      onDeleteRoom(meeting.code);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Study': 'bg-blue-100 text-blue-800',
      'Work': 'bg-green-100 text-green-800',
      'Focus': 'bg-purple-100 text-purple-800',
      'Music': 'bg-purple-100 text-purple-800',
      'Business': 'bg-indigo-100 text-indigo-800',
      'Fitness': 'bg-red-100 text-red-800',
      'Creative': 'bg-pink-100 text-pink-800',
      'Technology': 'bg-gray-100 text-gray-800',
      'Language': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">
            {meeting.name}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(meeting.category)}`}>
              {meeting.category}
            </span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Delete room"
              >
                <FontAwesomeIcon icon={faTrash} className="text-sm" />
              </button>
            )}
          </div>
        </div>
        
        {/* Focus Goal */}
        <div className="flex items-start gap-2 mb-3">
          <FontAwesomeIcon icon={faBullseye} className="text-blue-500 mt-1 text-sm flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">
            {meeting.focusGoal}
          </p>
        </div>

        {/* Room Code */}
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Room Code:</span>
            <span className="font-mono text-lg font-bold text-gray-800 tracking-wider truncate">
              {meeting.code}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            title="Copy room code"
          >
            <FontAwesomeIcon icon={faCopy} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Agenda */}
        {meeting.agenda && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {meeting.agenda}
            </p>
          </div>
        )}

        {/* Scheduled Time */}
        {meeting.scheduledAt && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <FontAwesomeIcon icon={faCalendar} className="flex-shrink-0" />
            <span className="truncate">{formatDate(meeting.scheduledAt)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="flex-shrink-0" />
            <span>{meeting.participantCount || 0} participants</span>
          </div>
          {meeting.isLive && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live</span>
            </div>
          )}
        </div>

        {/* Join Button */}
        <button
          onClick={() => onJoinRequest(meeting)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlay} />
          {meeting.isLive ? 'Join Session' : 'Join Room'}
        </button>
      </div>
    </div>
  );
};

export default MeetingCard; 