const express = require('express');

const chatController = require('../controllers/chat');

const router = express.Router();

const authenticateMiddleware = require('../middleware/auth');

router.post('/send', authenticateMiddleware.authenticate, chatController.postMessage);

router.get('/messages/:groupId', chatController.getMessages);

module.exports = router;