const User = require('../model/userDb');
const jwt = require('jsonwebtoken');
const Bcrypt = require('bcrypt');



const signUpUser = ( async (req, res) => {
    const { name, email, password, phonenumber} = req.body;
  
    const existingUser = await User.findOne({ where: { email: email } });

    try{
      if (existingUser) {
        return res.status(400).json({
          error: 'user already exists in database',
          message: 'user already exists '
        });
      } 
        Bcrypt.hash(password, 10, async(err, hash) => {
          const user = await User.create({name, email, password: hash, phonenumber});
        
          res.status(201).json({
          message: 'user created successfully'
        }) 
      });
    } catch(err) {
      res.status(500).json(err)
     }
  })
 

  const generateAccessToken = (id, name) => {
    return jwt.sign({ userId: id, name: name,  }, process.env.TOKEN_SECRET);
  };


  const loginUser =  ( async (req, res) => {
    try{
    const { email, password} = req.body;

    const user = await User.findAll({ where: { email }})
        if (user.length > 0) {
          Bcrypt.compare(password, user[0].password, (err, result) => {
            if(err){
              throw new Error('Something Went Wrong');
            } 
            if(result === true){
              res.status(200).json({ 
                success: true, 
                message: "user logged in successfully", 
                token: generateAccessToken( user[0].id, user[0].name ),
              });
            } else {
              return res.status(401).json({ success: false, message: "Password not matched" });
            }
          }) 
        } else {
           return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch(err) {
      res.status(500).json({success: false, message: err} )
    }
  }) 


  const userConnect = (async (userId) => {
    try {
    console.log(userId, 'connect controller');
    const user = await User.findByPk(userId);
        if (user) {
          user.isLoggedIn = true;
          console.log(userId, 'connect controller checked');
          return user.save();
        }
      } catch (error) {
        console.log(error, 'in error catch connect user')
        res.status(500).json({success: false, message: error} )
      }
   });

  
   const userDisconnect = (async (userId) => {
    try {
    console.log(userId, 'disconnect controller');
    const user = await User.findByPk(userId);
        if (user) {
          user.isLoggedIn = false;
          console.log(userId, 'disconnect controller checked');
          return user.save();
        }
      } catch (error) {
        console.log(error, 'in error catch connect user')
        res.status(500).json({success: false, message: error} )
      }
   });



  module.exports = {
    signUpUser,
    loginUser,
    userConnect,
    userDisconnect
  }