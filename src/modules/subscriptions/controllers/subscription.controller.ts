import { Request, Response } from 'express';
import {
  createSubscription,
  getSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  getPipelineSubscribers,
  getSubscriberPipelines,
} from '../services/subscription.service';
import { CreateSubscriptionDTO, UpdateSubscriptionDTO } from '../validation/subscription.validation';
import { sendResponse } from '../../../utils/responseHandler';
import { asyncHandler } from '../../../utils/asyncHandler';

/* --------------------------
   CREATE SUBSCRIPTION
-------------------------- */
export const createSubscriptionUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const dto = req.body as CreateSubscriptionDTO;
    const subscription = await createSubscription(dto);

    return sendResponse({
      res,
      entity: 'Subscription',
      action: 'created',
      data: subscription,
      statusCode: 201,
    });
  }
);

/* --------------------------
   GET ALL SUBSCRIPTIONS
-------------------------- */
export const getSubscriptionsUsingGet = asyncHandler(
  async (_req: Request, res: Response) => {
    const subscriptions = await getSubscriptions();

    return sendResponse({
      res,
      entity: 'Subscriptions',
      action: 'retrieved',
      data: subscriptions,
    });
  }
);

/* --------------------------
   GET SINGLE SUBSCRIPTION
-------------------------- */
export const getSubscriptionUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const subscription_id = Number(req.params.subscription_id);
    const subscription = await getSubscription(subscription_id);

    if (!subscription) {
      return sendResponse({ res, entity: 'Subscription', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Subscription',
      action: 'retrieved',
      data: subscription,
    });
  }
);

/* --------------------------
   UPDATE SUBSCRIPTION
-------------------------- */
export const updateSubscriptionUsingPut = asyncHandler(
  async (req: Request, res: Response) => {
    const subscription_id = Number(req.params.subscription_id);
    const dto = req.body as UpdateSubscriptionDTO;
    const subscription = await updateSubscription(subscription_id, dto);

    if (!subscription) {
      return sendResponse({ res, entity: 'Subscription', action: 'notFound' });
    }

    const updatedFields = Object.keys(dto).reduce<Record<string, any>>((acc, key) => {
      if ((dto as any)[key] !== undefined) acc[key] = (subscription as any)[key];
      return acc;
    }, {});

    return sendResponse({
      res,
      entity: 'Subscription',
      action: 'updated',
      data: { subscription, updatedFields },
    });
  }
);

/* --------------------------
   DELETE SUBSCRIPTION
-------------------------- */
export const deleteSubscriptionUsingDelete = asyncHandler(
  async (req: Request, res: Response) => {
    const subscription_id = Number(req.params.subscription_id);
    const subscription = await deleteSubscription(subscription_id);

    if (!subscription) {
      return sendResponse({ res, entity: 'Subscription', action: 'notFound' });
    }

    return sendResponse({
      res,
      entity: 'Subscription',
      action: 'deleted',
      data: subscription,
    });
  }
);

/* --------------------------
   GET PIPELINE SUBSCRIBERS
-------------------------- */
export const getPipelineSubscribersUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    if (isNaN(pipeline_id)) {
      return sendResponse({ res, error: 'Invalid pipeline ID', statusCode: 400 });
    }

    const subscribers = await getPipelineSubscribers(pipeline_id);

    return sendResponse({
      res,
      entity: 'Pipeline Subscribers',
      action: 'retrieved',
      data: subscribers,
    });
  }
);

/* --------------------------
   GET SUBSCRIBER PIPELINES
-------------------------- */
export const getSubscriberPipelinesUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const subscriber_id = Number(req.params.subscriber_id);

    if (isNaN(subscriber_id)) {
      return sendResponse({ res, error: 'Invalid subscriber ID', statusCode: 400 });
    }

    const pipelines = await getSubscriberPipelines(subscriber_id);

    return sendResponse({
      res,
      entity: 'Subscriber Pipelines',
      action: 'retrieved',
      data: pipelines,
    });
  }
);