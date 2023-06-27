
const Group = require('../model/group');
const User = require('../model/userDb');
const userMessage = require('../model/messageDb');
const jwt = require('jsonwebtoken');
const Bcrypt = require('bcrypt');
const userGroup = require('../model/userGroup');
const { use } = require('../route/userRoute');


const createGroup = async (req, res) => {
  const { name, userIds, adminId } = req.body;

  try {
    const group = await Group.create({ name });
    
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


const displayGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error getting group list", error);
    res.status(500).json({ error: 'backend error in display group' });
  }
};


const addUserToGroup = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    if (!group || !user) {
      return res.status(404).json({ error: 'group or user not found' });
    }

    await group.addUser(user);

    res.status(200).json({ success: true, message: 'user  added to group' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ success: false, error: 'backend adding user to group error' });
  }
};


const getGroupMembers = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findByPk(groupId, {
      include: [{
        model: User,
        attributes: ['id', 'name'] 
      }]
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found'});
    }

    const groupMembers = group.users;

    res.status(200).json(groupMembers);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};





const searchUser = async (req, res) => {
  const { query, groupId } = req.query;

  try {
    const users = await User.findAll({ 
      where: { name: query }
    })


    const admin = await userGroup.findAll({
      where: { groupId: groupId }
    });

    const adminIds = admin.map(admin => admin.adminId);

    
    res.status(200).json({
      users, 
      adminIds
    });
  } catch (error) {
    console.error('errpr searching user:', error);
    res.status(500).json({ success: false, error: 'backend server error in searching user' });
  }
};



const addUserToGroupByAdmin = async (req, res) => {
  const { groupId, userId } = req.params;
  const currentUserId  = req.body.currentUserId;

  try {
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    const admin = await userGroup.findAll({
      where: { groupId: groupId }
    });


    if (!group || !user) {
      return res.status(404).json({ error: 'Group or user not found' });
    }

    const adminIds = admin.map(admin => admin.adminId);

    
    if (!adminIds.includes(currentUserId)) {
      return res.status(403).json({ error: 'Only the group admin can add users to the group' });
    }


    await userGroup.create({
      groupId: group.id,
      userId: user.id,
      adminId: currentUserId
    });

    res.status(201).json({ success: true, message: 'User added to the group', adminId: admin.adminId });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ success: false, error: 'Backend server error in adding user to group' });
  }
};


const makeMemberAdmin = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const { currentUserId } = req.body;

    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(memberId);

    const admin = await userGroup.findAll({
      where: { groupId: groupId }
    });

    const adminIds = admin.map(admin => admin.adminId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!adminIds.includes(currentUserId)) {
      return res.status(403).json({ error: 'Only the group admin can make members admin' });
    }
   

    const member = await userGroup.findOne({
      where: {
        groupId: group.id,
        userId: memberId,
      },
    }); 

    if (!member) {
      return res.status(404).json({ error: 'Member not found in the group' });
    }

    member.adminId = memberId;

    await member.save();

    res.status(200).json({ success: true, message: 'Member successfully made admin', adminId: memberId });
  } catch (error) {
    console.error('Error making member admin:', error);
    res.status(500).json({ success: false, error: 'Backend server error in making member admin' });
  }
};



const removeMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    const userGroupEntry = await userGroup.findByPk(memberId);

    if (!userGroupEntry) {
      return res.status(404).json({ error: 'UserGroup entry not found' });
    }

    await userGroupEntry.destroy();

    res.status(200).json({ success: true, message: 'Member removed from the group' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ success: false, error: 'Backend server error in removing member' });
  }
};



module.exports = {
  createGroup,
  displayGroups,
  addUserToGroup,
  getGroupMembers,
  searchUser,
  addUserToGroupByAdmin,
  makeMemberAdmin,
  removeMember
}




