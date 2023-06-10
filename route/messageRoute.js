const express = require('express');
const router = express.Router();

const MessageController = require('../controller/message');

router.post('/sendMessage', MessageController.sendMessage);
router.post('/sendGroupMessage', MessageController.sendGroupMessage);
router.get('/getUsers', MessageController.getUsers);
router.get('/getMessage/:groupId?', MessageController.getMessage);

module.exports = router; 
