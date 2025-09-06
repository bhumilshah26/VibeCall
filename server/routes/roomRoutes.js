const express = require('express');
const router = express.Router();
const { createRoom, allRooms, joinRoom, getRoomByCode, leaveRoom, activateRoom } = require('../controllers/roomController');

router.post('/create', createRoom);
router.get('/', allRooms);
router.get('/join/:code', joinRoom);
router.get('/:code', getRoomByCode);
router.post('/:code/leave', leaveRoom);
router.post('/:code/activate', activateRoom);

module.exports = router;