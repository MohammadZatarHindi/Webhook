// src/worker/worker.ts
import 'dotenv/config'; // load .env if needed
import { Worker, Job as BullJob } from 'bullmq';
import fetch from 'node-fetch';
import { Job } from '../modules/jobs/types/job.type';
import { selectQuery, insertQuery, updateQuery, joinQuery } from '../config/genericQueries';

/* ---------------------- REDIS CONNECTION ---------------------- */
const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
};

/* ---------------------- LOGGER ---------------------- */
function log(...args: any[]) {
  console.log(new Date().toISOString(), '|', ...args);
}

/* ---------------------- ACTION HANDLER ---------------------- */
function applyAction(payload: any, actionType: string) {
  if (!payload?.text) return payload;
  switch (actionType) {
    case 'uppercase': return { ...payload, text: payload.text.toUpperCase() };
    case 'reverse': return { ...payload, text: payload.text.split('').reverse().join('') };
    case 'log':
    default: return payload;
  }
}

/* ---------------------- PROCESS SINGLE JOB ---------------------- */
async function processJob(job: BullJob<Job>) {
  const jobData = job.data;
  log(`WORKER → Received JOB ${jobData.job_id}`);

  try {
    const pipeline = await selectQuery<{ action_type: string }>('pipelines', {
      where: { pipeline_id: jobData.pipeline_id },
      single: true,
    });

    if (!pipeline) {
      log(`WORKER → JOB ${jobData.job_id} → Pipeline NOT FOUND → FAIL`);
      await updateQuery('jobs', { status: 'failed' }, { job_id: jobData.job_id });
      return;
    }

    const actionType = pipeline.action_type;
    log(`WORKER → JOB ${jobData.job_id} → START → Action: ${actionType}`);
    await updateQuery('jobs', { status: 'processing' }, { job_id: jobData.job_id });

    const subscribers = await joinQuery<{ subscriber_id: number; url: string }>( {
      select: ['s.subscriber_id', 's.url'],
      from: 'subscribers s',
      join: { table: 'subscriptions sub', on: 's.subscriber_id = sub.subscriber_id', type: 'INNER' },
      where: { 'sub.pipeline_id': jobData.pipeline_id },
    });

    log(`WORKER → JOB ${jobData.job_id} → Found ${subscribers.length} subscriber(s)`);

    const originalPayload = { ...jobData.payload };
    const processedPayload = applyAction(originalPayload, actionType);

    let totalAttempts = 0;
    let jobSucceeded = false;

    for (const sub of subscribers) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        totalAttempts++;
        log(`WORKER → JOB ${jobData.job_id} → Subscriber ${sub.url} attempt ${attempt}/3`);

        let status: 'success' | 'failed' = 'failed';
        let responseCode = 0;
        let responseBody = '';

        try {
          const res = await fetch(sub.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job_id: jobData.job_id,
              action_type: actionType,
              original_payload: originalPayload,
              processed_payload: processedPayload,
            }),
          });

          responseCode = res.status;
          const json = await res.json().catch(() => null);
          responseBody = JSON.stringify(json || { text: 'No JSON' });
          status = res.ok ? 'success' : 'failed';
        } catch (err) {
          responseBody = (err as Error).message;
        }

        await insertQuery('deliveries', {
          job_id: jobData.job_id,
          subscriber_id: sub.subscriber_id,
          status,
          attempts: attempt,
          response_code: responseCode,
          response_body: responseBody,
          attempted_at: new Date(),
        });

        if (status === 'success') {
          jobSucceeded = true;
          log(`WORKER → JOB ${jobData.job_id} → Subscriber ${sub.url} SUCCESS`);
          break;
        }

        await new Promise(r => setTimeout(r, 300));
      }
    }

    const finalStatus = jobSucceeded ? 'completed' : 'failed';
    await updateQuery('jobs', { status: finalStatus, attempts: totalAttempts }, { job_id: jobData.job_id });
    log(`WORKER → JOB ${jobData.job_id} → END → Status: ${finalStatus} | Total attempts: ${totalAttempts}`);
  } catch (err) {
    log(`WORKER → JOB ${jobData.job_id} → ERROR`, err);
    await updateQuery('jobs', { status: 'failed' }, { job_id: jobData.job_id });
  }
}

/* ---------------------- START WORKER ---------------------- */
const worker = new Worker<Job>('jobs', processJob, { connection, concurrency: 5 });

worker.on('completed', (job) => log(`WORKER → JOB ${job.id} completed`));
worker.on('failed', (job, err) => log(`WORKER → JOB ${job?.id} failed`, err));

log('WORKER → Started and listening to jobs...');