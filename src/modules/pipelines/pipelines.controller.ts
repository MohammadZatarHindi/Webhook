import { Request, Response } from "express";
import * as pipelineService from "./pipelines.service";
import { Pipeline } from "./pipelines.types";
import { createPipelineSchema, CreatePipelineInput } from "./pipelines.schema";

/**
 * @route POST /api/pipelines
 * @desc Create a new pipeline
 * @access Public
 */
export const createPipelineHandler = async (req: Request, res: Response) => {
  try {
    // Validate input using Zod
    const validatedData: CreatePipelineInput = createPipelineSchema.parse(req.body);

    // Call service to create pipeline
    const pipeline: Pipeline = await pipelineService.createPipeline(
      validatedData.name,
      validatedData.action
    );

    res.status(201).json(pipeline);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }

    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
};

/**
 * @route GET /api/pipelines
 * @desc Retrieve all pipelines
 * @access Public
 */
export const getPipelinesHandler = async (_req: Request, res: Response) => {
  try {
    const pipelines: Pipeline[] = await pipelineService.getPipelines();
    res.json(pipelines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
};