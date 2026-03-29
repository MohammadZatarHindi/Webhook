import * as db from '../../../config/genericQueries';
import { getPipeline } from '../../pipelines/services/pipeline.service';
import { Job } from '../../jobs/types/job.type';
import { WebhookDTO } from '../validation/webhook.validation';

import { getPipelineSubscribers } from '../../subscriptions/services/subscription.service';
import { getPipelines } from '../../pipelines/services/pipeline.service';
import { getPendingJob } from '../../jobs/helpers/job.helper';

export const createJobForWebhook = async (
  pipeline_id: number,
  dto: WebhookDTO
): Promise<Job> => {
  if (!dto.payload || Object.keys(dto.payload).length === 0) {
    throw new Error('Webhook payload cannot be empty');
  }

  const pipeline = await getPipeline({ pipeline_id });
  if (!pipeline) throw new Error(`Pipeline with id ${pipeline_id} not found`);
  
  
  // ------------------------------
  // Check if pipeline has subscribers
  // ------------------------------
  const subscribers = await getPipelineSubscribers(pipeline_id);
  if (!subscribers.length) {
    throw new Error(`Pipeline with id ${pipeline_id} has no subscribers`);
  }
  
  // ------------------------------
  // Check for existing pending job
  // ------------------------------
  const existingPendingJob = await db.selectQuery<Job>('jobs', {
    where: { pipeline_id, status: 'pending' },
    single: true, // get only one job if exists
  });
  
  if (existingPendingJob) {
    throw new Error(`There is already a pending job for pipeline ${pipeline_id}`);
  }
  
  const job = await db.insertQuery<Job>('jobs', {
    pipeline_id,
    payload: JSON.stringify(dto.payload), // serialize here
    status: 'pending',
    attempts: 0,
  });

  return { ...job, payload: dto.payload }; // return parsed payload
};

export const createJobsForWebhooks = async (dto: WebhookDTO): Promise<Job[]> => {
  // ------------------------------
  // Validate payload
  // ------------------------------
  
  if (!dto.payload || Object.keys(dto.payload).length === 0) {
    throw new Error('Webhook payload cannot be empty');
  }

  // ------------------------------
  // Get all pipelines
  // ------------------------------
  const pipelines = await getPipelines();
  if (!pipelines || pipelines.length === 0) {
    return []; // let controller decide response
  }
  
  

  const jobs: Job[] = [];

  for (const pipeline of pipelines) {
    const { pipeline_id } = pipeline;
	
    // ------------------------------
    // Skip if no subscribers
    // ------------------------------
    const subscribers = await getPipelineSubscribers(pipeline_id);
    if (!subscribers.length) continue;
	
    // ------------------------------
    // Skip if pending job exists
    // ------------------------------
    const existingJob = await getPendingJob(pipeline_id);
	
	
	
    if (existingJob) continue;

    // ------------------------------
    // Create job
    // ------------------------------
    const job = await db.insertQuery<Job>('jobs', {
      pipeline_id,
      payload: JSON.stringify(dto.payload),
      status: 'pending',
      attempts: 0,
    });

    jobs.push({ ...job, payload: dto.payload });
	
	
  }

  return jobs;
};