import { Request, Response } from 'express';
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
} from '../validation/subscriber.validation';
import { sendResponse } from '../../../utils/responseHandler';
import { asyncHandler } from '../../../utils/asyncHandler';

/* --------------------------
   CREATE SUBSCRIBER
-------------------------- */
export const createSubscriberUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const dto = req.body as CreateSubscriberDTO;
    const subscriber = await createSubscriber(dto);

    return sendResponse({
      res,
      entity: 'Subscriber',
      action: 'created',
      data: subscriber,
      statusCode: 201,
    });
  }
);

/* --------------------------
   GET ALL SUBSCRIBERS
-------------------------- */
export const getSubscribersUsingGet = asyncHandler(
  async (_req: Request, res: Response) => {
    const subscribers = await getSubscribers();

    return sendResponse({
      res,
      entity: 'Subscribers',
      action: 'retrieved',
      data: subscribers,
    });
  }
);

/* --------------------------
   GET SINGLE SUBSCRIBER
-------------------------- */
export const getSubscriberUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);

    if (isNaN(subscriber_id)) {
      return sendResponse({ res, error: 'Invalid subscriber ID', statusCode: 400 });
    }

    const subscriber = await getSubscriber({ subscriber_id });

    if (!subscriber) {
      return sendResponse({ res, entity: 'Subscriber', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Subscriber',
      action: 'retrieved',
      data: subscriber,
    });
  }
);

/* --------------------------
   UPDATE SUBSCRIBER
-------------------------- */
export const updateSubscriberUsingPut = asyncHandler(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);
    const dto = req.body as UpdateSubscriberDTO;
    const subscriber = await updateSubscriber({ subscriber_id }, dto);

    if (!subscriber) {
      return sendResponse({ res, entity: 'Subscriber', action: 'notFound' });
    }

    const updatedFields = Object.keys(dto).reduce<Record<string, any>>(
      (acc, key) => {
        if ((dto as any)[key] !== undefined) acc[key] = (subscriber as any)[key];
        return acc;
      },
      {}
    );

    return sendResponse({
      res,
      entity: 'Subscriber',
      action: 'updated',
      data: { subscriber, updatedFields },
    });
  }
);

/* --------------------------
   DELETE SUBSCRIBER
-------------------------- */
export const deleteSubscriberUsingDelete = asyncHandler(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);
    const subscriber = await deleteSubscriber({ subscriber_id });

    if (!subscriber) {
      return sendResponse({ res, entity: 'Subscriber', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Subscriber',
      action: 'deleted',
      data: subscriber,
    });
  }
);