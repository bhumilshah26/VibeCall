import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  
  faPlus,
  faSignInAlt,
  faUser,
  faCog
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
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = 'User' + Math.random().toString(36).substr(2, 5);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All','Study','Work','Focus','Music','Business','Fitness','Creative','Technology','Language','Other'];
  const settingsButtonRef = useRef(null);
  const settingsMenuRef = useRef(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vc_theme_dark');
    if (stored === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  // Apply dark mode class on root and persist
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vc_theme_dark', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

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
      streamRef.current = localStream;
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
    webRTCService.toggleAudio(!newMuted);
  };

  const handleToggleVideo = useCallback(async () => {
    try {
      const newVideoState = !isVideoOff; // true means video will be turned off
      setIsVideoOff(newVideoState);

      // Toggle the actual outbound video so others stop seeing you
      webRTCService.toggleVideo(!newVideoState);

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

  // Close settings when clicking outside
  useEffect(() => {
    if (!showSettings) return;
    
    const handleClickOutside = (event) => {
      const settingsButton = settingsButtonRef.current;
      const settingsMenu = settingsMenuRef.current;
      
      if (settingsMenu && !settingsMenu.contains(event.target) && 
          settingsButton && !settingsButton.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSettings]);

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-4 sm:p-6 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {selectedMeeting ? selectedMeeting.name : 'Focus Rooms'}  
          </h2>
        </div>
        
        {!selectedMeeting && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center relative">
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              <span className="hidden sm:inline">Join Room</span>
              <span className="sm:hidden">Join</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white dark:bg-green-500 dark:text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="hidden sm:inline">Create Room</span>
              <span className="sm:hidden">Create</span>
            </button>
            <button
              onClick={() => setShowSettings(prev => !prev)}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              title="Settings"
              ref={settingsButtonRef}
            >
              <FontAwesomeIcon icon={faCog} className="text-gray-900 dark:text-gray-100" />
            </button>
            <button
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              title="Guest"
            >
              <FontAwesomeIcon icon={faUser} className="text-gray-900 dark:text-gray-100" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 backdrop-blur-md rounded-lg shadow-lg p-3 z-10 border border-black/10 dark:border-white/10"
                   ref={settingsMenuRef}>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Settings</div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
                  <button
                    onClick={() => setIsDarkMode(v => !v)}
                    className={`w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
                    title="Toggle dark mode"
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="py-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Filter by category</div>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
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
              <div className="text-gray-900 dark:text-gray-100 text-lg">Loading rooms...</div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-900 dark:text-gray-100 text-lg mb-4">No focus rooms available</div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first focus room to get started!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors flex items-center gap-2 mx-auto"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(selectedCategory === 'All' ? meetings : meetings.filter(m => m.category === selectedCategory)).map((meeting) => (
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
        message={`Are you sure you want to join ${meetingToJoin?.name}? This will activate your camera and microphone.`}
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