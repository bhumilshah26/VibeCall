const express = require('express')
const router = express.Router()
const { createRoom, allRooms, joinRoom, getRoomByCode } = require('../controllers/roomController')

router.post('/create', createRoom);
router.get('/', allRooms);
router.get('/join/:code', joinRoom);
router.get('/:code', getRoomByCode);

module.exports = router;