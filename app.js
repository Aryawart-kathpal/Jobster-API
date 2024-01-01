require('dotenv').config();
require('express-async-errors');

const path = require('path');

const express = require('express');
const app = express();

// security Packages
const helmet = require('helmet');
// const cors = require('cors');// cors not required-> reason in readme
const xss = require('xss-clean');

//connectDB
const connectDB = require('./db/connect');

const authenticateUser = require('./middleware/authentication');

// routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

const notFoundMiddleware= require('./middleware/not-found');
const errorHandlerMiddleware=require('./middleware/error-handler');

// app.use('trust proxy',1);// to push it up to Heroku

app.use(express.static(path.resolve(__dirname,'./client/build')));
app.use(express.json());
// extra packages
app.use(helmet());
app.use(xss());

//routes
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/jobs',authenticateUser,jobsRouter); // as authenctication has to be firstly made for every job route

//serves index.html
app.get('*',(req,res)=>{// from here the react app takes over
    res.sendFile(path.resolve(__dirname,'./client/build','index.html'));
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start =async(req,res)=>{
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Successfully connected to database");
        app.listen(port,()=>console.log(`Server is listening at port ${port}...`));
    } catch (error) {
        console.log(error);
    }
}

start();