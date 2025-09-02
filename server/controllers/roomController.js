const Room = require('../models/Room')
const {v4:uuidv4 } = require('uuid')

let ioInstance = null;

const setIO = (io) => {
    ioInstance = io;
};

const emitRoomEvent = (event, data) => {
    if (ioInstance) {
        ioInstance.emit(event, data);
    }
};

const createRoom = async (req, res) => {
    const  { name, focusGoal, category, agenda, scheduledAt, owner, isLive, color } = req.body;
    const code = uuidv4().slice(0, 6).toUpperCase();

    try {
        const isScheduled = !!scheduledAt && !isLive;
        const room = await Room.create({ 
            code, 
            name, 
            focusGoal, 
            category,
            agenda, 
            scheduledAt: isScheduled ? scheduledAt : null,
            isLive: isLive === true && !isScheduled,
            isActive: true,
            participantCount: 0,
            owner: owner || 'Anonymous',
            color: color || '#2563eb'
        });
        
        // Emit room created event to all clients
        emitRoomEvent('room-created', room);
        
        res.status(200).json(room);
    } catch (e) {
        res.status(500).json({ error: "Failed to create room "} );
    }
};

const allRooms = async (_req, res) => {
    try {
        const rooms = await Room.find({ isActive: true }).sort({ createdAt: -1} );
        res.status(200).json(rooms);
    } catch (e) {
        res.status(500).json({ error: "Cannot Fetch All Rooms "} );
    }
};

const joinRoom = async (req, res) => {
    const { code } = req.params;
    
    try {
        const room = await Room.findOne({ code, isActive: true });
        if (!room) {
            return res.status(404).json({ error: "Room not found or inactive" });
        }
        if (!room.isLive) {
            return res.status(400).json({ error: "Room is scheduled and not live yet" });
        }
        
        room.participantCount += 1;
        await room.save();
        
        // Emit room updated event to all clients
        emitRoomEvent('room-updated', room);
        
        res.status(200).json(room);
    } catch (e) {
        res.status(500).json({ error: "Failed to join room" });
    }
};

const getRoomByCode = async (req, res) => {
    const { code } = req.params;
    
    try {
        const room = await Room.findOne({ code, isActive: true });
        if (!room) {
            return res.status(404).json({ error: "Room not found or inactive" });
        }
        
        res.status(200).json(room);
    } catch (e) {
        res.status(500).json({ error: "Failed to get room" });
    }
};

const leaveRoom = async (req, res) => {
    const { code } = req.params;
    
    try {
        const room = await Room.findOne({ code, isActive: true });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        if (room.participantCount > 0) {
            room.participantCount -= 1;
            await room.save();
            
            // Emit room updated event to all clients
            emitRoomEvent('room-updated', room);
        }
        
        res.status(200).json({ message: "Left room successfully" });
    } catch (e) {
        res.status(500).json({ error: "Failed to leave room" });
    }
};

module.exports = { 
    createRoom, 
    allRooms, 
    joinRoom, 
    getRoomByCode, 
    leaveRoom,
    setIO
};