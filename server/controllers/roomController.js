const Room = require('../models/Room')
const {v4:uuidv4 } = require('uuid')

const createRoom = async (req, res) => {
    const  { name, agenda, scheduledAt, focusGoal, category } = req.body;
    const code = uuidv4().slice(0, 6).toUpperCase();

    try {
        const room = await Room.create({ 
            code, 
            name, 
            agenda, 
            scheduledAt, 
            focusGoal, 
            category,
            isActive: true,
            participantCount: 0
        });
        res.status(200).json(room);
    } catch (e) {
        res.status(500).json({ error: "Failed to create room "} );
    }
};

const allRooms = async (req, res) => {
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
        
        // Increment participant count
        room.participantCount += 1;
        await room.save();
        
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

module.exports = { createRoom, allRooms, joinRoom, getRoomByCode };