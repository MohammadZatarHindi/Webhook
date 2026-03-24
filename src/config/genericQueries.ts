import { pool } from './db';
import { handleDbError } from '../utils/dbErrorHandler';

// ----------------------
// Type definitions
// ----------------------

// Allowed types for query values
type QueryValue = string | number | boolean | Date | null;

// Generic object representing column-value pairs
type QueryFields = Record<string, QueryValue>;

// ----------------------
// SELECT QUERY OPTIONS
// ----------------------

// Used when selecting multiple rows
type SelectOptionsMultiple = {
  fields?: string[];                  // Columns to select, e.g., ['job_id', 'status']
  where?: QueryFields;                // WHERE conditions, e.g., { status: 'pending' }
  orderBy?: string;                   // Column to order results, e.g., 'created_at'
  order?: 'ASC' | 'DESC';             // Sort order
  single?: false;                     // Must be false for multi-row queries
  // Usage inside selectQuery:
  // const jobs = await selectQuery<Job>('jobs', { where: { status: 'pending' } });
  // returns Job[]
};

// Used when selecting exactly one row
type SelectOptionsSingle = {
  fields?: string[];                  // Columns to select
  where?: QueryFields;                // WHERE conditions
  orderBy?: string;                   // Optional ordering
  order?: 'ASC' | 'DESC';             // Optional order direction
  single: true;                       // Must be true for single-row queries
  // Usage inside selectQuery:
  // const subscriber = await selectQuery<Subscriber>('subscribers', { where: { subscriber_id: 1 }, single: true });
  // returns Subscriber | null
};

// ----------------------
// JOIN QUERY OPTIONS
// ----------------------
type JoinOptionsMultiple = {
  select?: string[];                   // Columns to select, e.g., ['p.pipeline_name', 's.subscriber_id']
  from: string;                        // Base table, e.g., 'pipelines p'
  join: {                              // Join table information
    table: string;                     // Table to join, e.g., 'subscribtions s'
    on: string;                        // Join condition, e.g., 'p.pipeline_id = s.pipeline_id'
    type?: 'INNER' | 'LEFT' | 'RIGHT'; // Join type, default is INNER
  };
  where?: QueryFields;                 // Optional WHERE conditions
  orderBy?: string;                    // Optional order by column
  order?: 'ASC' | 'DESC';             // Optional order direction
  single?: false;                      // Must be false for multiple rows
  // Usage inside joinQuery:
  // const rows = await joinQuery<{ pipeline_name: string, subscriber_id: number }>({
  //   select: ['p.pipeline_name', 's.subscriber_id'],
  //   from: 'pipelines p',
  //   join: { table: 'subscribtions s', on: 'p.pipeline_id = s.pipeline_id' },
  //   where: { 's.subscriber_id': 1 }
  // });
  // returns array of objects
};

// Single row expected in join
type JoinOptionsSingle = Omit<JoinOptionsMultiple, 'single'> & { single: true };
// Usage:
// const row = await joinQuery<{ pipeline_name: string, subscriber_id: number }>({
//   select: ['p.pipeline_name', 's.subscriber_id'],
//   from: 'pipelines p',
//   join: { table: 'subscribtions s', on: 'p.pipeline_id = s.pipeline_id' },
//   where: { 's.subscriber_id': 1 },
//   single: true
// });
// returns object | null

// ----------------------
// ALLOWED TABLES
// ----------------------
const ALLOWED_TABLES = new Set([
  'pipelines',
  'subscribers',
  'subscribtions',
  'jobs',
  'deliveries',
]);

// Ensure table is valid (prevents SQL injection)
const validateTable = (table: string) => {
  const tableName = table.split(' ')[0]; // allow alias usage
  if (!ALLOWED_TABLES.has(tableName)) throw new Error(`Invalid table: ${tableName}`);
};

// ----------------------
// HELPERS
// ----------------------

// Build WHERE clause dynamically for parameterized queries
const buildWhereClause = (where: QueryFields, values: any[]): string => {
  const conditions = Object.entries(where).map(([key, value]) => {
    values.push(value);                   // Add value to array for $1, $2...
    return `${key} = $${values.length}`;  // Parameter placeholder
  });
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
};

