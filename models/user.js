const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required: [true,'please provide name'],
        minlength : 3,
        maxlength : 50,
    },
    email:{
        type:String,
        required:[true,"Please provide email"],
        // passing a regular Expression(regEx) which matches to email syntax
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please provide valid email"],
        unique:true,// generating a unique email everytime, avoiding duplicacy
    },
    password:{
        type:String,
        required:[true,"please provide password"],
        minlength:6, // we will remove minlength and maxlength properties after we setup hash for password
        // maxlength:12,
    },
    lastName:{
        type:String,
        trim:true,
        maxlength:20,
        default:'lastName',
    },
    location:{
        type:String,
        trim:true,
        maxlength:20,
        default:'my city',
    }
})

// using the function keyword so that we can use 'this' keyword
// we modify the password to hashed password here only, looks much of a cleaner code

// instead of using next() we can use a function that returns a promise i.e. using only async await is good, no need of next() keyword

UserSchema.pre('save',async function(/*next*/){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    // next();
})
// hashing the password here only before passing to req.body

// these are known as the Schema instance methods witn syntax as schema.methods.(methodName)
/*UserSchema.methods.getName = function(){
    return this.name;
}*/

// generating the token from here only using the instance methods so that controller doesn't get crowded
UserSchema.methods.createJWT = function(){
    return jwt.sign({userId:this._id,name:this.name},process.env.JWT_SECRET,{expiresIn : process.env.JWT_LIFETIME});
}

//create comparePassword here only so that we could directly invoke it in the controller
// ** async function
/*UserSchema.methods.comparePassword = async function(candidatePassword){
    console.log(candidatePassword);
    console.log(this.password);
    const isMatch = await bcrypt.compare(candidatePassword, this.passsword); // used in comparing the hashed passwords
    return isMatch;
}*/

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

module.exports = mongoose.model('User',UserSchema);