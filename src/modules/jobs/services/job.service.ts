import * as db from '../../../config/genericQueries';
import { Job } from '../types/job.type';
import { CreateJobDTO, UpdateJobDTO, JobParams } from '../validation/job.validation';
import { getPipeline } from '../../pipelines/services/pipeline.service';

import { TABLE, parsePayload } from '../helpers/job.helper';

/* --------------------------
   CREATE JOB
-------------------------- */
export const createJob = async (dto: CreateJobDTO): Promise<Job> => {
  const pipeline = await getPipeline({ pipeline_id: dto.pipeline_id });
  if (!pipeline) throw new Error(`Pipeline ${dto.pipeline_id} does not exist`);

  const record = await db.insertQuery<Job>(TABLE, {
    pipeline_id: dto.pipeline_id,
    payload: JSON.stringify(dto.payload), // serialize
    status: 'pending',
    attempts: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return { ...record, payload: parsePayload(record.payload) };
};

/* --------------------------
   GET ALL JOBS
-------------------------- */
export const getJobs = async (): Promise<Job[]> => {
  const records = await db.selectQuery<Job>(TABLE, { orderBy: 'job_id', order: 'ASC' });
  return (records || []).map(r => ({ ...r, payload: parsePayload(r.payload) }));
};

/* --------------------------
   GET SINGLE JOB
-------------------------- */
export const getJob = async (params: JobParams): Promise<Job | null> => {
  const record = await db.selectQuery<Job>(TABLE, { where: { job_id: params.job_id }, single: true });
  if (!record) return null;
  return { ...record, payload: parsePayload(record.payload) };
};

/* --------------------------
   UPDATE JOB
-------------------------- */
export const updateJob = async (params: JobParams, fields: UpdateJobDTO): Promise<Job | null> => {
  if (fields.pipeline_id) {
    const pipeline = await getPipeline({ pipeline_id: fields.pipeline_id });
    if (!pipeline) throw new Error(`Pipeline ${fields.pipeline_id} does not exist`);
  }

  const updateData: Record<string, any> = { updated_at: new Date(), ...fields };
  if (fields.payload !== undefined) {
    updateData.payload = JSON.stringify(fields.payload); // serialize
  }

  const record = await db.updateQuery<Job>(TABLE, updateData, { job_id: params.job_id });
  if (!record) return null;
  return { ...record, payload: parsePayload(record.payload) };
};

/* --------------------------
   DELETE JOB
-------------------------- */
export const deleteJob = async (params: JobParams): Promise<Job | null> => {
  const record = await db.deleteQuery<Job>(TABLE, { job_id: params.job_id });
  if (!record) return null;
  return { ...record, payload: parsePayload(record.payload) };
};

/* --------------------------
   GET JOBS FOR PIPELINE
-------------------------- */
export const getPipelineJobs = async (pipeline_id: number): Promise<Job[]> => {
  const pipeline = await getPipeline({ pipeline_id });
  if (!pipeline) throw new Error(`Pipeline with ID ${pipeline_id} does not exist`);

  const records = await db.selectQuery<Job>(TABLE, { where: { pipeline_id }, orderBy: 'job_id', order: 'ASC' });
  return (records || []).map(r => ({ ...r, payload: parsePayload(r.payload) }));
};