
const Group = require('../model/group');
const User = require('../model/userDb');
const userMessage = require('../model/messageDb');
const jwt = require('jsonwebtoken');
const Bcrypt = require('bcrypt');
const userGroup = require('../model/userGroup')


exports.createGroup = async (req, res) => {
  const { name, userIds, adminId } = req.body;

  try {
    const group = await Group.create({ name });

    console.log(adminId, 'JJJJJJJJJJk') 
    
    for (const userId of userIds) {
      await userGroup.create({ groupId: group.id, userId: userId, adminId: adminId });
    }

    const users = await User.findAll({
      where: {
        id: userIds,
      },
    });

    await group.addUsers(users);


    res.status(201).json({ success: true, message: 'group created successfully', groupId: group.id });
  } catch (error) {
    console.error('Error In group:', error);
    res.status(500).json({ success: false, error: 'backend server error in creating group' });
  }
};


exports.displayGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    console.error("Error getting group list:", error);
    res.status(500).json({ error: 'backend error in display group' });
  }
};


exports.addUserToGroup = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    if (!group || !user) {
      return res.status(404).json({ error: 'group or user not found' });
    }

    await group.addUser(user);

    res.json({ success: true, message: 'user  added to group' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ success: false, error: 'backend adding user to group error' });
  }
};


exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findByPk(groupId, {
      include: [User],
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group.Users);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};





exports.searchUser = async (req, res) => {
  const { query, groupId } = req.query;

  console.log(req.query, 'check in backend ')
  try {
    const users = await User.findAll({ 
      where: { name: query }
    })

    // console.log( users, 'at admin in backend ')

    const admin = await userGroup.findByPk(groupId);

    const adminId = admin.adminId
    // const token2 = generateAccessToken(admin.adminId);
    res.json({
      users, 
      adminId
    });
  } catch (error) {
    console.error('errpr searching user:', error);
    res.status(500).json({ success: false, error: 'backend server error in searching user' });
  }
};



exports.addUserToGroupByAdmin = async (req, res) => {
  const { groupId, userId } = req.params;
  const currentUserId  = req.body.currentUserId;
  // const currentUserId
  console.log(req.params, currentUserId, req.body,  'youoyououououo')
  try {
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);
    const admin = await userGroup.findByPk(groupId);

    console.log(user.id, 'youoyououououo222222222')

    if (!group || !user) {
      return res.status(404).json({ error: 'Group or user not found' });
    }

    console.log(admin.adminId, '3333333333333')
    // Check if the current user is the admin of the group
    if (admin.adminId !== currentUserId) {
      return res.status(403).json({ error: 'Only the group admin can add users to the group' });
    }

    // await group.addUser(user);

    await userGroup.create({
      groupId: group.id,
      userId: user.id,
      adminId: currentUserId
    });

    res.json({ success: true, message: 'User added to the group', adminId: admin.adminId });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ success: false, error: 'Backend server error in adding user to group' });
  }
};




