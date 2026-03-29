// config/genericQueries.ts
import { pool } from './db';
import { withDbErrorHandling } from '../utils/dbWrapper';

/** ----------------------
 * Type definitions
---------------------- */
export type QueryValue = string | number | boolean | Date | null;
export type QueryFields = Record<string, QueryValue>;

export type SelectOptionsMultiple = {
  fields?: string[];
  where?: QueryFields;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  single?: false;
};
export type SelectOptionsSingle = {
  fields?: string[];
  where?: QueryFields;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  single: true;
};

export type JoinOptionsMultiple = {
  select?: string[];
  from: string;
  join: { table: string; on: string; type?: 'INNER' | 'LEFT' | 'RIGHT' };
  where?: QueryFields;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  single?: false;
};
export type JoinOptionsSingle = Omit<JoinOptionsMultiple, 'single'> & { single: true };

/** ----------------------
 * Allowed tables
---------------------- */
const ALLOWED_TABLES = new Set([
  'pipelines',
  'subscribers',
  'subscriptions',
  'jobs',
  'deliveries',
]);

const validateTable = (table: string) => {
  const tableName = table.split(' ')[0];
  if (!ALLOWED_TABLES.has(tableName)) {
    throw new Error(`Invalid table: ${tableName}`);
  }
};

/** ----------------------
 * Build WHERE clause
---------------------- */
const buildWhereClause = (where: QueryFields, values: any[]): string => {
  const conditions = Object.entries(where).map(([key, value]) => {
    values.push(value);
    return `${key} = $${values.length}`;
  });
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
};

/** ----------------------
 * SELECT QUERY
---------------------- */
export async function selectQuery<T>(
  table: string,
  options?: SelectOptionsMultiple
): Promise<T[]>;
export async function selectQuery<T>(
  table: string,
  options: SelectOptionsSingle
): Promise<T | null>;
export async function selectQuery<T>(
  table: string,
  options: SelectOptionsSingle | SelectOptionsMultiple = {}
): Promise<T | T[]> {
  return withDbErrorHandling(async () => {
    validateTable(table);

    const fields = options.fields?.join(', ') || '*';
    const values: any[] = [];
    const whereClause = options.where ? buildWhereClause(options.where, values) : '';
    const orderClause = options.orderBy
      ? `ORDER BY ${options.orderBy} ${options.order || 'ASC'}`
      : '';

    const query = `SELECT ${fields} FROM ${table} ${whereClause} ${orderClause}`.trim();

    const result = await pool.query(query, values);

    return (options as any).single
      ? result.rows[0] || null
      : result.rows;
  });
}

/** ----------------------
 * INSERT QUERY
---------------------- */
export const insertQuery = async <T>(
  table: string,
  fields: QueryFields
): Promise<T> => {
  return withDbErrorHandling(async () => {
    validateTable(table);

    const columns = Object.keys(fields);
    const values = Object.values(fields);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  });
};

/** ----------------------
 * UPDATE QUERY
---------------------- */
export const updateQuery = async <T>(
  table: string,
  fields: QueryFields,
  where: QueryFields
): Promise<T> => {
  return withDbErrorHandling(async () => {
    validateTable(table);

    if (!fields || Object.keys(fields).length === 0) {
      throw new Error('No fields provided for update');
    }

    if (!where || Object.keys(where).length === 0) {
      throw new Error('Where clause required for update');
    }

    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(fields).forEach(([key, value]) => {
      values.push(value);
      updates.push(`${key} = $${values.length}`);
    });

    const whereClause = buildWhereClause(where, values);

    const query = `
      UPDATE ${table}
      SET ${updates.join(', ')}
      ${whereClause}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  });
};

/** ----------------------
 * DELETE QUERY
---------------------- */
export const deleteQuery = async <T>(
  table: string,
  where: QueryFields
): Promise<T> => {
  return withDbErrorHandling(async () => {
    validateTable(table);

    if (!where || Object.keys(where).length === 0) {
      throw new Error('Where clause required for delete');
    }

    const values: any[] = [];
    const whereClause = buildWhereClause(where, values);

    const query = `
      DELETE FROM ${table}
      ${whereClause}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  });
};

/** ----------------------
 * JOIN QUERY
---------------------- */
export async function joinQuery<T>(
  options: JoinOptionsMultiple
): Promise<T[]>;
export async function joinQuery<T>(
  options: JoinOptionsSingle
): Promise<T | null>;
export async function joinQuery<T>(
  options: JoinOptionsSingle | JoinOptionsMultiple
): Promise<T | T[]> {
  return withDbErrorHandling(async () => {
    validateTable(options.from);
    validateTable(options.join.table);

    const selectCols = options.select?.join(', ') || '*';
    const joinType = options.join.type || 'INNER';

    const values: any[] = [];
    const whereClause = options.where
      ? buildWhereClause(options.where, values)
      : '';

    const orderClause = options.orderBy
      ? `ORDER BY ${options.orderBy} ${options.order || 'ASC'}`
      : '';

    const query = `
      SELECT ${selectCols}
      FROM ${options.from}
      ${joinType} JOIN ${options.join.table} ON ${options.join.on}
      ${whereClause}
      ${orderClause}
    `.trim();

    const result = await pool.query(query, values);

    return (options as any).single
      ? result.rows[0] || null
      : result.rows;
  });
}