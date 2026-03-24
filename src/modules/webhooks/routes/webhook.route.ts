import express from 'express';
import { validate } from '../../../middlewares/validation.middleware';
import { createWebhookUsingPost, createWebhooksUsingPost } from '../controllers/webhook.controller';
import { webhookSchema, webhookParamsSchema } from '../validation/webhook.validation';

const router = express.Router();

// POST /webhook/:pipeline_id
router.post(
  '/:pipeline_id',
  validate(webhookParamsSchema, 'params'), // validate pipeline_id
  validate(webhookSchema, 'body'),         // validate payload body
  createWebhookUsingPost
);

router.post(
  '/',
  validate(webhookSchema, 'body'),         // validate payload body
  createWebhooksUsingPost
);

export default router;