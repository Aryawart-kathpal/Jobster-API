const Job = require('../models/Job');
const {StatusCodes}= require('http-status-codes');
const {BadRequestError,notFoundError}= require('../errors');

const getAllJobs = async(req,res)=>{
    const {sort,search,jobType,status} = req.query;

    const queryObject ={
        createdBy:req.user.userId
    }
    if(search){
        // if this search value not found then return all jobs
        queryObject.position = {$regex : search , $options:'i'};// $regex:search to search that word anywhere in the position and options 'i' for case insensitive
    }

    if(status && status!=='all'){
        queryObject.status=status;
    }

    if(jobType && jobType!=='all'){
        queryObject.jobType=jobType;
    }
    let result = Job.find(queryObject);

    if(sort === 'latest'){
        result=result.sort('-createdAt');
    }
    if(sort==='oldest'){
        result=result.sort('createdAt');
    }
    if(sort==='a-z'){
        result=result.sort('position');
    }
    if(sort==='z-a'){
        result=result.sort('position');
    }

    //Pagination
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip =(page-1)*limit;

    result.skip(skip).limit(limit);

    const totalJobs= await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs/limit);

    // totalJobs and numOfPages are required on my frontend
    const jobs = await result;
    res.status(StatusCodes.OK).json({jobs,totalJobs,numOfPages});
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