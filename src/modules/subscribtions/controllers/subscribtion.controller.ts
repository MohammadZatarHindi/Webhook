import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import {
  createSubscribtion,
  getSubscribtion,
  getSubscribtions,
  updateSubscribtion,
  deleteSubscribtion,
  getPipelineSubscribers,
  getSubscriberPipelines,
} from '../services/subscribtion.service';
import { CreateSubscribtionDTO, UpdateSubscribtionDTO, SubscribtionParams } from '../validation/subscribtion.validation';

import { sendNotFound } from '../../../utils/responseHandler';

/* --------------------------
   CREATE SUBSCRIPTION
-------------------------- */
export const createSubscribtionUsingPost = catchAsync(async (req: Request, res: Response) => {
  const dto = req.body as CreateSubscribtionDTO;
  const subscribtion = await createSubscribtion(dto);
  return res.status(201).json({ success: true, message: 'Subscribtion created', subscribtion });
});

/* --------------------------
   GET ALL SUBSCRIPTIONS
-------------------------- */
export const getSubscribtionsUsingGet = catchAsync(async (_req: Request, res: Response) => {
  const subscribtions = await getSubscribtions();
  return res.json({
    success: true,
    subscribtions,
    ...(subscribtions.length === 0 && { message: 'No subscribtions found' }),
  });
});

/* --------------------------
   GET SINGLE SUBSCRIPTION
-------------------------- */
export const getSubscribtionUsingGet = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as SubscribtionParams;
  const subscribtion = await getSubscribtion(params.subscribtion_id);
  if (!subscribtion) return sendNotFound(res, 'Subscribtions');

  return res.json({ success: true, subscribtion });
});

/* --------------------------
   UPDATE SUBSCRIPTION
-------------------------- */
export const updateSubscribtionUsingPut = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as SubscribtionParams;
  const dto = req.body as UpdateSubscribtionDTO;

  const subscribtion = await updateSubscribtion(params.subscribtion_id, dto);
  if (!subscribtion) return sendNotFound(res, 'Subscribtions');

  return res.json({
    success: true,
    message: 'Subscribtion updated',
    subscribtion,
  });
});

/* --------------------------
   DELETE SUBSCRIPTION
-------------------------- */
export const deleteSubscribtionUsingDelete = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as SubscribtionParams;
  const subscribtion = await deleteSubscribtion(params.subscribtion_id);
  if (!subscribtion) return sendNotFound(res, 'Subscribtions');

  return res.json({ success: true, message: 'Subscribtion deleted', subscribtion });
});

/* --------------------------
   GET PIPELINE SUBSCRIBERS
-------------------------- */
export const getPipelineSubscribersUsingGet = catchAsync(async (req: Request, res: Response) => {
  const pipeline_id = Number(req.params.pipeline_id);
  const subscribers = await getPipelineSubscribers(pipeline_id);

  return res.json({
    success: true,
    subscribers,
    ...(subscribers.length === 0 && { message: 'No subscribers found for this pipeline' }),
  });
});

/* --------------------------
   GET SUBSCRIBER PIPELINES
-------------------------- */
export const getSubscriberPipelinesUsingGet = catchAsync(async (req: Request, res: Response) => {
  const subscriber_id = Number(req.params.subscriber_id);
  const pipelines = await getSubscriberPipelines(subscriber_id);

  return res.json({
    success: true,
    pipelines,
    ...(pipelines.length === 0 && { message: 'No pipelines found for this subscriber' }),
  });
});