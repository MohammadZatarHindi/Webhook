import express from 'express';
import { validate } from '../../../middlewares/validation.middleware';
import {
  createJobUsingPost,
  getJobsUsingGet,
  getJobUsingGet,
  updateJobUsingPut,
  deleteJobUsingDelete,
  getPipelineJobsUsingGet,
} from '../controllers/job.controller';
import { createJobSchema, updateJobSchema, jobParamsSchema } from '../validation/job.validation';

const router = express.Router();

// Reusable param validation middleware
const validateJobParams = validate(jobParamsSchema, 'params');

/* --------------------------
   Job Routes
-------------------------- */

// Create job
router.post('/', validate(createJobSchema), createJobUsingPost);

// Get all jobs
router.get('/', getJobsUsingGet);

// Get single job
router.get('/:job_id', validateJobParams, getJobUsingGet);

// Update job
router.put('/:job_id', validateJobParams, validate(updateJobSchema), updateJobUsingPut);

// Delete job
router.delete('/:job_id', validateJobParams, deleteJobUsingDelete);

// Get all jobs for a pipeline
router.get('/pipeline/:pipeline_id', getPipelineJobsUsingGet);

export default router;