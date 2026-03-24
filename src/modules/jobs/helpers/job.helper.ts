import * as db from '../../../config/genericQueries';
import { Job } from '../types/job.type';

export const TABLE = 'jobs';

/* --------------------------
   HELPER: Safe parse payload
-------------------------- */
export const parsePayload = (payload: unknown): Record<string, any> => {
  if (!payload) return {};
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }
  return payload as Record<string, any>;
};

export const getPendingJobs = async (): Promise<Job[]> => {
  const records = await db.selectQuery<Job>('jobs', {
    where: { status: 'pending' },
    orderBy: 'job_id',
    order: 'ASC',
  });

  return (records || []).map(r => ({ ...r, payload: parsePayload(r.payload) }));
};

export const getPendingJob = async (pipeline_id: number): Promise<Job | null> => {
  const record = await db.selectQuery<Job>('jobs', {
    where: { pipeline_id, status: 'pending' },
    orderBy: 'job_id',
    order: 'ASC',
    single: true,
  });

  if (!record) return null;

  return { ...record, payload: parsePayload(record.payload) };
};