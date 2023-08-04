const User = require('../models/user');
const Group = require('../models/group');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        const group = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('userID >>>>',user.userId, user.name);
        const users = await User.findByPk(user.userId)
        const groups = await Group.findByPk(group.GroupId)
            console.log('values'+JSON.stringify(groups));
            console.log('values of user'+JSON.stringify(users));
            req.user = users;
            req.group = groups;
            next();
        // }).catch(err => { throw new Error(err)})
    } catch(err) {
        console.log(err);
        return res.status(401).json({success: false})
    }
}

module.exports = {
    authenticate
}
