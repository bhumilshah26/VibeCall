import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  faCompress,
  faPlus,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import webRTCService from '../services/webRTC';
import signalingService from '../services/signaling';
import VideoConference from './components/VideoConference';
import MeetingCard from './components/MeetingCard';
import ConfirmationDialog from './components/ConfirmationDialog';
import CreateRoomModal from './components/CreateRoomModal';
import JoinRoomModal from './components/JoinRoomModal';

const Dashboard = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const localStreamRef = useRef(null);
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [meetingToJoin, setMeetingToJoin] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const meetingContainerRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('User' + Math.random().toString(36).substr(2, 5));

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms`);
      if (response.ok) {
        const rooms = await response.json();
        setMeetings(rooms);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Keep ref in sync with latest localStream
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Connect signaling once on mount; cleanup on unmount only
  useEffect(() => {
    // Connect to signaling server
    signalingService.connect();

    // Set up real-time room update handlers
    signalingService.onRoomCreated = (newRoom) => {
      setMeetings(prev => [newRoom, ...prev]);
    };

    signalingService.onRoomUpdated = (updatedRoom) => {
      setMeetings(prev => prev.map(room => 
        room.code === updatedRoom.code ? updatedRoom : room
      ));
    };

    // Cleanup only on unmount
    return () => {
      if (localStreamRef.current) {
        webRTCService.cleanup();
      }
      signalingService.disconnect();
    };
  }, []);

  const handleStreamReceived = (participantId, stream) => {
    console.log('Received stream from participant:', participantId);
    setRemoteStreams(prev => new Map(prev).set(participantId, stream));
  };

  // Add useEffect to handle local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('Setting local stream to video element');
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const initializeMedia = async () => {
    try {
      const stream = await webRTCService.requestMediaPermissions();
      if (stream) {
        console.log('Got media stream:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
        setLocalStream(stream);
        setPermissionsGranted(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch(e => console.error('Error playing video:', e));
        }
      }

      // Set up WebRTC event handlers
      webRTCService.onStreamReceived = handleStreamReceived;
      webRTCService.onParticipantLeft = (participantId) => {
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(participantId);
          return newStreams;
        });
      };
    } catch (error) {
      console.error('Error initializing media:', error);
      setPermissionsGranted(false);
    }
  };

  const handleJoinRequest = (meeting) => {
    setMeetingToJoin(meeting);
    setShowJoinConfirmation(true);
  };

  const handleJoinConfirmed = async () => {
    try {
      if (!permissionsGranted) {
        await initializeMedia();
      }
      const savedName = localStorage.getItem('vc_displayName');
      const joinName = savedName || currentUser;
      
      console.log('Joining room:', meetingToJoin.code, 'as:', joinName);
      
      await signalingService.joinRoom(meetingToJoin.code, joinName);
      setSelectedMeeting(meetingToJoin);
      setShowJoinConfirmation(false);
      setMeetingToJoin(null);
      
      console.log('Successfully joined room:', meetingToJoin.code);
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting. Please try again.');
    }
  };

  const handleLeaveRequest = () => {
    setShowLeaveConfirmation(true);
  };

  const handleLeaveConfirmed = async () => {
    try {
      // Notify server that user is leaving
      if (selectedMeeting) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${selectedMeeting.code}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
    signalingService.leaveRoom();
    webRTCService.cleanup();
    setLocalStream(null);
    setRemoteStreams(new Map());
    setSelectedMeeting(null);
    setPermissionsGranted(false);
    setShowLeaveConfirmation(false);
    
    // Refresh rooms list
    fetchRooms();
  };

  const handleToggleAudio = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    webRTCService.toggleAudio(newMuted);
  };

  const handleToggleVideo = useCallback(async () => {
    try {
      const newVideoState = !isVideoOff;
      const trackEnabled = webRTCService.toggleVideo(!newVideoState);
      setIsVideoOff(newVideoState);

      if (localVideoRef.current && streamRef.current) {
        if (!newVideoState) {
          localVideoRef.current.srcObject = streamRef.current;
          localVideoRef.current.style.display = 'block';
          await localVideoRef.current.play().catch(e => console.error('Error playing video:', e));
        } else {
          localVideoRef.current.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }, [isVideoOff]);

  const handleCreateRoom = (newRoom) => {
    // Room will be added via real-time update from socket
    console.log('Room created:', newRoom);
  };

  const handleJoinRoom = (room) => {
    setMeetingToJoin(room);
    setShowJoinConfirmation(true);
  };



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
      <button 
        onClick={() => setIsMaximized(false)}
        className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center group"
      >
        <FontAwesomeIcon 
          icon={faWindowMinimize} 
          className="text-[8px] text-transparent group-hover:text-yellow-800"
        />
      </button>
      <button 
        onClick={() => setIsMaximized(true)}
        className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center group"
      >
        <FontAwesomeIcon 
          icon={faWindowMaximize} 
          className="text-[8px] text-transparent group-hover:text-green-800"
        />
      </button>
    </div>
  );

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

  useEffect(() => {
    const openCreate = () => setShowCreateModal(true);
    window.addEventListener('open-create-room', openCreate);
    return () => window.removeEventListener('open-create-room', openCreate);
  }, []);

  const VideoGrid = () => (
    <div ref={meetingContainerRef} className={`space-y-6 ${isFullscreen ? 'bg-gray-900 p-6' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MacOSButtons onClose={handleLeaveRequest} />
          <h2 className="text-2xl font-bold text-white">{selectedMeeting.name}</h2>
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
            {/* Ensure remote audio is played */}
            <audio
              autoPlay
              ref={el => {
                if (el && el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.play().catch(e => console.error('Error playing remote audio:', e));
                }
              }}
            />
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              LIVE
              </div>
            </div>
          ))}

        {/* Empty slots for grid */}
        {Array.from({ length: Math.max(0, 6 - remoteStreams.size - 1) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-video rounded-lg overflow-hidden relative backdrop-blur-md bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <div className="text-white/30 text-center">
              <FontAwesomeIcon icon={faUsers} className="text-2xl mb-2" />
              <p className="text-sm">Waiting for participants...</p>
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
                onClick={handleLeaveRequest}
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

  return (
    <div className="flex-1 bg-gray-900 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {selectedMeeting ? 'Current Session' : 'Focus Rooms'}
          </h2>
        </div>
        
        {!selectedMeeting && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              <span className="hidden sm:inline">Join Room</span>
              <span className="sm:hidden">Join</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="hidden sm:inline">Create Room</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        )}
      </div>

      {selectedMeeting ? (
        <VideoConference
          selectedMeeting={selectedMeeting}
          onLeaveRequest={handleLeaveRequest}
          localVideoRef={localVideoRef}
          streamRef={streamRef}
          remoteStreams={remoteStreams}
          isVideoOff={isVideoOff}
          isMuted={isMuted}
          handleToggleAudio={handleToggleAudio}
          handleToggleVideo={handleToggleVideo}
          isMaximized={isMaximized}
        />
      ) : (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-lg">Loading rooms...</div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white text-lg mb-4">No focus rooms available</div>
              <p className="text-gray-400 mb-6">Create your first focus room to get started!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {meetings.map((meeting) => (
                <MeetingCard 
                  key={meeting._id || meeting.id} 
                  meeting={meeting} 
                  onJoinRequest={handleJoinRequest}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Join Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showJoinConfirmation}
        onClose={() => {
          setShowJoinConfirmation(false);
          setMeetingToJoin(null);
        }}
        onConfirm={handleJoinConfirmed}
        title="Join Focus Room"
        message={`Are you sure you want to join "${meetingToJoin?.name}"? This will activate your camera and microphone.`}
        confirmText="Join"
        cancelText="Cancel"
      />

      {/* Leave Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLeaveConfirmation}
        onClose={() => setShowLeaveConfirmation(false)}
        onConfirm={handleLeaveConfirmed}
        title="Leave Meeting"
        message="Are you sure you want to leave this meeting? Your connection will be terminated."
        confirmText="Leave"
        cancelText="Stay"
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        currentUser={currentUser}
      />

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
};

export default Dashboard; 