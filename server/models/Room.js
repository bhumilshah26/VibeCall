const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    agenda: String,
    focusGoal: { type: String, required: true },
    category: { type: String, required: true },
    scheduledAt: Date,
    isLive: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    participantCount: { type: Number, default: 0 },
    owner: { type: String, default: 'Anonymous' },
    color: { type: String, default: '#2563eb' },
    createdAt: {
        type:Date,
        default:Date.now,
    },
});

module.exports = mongoose.model('Room', roomSchema);