const express = require('express');
const router = express.Router();
const testUser = require('../middleware/testUser');
const {getAllJobs,getJob,createJob,updateJob,deleteJob} = require('../controllers/jobs');

// all the jobs have to be protected from any external access so, the authentication should be for every job
router.route('/').get(getAllJobs).post(testUser,createJob);
router.route('/:id').get(getJob).patch(testUser,updateJob).delete(testUser,deleteJob);

module.exports = router;