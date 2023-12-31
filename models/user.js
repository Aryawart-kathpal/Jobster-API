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

UserSchema.pre('save',async function(/*next*/){
    //console.log(this.modifiedPaths());-> the paths whose value is changed while updating, as password is only edited once when registering the user, so we want it to change only then, and not again hash it when we send the update req
    if(!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    // next();
})

// generating the token from here only using the instance methods so that controller doesn't get crowded
UserSchema.methods.createJWT = function(){
    return jwt.sign({userId:this._id,name:this.name},process.env.JWT_SECRET,{expiresIn : process.env.JWT_LIFETIME});
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

module.exports = mongoose.model('User',UserSchema);