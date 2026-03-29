// src/modules/jobs/enqueueJob.ts
import { Queue } from 'bullmq';
import { Job } from '../modules/jobs/types/job.type';
import { v4 as uuidv4 } from 'uuid';

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
};

// Create queue (API only enqueues jobs)
const jobQueue = new Queue<Job>('jobs', { connection });

export async function enqueueJob(jobData: Job) {
  const uniqueJobId = `job-${jobData.job_id}-${Date.now()}-${uuidv4()}`;
  await jobQueue.add(uniqueJobId, jobData, {
    jobId: uniqueJobId,
    attempts: 3,
    backoff: { type: 'fixed', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: true,
  });

  console.log(new Date().toISOString(), '|', `JOB ${jobData.job_id} → Enqueued as ${uniqueJobId}`);
}