import * as db from '../../../config/genericQueries';
import { CreateSubscribtionDTO, UpdateSubscribtionDTO } from '../validation/subscribtion.validation';
import { Subscribtion } from '../types/subscribtion.type';
import { getPipeline } from '../../pipelines/services/pipeline.service';
import { getSubscriber } from '../../subscribers/services/subscriber.service';
import { Pipeline } from '../../pipelines/types/pipeline.type';
import { Subscriber } from '../../subscribers/types/subscriber.type';

const TABLE = 'subscribtions';

/* --------------------------
   CREATE SUBSCRIPTION
-------------------------- */
export const createSubscribtion = async (data: CreateSubscribtionDTO): Promise<Subscribtion> => {
  const pipeline = await getPipeline({ pipeline_id: data.pipeline_id });
  if (!pipeline) throw new Error(`Pipeline with id ${data.pipeline_id} not found`);

  const subscriber = await getSubscriber({ subscriber_id: data.subscriber_id });
  if (!subscriber) throw new Error(`Subscriber with id ${data.subscriber_id} not found`);

  const existing = await db.selectQuery<Subscribtion>(TABLE, {
    where: { pipeline_id: data.pipeline_id, subscriber_id: data.subscriber_id },
    single: true,
  });

  if (existing) throw new Error('Subscribtion already exists');

  return db.insertQuery<Subscribtion>(TABLE, { ...data, created_at: new Date() });
};

/* --------------------------
   GET ALL SUBSCRIPTIONS
-------------------------- */
export const getSubscribtions = async (): Promise<Subscribtion[]> =>
  db.selectQuery<Subscribtion>(TABLE, { orderBy: 'subscribtion_id', order: 'ASC' });

/* --------------------------
   GET SINGLE SUBSCRIPTION
-------------------------- */
export const getSubscribtion = async (subscribtion_id: number): Promise<Subscribtion | null> =>
  db.selectQuery<Subscribtion>(TABLE, { where: { subscribtion_id }, single: true });

/* --------------------------
   UPDATE SUBSCRIPTION
-------------------------- */
export const updateSubscribtion = async (
  subscribtion_id: number,
  data: UpdateSubscribtionDTO
): Promise<Subscribtion | null> => {
  if (data.pipeline_id) {
    const pipeline = await getPipeline({ pipeline_id: data.pipeline_id });
    if (!pipeline) throw new Error(`Pipeline with id ${data.pipeline_id} not found`);
  }

  if (data.subscriber_id) {
    const subscriber = await getSubscriber({ subscriber_id: data.subscriber_id });
    if (!subscriber) throw new Error(`Subscriber with id ${data.subscriber_id} not found`);
  }

  return db.updateQuery<Subscribtion>(TABLE, data, { subscribtion_id });
};

/* --------------------------
   DELETE SUBSCRIPTION
-------------------------- */
export const deleteSubscribtion = async (subscribtion_id: number): Promise<Subscribtion | null> =>
  db.deleteQuery<Subscribtion>(TABLE, { subscribtion_id });

/* --------------------------
   PIPELINE SUBSCRIBERS
-------------------------- */
export const getPipelineSubscribers = async (pipeline_id: number): Promise<Subscriber[]> => {
  const pipeline = await getPipeline({ pipeline_id });
  if (!pipeline) throw new Error(`Pipeline with id ${pipeline_id} not found`);

  const result = await db.joinQuery<Subscriber>({
    from: 'subscribers s',
    join: { table: 'subscribtions sub', on: 's.subscriber_id = sub.subscriber_id', type: 'INNER' },
    where: { 'sub.pipeline_id': pipeline_id },
    orderBy: 's.subscriber_id',
  });

  if (!result) return [];
  return Array.isArray(result) ? result : [result];
};

/* --------------------------
   SUBSCRIBER PIPELINES
-------------------------- */
export const getSubscriberPipelines = async (subscriber_id: number): Promise<Pipeline[]> => {
  const subscriber = await getSubscriber({ subscriber_id });
  if (!subscriber) throw new Error(`Subscriber with id ${subscriber_id} not found`);

  const result = await db.joinQuery<Pipeline>({
    from: 'pipelines p',
    join: { table: 'subscribtions sub', on: 'p.pipeline_id = sub.pipeline_id', type: 'INNER' },
    where: { 'sub.subscriber_id': subscriber_id },
    orderBy: 'p.pipeline_id',
  });

  if (!result) return [];
  return Array.isArray(result) ? result : [result];
};