import { pool } from "../../config/db";
import { Pipeline, ActionType } from "./pipelines.types";

/**
 * Create a new pipeline in the database
 * @param name - pipeline name
 * @param action - pipeline action type
 * @returns the created Pipeline object
 */
export const createPipeline = async (
  name: string,
  action: ActionType
): Promise<Pipeline> => {
  const result = await pool.query(
    "INSERT INTO pipelines (name, action_type) VALUES ($1, $2) RETURNING *",
    [name, action]
  );
  return result.rows[0];
};

/**
 * Fetch all pipelines from the database
 * @returns array of Pipeline objects
 */
export const getPipelines = async (): Promise<Pipeline[]> => {
  const result = await pool.query("SELECT * FROM pipelines ORDER BY id DESC");
  return result.rows;
};