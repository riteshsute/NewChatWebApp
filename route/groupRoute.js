const express = require('express');
const router = express.Router();

const GroupController = require('../controller/group');

router.post('/createGroup', GroupController.createGroup);
router.get('/displayGroups', GroupController.displayGroups)
router.get('/groupMembers/:groupId', GroupController.getGroupMembers);
router.get('/searchUser', GroupController.searchUser);
router.post('/addGroupMember/:groupId/:userId', GroupController.addUserToGroupByAdmin);
router.put('/makeAdmin/:groupId/:memberId', GroupController.makeMemberAdmin);
router.delete('/removeMember/:memberId', GroupController.removeMember);

module.exports = router;
