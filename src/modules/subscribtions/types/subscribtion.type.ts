// ----------------------
// Subscription Model
// ----------------------
export interface Subscribtion {
  subscribtion_id: number;  // Primary key in DB
  pipeline_id: number;      // Foreign key to pipeline
  subscriber_id: number;    // Foreign key to subscriber
  created_at?: Date;        // Optional timestamp (usually auto-generated)
}