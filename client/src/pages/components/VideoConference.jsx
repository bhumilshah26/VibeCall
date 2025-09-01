import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faMicrophone, 
  faVideo, 
  faClosedCaptioning,
  faLanguage,
  faTimes,
  faWindowMinimize,
  faWindowMaximize,
  faMicrophoneSlash,
  faVideoSlash,
  faExpand,
  faCompress
} from '@fortawesome/free-solid-svg-icons';
import webRTCService from '../../services/webRTC';

const MacOSButtons = ({ onClose }) => (
  <div className="flex gap-2">
    <button 
      onClick={onClose}
      className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group"
    >
      <FontAwesomeIcon 
        icon={faTimes} 
        className="text-[8px] text-transparent group-hover:text-red-800" 
      />
    </button>
    <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600">
      <FontAwesomeIcon icon={faWindowMinimize} className="hidden" />
    </button>
    <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600">
      <FontAwesomeIcon icon={faWindowMaximize} className="hidden" />
    </button>
  </div>
);

const VideoConference = ({ 
  selectedMeeting,
  onLeaveRequest,
  localVideoRef,
  streamRef,
  remoteStreams,
  isVideoOff,
  isMuted,
  handleToggleAudio,
  handleToggleVideo,
  isMaximized
}) => {
  const [showControls, setShowControls] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const meetingContainerRef = useRef(null);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await meetingContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={meetingContainerRef} className={`space-y-6 ${isFullscreen ? 'bg-gray-900 p-6' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <MacOSButtons onClose={onLeaveRequest} />
          <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedMeeting.name}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <FontAwesomeIcon icon={faUsers} />
            <span>{remoteStreams.size + 1} participants</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <FontAwesomeIcon 
              icon={isFullscreen ? faCompress : faExpand}
              className="text-white text-lg" 
            />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${isMaximized ? 'scale-100' : 'scale-90'} transition-transform`}>
        {/* Local Video */}
        <div className={`aspect-video rounded-lg overflow-hidden relative backdrop-blur-md bg-white/10 border border-white/20 ${
          isFullscreen ? 'hover:ring-2 hover:ring-blue-500 transition-all' : ''
        }`}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform"
            style={{ 
              transform: 'scaleX(-1)',
              display: isVideoOff ? 'none' : 'block'
            }}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <FontAwesomeIcon icon={faVideoSlash} className="text-4xl text-white" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              YOU
            </div>
            {isMuted && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                <FontAwesomeIcon icon={faMicrophoneSlash} />
              </div>
            )}
          </div>
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams).map(([participantId, stream]) => (
          <div
            key={participantId}
            className={`aspect-video rounded-lg overflow-hidden relative backdrop-blur-md bg-white/10 border border-white/20 ${
              isFullscreen ? 'hover:ring-2 hover:ring-blue-500 transition-all' : ''
            }`}
          >
            <video
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              ref={el => {
                if (el && el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.play().catch(e => console.error('Error playing remote video:', e));
                }
              }}
            />
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              LIVE
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      {showControls && (
        <div className={`fixed ${isFullscreen ? 'bottom-6 left-6 right-6' : 'bottom-0 left-0 right-0'} backdrop-blur-md bg-black/50 p-4 rounded-lg`}>
          <div className="max-w-screen-xl mx-auto flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={handleToggleAudio}
                className={`p-3 rounded-full ${
                  isMuted ? 'bg-red-500' : 'bg-white/20'
                } hover:bg-opacity-80 transition-colors`}
              >
                <FontAwesomeIcon 
                  icon={isMuted ? faMicrophoneSlash : faMicrophone} 
                  className="text-white" 
                />
              </button>
              <button
                onClick={handleToggleVideo}
                className={`p-3 rounded-full ${
                  isVideoOff ? 'bg-red-500' : 'bg-white/20'
                } hover:bg-opacity-80 transition-colors`}
              >
                <FontAwesomeIcon 
                  icon={isVideoOff ? faVideoSlash : faVideo} 
                  className="text-white" 
                />
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`p-3 rounded-full ${
                  showCaptions ? 'bg-blue-500' : 'bg-white/20'
                } hover:bg-opacity-80 transition-colors`}
              >
                <FontAwesomeIcon icon={faClosedCaptioning} className="text-white" />
              </button>
              <button className="p-3 rounded-full bg-white/20 hover:bg-opacity-80 transition-colors">
                <FontAwesomeIcon icon={faLanguage} className="text-white" />
              </button>
              <button
                onClick={onLeaveRequest}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Language Transcription */}
      {showCaptions && (
        <div className={`fixed ${isFullscreen ? 'bottom-32 left-6 right-6' : 'bottom-24 left-0 right-0'} backdrop-blur-md bg-black/30 text-white p-4 text-center rounded-lg`}>
          <p>Live captions will appear here...</p>
        </div>
      )}
    </div>
  );
};

export default VideoConference; 