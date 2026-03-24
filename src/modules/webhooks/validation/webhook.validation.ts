import { z } from 'zod';

export const webhookSchema = z.object({
  payload: z.object({ text: z.string().min(1) }), // require at least a text property
});

export type WebhookDTO = z.infer<typeof webhookSchema>;

// Route params schema
export const webhookParamsSchema = z.object({
  pipeline_id: z.coerce.number().int().min(1, { message: 'Pipeline ID must be a positive integer' }),
});
export type WebhookParams = z.infer<typeof webhookParamsSchema>;