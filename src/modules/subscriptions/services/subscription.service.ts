import * as db from '../../../config/genericQueries';
import { CreateSubscriptionDTO, UpdateSubscriptionDTO } from '../validation/subscription.validation';
import { Subscription } from '../types/subscription.type';
import { getPipeline } from '../../pipelines/services/pipeline.service';
import { getSubscriber } from '../../subscribers/services/subscriber.service';
import { Pipeline } from '../../pipelines/types/pipeline.type';
import { Subscriber } from '../../subscribers/types/subscriber.type';

const TABLE = 'subscriptions';

/* --------------------------
   CREATE SUBSCRIPTION
-------------------------- */
export const createSubscription = async (data: CreateSubscriptionDTO): Promise<Subscription> => {
  const pipeline = await getPipeline({ pipeline_id: data.pipeline_id });
  if (!pipeline) throw new Error(`Pipeline with id ${data.pipeline_id} not found`);

  const subscriber = await getSubscriber({ subscriber_id: data.subscriber_id });
  if (!subscriber) throw new Error(`Subscriber with id ${data.subscriber_id} not found`);

  const existing = await db.selectQuery<Subscription>(TABLE, {
    where: { pipeline_id: data.pipeline_id, subscriber_id: data.subscriber_id },
    single: true,
  });

  if (existing) throw new Error('Subscription already exists');

  return db.insertQuery<Subscription>(TABLE, { ...data, created_at: new Date() });
};

/* --------------------------
   GET ALL SUBSCRIPTIONS
-------------------------- */
export const getSubscriptions = async (): Promise<Subscription[]> =>
  db.selectQuery<Subscription>(TABLE, { orderBy: 'subscription_id', order: 'ASC' });

/* --------------------------
   GET SINGLE SUBSCRIPTION
-------------------------- */
export const getSubscription = async (subscription_id: number): Promise<Subscription | null> =>
  db.selectQuery<Subscription>(TABLE, { where: { subscription_id }, single: true });

/* --------------------------
   UPDATE SUBSCRIPTION
-------------------------- */
export const updateSubscription = async (
  subscription_id: number,
  data: UpdateSubscriptionDTO
): Promise<Subscription | null> => {
  if (data.pipeline_id) {
    const pipeline = await getPipeline({ pipeline_id: data.pipeline_id });
    if (!pipeline) throw new Error(`Pipeline with id ${data.pipeline_id} not found`);
  }

  if (data.subscriber_id) {
    const subscriber = await getSubscriber({ subscriber_id: data.subscriber_id });
    if (!subscriber) throw new Error(`Subscriber with id ${data.subscriber_id} not found`);
  }

  return db.updateQuery<Subscription>(TABLE, data, { subscription_id });
};

/* --------------------------
   DELETE SUBSCRIPTION
-------------------------- */
export const deleteSubscription = async (subscription_id: number): Promise<Subscription | null> =>
  db.deleteQuery<Subscription>(TABLE, { subscription_id });

/* --------------------------
   PIPELINE SUBSCRIBERS
-------------------------- */
export const getPipelineSubscribers = async (pipeline_id: number): Promise<Subscriber[]> => {
  const pipeline = await getPipeline({ pipeline_id });
  if (!pipeline) throw new Error(`Pipeline with id ${pipeline_id} not found`);

  const result = await db.joinQuery<Subscriber>({
    from: 'subscribers s',
    join: { table: 'subscriptions sub', on: 's.subscriber_id = sub.subscriber_id', type: 'INNER' },
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
    join: { table: 'subscriptions sub', on: 'p.pipeline_id = sub.pipeline_id', type: 'INNER' },
    where: { 'sub.subscriber_id': subscriber_id },
    orderBy: 'p.pipeline_id',
  });

  if (!result) return [];
  return Array.isArray(result) ? result : [result];
};