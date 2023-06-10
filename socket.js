const socketio = require('socket.io');
const messageController = require('./controller/message');

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
      const userId = socket.userId;
      messageController.userDisconnect(userId);
    });

    socket.on('chatMessage', (data) => {
      console.log('Received chat message:', data);
      const { userId, message } = data;
      messageController.sendMessage({ userId, message });
    });
  });

  return io; // Return the Socket.IO instance
};

module.exports = {
  initSocket,
};
