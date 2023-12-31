const express = require('express');
const router = express.Router();

const {getAllJobs,getJob,createJob,updateJob,deleteJob} = require('../controllers/jobs');

// all the jobs have to be protected from any external access so, the authentication should be for every job
router.route('/').get(getAllJobs).post(createJob);
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob);

module.exports = router;