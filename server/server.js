const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const  { Server } = require('socket.io')
const helmet = require('helmet')
const compression = require('compression')

const roomRoutes = require('./routes/roomRoutes')
const userRoutes = require('./routes/userRoutes')
const socketHandler = require('./socket/index')
const { setIO } = require('./controllers/roomController')

dotenv.config();

app = express();
const server = http.createServer(app);
const io = new Server(server,  {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
        credentials: true
    }
});

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
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

mongoose.connect(process.env.MONGO_URI, {})
.then(() => {
    console.log('Mongo DB Connected');
    server.listen(process.env.PORT || 5000, () => {
        console.log(`server is running on port ${process.env.PORT || 5000}`);
    })
})
.catch(err => console.log("Unable to connect to the database: ", err));