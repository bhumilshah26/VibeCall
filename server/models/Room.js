const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    agenda: String,
    focusGoal: { type: String, required: true },
    category: { type: String, required: true },
    scheduledAt: Date,
    isActive: { type: Boolean, default: true },
    participantCount: { type: Number, default: 0 },
    createdAt: {
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);