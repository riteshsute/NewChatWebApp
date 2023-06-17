const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./userDb');
const Chats = require('./messageDb');

const Group = sequelize.define('group', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Group.belongsToMany(User, { through: 'UserGroup' });


module.exports = Group;
