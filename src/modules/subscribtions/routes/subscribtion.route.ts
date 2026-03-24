import express from 'express';
import { validate } from '../../../middlewares/validation.middleware';
import {
  createSubscribtionUsingPost,
  getSubscribtionsUsingGet,
  getSubscribtionUsingGet,
  updateSubscribtionUsingPut,
  deleteSubscribtionUsingDelete,
  getPipelineSubscribersUsingGet,
  getSubscriberPipelinesUsingGet,
} from '../controllers/subscribtion.controller';
import {
  createSubscribtionSchema,
  updateSubscribtionSchema,
  subscribtionParamsSchema,
} from '../validation/subscribtion.validation';

const router = express.Router();

// Reusable param validation middleware for :subscribtion_id
const validateSubscribtionParams = validate(subscribtionParamsSchema, 'params');

/* --------------------------
   Subscribtion Routes
-------------------------- */

// Create subscription
router.post('/', validate(createSubscribtionSchema), createSubscribtionUsingPost);

// Get all subscriptions
router.get('/', getSubscribtionsUsingGet);

// Get single subscription by ID
router.get('/:subscribtion_id', validateSubscribtionParams, getSubscribtionUsingGet);

// Update subscription
router.put(
  '/:subscribtion_id',
  validateSubscribtionParams,
  validate(updateSubscribtionSchema),
  updateSubscribtionUsingPut
);

// Delete subscription
router.delete('/:subscribtion_id', validateSubscribtionParams, deleteSubscribtionUsingDelete);

// Get all subscribers for a specific pipeline
router.get('/pipelines/:pipeline_id/subscribers', getPipelineSubscribersUsingGet);

// Get all pipelines for a specific subscriber
router.get('/subscribers/:subscriber_id/pipelines', getSubscriberPipelinesUsingGet);

export default router;