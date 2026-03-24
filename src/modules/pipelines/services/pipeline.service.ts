import { CreatePipelineDTO, UpdatePipelineDTO, PipelineParams } from '../validation/pipeline.validation';
import { Pipeline } from '../types/pipeline.type';
import * as db from '../../../config/genericQueries';

const TABLE = 'pipelines';

/* ----------------------
   CREATE PIPELINE
---------------------- */
export const createPipeline = async (dto: CreatePipelineDTO): Promise<Pipeline> => {
  // Inserts a new pipeline record into the DB
  return db.insertQuery<Pipeline>(TABLE, dto);
};

/* ----------------------
   GET ALL PIPELINES
---------------------- */
export const getPipelines = async (): Promise<Pipeline[]> => {
  // Selects all pipelines, ordered by pipeline_id ascending
  return db.selectQuery<Pipeline>(TABLE, {
    orderBy: 'pipeline_id',
    order: 'ASC',
  });
};

/* ----------------------
   GET SINGLE PIPELINE
---------------------- */
export const getPipeline = async (params: PipelineParams): Promise<Pipeline | null> => {
  // Selects a single pipeline by its pipeline_id
  return db.selectQuery<Pipeline>(TABLE, {
    where: { pipeline_id: params.pipeline_id },
    single: true,
  });
};

/* ----------------------
   UPDATE PIPELINE
---------------------- */
export const updatePipeline = async (
  params: PipelineParams,
  fields: UpdatePipelineDTO
): Promise<Pipeline | null> => {
  // Updates the pipeline with given fields, returns updated row
  return db.updateQuery<Pipeline>(TABLE, fields, { pipeline_id: params.pipeline_id });
};

/* ----------------------
   DELETE PIPELINE
---------------------- */
export const deletePipeline = async (params: PipelineParams): Promise<Pipeline | null> => {
  // Deletes the pipeline, returns the deleted record
  return db.deleteQuery<Pipeline>(TABLE, { pipeline_id: params.pipeline_id });
};