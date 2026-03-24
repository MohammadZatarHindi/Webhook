import fetch from 'node-fetch';
import { Job } from '../modules/jobs/types/job.type';
import { DELIVERY_STATUSES } from '../modules/deliveries/types/delivery.type';
import { selectQuery, insertQuery, updateQuery, joinQuery } from '../config/genericQueries';

/* ---------------------- CONSTANTS ---------------------- */
const POLL_INTERVAL = 5000; // 5 seconds between polling for new jobs
const MAX_ATTEMPTS = 3;     // Maximum delivery attempts per subscriber

/* ---------------------- LOGGER ---------------------- */
// Simple logger with ISO timestamp for clarity
function log(...args: any[]) {
  console.log(new Date().toISOString(), '|', ...args);
}

/* ---------------------- APPLY ACTION ---------------------- */
/**
 * Applies the pipeline action to the payload.
 * @param payload - Original job payload
 * @param actionType - Pipeline action type ('uppercase', 'reverse', 'log')
 * @returns Processed payload
 *
 * Usage:
 * const result = applyAction({ text: "hello" }, "uppercase");
 * // result.text === "HELLO"
 */
function applyAction(payload: any, actionType: string) {
  if (!payload?.text) return payload; // If no text, return as-is

  const text = payload.text;
  switch (actionType) {
    case 'uppercase':
      return { ...payload, text: text.toUpperCase() };
    case 'reverse':
      return { ...payload, text: text.split('').reverse().join('') };
    case 'log':
      return payload; // No modification
    default:
      return payload; // Unknown action, return as-is
  }
}

/* ---------------------- PROCESS SINGLE JOB ---------------------- */
/**
 * Processes a single job:
 * - Fetches the pipeline action
 * - Marks job as processing
 * - Fetches subscribers
 * - Applies the action to the payload
 * - Sends the processed payload to each subscriber with retries
 * - Records each delivery in the 'deliveries' table
 * - Updates job status based on delivery results
 *
 * Usage:
 * await processJob(job); // job is from selectQuery<Job>
 */
async function processJob(job: Job) {
  try {
    // ----------------------
    // Fetch pipeline to get action type
    // ----------------------
    const pipeline = await selectQuery<{ action_type: string }>('pipelines', {
      where: { pipeline_id: job.pipeline_id }, // filter by pipeline_id
      single: true,                            // return single row | null
    });

    if (!pipeline) {
      log(`JOB ${job.job_id} → pipeline ${job.pipeline_id} not found → FAIL`);
      await updateQuery('jobs', { status: 'failed' }, { job_id: job.job_id });
      return;
    }

    const actionType = pipeline.action_type;
    log(`JOB ${job.job_id} → START → Action: ${actionType}`);

    // ----------------------
    // Mark job as processing
    // ----------------------
    await updateQuery('jobs', { status: 'processing' }, { job_id: job.job_id });

    // ----------------------
    // Fetch subscribers linked to this pipeline
    // ----------------------
    const subscribers = await joinQuery<{ subscriber_id: number; url: string }>({
      select: ['s.subscriber_id', 's.url'],
      from: 'subscribers s',
      join: { table: 'subscribtions sub', on: 's.subscriber_id = sub.subscriber_id', type: 'INNER' },
      where: { 'sub.pipeline_id': job.pipeline_id },
    });

    log(`JOB ${job.job_id} → Found ${subscribers.length} subscriber(s)`);

    const originalPayload = { ...job.payload };
    const processedPayload = applyAction(originalPayload, actionType);

    let totalAttempts = 0;   // Track total attempts across all subscribers
    let jobHasSuccess = false; // Track if at least one delivery succeeded

    // ----------------------
    // Loop over subscribers
    // ----------------------
    for (const sub of subscribers) {
      // Check last delivery for this subscriber to avoid retrying unnecessary
      const lastDelivery = await selectQuery<{ status: string; attempts: number }>('deliveries', {
        where: { job_id: job.job_id, subscriber_id: sub.subscriber_id },
        orderBy: 'attempted_at',
        order: 'DESC',
        single: true,
      });

      // Skip subscriber if success or max attempts reached
      if (lastDelivery?.status === 'success' || (lastDelivery?.attempts || 0) >= MAX_ATTEMPTS) {
        log(`JOB ${job.job_id} → Subscriber ${sub.url} already success or max attempts → skip`);
        continue;
      }

      let attemptNumber = lastDelivery?.attempts || 0;
      let finalStatus: 'failed' | 'success' = 'failed';

      // ----------------------
      // Retry loop per subscriber
      // ----------------------
      while (attemptNumber < MAX_ATTEMPTS) {
        attemptNumber++;
        totalAttempts++;
        log(`JOB ${job.job_id} → Subscriber ${sub.url} attempt ${attemptNumber}/${MAX_ATTEMPTS}`);

        let status: 'failed' | 'success' = 'failed';
        let responseCode = 0;
        let responseBody = '';

        try {
          // ----------------------
          // Send processed payload to subscriber
          // ----------------------
          const res = await fetch(sub.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job_id: job.job_id,
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

        // ----------------------
        // Record delivery attempt in 'deliveries' table
        // ----------------------
        await insertQuery('deliveries', {
          job_id: job.job_id,
          subscriber_id: sub.subscriber_id,
          status,
          attempts: attemptNumber,
          response_code: responseCode,
          response_body: responseBody,
          attempted_at: new Date(),
        });

        if (status === 'success') {
          finalStatus = 'success';
          jobHasSuccess = true; // at least one subscriber succeeded
          break; // stop retrying this subscriber
        }

        await new Promise(r => setTimeout(r, 300)); // small delay between attempts
      }

      if (finalStatus === 'failed') log(`JOB ${job.job_id} → Subscriber ${sub.url} FAILED`);
    }

    // ----------------------
    // Update job status based on overall success
    // ----------------------
    const jobStatus = jobHasSuccess ? 'completed' : 'failed';
    await updateQuery('jobs', { status: jobStatus, attempts: totalAttempts }, { job_id: job.job_id });

    log(`JOB ${job.job_id} → END → Status: ${jobStatus} | Total attempts: ${totalAttempts}`);
  } catch (err) {
    log(`JOB ${job.job_id} → ERROR`, err);
  }
}

/* ---------------------- WORKER LOOP ---------------------- */
/**
 * Continuously polls the 'jobs' table for pending jobs.
 * Processes each pending job sequentially.
 * Waits POLL_INTERVAL ms before next polling iteration.
 */
async function workerLoop() {
  while (true) {
    const jobs = await selectQuery<Job>('jobs', { where: { status: 'pending' } });
    log(`Polling... found ${jobs.length} pending job(s)`);

    for (const job of jobs) await processJob(job);

    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }
}

/* ---------------------- START WORKER ---------------------- */
// Entry point: start the worker loop
workerLoop().catch(err => console.error('Worker crashed:', err));