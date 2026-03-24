import * as db from '../../../config/genericQueries';
import { Delivery } from '../types/delivery.type';
import { CreateDeliveryDTO, UpdateDeliveryDTO, DeliveryParams } from '../validation/delivery.validation';
import { getJob } from '../../jobs/services/job.service';
import { getSubscriber } from '../../subscribers/services/subscriber.service';

const TABLE = 'deliveries';

// ----------------------
// CREATE DELIVERY
// ----------------------
export const createDelivery = async (dto: CreateDeliveryDTO): Promise<Delivery> => {
  const job = await getJob({ job_id: dto.job_id });
  if (!job) throw new Error(`Job ${dto.job_id} does not exist`);

  const subscriber = await getSubscriber({ subscriber_id: dto.subscriber_id });
  if (!subscriber) throw new Error(`Subscriber ${dto.subscriber_id} does not exist`);

  const record = await db.insertQuery<Delivery>(TABLE, {
    ...dto,
    attempts: dto.attempts ?? 0,
    attempted_at: new Date(),
    created_at: new Date(),
  });

  return record;
};

// ----------------------
// GET ALL DELIVERIES
// ----------------------
export const getDeliveries = async (): Promise<Delivery[]> => {
  return db.selectQuery<Delivery>(TABLE, { orderBy: 'delivery_id', order: 'ASC' }) as Promise<Delivery[]>;
};

// ----------------------
// GET SINGLE DELIVERY
// ----------------------
export const getDelivery = async (params: DeliveryParams): Promise<Delivery | null> => {
  return db.selectQuery<Delivery>(TABLE, { where: { delivery_id: params.delivery_id }, single: true }) as Promise<Delivery | null>;
};

// ----------------------
// UPDATE DELIVERY
// ----------------------
export const updateDelivery = async (params: DeliveryParams, fields: UpdateDeliveryDTO): Promise<Delivery | null> => {
  if (fields.job_id !== undefined) {
    const job = await getJob({ job_id: fields.job_id });
    if (!job) throw new Error(`Job ${fields.job_id} does not exist`);
  }

  if (fields.subscriber_id !== undefined) {
    const subscriber = await getSubscriber({ subscriber_id: fields.subscriber_id });
    if (!subscriber) throw new Error(`Subscriber ${fields.subscriber_id} does not exist`);
  }

  const updateData = {
    ...fields,
    attempted_at: new Date(), // updates timestamp
  };

  return (await db.updateQuery<Delivery>(TABLE, updateData, { delivery_id: params.delivery_id })) || null;
};

// ----------------------
// DELETE DELIVERY
// ----------------------
export const deleteDelivery = async (params: DeliveryParams): Promise<Delivery | null> => {
  return db.deleteQuery<Delivery>(TABLE, { delivery_id: params.delivery_id }) as Promise<Delivery | null>;
};

// ----------------------
// GET ALL DELIVERIES FOR A JOB
// ----------------------
export const getJobDeliveries = async (job_id: number): Promise<Delivery[]> => {
  const job = await getJob({ job_id });
  if (!job) throw new Error(`Job ${job_id} does not exist`);

  return db.selectQuery<Delivery>(TABLE, { where: { job_id }, orderBy: 'delivery_id', order: 'ASC' }) as Promise<Delivery[]>;
};

// ----------------------
// GET ALL DELIVERIES FOR A SUBSCRIBER
// ----------------------
export const getSubscriberDeliveries = async (subscriber_id: number): Promise<Delivery[]> => {
  const subscriber = await getSubscriber({ subscriber_id });
  if (!subscriber) throw new Error(`Subscriber ${subscriber_id} does not exist`);

  return db.selectQuery<Delivery>(TABLE, { where: { subscriber_id }, orderBy: 'delivery_id', order: 'ASC' }) as Promise<Delivery[]>;
};