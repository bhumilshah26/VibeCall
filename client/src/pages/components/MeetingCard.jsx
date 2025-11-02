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
    const colorMap = {
      'Study': 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      'Work': 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      'Focus': 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      'Music': 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
      'Business': 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
      'Fitness': 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
      'Creative': 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
      'Technology': 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
      'Language': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      'Other': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
    };
    return colorMap[category] || colorMap['Other'];
  };

  const canJoin = meeting.isLive === true;
  const canActivate = !meeting.isLive && isScheduledRoomReady();
  const accentColor = meeting.color || '#2563eb';

  return (
    <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-gray-950/50 hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-gray-950/80 transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 line-clamp-2 flex-1 mr-2 tracking-tight">
            {meeting.name}
          </h3>
          <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryColor(meeting.category)}`}>
              {meeting.category}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              canJoin 
                ? 'bg-emerald-500 dark:bg-emerald-600 text-white' 
                : canActivate 
                  ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {canJoin ? 'Live' : canActivate ? 'Ready' : 'Scheduled'}
            </span>
          </div>
        </div>
        
        {/* Focus Goal */}
        <div className="flex items-start gap-2.5 mb-4">
          <FontAwesomeIcon icon={faBullseye} className="text-gray-600 dark:text-gray-400 mt-0.5 text-sm flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {meeting.focusGoal}
          </p>
        </div>

        {/* Room Code */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Room Code:</span>
            <span className="font-mono text-lg font-bold text-gray-900 dark:text-gray-50 tracking-wider truncate">
              {meeting.code}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex-shrink-0"
            title="Copy room code"
          >
            <FontAwesomeIcon icon={faCopy} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable area */}
      <div className="p-5 flex-1 overflow-y-auto">
        {/* Agenda */}
        {meeting.agenda && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {meeting.agenda}
            </p>
          </div>
        )}

        {/* Scheduled Time */}
        {!canJoin && meeting.scheduledAt && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <FontAwesomeIcon icon={faCalendar} className="flex-shrink-0 text-xs" />
            <span className="truncate">{formatDate(meeting.scheduledAt)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="flex-shrink-0 text-xs" />
            <span className="font-medium">{meeting.participantCount || 0} participants</span>
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at bottom */}
      <div className="p-5 pt-0 flex-shrink-0">
        {canJoin ? (
          <button
            onClick={() => onJoinRequest(meeting)}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-600/30 dark:hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <FontAwesomeIcon icon={faPlay} />
            Join Room
          </button>
        ) : canActivate ? (
          <button
            onClick={handleActivateRoom}
            className="w-full bg-slate-700 dark:bg-slate-600 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-slate-700/20 dark:shadow-slate-600/20 hover:shadow-xl hover:shadow-slate-700/30 dark:hover:shadow-slate-600/30 hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            <FontAwesomeIcon icon={faPlayCircle} />
            Activate Room
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-medium cursor-not-allowed"
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