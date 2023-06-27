
const socketio = require('socket.io');
const messageController = require('./controller/message');
const userController = require('./controller/user');
const { IoTSiteWise, IoTFleetWise } = require('aws-sdk');

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin:  '*',
      methods: ['GET','POST'],
      allowedHeaders: ['Content-Type'],
    },
  });


  io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('userConnect', (userId) => {
      console.log('User connected:', userId);
      socket.userId = userId;
      userController.userConnect(userId);
      const users = messageController.getUsers 

      console.log(users,  'User connected 1');
      // socket.emit('updateUserList', users);
    });
    
    socket.on('disconnect', () => { 
      console.log( 'User disconnected');
      const userId = socket.userId
      console.log(userId, 'in the disconnect event backend');
      userController.userDisconnect(userId);
      const users = messageController.getUsers;
      console.log(users,  'User disconnected 2');
      // socket.broadcast.emit('updateUserList', users);
    }); 

    socket.on('chatMessage', (messageObject) => {
      console.log(messageObject, 'Received chat message');
      const { userId, message, fileUrl } = messageObject;
      messageController.sendMessage({ userId, message, fileUrl });
      const newMessage = {
        sender: userController.getUserName(userId),
        message,
        fileUrl,
      };
      // socket.broadcast.emit('newMessage', newMessage); 
    });
  }); 
    
  return io; 

};

module.exports = {
  initSocket,
};
