import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faVideo, 
  faPlus, 
  faTimes, 
  faBook, 
  faMusic, 
  faBriefcase, 
  faGlobe,
  faWindowMinimize,
  faWindowMaximize,
  faPen,
  faSignal,
  faMicrophone,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
// import { faBluetoothB } from '@fortawesome/free-brands-svg-icons';

const Sidebar = () => {
  const categories = [
    { id: 'study', name: 'Study', icon: faBook },
    { id: 'music', name: 'Music', icon: faMusic },
    { id: 'business', name: 'Business', icon: faBriefcase },
    { id: 'general', name: 'General Knowledge', icon: faGlobe },
  ];

  const [displayName, setDisplayName] = useState('Guest');
  const [avatarColor, setAvatarColor] = useState('#64748b');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [devices, setDevices] = useState({ audioInputs: [], audioOutputs: [], videoInputs: [], bluetooth: [] });
  const panelRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('vc_displayName');
    const savedColor = localStorage.getItem('vc_avatarColor');
    if (savedName) setDisplayName(savedName);
    if (savedColor) setAvatarColor(savedColor);
  }, []);

  const saveProfile = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarColor })
      });
      if (!res.ok) throw new Error('Failed to save profile');
      localStorage.setItem('vc_displayName', displayName);
      localStorage.setItem('vc_avatarColor', avatarColor);
      setIsEditingProfile(false);
    } catch (e) {
      alert('Could not save profile');
    }
  };

  const MacOSButtons = () => (
    <div className="flex gap-2 mb-4">
      <button className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600">
        <FontAwesomeIcon icon={faTimes} className="hidden" />
      </button>
      <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600">
        <FontAwesomeIcon icon={faWindowMinimize} className="hidden" />
      </button>
      <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600">
        <FontAwesomeIcon icon={faWindowMaximize} className="hidden" />
      </button>
    </div>
  );

  const openCreateRoom = () => {
    window.dispatchEvent(new Event('open-create-room'));
  };

  const refreshDevices = async (withPermission = false) => {
    try {
      let stream;
      if (withPermission) {
        // Request permission so device labels are visible
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      }
      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devs.filter(d => d.kind === 'audioinput');
      const audioOutputs = devs.filter(d => d.kind === 'audiooutput');
      const videoInputs = devs.filter(d => d.kind === 'videoinput');
      const bluetooth = devs.filter(d => (d.label || '').toLowerCase().includes('bluetooth'));
      setDevices({ audioInputs, audioOutputs, videoInputs, bluetooth });
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    } catch (e) {
      console.error('Device scan failed', e);
    }
  };

  useEffect(() => {
    function onDeviceChange() {
      if (isProfilePanelOpen) refreshDevices(false);
    }
    navigator.mediaDevices?.addEventListener('devicechange', onDeviceChange);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', onDeviceChange);
  }, [isProfilePanelOpen]);

  useEffect(() => {
    function onClickOutside(e) {
      if (isProfilePanelOpen && panelRef.current && !panelRef.current.contains(e.target)) {
        setIsProfilePanelOpen(false);
        setIsEditingProfile(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isProfilePanelOpen]);

  const toggleProfilePanel = async () => {
    const next = !isProfilePanelOpen;
    setIsProfilePanelOpen(next);
    if (next) {
      refreshDevices(false);
    }
  };

  return (
    <div className="sidebar h-screen bg-gray-900 text-white p-4 flex flex-col relative">
      <MacOSButtons />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">VibeCall</h1>
        <p className="text-gray-400 text-sm">Connect with like-minded people</p>
      </div>

      <div className="flex-grow">
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Join a Room</h2>
            <input
              type="text"
              placeholder="Enter room code"
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
            <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faVideo} />
              Join
            </button>
          </div>

          <button
            onClick={openCreateRoom}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create a Room
          </button>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Focus Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-3"
                >
                  <FontAwesomeIcon icon={category.icon} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button onClick={toggleProfilePanel} className="w-full text-left">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: avatarColor }}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate" title={displayName}>{displayName}</h3>
                <span className="text-xs text-gray-400">Profile</span>
              </div>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
        </button>

        {/* Profile Popover */}
        <div
          ref={panelRef}
          className={`absolute left-4 right-4 bottom-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 origin-bottom transform transition-all duration-200 ease-out ${isProfilePanelOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: avatarColor }} />
              <span className="font-medium">{displayName}</span>
            </div>
            <button className="text-gray-400 hover:text-white" onClick={() => setIsProfilePanelOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button onClick={() => setIsEditingProfile(v => !v)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FontAwesomeIcon icon={faPen} />
                Edit avatar/name
              </div>
              <p className="text-xs text-gray-400 mt-1">Customize how others see you</p>
            </button>
            <button onClick={() => refreshDevices(true)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FontAwesomeIcon icon={faSignal} />
                Scan devices
              </div>
              <p className="text-xs text-gray-400 mt-1">Refresh audio/video list</p>
            </button>
          </div>

          {/* Devices */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <FontAwesomeIcon icon={faMicrophone} /> Microphones
            </div>
            <ul className="text-sm text-gray-300 max-h-20 overflow-auto">
              {devices.audioInputs.length === 0 && <li className="text-gray-500">No inputs detected</li>}
              {devices.audioInputs.map(d => <li key={d.deviceId}>{d.label || 'Audio input'}</li>)}
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200 mt-2">
              <FontAwesomeIcon icon={faCamera} /> Cameras
            </div>
            <ul className="text-sm text-gray-300 max-h-20 overflow-auto">
              {devices.videoInputs.length === 0 && <li className="text-gray-500">No cameras detected</li>}
              {devices.videoInputs.map(d => <li key={d.deviceId}>{d.label || 'Video input'}</li>)}
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200 mt-2">
              {/* <FontAwesomeIcon icon={} /> Bluetooth */}
            </div>
            <ul className="text-sm text-gray-300 max-h-16 overflow-auto">
              {devices.bluetooth.length === 0 && <li className="text-gray-500">Not detected</li>}
              {devices.bluetooth.map(d => <li key={`${d.deviceId}-bt`}>{d.label}</li>)}
            </ul>
          </div>

          {/* Inline edit area */}
          {isEditingProfile && (
            <div className="border-t border-gray-700 pt-3 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 bg-gray-900 rounded px-3 py-2 text-white"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                />
                <input
                  type="color"
                  value={avatarColor}
                  onChange={(e) => setAvatarColor(e.target.value)}
                  className="w-10 h-10 p-0 border border-gray-700 rounded"
                  title="Avatar color"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveProfile} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Save</button>
                <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 