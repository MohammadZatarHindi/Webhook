import { Request, Response } from 'express';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getPipelineJobs,
} from '../services/job.service';
import { CreateJobDTO, UpdateJobDTO } from '../validation/job.validation';
import { sendResponse } from '../../../utils/responseHandler';
import { asyncHandler } from '../../../utils/asyncHandler';

/* --------------------------
   CREATE JOB
-------------------------- */
export const createJobUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const dto = req.body as CreateJobDTO;
    const job = await createJob(dto);

    return sendResponse({
      res,
      entity: 'Job',
      action: 'created',
      data: job,
      statusCode: 201,
    });
  }
);

/* --------------------------
   GET ALL JOBS
-------------------------- */
export const getJobsUsingGet = asyncHandler(
  async (_req: Request, res: Response) => {
    const jobs = await getJobs();

    return sendResponse({
      res,
      entity: 'Jobs',
      action: 'retrieved',
      data: jobs,
    });
  }
);

/* --------------------------
   GET SINGLE JOB
-------------------------- */
export const getJobUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const job_id = Number(req.params.job_id);
    const job = await getJob({ job_id });

    if (!job) {
      return sendResponse({ res, entity: 'Job', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Job',
      action: 'retrieved',
      data: job,
    });
  }
);

/* --------------------------
   UPDATE JOB
-------------------------- */
export const updateJobUsingPut = asyncHandler(
  async (req: Request, res: Response) => {
    const job_id = Number(req.params.job_id);
    const dto = req.body as UpdateJobDTO;
    const job = await updateJob({ job_id }, dto);

    if (!job) {
      return sendResponse({ res, entity: 'Job', action: 'notFound' });
    }

    const updatedFields = Object.keys(dto).reduce<Record<string, any>>((acc, key) => {
      if ((dto as any)[key] !== undefined) acc[key] = (job as any)[key];
      return acc;
    }, {});

    return sendResponse({
      res,
      entity: 'Job',
      action: 'updated',
      data: { job, updatedFields },
    });
  }
);

/* --------------------------
   DELETE JOB
-------------------------- */
export const deleteJobUsingDelete = asyncHandler(
  async (req: Request, res: Response) => {
    const job_id = Number(req.params.job_id);
    const job = await deleteJob({ job_id });

    if (!job) {
      return sendResponse({ res, entity: 'Job', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Job',
      action: 'deleted',
      data: job,
    });
  }
);

/* --------------------------
   GET JOBS FOR PIPELINE
-------------------------- */
export const getPipelineJobsUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    if (isNaN(pipeline_id)) {
      return sendResponse({ res, error: 'Invalid pipeline ID', statusCode: 400 });
    }

    const jobs = await getPipelineJobs(pipeline_id);

    return sendResponse({
      res,
      entity: 'Pipeline Jobs',
      action: 'retrieved',
      data: jobs,
    });
  }
);