class WebRTCService {
  constructor() {
    this.peerConnections = new Map(); // Store peer connections
    this.localStream = null;
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onStreamReceived = null;
    this.videoTrack = null;
    this.audioTrack = null;

    // STUN servers for NAT traversal
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }

  async requestMediaPermissions() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Store individual tracks
      this.videoTrack = this.localStream.getVideoTracks()[0];
      this.audioTrack = this.localStream.getAudioTracks()[0];

      console.log('Media permissions granted:', {
        videoTrack: this.videoTrack?.enabled,
        audioTrack: this.audioTrack?.enabled
      });

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createPeerConnection(participantId) {
    try {
      const peerConnection = new RTCPeerConnection(this.configuration);

      // Add local tracks to the peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send the ICE candidate to the other peer through your signaling server
          this.onIceCandidate?.(participantId, event.candidate);
        }
      };

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (this.onStreamReceived) {
          this.onStreamReceived(participantId, event.streams[0]);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected') {
          this.handleParticipantDisconnect(participantId);
        }
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
      const peerConnection = await this.createPeerConnection(participantId);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      return answer;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  async initiateCall(participantId) {
    try {
      const peerConnection = await this.createPeerConnection(participantId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      return offer;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  async handleAnswer(participantId, answer) {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async addIceCandidate(participantId, candidate) {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      throw error;
    }
  }

  handleParticipantDisconnect(participantId) {
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