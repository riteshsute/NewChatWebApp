
const Group = require('../model/group');
const User = require('../model/userDb');
const userMessage = require('../model/messageDb');

exports.createGroup = async (req, res) => {
  const { name, userIds } = req.body;

  try {
    const group = await Group.create({ name });

    const users = await User.findAll({
      where: {
        id: userIds,
      },
    });
    await group.addUsers(users);

    res.status(201).json({ success: true, message: 'Group created successfully', groupId: group.id });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.displayGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    console.error("Error fetching group list:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.addUserToGroup = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    if (!group || !user) {
      return res.status(404).json({ error: 'Group or user not found' });
    }

    await group.addUser(user);

    res.json({ success: true, message: 'User added to group successfully' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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


exports.getMessagesForGroup = async (req, res) => {
  const { groupId, userId, lastMessageId } = req.query;

  console.log(groupId, userId, lastMessageId, ' in the group msg back');
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const messages = await userMessage.findAll({ where: { groupId } });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};