// Wraps async DB functions to handle errors via handleDbError
const withDbErrorHandling = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    handleDbError(err); // Convert to AppError if possible
    throw err;
  }
};

// ----------------------
// SELECT QUERY
// ----------------------
export function selectQuery<T>(table: string, options?: SelectOptionsMultiple): Promise<T[]>;
export function selectQuery<T>(table: string, options: SelectOptionsSingle): Promise<T | null>;
export function selectQuery<T>(
  table: string,
  options: SelectOptionsSingle | SelectOptionsMultiple = {}
): Promise<T | T[]> {
  return withDbErrorHandling(async () => {
    validateTable(table);

    const fields = options.fields?.join(', ') || '*';              // columns to select
    const values: any[] = [];                                      // store parameter values
    const whereClause = options.where ? buildWhereClause(options.where, values) : ''; // optional WHERE
    const orderClause = options.orderBy ? `ORDER BY ${options.orderBy} ${options.order || 'ASC'}` : ''; // optional ORDER BY
    const query = `SELECT ${fields} FROM ${table} ${whereClause} ${orderClause}`.trim();

    const result = await pool.query(query, values);
    return options.single ? result.rows[0] || null : result.rows; // returns single row or array
  });
}

// ----------------------
// JOIN QUERY
// ----------------------
export function joinQuery<T>(options: JoinOptionsMultiple): Promise<T[]>;
export function joinQuery<T>(options: JoinOptionsSingle): Promise<T | null>;
export function joinQuery<T>(options: JoinOptionsSingle | JoinOptionsMultiple): Promise<T | T[]> {
  return withDbErrorHandling(async () => {
    validateTable(options.from);
    validateTable(options.join.table);

    const selectCols = options.select?.join(', ') || '*';     // columns to select
    const joinType = options.join.type || 'INNER';            // join type
    const values: any[] = [];
    const whereClause = options.where ? buildWhereClause(options.where, values) : '';
    const orderClause = options.orderBy ? `ORDER BY ${options.orderBy} ${options.order || 'ASC'}` : '';

    const query = `
      SELECT ${selectCols}
      FROM ${options.from}
      ${joinType} JOIN ${options.join.table} ON ${options.join.on}
      ${whereClause}
      ${orderClause}
    `.trim();

    const result = await pool.query(query, values);
    return (options as any).single ? result.rows[0] || null : result.rows;
  });
}

// ----------------------
// INSERT QUERY
// ----------------------
export const insertQuery = async <T>(table: string, fields: QueryFields): Promise<T> =>
  withDbErrorHandling(async () => {
    validateTable(table);

    const columns = Object.keys(fields);
    const values = Object.values(fields);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', '); // $1, $2,...

    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0]; // return inserted row
  });

// ----------------------
// UPDATE QUERY
// ----------------------
export const updateQuery = async <T>(table: string, fields: QueryFields, where: QueryFields): Promise<T> =>
  withDbErrorHandling(async () => {
    validateTable(table);

    if (!fields || Object.keys(fields).length === 0) throw new Error('No fields provided for update');
    if (!where || Object.keys(where).length === 0) throw new Error('Where clause required for update');

    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(fields).forEach(([key, value]) => {
      values.push(value);
      updates.push(`${key} = $${values.length}`); // $1, $2...
    });

    const whereClause = buildWhereClause(where, values);
    const query = `UPDATE ${table} SET ${updates.join(', ')} ${whereClause} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0]; // return updated row
  });

// ----------------------
// DELETE QUERY
// ----------------------
export const deleteQuery = async <T>(table: string, where: QueryFields): Promise<T> =>
  withDbErrorHandling(async () => {
    validateTable(table);

    if (!where || Object.keys(where).length === 0) throw new Error('Where clause required for delete');

    const values: any[] = [];
    const whereClause = buildWhereClause(where, values);
    const query = `DELETE FROM ${table} ${whereClause} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0]; // return deleted row
  });