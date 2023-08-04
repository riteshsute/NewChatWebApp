const express = require('express');

const fileController = require('../controllers/mediaFile');

const authenticateMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/file/:groupId',authenticateMiddleware.authenticate, fileController.postMediaFile)

module.exports = router;
