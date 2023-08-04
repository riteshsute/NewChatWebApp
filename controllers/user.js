const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sequelize = require('../util/database');

// Checking string is valid or not
const isStringInvalid = (string) => {
    if(string == undefined || string.length === 0) {
        return true;
    } else {
        return false;
    }
}

// Creating a new user in the User table
const signup = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        const {name, email, phoneNumber, password} = req.body;

        if(isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(phoneNumber) || isStringInvalid(password)) {
            return res.status(400).json({error: "Bad parameters. Something is missing"})
        }

        const user = await User.findOne({ where: { email }}, { transaction: t });

        if(user) {
            return res.status(400).json({ error: 'User already exist, Please Login'});
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, phoneNumber, password:hash }, { transaction: t })

        await t.commit();
        res.status(201).json({ message: 'Successfully created New User Account'})
        console.log('New user id >>>>',newUser.dataValues.id);
    } catch(err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
}

// Generating a token and passing user details in it
const generateAccessToken = (id,name) => {
    return jwt.sign({ userId:id, name: name }, process.env.TOKEN_SECRET);
}

// User is valid or not 
const login = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { email, password} = req.body;

        if(isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({ error: 'Email and password is missing' });
        }

        const user = await User.findAll({ where: { email }}, { transaction: t });
        if(user.length > 0) {
            bcrypt.compare(password, user[0].password, async (err, result) => {
                if(err) {
                    throw new Error('Something went wrong');
                }
                if(result === true) {
                    await t.commit();
                    res.status(200).json({ message: 'User logged in successfully', 
                    token: generateAccessToken(user[0].id, user[0].name) })
                }else {
                    return res.status(401).json({ error: 'User not authorized'});
                }
            })
        }else {
            return res.status(404).json({ error: `User not found`})
        }
    } catch(err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getUsers = async(req, res) => {
    try {
        const users = await User.findAll();
        res.status(202).json({ listOfUsers: users })
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: `Internal Server Error` })
    }
}

module.exports = {
    signup,
    login,
    getUsers
}