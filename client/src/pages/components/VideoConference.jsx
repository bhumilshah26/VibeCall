import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faMicrophone, 
  faVideo, 
  faMicrophoneSlash,
  faVideoSlash,
  faExpand,
  faCompress,
  faPhoneSlash
} from '@fortawesome/free-solid-svg-icons';

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
    <div ref={meetingContainerRef} className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Top-Right overlay: participant count + fullscreen */}
      <div className="fixed top-6 right-6 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-50 text-sm px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg shadow-gray-900/10 dark:shadow-gray-950/50">
          <FontAwesomeIcon icon={faUsers} className="text-xs" />
          <span className="font-medium">{remoteStreams.size + 1} participant{remoteStreams.size !== 0 ? 's' : ''}</span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-lg shadow-gray-900/10 dark:shadow-gray-950/50 hover:shadow-xl"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-gray-900 dark:text-gray-50 text-sm" />
        </button>
      </div>

      {/* Video Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 p-6 lg:p-8 pt-20 ${isMaximized ? 'scale-100' : 'scale-100'} transition-all duration-500` }>
        {/* Local Video */}
        <div className={`group aspect-video rounded-2xl overflow-hidden relative bg-gray-900 dark:bg-gray-950 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/10 dark:shadow-gray-950/50 hover:shadow-2xl hover:shadow-gray-900/20 dark:hover:shadow-gray-950/80 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`}>
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 dark:bg-gray-900 rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-700 dark:bg-gray-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faVideoSlash} className="text-2xl text-gray-400 dark:text-gray-500" />
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">Camera Off</span>
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            {isMuted && (
              <div className="bg-red-600/90 dark:bg-red-500/90 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl border border-red-500/50 dark:border-red-400/50 shadow-lg">
                <FontAwesomeIcon icon={faMicrophoneSlash} />
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-4 bg-gray-900/80 dark:bg-gray-800/80 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl border border-gray-700/50 dark:border-gray-600/50 shadow-lg font-medium">
            You
          </div>
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams).map(([participantId, stream]) => (
          <div
            key={participantId}
            className={`group aspect-video rounded-2xl overflow-hidden relative bg-gray-900 dark:bg-gray-950 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/10 dark:shadow-gray-950/50 hover:shadow-2xl hover:shadow-gray-900/20 dark:hover:shadow-gray-950/80 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
          >
            <video
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              ref={el => {
                if (el && el.srcObject !== stream) {
                  el.srcObject = stream;
                  const vTrack = stream.getVideoTracks()[0];
                  if (vTrack) {
                    el.style.display = vTrack.enabled ? 'block' : 'none';
                    const handleMute = () => { el.style.display = 'none'; };
                    const handleUnmute = () => { el.style.display = 'block'; };
                    const handleEnded = () => { el.style.display = 'none'; };
                    vTrack.addEventListener('mute', handleMute);
                    vTrack.addEventListener('unmute', handleUnmute);
                    vTrack.addEventListener('ended', handleEnded);
                    el._cleanupTrackListeners = () => {
                      vTrack.removeEventListener('mute', handleMute);
                      vTrack.removeEventListener('unmute', handleUnmute);
                      vTrack.removeEventListener('ended', handleEnded);
                    };
                  }
                  el.play().catch(e => console.error('Error playing remote video:', e));
                } else if (el && el._cleanupTrackListeners) {
                  el._cleanupTrackListeners();
                  el._cleanupTrackListeners = null;
                }
              }}
            />
            <audio
              autoPlay
              ref={el => {
                if (el && el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.play().catch(e => console.error('Error playing remote audio:', e));
                }
              }}
            />
            <div className="absolute bottom-4 left-4 bg-gray-900/80 dark:bg-gray-800/80 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl border border-gray-700/50 dark:border-gray-600/50 shadow-lg font-medium">
              Participant
            </div>
          </div>
        ))}
      </div>

      {/* Unified Bottom Control Bar - centered */}
      {showControls && (
        <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-t border-gray-200/50 dark:border-gray-700/50 p-5 rounded-t-2xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-950/50`}>
          <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={handleToggleAudio}
              className={`p-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                isMuted 
                  ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400' 
                  : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} className="text-lg" />
            </button>
            <button
              onClick={handleToggleVideo}
              className={`p-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                isVideoOff 
                  ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400' 
                  : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={isVideoOff ? faVideoSlash : faVideo} className="text-lg" />
            </button>
            <button
              onClick={onLeaveRequest}
              title="End Call"
              className="p-4 rounded-xl bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 border border-red-500 dark:border-red-400 transition-all duration-200 shadow-lg shadow-red-600/20 dark:shadow-red-500/20 hover:shadow-xl hover:shadow-red-600/30 dark:hover:shadow-red-500/30 hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faPhoneSlash} className="text-white text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConference; 