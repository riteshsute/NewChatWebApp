const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Group = require('./group');

const UserMessage = sequelize.define('userMessage', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // groupId: {
  //   type: Sequelize.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: Group,
  //     key: 'id'
  //   }
  // }
});

// Group.hasMany(UserMessage, { foreignKey: 'groupId' });
// UserMessage.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = UserMessage;