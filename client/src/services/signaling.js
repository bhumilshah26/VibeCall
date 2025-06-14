import io from 'socket.io-client';
import webRTCService from './webRTC';

class SignalingService {
  constructor() {
    this.socket = null;
    this.roomId = null;
  }

  connect(serverUrl = process.env.SERVER_URL) {
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    // Handle incoming call requests
    this.socket.on('call-user', async ({ from, offer }) => {
      try {
        const answer = await webRTCService.handleIncomingCall(from, offer);
        this.socket.emit('make-answer', {
          answer,
          to: from,
        });
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    });

    // Handle call answers
    this.socket.on('answer-made', async ({ from, answer }) => {
      try {
        await webRTCService.handleAnswer(from, answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    // Handle ICE candidates
    this.socket.on('ice-candidate', async ({ from, candidate }) => {
      try {
        await webRTCService.addIceCandidate(from, candidate);
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    // Handle user joined
    this.socket.on('user-joined', ({ userId }) => {
      this.initiateCallToUser(userId);
    });

    // Handle user left
    this.socket.on('user-left', ({ userId }) => {
      webRTCService.handleParticipantDisconnect(userId);
    });

    // Set up WebRTC ice candidate handler
    webRTCService.onIceCandidate = (participantId, candidate) => {
      this.socket.emit('ice-candidate', {
        candidate,
        to: participantId,
      });
    };
  }

  async joinRoom(roomId) {
    if (!this.socket) {
      throw new Error('Socket connection not established');
    }

    this.roomId = roomId;
    this.socket.emit('join-room', { roomId });
  }

  async initiateCallToUser(userId) {
    try {
      const offer = await webRTCService.initiateCall(userId);
      this.socket.emit('call-user', {
        offer,
        to: userId,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
      this.roomId = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SignalingService(); 