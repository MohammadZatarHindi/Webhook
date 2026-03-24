import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDelivery,
  deleteDelivery,
  getJobDeliveries,
  getSubscriberDeliveries,
} from '../services/delivery.service';
import { CreateDeliveryDTO, UpdateDeliveryDTO, DeliveryParams } from '../validation/delivery.validation';
import { sendNotFound } from '../../../utils/responseHandler';

/* --------------------------
   CREATE DELIVERY
-------------------------- */
export const createDeliveryUsingPost = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as CreateDeliveryDTO;
  const delivery = await createDelivery(body);
  
  return res.status(201).json({ 
    success: true, 
    message: 'Delivery created', 
    delivery 
  });
});

/* --------------------------
   GET ALL DELIVERIES
-------------------------- */
export const getDeliveriesUsingGet = catchAsync(async (_req: Request, res: Response) => {
  const deliveries = await getDeliveries();
  
  return res.json({ 
    success: true, 
    deliveries, 
    ...(deliveries.length === 0 && { message: 'No deliveries yet' }) 
  });
});

/* --------------------------
   GET SINGLE DELIVERY
-------------------------- */
export const getDeliveryUsingGet = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as DeliveryParams;
  const delivery = await getDelivery(params);
  
  if (!delivery) return sendNotFound(res, 'Delivery');
  
  return res.json({ success: true, delivery });
});

/* --------------------------
   UPDATE DELIVERY
-------------------------- */
export const updateDeliveryUsingPut = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as DeliveryParams;
  const body = req.body as UpdateDeliveryDTO;

  const delivery = await updateDelivery(params, body);
  if (!delivery) return sendNotFound(res, 'Delivery');

  return res.json({ 
    success: true, 
    message: 'Delivery updated', 
    delivery 
  });
});

/* --------------------------
   DELETE DELIVERY
-------------------------- */
export const deleteDeliveryUsingDelete = catchAsync(async (req: Request, res: Response) => {
  const params = req.params as unknown as DeliveryParams;
  const delivery = await deleteDelivery(params);
  
  if (!delivery) return sendNotFound(res, 'Delivery');
  
  return res.json({ 
    success: true, 
    message: 'Delivery deleted', 
    delivery 
  });
});

/* --------------------------
   GET ALL DELIVERIES FOR A JOB
-------------------------- */
export const getJobDeliveriesUsingGet = catchAsync(async (req: Request, res: Response) => {
  const job_id = Number(req.params.job_id);
  const deliveries = await getJobDeliveries(job_id);
  
  return res.json({ 
    success: true, 
    deliveries, 
    ...(deliveries.length === 0 && { message: 'No deliveries found for this job' }) 
  });
});

/* --------------------------
   GET ALL DELIVERIES FOR A SUBSCRIBER
-------------------------- */
export const getSubscriberDeliveriesUsingGet = catchAsync(async (req: Request, res: Response) => {
  const subscriber_id = Number(req.params.subscriber_id);
  const deliveries = await getSubscriberDeliveries(subscriber_id);
  
  return res.json({ 
    success: true, 
    deliveries, 
    ...(deliveries.length === 0 && { message: 'No deliveries found for this subscriber' }) 
  });
});