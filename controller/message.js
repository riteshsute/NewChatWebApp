const { Op } = require('sequelize');
const Message = require('../model/messageDb');
const User = require('../model/userDb');
const Group = require('../model/group');
const { uploadFileToS3 } = require('../services/S3Services');



const getUsers = async (req, res) => {
  // console.log(req, ' kndddjaidj')
  try {
      const users = await User.findAll({
        where: {
          isLoggedIn: true
        }
      })
      // console.log(users, ' in getusers fun backend')
      res.status(200).json(users) 
  }
  catch(error) {
      console.error("error getting users:", error);
      res.status(500).json({ success: false, error: 'getUser error' });
    }
  } 
  

const sendMessage = async (req, res ) => {
  try {
    const { userId, message, fileUrl } = req.body;

    console.log( req.body, 'in the body ')

    const sender = await User.findByPk(userId);

    if (sender) {
      if (fileUrl) {
        const fileData = Buffer.from(fileUrl, 'base64');
        const fileName = `message_${Date.now()}`;
      
        const s3fileUrl = await uploadFileToS3(fileData, fileName);
        console.log('File uploaded to S3:', s3fileUrl);
      
        const newMessage = {
          userId,
          fileUrl: s3fileUrl,
          message: null,
        };

        console.log(newMessage, 'jokokokkok')
      
        await Message.create(newMessage);
      } else {
        await Message.create({ userId, message, fileUrl: null });
      }

      res.status(200).json({ success: true, message: 'Message stored in the database' });
    } else {
      res.status(400).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.log('Error storing message:', error);
    res.status(500).json({ success: false, error: 'Backend server error' });
  }
};

   
  const sendGroupMessage = async (req, res) => {
    try {
      const { userId, groupId, message } = req.body;

      const sender = await User.findByPk(userId);
      if (!sender) {
        return res.status(400).json({ success: false, error: 'user not found' });
      }
  
      // const group = await Group.findByPk(groupId);
      // if (!group) {
      //   return res.status(400).json({ success: false, error: 'Group not found' });
      // }
  
      const newMessage = await Message.create({ userId, groupId, message });
  
      res.status(200).json({ success: true, newMessage, message: 'Group message stored in database' });
    } catch (error) {
      console.error('error storing group message:', error);
      res.status(500).json({ success: false, error: ' server error in group msg storing' });
    }
  };



  const getMessage = async (req, res) => {
    try {
      let groupId  =req.params.groupId
      const lastMessageId = req.query.lastMessageId || 0;
      const userId = req.query.userId;
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ success: false, error: 'user not found error' });
      }
  
  
      if (groupId) {
  
        const group = await Group.findByPk(groupId);
        if (!group) {
          return res.status(400).json({ success: false, error: 'group not found' });
        }

        const member = await group.hasUser(user);
  
        if (!member) {
          return res.status(401).json({ success: false, error: 'unauthorized' });
        }
        } else {
          groupId = null;
        }

      const messages = await Message.findAll({
        attributes: ['id', 'message', 'userId', 'groupId', 'fileUrl'],
        where: {
          groupId: groupId,
          id: { [Op.gt]: lastMessageId },
        },
        include: [{ model: User, 
          attributes: ['id', 'name'] 
        }],
      });

      const formattedMessages = messages.map((message) => ({
        id: message.id,
        message: message.message, 
        userId: message.userId,
        sender: message.user.name,
        fileUrl: message.fileUrl
      })
    );

      // console.log(formattedMessages, 'josbjsbsvqsvqvwq  gws')
      res.json(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  module.exports = {
   getUsers,
   sendMessage,
   sendGroupMessage,
   getMessage,
  }
  






