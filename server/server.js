const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const  { Server } = require('socket.io')

const roomRoutes = require('./routes/roomRoutes')
const socketHandler = require('./socket/index')

dotenv.config();

app = express();
const server = http.createServer(app);
const io = new Server(server,  {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomRoutes);

// function to handle the actual socket 
socketHandler(io);

// function to connect to the database
mongoose.connect(process.env.MONGO_URI, {})
.then(() => {
    console.log('Mongo DB Connected');
    server.listen(process.env.PORT, () => {
        console.log(`server is running on port ${process.env.PORT}`);
    })
})
.catch(err => console.log("Unable to connect to the database: ", err));