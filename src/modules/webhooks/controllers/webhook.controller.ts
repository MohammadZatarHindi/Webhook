import { Request, Response, NextFunction } from 'express';
import { createJobForWebhook, createJobsForWebhooks } from '../services/webhook.service';
import { WebhookDTO, WebhookParams } from '../validation/webhook.validation';
  
export const createWebhookUsingPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pipeline_id } = req.params as unknown as WebhookParams; // safely typed
    const dto = req.body as WebhookDTO;

    // create a pending job
    const job = await createJobForWebhook(pipeline_id, dto);
	
	
    res.status(201).json({
      success: true,
      message: 'Webhook received and job created',
      job,
    });
  } catch (err: any) {
    next(err);
  }
};

export const createWebhooksUsingPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as WebhookDTO;

    const jobs = await createJobsForWebhooks(dto);

    if (!jobs.length) {
      return res.status(200).json({
        success: true,
        message: 'No eligible pipelines (no subscribers or already processing)',
        jobs: [],
      });
    }

    res.status(201).json({
      success: true,
      message: `${jobs.length} job(s) created for pipelines with subscribers`,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};