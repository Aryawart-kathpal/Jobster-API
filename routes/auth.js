const express = require('express');
const router = express.Router();

const authenticateUser= require('../middleware/authentication');
const {login,register,updateUser} = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/updateUser').patch(authenticateUser,updateUser);// in app.js when we call this route then we have not made authentication as it is not required in register and login, but in updation it is required, so therefore here we have to stick the authentication middleware

module.exports = router;