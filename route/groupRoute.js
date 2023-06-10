const express = require('express');
const router = express.Router();

const GroupController = require('../controller/group');

router.post('/createGroup', GroupController.createGroup);
router.get('/displayGroups', GroupController.displayGroups)
// router.get('/getMessagesForGroup', GroupController.getMessagesForGroup);



module.exports = router;
