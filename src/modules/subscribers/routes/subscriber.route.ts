import express from 'express';
import { validate } from '../../../middlewares/validation.middleware';
import {
  createSubscriberUsingPost,
  getSubscribersUsingGet,
  getSubscriberUsingGet,
  updateSubscriberUsingPut,
  deleteSubscriberUsingDelete,
} from '../controllers/subscriber.controller';
import {
  createSubscriberSchema,
  updateSubscriberSchema,
  subscriberParamsSchema,
} from '../validation/subscriber.validation';

const router = express.Router();

// Reusable param validation middleware for routes with :subscriber_id
const validateSubscriberParams = validate(subscriberParamsSchema, 'params');

/* --------------------------
   Subscriber Routes
-------------------------- */

// Create subscriber
// Validates request body against createSubscriberSchema
router.post('/', validate(createSubscriberSchema), createSubscriberUsingPost);

// Get all subscribers
// No validation needed; just fetch all subscribers
router.get('/', getSubscribersUsingGet);

// Get single subscriber
// Validates :subscriber_id param before fetching
router.get('/:subscriber_id', validateSubscriberParams, getSubscriberUsingGet);

// Update subscriber
// Validates :subscriber_id param and request body
router.put(
  '/:subscriber_id',
  validateSubscriberParams,
  validate(updateSubscriberSchema),
  updateSubscriberUsingPut
);

// Delete subscriber
// Only validates :subscriber_id param
router.delete('/:subscriber_id', validateSubscriberParams, deleteSubscriberUsingDelete);

export default router;