const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Group = require('./group');
const User = require('./userDb');

const UserGroup = sequelize.define('userGroup', {
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}); 

User.belongsToMany(Group, { through: { model: UserGroup, unique: false }, foreignKey: 'userId' });
Group.belongsToMany(User, { through: { model: UserGroup, unique: false }, foreignKey: 'groupId' });

module.exports = UserGroup;

// group