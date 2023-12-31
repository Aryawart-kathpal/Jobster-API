const Job = require('../models/Job');
const {StatusCodes}= require('http-status-codes');
const {BadRequestError,notFoundError}= require('../errors');

const getAllJobs = async(req,res)=>{
    const jobs = await Job.find({createdBy : req.user.userId}).sort('createdBy');
    res.status(StatusCodes.OK).json({jobs,count : jobs.length});
}

const getJob = async(req,res)=>{
    const {user:{userId},params:{id:jobId}} = req; // like userId = req.user and req.params.id=jobId

    const job = await Job.findOne({
        _id:jobId,createdBy:userId
    })
    if(!job){
        throw new notFoundError(`No job with id :${jobId}`);
    }
    res.status(StatusCodes.OK).json({job});
}

// as we reach here only after the authentication so, req.user contains the info of the user that has send the requests
// the createdAt and updatedAt are automatically created by the mongoose timestamps:true
const createJob = async(req,res)=>{
    req.body.createdBy = req.user.userId;
    const job = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json({job});
    // req.user not like {req.user}
}

const updateJob = async(req,res)=>{
    const {user:{userId},params:{id :jobId},body:{company,position}}=req;
    if(company === "" || position===""){
        throw new BadRequestError("Company or position fields can't be empty");
    }

    const job = await Job.findOneAndUpdate({_id:jobId,createdBy:userId},req.body,{new:true,runValidators:true});

    if(!job){
        throw new notFoundError(`No job with id : ${jobId}`);
    }

    res.status(StatusCodes.OK).json({job});
}

const deleteJob = async(req,res)=>{
    const{user:{userId},params:{id:jobId}} = req;
    const job =await Job.findOneAndRemove({_id:jobId,createdBy:userId});

    if(!job){
        throw new notFoundError(`No job with id : ${jobId}`);
    }
    res.status(StatusCodes.OK).send();
}

module.exports ={getAllJobs,getJob,updateJob,createJob,deleteJob};