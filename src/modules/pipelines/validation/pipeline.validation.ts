import { z } from 'zod';
import { ACTION_TYPES } from '../types/pipeline.type';

/* --------------------------
   Create Pipeline Schema
-------------------------- */
// Validates request body for creating a new pipeline
export const createPipelineSchema = z
  .object({
    pipeline_name: z
      .string()
      .trim()                       // Remove leading/trailing spaces
      .min(1, { message: 'Pipeline name is required' }), // Non-empty name

    action_type: z.enum(ACTION_TYPES), // Must match one of the defined action types
  })
  .strict(); // No extra fields allowed

// DTO type inferred from Zod schema
export type CreatePipelineDTO = z.infer<typeof createPipelineSchema>;

/* --------------------------
   Update Pipeline Schema
-------------------------- */
// Partial schema: all fields optional for updates
export const updatePipelineSchema = createPipelineSchema.partial();

// DTO type for update
export type UpdatePipelineDTO = z.infer<typeof updatePipelineSchema>;

/* --------------------------
   Route Params Schema
-------------------------- */
// Validates URL params, e.g., :pipeline_id
export const pipelineParamsSchema = z.object({
  pipeline_id: z.coerce
    .number() // Coerce string to number (common in Express)
    .int()    // Must be an integer
    .positive({ message: 'Pipeline ID must be a positive number' }),
});

// DTO type inferred from params schema
export type PipelineParams = z.infer<typeof pipelineParamsSchema>;