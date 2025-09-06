const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const  { Server } = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');

const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const socketHandler = require('./socket/index');
const { setIO } = require('./controllers/roomController');
const Room = require('./models/Room');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
        credentials: true,
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
});

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(compression());

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);

socketHandler(io);

setIO(io);

// Function to check and activate scheduled rooms
const checkScheduledRooms = async () => {
    try {
        const now = new Date();
        const roomsToActivate = await Room.find({
            isActive: true,
            isLive: false,
            scheduledAt: { $lte: now }
        });

        for (const room of roomsToActivate) {
            room.isLive = true;
            await room.save();
            io.emit('room-updated', room);
            console.log(`Auto-activated scheduled room: ${room.name} (${room.code})`);
        }
    } catch (error) {
        console.error('Error checking scheduled rooms:', error);
    }
};

// Check for scheduled rooms every minute
setInterval(checkScheduledRooms, 60000);

mongoose.connect(process.env.MONGO_URI, {})
.then(() => {
    console.log('Mongo DB Connected');
    server.listen(process.env.PORT || 5000, () => {
        console.log(`server is running on port ${process.env.PORT}`);
    });
})
.catch(err => console.log("Unable to connect to the database: ", err));