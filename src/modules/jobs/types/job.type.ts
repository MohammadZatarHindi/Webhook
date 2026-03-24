export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  job_id: number;
  pipeline_id: number;
  payload: Record<string, any>;
  status: JobStatus;
  attempts: number;
  created_at?: Date;
  updated_at?: Date;
}