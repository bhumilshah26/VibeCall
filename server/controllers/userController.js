const User = require('../models/User')

const upsertUser = async (req, res) => {
	try {
		const { displayName, avatarColor } = req.body;
		if (!displayName) return res.status(400).json({ error: 'displayName is required' });
		let user = await User.findOne({ displayName });
		if (!user) {
			user = await User.create({ displayName, avatarColor });
		} else {
			if (avatarColor) user.avatarColor = avatarColor;
			await user.save();
		}
		return res.status(200).json(user);
	} catch (e) {
		return res.status(500).json({ error: 'Failed to upsert user' });
	}
};

const getUser = async (req, res) => {
	try {
		const { displayName } = req.params;
		const user = await User.findOne({ displayName });
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.status(200).json(user);
	} catch (e) {
		return res.status(500).json({ error: 'Failed to get user' });
	}
};

module.exports = { upsertUser, getUser };
