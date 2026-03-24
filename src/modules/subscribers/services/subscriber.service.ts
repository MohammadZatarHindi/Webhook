import { CreateSubscriberDTO, UpdateSubscriberDTO, SubscriberParams } from '../validation/subscriber.validation';
import { Subscriber } from '../types/subscriber.type';
import * as db from '../../../config/genericQueries';

const TABLE = 'subscribers';

/* --------------------------
   CREATE SUBSCRIBER
-------------------------- */
// Inserts a new subscriber record and returns it
export const createSubscriber = async (dto: CreateSubscriberDTO): Promise<Subscriber> =>
  db.insertQuery<Subscriber>(TABLE, dto);

/* --------------------------
   GET ALL SUBSCRIBERS
-------------------------- */
// Fetch all subscribers, ordered by subscriber_id ascending
export const getSubscribers = async (): Promise<Subscriber[]> => {
  const result = await db.selectQuery<Subscriber>(TABLE, {
    orderBy: 'subscriber_id',
    order: 'ASC',
  });

  // Ensure a flat array is always returned
  return Array.isArray(result) ? result : [];
};

/* --------------------------
   GET SINGLE SUBSCRIBER
-------------------------- */
// Fetch one subscriber by ID, return null if not found
export const getSubscriber = async (params: SubscriberParams): Promise<Subscriber | null> =>
  db.selectQuery<Subscriber>(TABLE, {
    where: { subscriber_id: params.subscriber_id },
    single: true,
  });

/* --------------------------
   UPDATE SUBSCRIBER
-------------------------- */
// Update subscriber fields, returns the updated record or null if not found
export const updateSubscriber = async (
  params: SubscriberParams,
  dto: UpdateSubscriberDTO
): Promise<Subscriber | null> =>
  db.updateQuery<Subscriber>(TABLE, dto, { subscriber_id: params.subscriber_id });

/* --------------------------
   DELETE SUBSCRIBER
-------------------------- */
// Delete a subscriber by ID, returns deleted record or null
export const deleteSubscriber = async (params: SubscriberParams): Promise<Subscriber | null> =>
  db.deleteQuery<Subscriber>(TABLE, { subscriber_id: params.subscriber_id });