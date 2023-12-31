const User = require('../models/user');
const {StatusCodes} = require('http-status-codes');
const{BadRequestError,UnauthenticatedError} = require('../errors');
const jwt = require('jsonwebtoken');

const register = async(req,res)=>{
    const user = await User.create({... req.body});
    const token = user.createJWT();
    // send all the info in the giant user object, because this is what our frontend is expecting
    res.status(StatusCodes.CREATED).json({user :{email:user.email,name:user.name,lastName:user.lastName,location:user.location,token}});//201
}

const login = async(req,res)=>{
    const {email,password} =req.body;
    //  if we don't use the below statement anyways the error will be thrown further, but to handle it in a clean way this is a good practice
    if(!email || !password){
        throw new BadRequestError("Please provide email id and password");
    }
    
    const user = await User.findOne({email}); // findOne() is promise returning so use async/await
    if(!user){
        throw new UnauthenticatedError("Invalid Credentials");
    }
    
    //compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new UnauthenticatedError("Invalid credentials");
    }

    const token = user.createJWT();
    // in my frontend I may require some extra things, that extra thing here is user.name
    res.status(StatusCodes.OK).json({user :{email:user.email,name:user.name,lastName:user.lastName,location:user.location,token}});//200
}

// in the User.findOne() operation we hook the pre and post save hook in the USER model, so here the password once again gets hashed, i.e. we hash the password again, which is not a good practice
const updateUser = async(req,res)=>{
    // console.log(req.user);-> we are getting this from authentication middleware
    const {name,lastName,email,location}=req.body;
    if(!name || !email || !email || !location){// these checks are made in both frontend and backend
        throw new BadRequestError("Please provide all values");
    }
    // instead of this findOneAndUpdate can also be used
    const user = await User.findOne({_id:req.user.userId});
    user.email=email;
    user.name=name;
    user.lastName=lastName;
    user.location=location;

    await user.save();
    const token = user.createJWT();// in createJWT we are passing the name in the payload,so when we change the name the token with the changed name has to be generated
    res.status(StatusCodes.OK).json({user :{email:user.email,name:user.name,lastName:user.lastName,location:user.location,token}});//200
}

module.exports ={register,login,updateUser};