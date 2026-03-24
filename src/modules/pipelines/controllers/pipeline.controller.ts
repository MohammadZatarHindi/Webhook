import { Request, Response } from 'express';
import {
  createPipeline,
  getPipelines,
  getPipeline,
  updatePipeline,
  deletePipeline,
} from '../services/pipeline.service';

import {
  CreatePipelineDTO,
  UpdatePipelineDTO,
} from '../validation/pipeline.validation';

import { catchAsync } from '../../../utils/catchAsync';

import { sendNotFound } from '../../../utils/responseHandler';

/* --------------------------
   CREATE PIPELINE
-------------------------- */
export const createPipelineUsingPost = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body as CreatePipelineDTO;

    // Call service layer to create pipeline
    const pipeline = await createPipeline(body);

    return res.status(201).json({
      success: true,
      message: 'Pipeline created',
      pipeline,
    });
  }
);

/* --------------------------
   GET ALL PIPELINES
-------------------------- */
export const getPipelinesUsingGet = catchAsync(
  async (_req: Request, res: Response) => {
    const pipelines = await getPipelines();
    const isEmpty = pipelines.length === 0;

    return res.json({
      success: true,
      pipelines,
      ...(isEmpty && { message: 'No pipelines yet' }),
    });
  }
);

/* --------------------------
   GET SINGLE PIPELINE
-------------------------- */
export const getPipelineUsingGet = catchAsync(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    const pipeline = await getPipeline({ pipeline_id });
    if (!pipeline) return sendNotFound(res, 'Pipeline');;

    return res.json({
      success: true,
      message: `Pipeline retrieved`,
      pipeline,
    });
  }
);

/* --------------------------
   UPDATE PIPELINE
-------------------------- */
export const updatePipelineUsingPut = catchAsync(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);
    const body = req.body as UpdatePipelineDTO;

    // Call service to update the pipeline
    const pipeline = await updatePipeline({ pipeline_id }, body);
    if (!pipeline) return sendNotFound(res, 'Pipeline');;

    // Compute only updated fields to return
    const updatedFields = Object.keys(body).reduce<Record<string, any>>(
      (acc, key) => {
        const value = (body as any)[key];
        if (value !== undefined) {
          acc[key] = (pipeline as any)[key];
        }
        return acc;
      },
      {}
    );

    return res.json({
      success: true,
      message: `Pipeline updated`,
      updatedFields,
      pipeline,
    });
  }
);

/* --------------------------
   DELETE PIPELINE
-------------------------- */
export const deletePipelineUsingDelete = catchAsync(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    const pipeline = await deletePipeline({ pipeline_id });
    if (!pipeline) return sendNotFound(res, 'Pipeline');;

    return res.json({
      success: true,
      message: `Pipeline deleted`,
      pipeline,
    });
  }
);