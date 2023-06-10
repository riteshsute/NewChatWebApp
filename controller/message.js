// const { userInfo } = require('os');
const { Op } = require('sequelize');
const Message = require('../model/messageDb');
const User = require('../model/userDb');
const Group = require('../model/group');
// const userGroup = require('../model/userGroup');

exports.getUsers = (req, res) => {
  User.findAll({
    attributes: ['id', 'name', 'isLoggedIn'] // Include the 'id' and 'isLoggedIn' attributes
  })
    .then(users => {
      res.json(users);
    })
    .catch(error => {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: 'Internal server error' });
    });
}; 

exports.sendMessage = async (req, res) => {
    try {
    const { userId, message } = req.body;
    console.log(userId, 'j22222')

    const sender = await User.findByPk(userId)
    console.log(sender.name, ' 100001 in the newmessage')
    if (sender) {
      const newMessage = {
        message, 
      };
      // console.log(newMessage, ' in the newmessage')

      await Message.create({ userId, message });
      res.status(200).json({ success: true, message: 'Chat message stored successfully' });
       } 
    }catch (error) {
      console.error('Error storing chat message:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };
   
  exports.sendGroupMessage = async (req, res) => {
    try {
      const { userId, groupId, message } = req.body;

      console.log(groupId, userId, 'jbdkjbdkdgkdgkgdd')
      const sender = await User.findByPk(userId);
      if (!sender) {
        return res.status(400).json({ success: false, error: 'User not found' });
      }
  
      // const group = await Group.findByPk(groupId);
      // if (!group) {
      //   return res.status(400).json({ success: false, error: 'Group not found' });
      // }
  
      const newMessage = await Message.create({ userId, groupId, message });
  
      res.status(200).json({ success: true, newMessage, message: 'Group chat message stored successfully' });
    } catch (error) {
      console.error('Error storing group chat message:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };



  exports.getMessage = async (req, res) => {
    try {
      let groupId  =req.params.groupId
      const lastMessageId = req.query.lastMessageId || 0;
      const userId = req.query.userId;
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ success: false, error: 'user not found error' });
      }
  
      // let messages;
  
      if (groupId) {

        console.log(groupId, userId, 'hnalkanABSahs');
  
        const group = await Group.findByPk(groupId);
        if (!group) {
          return res.status(400).json({ success: false, error: 'group not found' });
        }

        const member = await group.hasUser(user);
  
        console.log(member, 'UUUUUUUUU');
  
        if (!member) {
          return res.status(401).json({ success: false, error: 'unauthorized' });
        }
        } else {
          groupId = null;
        }

      console.log( groupId,  'lsknklsndsad')
  
      const messages = await Message.findAll({
        attributes: ['id', 'message', 'userId', 'groupId'],
        where: {
          groupId: groupId,
          id: { [Op.gt]: lastMessageId },
        },
        include: [{ model: User, attributes: ['id', 'name'] }],
      });

      // console.log(messages, ' in the messages backend ')
      const formattedMessages = messages.map((message) => ({
        id: message.id,
        message: message.message, 
        userId: message.userId,
        sender: message.user.name,
      }));
  
      res.json(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  
  
  
  

exports.userDisconnect = (userId) => {
  User.findByPk(userId)
    .then(user => {
      if (user) {
        user.isLoggedIn = false;
        return user.save();
      }
    })
    .catch(error => {
      console.error('Error updating user status:', error);
    });
};







