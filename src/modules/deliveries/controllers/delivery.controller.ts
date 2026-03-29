import { Request, Response } from 'express';
import {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDelivery,
  deleteDelivery,
  getJobDeliveries,
  getSubscriberDeliveries,
} from '../services/delivery.service';
import { CreateDeliveryDTO, UpdateDeliveryDTO } from '../validation/delivery.validation';
import { sendResponse } from '../../../utils/responseHandler';
import { asyncHandler } from '../../../utils/asyncHandler';

/* --------------------------
   CREATE DELIVERY
-------------------------- */
export const createDeliveryUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as CreateDeliveryDTO;
    const delivery = await createDelivery(body);

    return sendResponse({
      res,
      entity: 'Delivery',
      action: 'created',
      data: delivery,
      statusCode: 201,
    });
  }
);

/* --------------------------
   GET ALL DELIVERIES
-------------------------- */
export const getDeliveriesUsingGet = asyncHandler(
  async (_req: Request, res: Response) => {
    const deliveries = await getDeliveries();

    return sendResponse({
      res,
      entity: 'Deliveries',
      action: 'retrieved',
      data: deliveries,
    });
  }
);

/* --------------------------
   GET SINGLE DELIVERY
-------------------------- */
export const getDeliveryUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const delivery_id = Number(req.params.delivery_id);
    const delivery = await getDelivery({ delivery_id });

    if (!delivery) {
      return sendResponse({ res, entity: 'Delivery', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Delivery',
      action: 'retrieved',
      data: delivery,
    });
  }
);

/* --------------------------
   UPDATE DELIVERY
-------------------------- */
export const updateDeliveryUsingPut = asyncHandler(
  async (req: Request, res: Response) => {
    const delivery_id = Number(req.params.delivery_id);
    const body = req.body as UpdateDeliveryDTO;
    const delivery = await updateDelivery({ delivery_id }, body);

    if (!delivery) {
      return sendResponse({ res, entity: 'Delivery', action: 'notFound' });
    }

    const updatedFields = Object.keys(body).reduce<Record<string, any>>((acc, key) => {
      if ((body as any)[key] !== undefined) acc[key] = (delivery as any)[key];
      return acc;
    }, {});

    return sendResponse({
      res,
      entity: 'Delivery',
      action: 'updated',
      data: { delivery, updatedFields },
    });
  }
);

/* --------------------------
   DELETE DELIVERY
-------------------------- */
export const deleteDeliveryUsingDelete = asyncHandler(
  async (req: Request, res: Response) => {
    const delivery_id = Number(req.params.delivery_id);
    const delivery = await deleteDelivery({ delivery_id });

    if (!delivery) {
      return sendResponse({ res, entity: 'Delivery', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Delivery',
      action: 'deleted',
      data: delivery,
    });
  }
);

/* --------------------------
   GET DELIVERIES FOR A JOB
-------------------------- */
export const getJobDeliveriesUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const job_id = Number(req.params.job_id);

    if (isNaN(job_id)) {
      return sendResponse({ res, error: 'Invalid job ID', statusCode: 400 });
    }

    const deliveries = await getJobDeliveries(job_id);

    return sendResponse({
      res,
      entity: 'Job Deliveries',
      action: 'retrieved',
      data: deliveries,
    });
  }
);


/* --------------------------
   GET DELIVERIES FOR A SUBSCRIBER
-------------------------- */
export const getSubscriberDeliveriesUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);

    if (isNaN(subscriber_id)) {
      return sendResponse({ res, error: 'Invalid subscriber ID', statusCode: 400 });
    }

    const deliveries = await getSubscriberDeliveries(subscriber_id);

    return sendResponse({
      res,
      entity: 'Subscriber Deliveries',
      action: 'retrieved',
      data: deliveries,
    });
  }
);