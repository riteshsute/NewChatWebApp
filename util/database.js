const Sequelize = require('sequelize');

const sequelize = new Sequelize('chatapp', 'root', '@Ritesh123', {
    dialect: 'mysql',
    host: 'localhost'
}); 

module.exports = sequelize; 