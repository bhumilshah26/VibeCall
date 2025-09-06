import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faBullseye, 
  faCopy,
  faCalendar,
  faPlay,
  faClock,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';

const MeetingCard = ({ meeting, onJoinRequest, onActivateRoom }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(meeting.code);
  };

  const handleActivateRoom = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${meeting.code}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Room activated successfully');
        // The room will be updated via socket events
      } else {
        const error = await response.json();
        alert(`Failed to activate room: ${error.error}`);
      }
    } catch (error) {
      console.error('Error activating room:', error);
      alert('Failed to activate room. Please try again.');
    }
  };

  const isScheduledRoomReady = () => {
    if (meeting.isLive || !meeting.scheduledAt) return false;
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduledAt);
    return scheduledTime <= now;
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

  const canJoin = meeting.isLive === true;
  const canActivate = !meeting.isLive && isScheduledRoomReady();
  const accentColor = meeting.color || '#2563eb';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-80 flex flex-col">
      {/* Accent Bar */}
      <div style={{ backgroundColor: accentColor }} className="h-1 w-full" />

      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">
            {meeting.name}
          </h3>
          <div className="flex gap-2 flex-shrink-0 items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(meeting.category)}`}>
              {meeting.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${canJoin ? 'bg-green-100 text-green-800' : canActivate ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {canJoin ? 'Live' : canActivate ? 'Ready' : 'Scheduled'}
            </span>
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

      {/* Content - Scrollable area */}
      <div className="p-4 flex-1 overflow-y-auto">
        {/* Agenda */}
        {meeting.agenda && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {meeting.agenda}
            </p>
          </div>
        )}

        {/* Scheduled Time */}
        {!canJoin && meeting.scheduledAt && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <FontAwesomeIcon icon={faCalendar} className="flex-shrink-0" />
            <span className="truncate">{formatDate(meeting.scheduledAt)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="flex-shrink-0" />
            <span>{meeting.participantCount || 0} participants</span>
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at bottom */}
      <div className="p-4 flex-shrink-0">
        {canJoin ? (
          <button
            onClick={() => onJoinRequest(meeting)}
            style={{ backgroundColor: accentColor }}
            className="w-full text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 hover:opacity-95"
          >
            <FontAwesomeIcon icon={faPlay} />
            Join Room
          </button>
        ) : canActivate ? (
          <button
            onClick={handleActivateRoom}
            style={{ backgroundColor: accentColor }}
            className="w-full text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 hover:opacity-95"
          >
            <FontAwesomeIcon icon={faPlayCircle} />
            Activate Room
          </button>
        ) : (
          <button
            disabled
            className="w-full text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 bg-gray-400 cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faClock} />
            Scheduled
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingCard; 