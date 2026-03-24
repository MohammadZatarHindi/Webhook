// ----------------------
// Delivery status enum (single source of truth)
// ----------------------
export const DELIVERY_STATUSES = ['pending', 'success', 'failed'] as const;
export type DeliveryStatus = typeof DELIVERY_STATUSES[number];

// ----------------------
// Delivery DB Model
// ----------------------
export interface Delivery {
  delivery_id: number;
  job_id: number;
  subscriber_id: number;
  status: DeliveryStatus;
  attempts: number;
  response_code?: number;
  response_body?: string;
  attempted_at: Date; // timestamp updated on create/update
  created_at: Date;
}