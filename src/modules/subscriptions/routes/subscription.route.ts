import express from 'express';
import { validate } from '../../../middlewares/validation.middleware';
import {
  createSubscriptionUsingPost,
  getSubscriptionsUsingGet,
  getSubscriptionUsingGet,
  updateSubscriptionUsingPut,
  deleteSubscriptionUsingDelete,
  getPipelineSubscribersUsingGet,
  getSubscriberPipelinesUsingGet,
} from '../controllers/subscription.controller';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  subscriptionParamsSchema,
} from '../validation/subscription.validation';

const router = express.Router();

// Reusable param validation middleware for :subscription_id
const validateSubscriptionParams = validate(subscriptionParamsSchema, 'params');

/* --------------------------
   Subscription Routes
-------------------------- */

// Create subscription
router.post('/', validate(createSubscriptionSchema), createSubscriptionUsingPost);

// Get all subscriptions
router.get('/', getSubscriptionsUsingGet);

// Get single subscription by ID
router.get('/:subscription_id', validateSubscriptionParams, getSubscriptionUsingGet);

// Update subscription
router.put(
  '/:subscription_id',
  validateSubscriptionParams,
  validate(updateSubscriptionSchema),
  updateSubscriptionUsingPut
);

// Delete subscription
router.delete('/:subscription_id', validateSubscriptionParams, deleteSubscriptionUsingDelete);

// Get all subscribers for a specific pipeline
router.get('/pipeline/:pipeline_id/subscribers', getPipelineSubscribersUsingGet);

// Get all pipelines for a specific subscriber
router.get('/subscribers/:subscriber_id/pipeline', getSubscriberPipelinesUsingGet);

export default router;