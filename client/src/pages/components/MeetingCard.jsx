import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers,
  faClock,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

const MeetingCard = ({ meeting, onJoinRequest }) => (
  <div
    onClick={() => meeting.isLive && onJoinRequest(meeting)}
    className={`
      relative overflow-hidden rounded-lg p-6 cursor-pointer
      backdrop-blur-md bg-white/10
      border border-white/20
      transform transition-all duration-300
      ${meeting.isLive ? 'hover:scale-105' : 'hover:bg-white/15'}
      group
    `}
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white group-hover:opacity-0 transition-opacity">{meeting.name}</h3>
        {meeting.isLive && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded group-hover:opacity-0 transition-opacity">LIVE</span>
        )}
      </div>
      
      <div className="text-gray-300 mb-2 group-hover:opacity-0 transition-opacity">{meeting.category}</div>
      
      {/* Hover Information */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {meeting.isLive ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xl">
              <FontAwesomeIcon icon={faUsers} className="text-blue-400" />
              <span className="text-white">{meeting.activePeople}</span>
            </div>
            <p className="text-gray-300 mt-2">{meeting.purpose}</p>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FontAwesomeIcon icon={faClock} className="text-yellow-400" />
              <span className="text-white">
                {new Date(meeting.scheduledTime).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} className="text-green-400" />
              <span className="text-white">{meeting.purpose}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MeetingCard; 