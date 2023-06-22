const express = require('express');
const app = express();
const server = require('http').createServer(app);

const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs')
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initSocket } = require('./socket');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const accessLogStream = fs.createWriteStream(  
  path.join(__dirname, 'access.log'), 
  { flags: 'a' }  
);

const signupRoute = require('./route/userRoute');
const messageRoute = require('./route/messageRoute');
const groupRoute = require('./route/groupRoute')
const sequelize = require('./util/database');

app.use(morgan('combined', { stream: accessLogStream}))
app.use(helmet());
app.use('/ChatApp', signupRoute);
app.use('/ChatApp', messageRoute);
app.use('/ChatApp', groupRoute);

const Chats = require('./model/messageDb');
const User = require('./model/userDb');
const Group = require('./model/group');
const UserGroup = require('./model/userGroup');

User.hasMany(Chats);
Chats.belongsTo(User);
  
// User.belongsToMany(Group, { through: 'UserGroup' });
// Group.belongsToMany(User, { through: 'UserGroup' });

Chats.belongsTo(User); 

Group.hasMany(Chats, { foreignKey: 'groupId' });
Chats.belongsTo(Group, { foreignKey: 'groupId' });
 
  
sequelize
  // .sync({ force: true })
  .sync()  
  .then(() => {
    const socketServer = initSocket(server); 

    server.listen(4000, () => {
      console.log('Server is running on port 4000');
    });
  }) 
  .catch((err) => {
    console.error('Error starting server:', err);
  });  
