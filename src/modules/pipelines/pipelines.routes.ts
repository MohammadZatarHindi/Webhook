import { Router } from "express";
import {
  createPipelineHandler,
  getPipelinesHandler,
} from "./pipelines.controller";

// Create a new router instance
const router = Router();

/**
 * @route POST /api/pipelines
 * @desc Create a new pipeline
 * @access Public (for now)
 * Validates input and stores the pipeline in the database
 */
router.post("/", createPipelineHandler);

/**
 * @route GET /api/pipelines
 * @desc Get all pipelines
 * @access Public (for now)
 * Returns a list of pipelines from the database
 */
router.get("/", getPipelinesHandler);

// Export the router to be used in index.ts
export default router;