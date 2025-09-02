const express = require('express');
const router = express.Router();
const { upsertUser, getUser } = require('../controllers/userController');

router.post('/', upsertUser);
router.get('/:displayName', getUser);

module.exports = router;
