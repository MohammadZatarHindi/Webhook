import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getPipelineJobs,
} from '../services/job.service';
import { CreateJobDTO, UpdateJobDTO, JobParams } from '../validation/job.validation';

import { sendNotFound } from '../../../utils/responseHandler';

/* --------------------------
   CREATE JOB
-------------------------- */
export const createJobUsingPost = catchAsync(async (req: Request, res: Response) => {
  const dto = req.body as CreateJobDTO;
  const job = await createJob(dto);
  return res.status(201).json({ success: true, message: 'Job created', job });
});

/* --------------------------
   GET ALL JOBS
-------------------------- */
export const getJobsUsingGet = catchAsync(async (_req: Request, res: Response) => {
  const jobs = await getJobs();
  return res.json({
    success: true,
    jobs,
    ...(jobs.length === 0 && { message: 'No jobs found' }),
  });
});

/* --------------------------
   GET SINGLE JOB
-------------------------- */
export const getJobUsingGet = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as JobParams;
  const job = await getJob(params);
  if (!job) return sendNotFound(res, 'Job');

  return res.json({ success: true, job });
});

/* --------------------------
   UPDATE JOB
-------------------------- */
export const updateJobUsingPut = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as JobParams;
  const dto = req.body as UpdateJobDTO;
  const job = await updateJob(params, dto);
  if (!job) return sendNotFound(res, 'Job');

  return res.json({ success: true, message: 'Job updated', job });
});

/* --------------------------
   DELETE JOB
-------------------------- */
export const deleteJobUsingDelete = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as JobParams;
  const job = await deleteJob(params);
  if (!job) return sendNotFound(res, 'Job');

  return res.json({ success: true, message: 'Job deleted', job });
});

/* --------------------------
   GET JOBS FOR PIPELINE
-------------------------- */
export const getPipelineJobsUsingGet = catchAsync(async (req: Request, res: Response) => {
  const pipeline_id = Number(req.params.pipeline_id);
  const jobs = await getPipelineJobs(pipeline_id);

  return res.json({
    success: true,
    jobs,
    ...(jobs.length === 0 && { message: 'No jobs found for this pipeline' }),
  });
});