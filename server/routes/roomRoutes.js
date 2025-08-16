const express = require('express')
const router = express.Router()
const { createRoom, allRooms, joinRoom, getRoomByCode, deleteRoom, leaveRoom } = require('../controllers/roomController')

router.post('/create', createRoom);
router.get('/', allRooms);
router.get('/join/:code', joinRoom);
router.get('/:code', getRoomByCode);
router.delete('/:code', deleteRoom);
router.post('/:code/leave', leaveRoom);

module.exports = router;