import { z } from "zod";

// Define allowed action types for validation
export const actionTypeEnum = z.enum(['log', 'uppercase', 'reverse']);

// Validation schema for creating a pipeline
export const createPipelineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  action: actionTypeEnum,
});

// Type inferred from Zod schema
export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;