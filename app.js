
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const fs = require('fs')
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const cron = require('node-cron');

const app = express();
const server = require('http').createServer(app);

// app.use(cors());

const io = require('socket.io')(server,{
    cors: {
      origin: "*"
    }
});

app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const accessLogStream = fs.createWriteStream(  
  path.join(__dirname, 'access.log'), 
  { flags: 'a' }  
); 

const port = 3000

const sequelize = require('./util/database')

// models
const User = require('./models/user');
const Chats = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/userGroup');
const ArchivedChats = require('./models/archivedChat');

// routes
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');
const fileRoutes = require('./routes/file');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/user', userRoutes);
app.use('/chats', chatRoutes);
app.use('/group', groupRoutes);
app.use('/files', upload.single('userFile'),fileRoutes);

// User and textMessages relation
User.hasMany(Chats);
Chats.belongsTo(User);

// Group and textMessages relation
Group.hasMany(Chats);
Chats.belongsTo(Group);

// Users and Groups relation
User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

// Users and archived chats relation
User.hasMany(ArchivedChats);
// Groups and archied chats relation
Group.hasMany(ArchivedChats);

// Socket io
io.on("connect", (socket) => {

    socket.on('user', () => {
        console.log(`user is connected`);
    })

    socket.on('joined-group', group => {
         socket.join(group);
    })

    socket.on('send-message', message => {
        socket.to(message.groupId).emit('received-message', message);
    })

    socket.on('disconnect', () => {
        console.log(`user is disconnected`);
    })
});

// cron job
cron.schedule('0 0 * * *', async () => {
    //running every day 
    try{
        const chats = await Chats.findAll();

        for(let chat of chats) {
            await ArchivedChats.create({ message: chat.textmessage, sender: chat.name, groupId: chat.groupId, 
            userId: chat.userId });
            console.log('old chats are stored to archieved table');
            await Chats.destroy({ where:{id:chat.id} });
            console.log('chats in the chats table are deleted');
        }
    } catch(err) {
        console.log(err);
    }
})

sequelize
// .sync({ force: true })
.sync()
.then(() => {
    server.listen(port);
    console.log('server is running');
}).catch(err => {
    console.log(err);
})