import express from 'express';
import { validate } from '../../../middlewares/validation.middleware';
import {
  createDeliveryUsingPost,
  getDeliveriesUsingGet,
  getDeliveryUsingGet,
  updateDeliveryUsingPut,
  deleteDeliveryUsingDelete,
  getJobDeliveriesUsingGet,
  getSubscriberDeliveriesUsingGet
} from '../controllers/delivery.controller';
import { createDeliverySchema, updateDeliverySchema, deliveryParamsSchema } from '../validation/delivery.validation';

const router = express.Router();

router.post('/', validate(createDeliverySchema), createDeliveryUsingPost);
router.get('/', getDeliveriesUsingGet);
router.get('/:delivery_id', validate(deliveryParamsSchema, 'params'), getDeliveryUsingGet);
router.put('/:delivery_id', validate(deliveryParamsSchema, 'params'), validate(updateDeliverySchema), updateDeliveryUsingPut);
router.delete('/:delivery_id', validate(deliveryParamsSchema, 'params'), deleteDeliveryUsingDelete);

router.get('/job/:job_id', getJobDeliveriesUsingGet);
router.get('/subscriber/:subscriber_id', getSubscriberDeliveriesUsingGet);

export default router;