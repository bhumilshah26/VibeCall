const mongoose = require('mongoose')


const roomSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: String,
    agenda: String,
    scheduledAt: Date,
    createdAt: {
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);