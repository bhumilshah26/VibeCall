const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	displayName: { type: String, required: true },
	avatarColor: { type: String, default: '#64748b' },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
