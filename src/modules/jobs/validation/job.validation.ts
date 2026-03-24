import { z } from 'zod';
import { JobStatus } from '../types/job.type';

const jobStatuses: JobStatus[] = ['pending', 'processing', 'completed', 'failed'];
const jobStatusEnum = z.enum(jobStatuses as [JobStatus, ...JobStatus[]]);

/* --------------------------
   Create Job Schema
-------------------------- */
export const createJobSchema = z.object({
  pipeline_id: z.coerce.number().int().min(1, { message: 'Pipeline ID must be positive' }),
  payload: z.record(z.string(), z.any()),
});
export type CreateJobDTO = z.infer<typeof createJobSchema>;

/* --------------------------
   Update Job Schema
-------------------------- */
export const updateJobSchema = createJobSchema
  .partial()
  .extend({
    status: jobStatusEnum.optional(),
    attempts: z.coerce.number().int().min(0).optional(),
  });
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;

/* --------------------------
   Params Schema
-------------------------- */
export const jobParamsSchema = z.object({
  job_id: z.coerce.number().int().min(1, { message: 'Job ID must be positive' }),
});
export type JobParams = z.infer<typeof jobParamsSchema>;