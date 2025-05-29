const express = require('express')
const router = express.Router()
const { createRoom, allRooms } = require('../controllers/roomController')

router.post('/create', createRoom);
router.get('/', allRooms);

module.exports = router;