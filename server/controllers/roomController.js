const Room = require('../models/Room')
const {v4:uuidv4 } = require('uuid')

const createRoom = async (req, res) => {
    const  { name, focusGoal, category, agenda, scheduledAt } = req.body;
    const code = uuidv4().slice(0, 6).toUpperCase();

    try {
        const room = await Room.create({ 
            code, 
            name, 
            focusGoal, 
            category,
            agenda, 
            scheduledAt, 
            isActive: true,
            participantCount: 0,
            owner: req.body.owner || 'Anonymous' // Add owner field
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

const deleteRoom = async (req, res) => {
    const { code } = req.params;
    
    try {
        const room = await Room.findOne({ code, isActive: true });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        // Soft delete - mark as inactive
        room.isActive = false;
        await room.save();
        
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete room" });
    }
};

const leaveRoom = async (req, res) => {
    const { code } = req.params;
    
    try {
        const room = await Room.findOne({ code, isActive: true });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        // Decrement participant count (ensure it doesn't go below 0)
        if (room.participantCount > 0) {
            room.participantCount -= 1;
            await room.save();
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
    deleteRoom, 
    leaveRoom 
};