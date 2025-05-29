const Room = require('../models/Room')
const {v4:uuidv4 } = require('uuid')

const createRoom = async (req, res) => {
    const  { name, agenda, scheduledAt } = req.body;
    const code = uuidv4().slice(0, 6).toUpperCase();

    try {
        const room = await Room.create({ code, name, agenda, scheduledAt});
        res.status(200).json(room);
    } catch (e) {
        res.status(500).json({ error: "Failed to create room "} );
    }
};

const allRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1} );
        res.status(200).json(rooms);
    } catch (e) {
        res.status(500).json({ error: "Cannot Fetch All Rooms "} );
    }
};


module.exports = { createRoom, allRooms };