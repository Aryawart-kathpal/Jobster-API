const express = require('express');
const router = express.Router();

const authenticateUser= require('../middleware/authentication');
const testUser=require('../middleware/testUser');
const {login,register,updateUser} = require('../controllers/auth');

const rateLimiter = require('express-rate-limit');
const apiLimiter = rateLimiter({
    windowMs:15*60*1000, // 15 minutes
    max:10,
    message:{// This time we have created separate message object bcz this is what our frontend is expecting
        msg : 'Too many requests from this IP, please try again after 15 minutes'
    }
})

router.route('/register').post(apiLimiter,register);
router.route('/login').post(apiLimiter,login);
//testUser check before updating
router.route('/updateUser').patch(authenticateUser,testUser,updateUser);// in app.js when we call this route then we have not made authentication as it is not required in register and login, but in updation it is required, so therefore here we have to stick the authentication middleware

module.exports = router;