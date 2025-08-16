# VibeCall - Focus Room Application

A real-time video conferencing application designed for focused collaboration and goal-oriented sessions. Users can create and join focus rooms to work together on shared objectives.

## Features

### 🎯 Focus Room Management
- **Create Focus Rooms**: Set up rooms with specific goals, categories, and agendas
- **Room Codes**: 6-character unique codes for easy room sharing
- **Categories**: Organize rooms by type (Study, Work, Music, Business, etc.)
- **Scheduling**: Optional scheduling for future sessions

### 🔗 Room Connection
- **Join by Code**: Enter room codes to join existing sessions
- **Dashboard View**: See all available rooms with real-time information
- **Participant Tracking**: Monitor who's in each room
- **Copy Room Codes**: Easy sharing with one-click copy functionality

### 📹 Video Conferencing
- **WebRTC Integration**: High-quality peer-to-peer video calls
- **Real-time Communication**: Audio, video, and screen sharing capabilities
- **Participant Management**: See all participants in a grid layout
- **Controls**: Mute/unmute, video on/off, and fullscreen options

### 🚀 Multi-Client Support
- **Multiple Users**: Join the same room from different devices/browsers
- **Real-time Updates**: Live participant count and status updates
- **Cross-Platform**: Works on any device with a modern web browser

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **MongoDB** with Mongoose for data persistence
- **WebRTC** for peer-to-peer video calls

### Frontend
- **React.js** with modern hooks
- **Tailwind CSS** for styling
- **FontAwesome** for icons
- **Socket.IO Client** for real-time updates

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/vibecall
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Usage

### Creating a Focus Room
1. Click "Create Room" on the dashboard
2. Fill in room details:
   - Room name
   - Focus goal
   - Category
   - Optional agenda and scheduling
3. Click "Create Room" to generate a unique room code

### Joining a Room
1. **From Dashboard**: Click "Join Room" on any available room card
2. **By Code**: Click "Join Room" button and enter the 6-digit room code
3. Grant camera and microphone permissions when prompted

### Sharing Room Access
- Copy the room code from the room card
- Share the code with others via any communication method
- Users can join using the "Join Room" feature and entering the code

### Testing Multiple Clients
1. Open the application in multiple browser tabs/windows
2. Join the same room using the room code
3. Verify that all participants can see and hear each other
4. Test different devices (desktop, mobile, tablet) for cross-platform compatibility

## API Endpoints

### Rooms
- `POST /api/rooms/create` - Create a new focus room
- `GET /api/rooms` - Get all available rooms
- `GET /api/rooms/join/:code` - Join a room by code
- `GET /api/rooms/:code` - Get room details by code

## Room Schema

```javascript
{
  code: String,           // 6-character unique room code
  name: String,           // Room name
  focusGoal: String,      // Primary objective of the room
  category: String,       // Room category (Study, Work, etc.)
  agenda: String,         // Optional agenda description
  scheduledAt: Date,      // Optional scheduled time
  isActive: Boolean,      // Room status
  participantCount: Number, // Current participant count
  createdAt: Date         // Creation timestamp
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on the GitHub repository.



