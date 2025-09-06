class WebRTCService {
  constructor() {
    this.peerConnections = new Map(); // Store peer connections
    this.localStream = null;
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onStreamReceived = null;
    this.videoTrack = null;
    this.audioTrack = null;
    this.onIceCandidate = null;

    // Traversal Using Relays around NAT (TURN Servers)
    const turnUrl = process.env.REACT_APP_TURN_URL;
    const turnUser = process.env.REACT_APP_TURN_USERNAME;
    const turnPass = process.env.REACT_APP_TURN_CREDENTIAL;

    this.configuration = {
      iceServers: [
        
        // Session Traversal Utilities for NAT (STUN)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        
        // Additional STUN servers for better connectivity
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stunserver.org' },

        ...(turnUrl && turnUser && turnPass
          ? [{
              urls: turnUrl,
              username: turnUser,
              credential: turnPass
            }]
          : [])
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all', // 'relay' used for enterprise security
      bundlePolicy: 'max-bundle', // use only one connection for all 3 (video, audio, chat) 
      rtcpMuxPolicy: 'require', // reduces extra ports/channels, all things in one (media and control info) 
    };
  }

  async requestMediaPermissions() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      // Store individual tracks
      this.videoTrack = this.localStream.getVideoTracks()[0];
      this.audioTrack = this.localStream.getAudioTracks()[0];

      this.audioTrack.enabled = false;
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createPeerConnection(participantId) {
    try {
      console.log('Creating peer connection for:', participantId);
      const peerConnection = new RTCPeerConnection(this.configuration);

      // Add local tracks to the peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
          console.log('Added track to peer connection:', track.kind);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated for:', participantId);
          // Send the ICE candidate to the other peer through your signaling server
          this.onIceCandidate?.(participantId, event.candidate);
        }
      };

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log('Received track from:', participantId, event.streams[0]);
        if (this.onStreamReceived) {
          this.onStreamReceived(participantId, event.streams[0]);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed for', participantId, ':', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected') {
          this.handleParticipantDisconnect(participantId);
        }
      };

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state for', participantId, ':', peerConnection.iceConnectionState);
      };

      this.peerConnections.set(participantId, peerConnection);
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  async handleIncomingCall(participantId, offer) {
    try {
      console.log('Handling incoming call from:', participantId);
      const peerConnection = await this.createPeerConnection(participantId);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log('Created answer for:', participantId);
      return answer;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  async initiateCall(participantId) {
    try {
      console.log('Initiating call to:', participantId);
      const peerConnection = await this.createPeerConnection(participantId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      console.log('Created offer for:', participantId);
      return offer;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  async handleAnswer(participantId, answer) {
    try {
      console.log('Handling answer from:', participantId);
      const peerConnection = this.peerConnections.get(participantId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Set remote description for:', participantId);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async addIceCandidate(participantId, candidate) {
    try {
      console.log('Adding ICE candidate for:', participantId);
      const peerConnection = this.peerConnections.get(participantId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added for:', participantId);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  handleParticipantDisconnect(participantId) {
    console.log('Participant disconnected:', participantId);
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
      this.onParticipantLeft?.(participantId);
    }
  }

  toggleVideo(enabled) {
    console.log('Toggling video:', enabled);
    if (this.videoTrack) {
      this.videoTrack.enabled = enabled;
      console.log('Video track enabled state:', this.videoTrack.enabled);
    }
    
    // Update video track in all peer connections
    this.peerConnections.forEach(pc => {
      const senders = pc.getSenders();
      const videoSender = senders.find(sender => 
        sender.track?.kind === 'video'
      );
      if (videoSender && this.videoTrack) {
        videoSender.track.enabled = enabled;
      }
    });

    return this.videoTrack?.enabled || false;
  }

  toggleAudio(enabled) {
    console.log('Toggling audio:', enabled);
    if (this.audioTrack) {
      this.audioTrack.enabled = enabled;
      console.log('Audio track enabled state:', this.audioTrack.enabled);
    }
    
    // Update audio track in all peer connections
    this.peerConnections.forEach(pc => {
      const senders = pc.getSenders();
      const audioSender = senders.find(sender => 
        sender.track?.kind === 'audio'
      );
      if (audioSender && this.audioTrack) {
        audioSender.track.enabled = enabled;
      }
    });

    return this.audioTrack?.enabled || false;
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
    }
    this.videoTrack = null;
    this.audioTrack = null;
    this.peerConnections.forEach(connection => connection.close());
    this.peerConnections.clear();
  }
}

export default new WebRTCService(); 