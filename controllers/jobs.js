const Job = require('../models/Job');
const {StatusCodes}= require('http-status-codes');
const {BadRequestError,notFoundError}= require('../errors');
const mongoose = require('mongoose');
const moment= require('moment');

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

const showStats=async(req,res)=>{
    let stats = await Job.aggregate([
        {$match:{createdBy:mongoose.Types.ObjectId(req.user.userId)}},
        {$group: {_id: '$status',count:{$sum:1}}},// $sum:1 means that one data in one type of status, for ex. 'declined' would account for a value '1'
    ])

    // in detail of using reduce refer readme file
    stats=stats.reduce((acc,curr)=>{
        const {_id:title,count}=curr;
        acc[title]=count;
        return acc;
    },{});// second argument tells about the return type {}-> json object

    // making the checks for the non-zero or zero values in the backend, double check in the backend also
    const defaultStats={
        pending:stats.pending || 0,
        interview : stats.interview || 0,
        declined : stats.declined || 0
    }

    let monthlyApplications = await Job.aggregate([
        {$match:{createdBy:mongoose.Types.ObjectId(req.user.userId)}},
        {$group:{
            _id:{year:{$year: '$createdAt'},month :{$month:'$createdAt'}},
            count :{$sum:1}
        }},
        {$sort : {'_id.year':-1,'_id.month':-1}},
        {$limit:6}
    ])

    monthlyApplications=monthlyApplications.map((item)=>{
        const{ _id:{year,month},count} =item;
        const date =moment().month(month-1).year(year).format('MMM Y');// these different formats are available on moment js refer docs for ex. here Jul 2023, Dec 2022,etc
        return {date,count};
    }).reverse();// as we want the last 6 months in the opposite order

    console.log(monthlyApplications);

    res.status(StatusCodes.OK).json({defaultStats,monthlyApplications});// our frontend is expecting these two things
}

module.exports ={getAllJobs,getJob,updateJob,createJob,deleteJob,showStats};