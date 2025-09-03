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
    <div ref={meetingContainerRef}>
      {/* Top-Right overlay: participant count + fullscreen */}
      <div className="fixed top-5 right-3 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 text-white/90 text-sm px-3 py-1.5 rounded-full border border-white/20 bg-white/10">
          <FontAwesomeIcon icon={faUsers} />
          <span>{remoteStreams.size + 1} participant/s</span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-white" />
        </button>
      </div>

      {/* Video Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isMaximized ? 'scale-100' : 'scale-90'} transition-all duration-500` }>
        {/* Local Video */}
        <div className={`aspect-video rounded-2xl overflow-hidden relative backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/50 to-white/40 dark:from-white/15 dark:via-white/10 dark:to-white/5 border border-black/10 dark:border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 ${
          isFullscreen ? 'hover:ring-4 hover:ring-gray-400/50 hover:scale-105' : 'hover:scale-105'
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
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-gray-800/60 rounded-2xl">
              <FontAwesomeIcon icon={faVideoSlash} className="text-4xl text-white/80" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            {isMuted && (
              <div className="backdrop-blur-md bg-gradient-to-r from-gray-900/80 to-gray-700/80 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                <FontAwesomeIcon icon={faMicrophoneSlash} />
              </div>
            )}
          </div>
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams).map(([participantId, stream]) => (
          <div
            key={participantId}
            className={`aspect-video rounded-2xl overflow-hidden relative backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/50 to-white/40 dark:from-white/15 dark:via-white/10 dark:to-white/5 border border-black/10 dark:border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105`}
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
          </div>
        ))}
      </div>

      {/* Unified Bottom Control Bar - centered */}
      {showControls && (
        <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-2xl bg-gradient-to-r from-black/40 via-black/30 to-black/40 dark:from-black/50 dark:via-black/40 dark:to-black/50 border-t border-white/20 p-4 sm:p-5 rounded-t-2xl shadow-2xl`}>
          <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={handleToggleAudio}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 transition-colors"
            >
              <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} className="text-white text-lg" />
            </button>
            <button
              onClick={handleToggleVideo}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 transition-colors"
            >
              <FontAwesomeIcon icon={isVideoOff ? faVideoSlash : faVideo} className="text-white text-lg" />
            </button>
            <button
              onClick={onLeaveRequest}
              title="End Call"
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 border border-red-500/70 transition-colors shadow-lg"
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