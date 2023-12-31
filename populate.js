require('dotenv').config();

const connectDB = require('./db/connect');
const mockData= require('./mock-data.json');
const Job = require('./models/Job');

const start = async(req,res)=>{
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Connected to the database");
        await Job.create(mockData);
        console.log("Successfully populated the database");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

start();