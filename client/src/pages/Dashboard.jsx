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
  const [isDarkMode, setIsDarkMode] = useState(true);
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
    setRemoteStreams(prev => new Map(prev).set(participantId, stream));
  };

  // Add useEffect to handle local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
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
      
      
      await signalingService.joinRoom(meetingToJoin.code, joinName);
      setSelectedMeeting(meetingToJoin);
      setShowJoinConfirmation(false);
      setMeetingToJoin(null);
      
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
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-gray-50 tracking-tight">
              {selectedMeeting ? (
                <span className="font-medium">{selectedMeeting.name}</span>
              ) : (
                <>
                  <span className="font-medium">Focus</span>
                  <span className="text-gray-400 dark:text-gray-500">Rooms</span>
                </>
              )}
            </h1>
          </div>
          
          {!selectedMeeting && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center relative">
              <button
                onClick={() => setShowJoinModal(true)}
                className="group w-full sm:w-auto px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-600/30 dark:hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span className="hidden sm:inline">Join Room</span>
                <span className="sm:hidden">Join</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="group w-full sm:w-auto px-5 py-2.5 bg-slate-700 dark:bg-slate-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-slate-700/20 dark:shadow-slate-600/20 hover:shadow-xl hover:shadow-slate-700/30 dark:hover:shadow-slate-600/30 hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span className="hidden sm:inline">Create Room</span>
                <span className="sm:hidden">Create</span>
              </button>
              <button
                onClick={() => setShowSettings(prev => !prev)}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Settings"
                ref={settingsButtonRef}
              >
                <FontAwesomeIcon icon={faCog} className="text-gray-700 dark:text-gray-300 text-sm" />
              </button>
              <button
                className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Guest"
              >
                <FontAwesomeIcon icon={faUser} className="text-gray-700 dark:text-gray-300 text-sm" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-14 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/20 dark:shadow-gray-950/50 p-4 z-10 border border-gray-200/50 dark:border-gray-700/50"
                     ref={settingsMenuRef}>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider text-xs">Settings</div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
                    <button
                      onClick={() => setIsDarkMode(v => !v)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'}`}
                      title="Toggle dark mode"
                    >
                      <span className={`block w-5 h-5 bg-white dark:bg-gray-50 rounded-full transform transition-transform duration-300 shadow-lg ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="py-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Filter by category</div>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition-all"
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
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading rooms...</div>
              </div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <FontAwesomeIcon icon={faPlus} className="text-2xl text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-50 mb-2">No focus rooms available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Create your first focus room to get started with productive sessions!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="group px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 flex items-center gap-2 mx-auto font-medium shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-600/30 dark:hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
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
    </div>
  );
};

export default Dashboard; 