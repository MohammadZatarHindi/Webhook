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

import { sendResponse } from '../../../utils/responseHandler';
import { asyncHandler } from '../../../utils/asyncHandler';

/* --------------------------
   CREATE PIPELINE
-------------------------- */
export const createPipelineUsingPost = asyncHandler(
  async (req: Request, res: Response) => {
    const pipeline = await createPipeline(req.body as CreatePipelineDTO);

    return sendResponse({
      res,
      entity: 'Pipeline',
      action: 'created',
      data: pipeline,
      statusCode: 201,
    });
  }
);

/* --------------------------
   GET ALL PIPELINES
-------------------------- */
export const getPipelinesUsingGet = asyncHandler(
  async (_req: Request, res: Response) => {
    const pipelines = await getPipelines();

    return sendResponse({
      res,
      entity: 'Pipelines',
      action: 'retrieved',
      data: pipelines,
    });
  }
);

/* --------------------------
   GET SINGLE PIPELINE
-------------------------- */
export const getPipelineUsingGet = asyncHandler(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    if (isNaN(pipeline_id)) {
      return sendResponse({
        res,
        error: 'Invalid pipeline ID',
        statusCode: 400,
      });
    }

    const pipeline = await getPipeline({ pipeline_id });

    if (!pipeline) {
      return sendResponse({
        res,
        entity: 'Pipeline',
        action: 'notFound',
      });
    }

    return sendResponse({
      res,
      entity: 'Pipeline',
      action: 'retrieved',
      data: pipeline,
    });
  }
);

/* --------------------------
   UPDATE PIPELINE
-------------------------- */
export const updatePipelineUsingPut = asyncHandler(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    if (isNaN(pipeline_id)) {
      return sendResponse({
        res,
        error: 'Invalid pipeline ID',
        statusCode: 400,
      });
    }

    const pipeline = await updatePipeline(
      { pipeline_id },
      req.body as UpdatePipelineDTO
    );

    if (!pipeline) {
      return sendResponse({
        res,
        entity: 'Pipeline',
        action: 'notFound',
      });
    }

    return sendResponse({
      res,
      entity: 'Pipeline',
      action: 'updated',
      data: pipeline,
    });
  }
);

/* --------------------------
   DELETE PIPELINE
-------------------------- */
export const deletePipelineUsingDelete = asyncHandler(
  async (req: Request, res: Response) => {
    const pipeline_id = Number(req.params.pipeline_id);

    if (isNaN(pipeline_id)) {
      return sendResponse({
        res,
        error: 'Invalid pipeline ID',
        statusCode: 400,
      });
    }

    const pipeline = await deletePipeline({ pipeline_id });

    if (!pipeline) {
      return sendResponse({
        res,
        entity: 'Pipeline',
        action: 'notFound',
      });
    }

    return sendResponse({
      res,
      entity: 'Pipeline',
      action: 'deleted',
      data: pipeline,
    });
  }
);