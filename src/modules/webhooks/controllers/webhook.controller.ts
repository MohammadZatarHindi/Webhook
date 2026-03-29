import { Request, Response } from 'express';
import { createJobForWebhook, createJobsForWebhooks } from '../services/webhook.service';
import { WebhookDTO, WebhookParams } from '../validation/webhook.validation';
import { sendResponse } from '../../../utils/responseHandler';
import { asyncHandler } from '../../../utils/asyncHandler';
import { enqueueJob } from '../../../worker/worker'; // import enqueue function

/* --------------------------
   CREATE SINGLE WEBHOOK JOB
-------------------------- */
export const createWebhookUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { pipeline_id } = req.params as unknown as WebhookParams;
    const dto = req.body as WebhookDTO;

    // create job in DB
    const job = await createJobForWebhook(pipeline_id, dto);

    // enqueue job to BullMQ
    await enqueueJob(job);

    return sendResponse({
      res,
      entity: 'Webhook Job',
      action: 'created',
      data: job,
      statusCode: 201,
    });
  }
);

/* --------------------------
   CREATE MULTIPLE WEBHOOK JOBS
-------------------------- */
export const createWebhooksUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const jobs = await createJobsForWebhooks(req.body);

    if (!jobs.length) {
      return sendResponse({
        res,
        entity: 'Webhook Jobs',
        action: 'retrieved',
        data: [],
      });
    }

    for (const job of jobs) {
      await enqueueJob(job);
    }

    return sendResponse({
      res,
      entity: 'Webhook Jobs',
      action: 'created',
      data: jobs,
      statusCode: 201,
    });
  }
);