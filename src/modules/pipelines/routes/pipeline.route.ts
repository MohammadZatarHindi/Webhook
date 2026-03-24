import express from 'express';
// Importing the controller functions that handle the actual logic for each route
import {
  createPipelineUsingPost,
  getPipelinesUsingGet,
  getPipelineUsingGet,
  updatePipelineUsingPut,
  deletePipelineUsingDelete,
} from '../controllers/pipeline.controller';

// Importing Zod schemas for validating request bodies and params
import {
  createPipelineSchema,
  updatePipelineSchema,
  pipelineParamsSchema,
} from '../validation/pipeline.validation';

// Importing a generic validation middleware that uses Zod schemas
import { validate } from '../../../middlewares/validation.middleware';

const router = express.Router();

// Reusable param validation middleware for routes with :pipeline_id
const validatePipelineParams = validate(pipelineParamsSchema, 'params');

/* --------------------------
   Pipeline Routes
-------------------------- */

// Create pipeline
// Validates request body with createPipelineSchema before calling the controller
router.post('/', validate(createPipelineSchema), createPipelineUsingPost);

// Get all pipelines
// No validation needed here, just fetch all pipelines
router.get('/', getPipelinesUsingGet);

// Get single pipeline
// Validates URL param :pipeline_id before fetching the specific pipeline
router.get('/:pipeline_id', validatePipelineParams, getPipelineUsingGet);

// Update pipeline
// First validates :pipeline_id param, then validates request body before updating
router.put(
  '/:pipeline_id',
  validatePipelineParams,
  validate(updatePipelineSchema),
  updatePipelineUsingPut
);

// Delete pipeline
// Only validates :pipeline_id param before deleting
router.delete('/:pipeline_id', validatePipelineParams, deletePipelineUsingDelete);

export default router;