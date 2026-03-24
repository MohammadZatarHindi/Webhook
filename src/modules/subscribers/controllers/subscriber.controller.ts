import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import {
  createSubscriber,
  getSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
} from '../services/subscriber.service';

import {
  CreateSubscriberDTO,
  UpdateSubscriberDTO,
  SubscriberParams,
} from '../validation/subscriber.validation';

import { sendNotFound } from '../../../utils/responseHandler';

/* --------------------------
   CREATE SUBSCRIBER
-------------------------- */
export const createSubscriberUsingPost = catchAsync(
  async (req: Request, res: Response) => {
    const dto = req.body as CreateSubscriberDTO;
    const subscriber = await createSubscriber(dto);
    return res.status(201).json({ success: true, message: 'Subscriber created', subscriber });
  }
);

/* --------------------------
   GET ALL SUBSCRIBERS
-------------------------- */
export const getSubscribersUsingGet = catchAsync(
  async (_req: Request, res: Response) => {
    const subscribers = await getSubscribers();
    return res.json({
      success: true,
      subscribers,
      ...(subscribers.length === 0 && { message: 'No subscribers found' }),
    });
  }
);

/* --------------------------
   GET SINGLE SUBSCRIBER
-------------------------- */
export const getSubscriberUsingGet = catchAsync(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id); // Coerce param to number
    const subscriber = await getSubscriber({ subscriber_id });
    if (!subscriber) return sendNotFound(res, 'Subscriber');

    return res.json({ success: true, message: 'Subscriber retrieved', subscriber });
  }
);

/* --------------------------
   UPDATE SUBSCRIBER
-------------------------- */
export const updateSubscriberUsingPut = catchAsync(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);
    const dto = req.body as UpdateSubscriberDTO;
    const subscriber = await updateSubscriber({ subscriber_id }, dto);
    if (!subscriber) return sendNotFound(res, 'Subscriber');

    // Include only fields that were updated
    const updatedFields = Object.keys(dto).reduce<Record<string, any>>((acc, key) => {
      if ((dto as any)[key] !== undefined) acc[key] = (subscriber as any)[key];
      return acc;
    }, {});

    return res.json({
      success: true,
      message: 'Subscriber updated',
      updatedFields,
      subscriber,
    });
  }
);

/* --------------------------
   DELETE SUBSCRIBER
-------------------------- */
export const deleteSubscriberUsingDelete = catchAsync(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);
    const subscriber = await deleteSubscriber({ subscriber_id });
    if (!subscriber) return sendNotFound(res, 'Subscriber');

    return res.json({ success: true, message: 'Subscriber deleted', subscriber });
  }
);