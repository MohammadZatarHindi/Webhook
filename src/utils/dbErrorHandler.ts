import { AppError } from './appError';

/**
 * handleDbError
 * -------------
 * Centralized handler for database errors.
 * Converts database-specific errors into standardized AppError instances.
 *
 * @param error - The error object thrown by the database
 * @throws AppError - Always throws a standardized error
 */
export const handleDbError = (error: any): never => {
  switch (error.code) {
    // Unique constraint violation (duplicate value)
    case '23505':
      console.error('DB Error detail:', error.detail); // Log detailed DB error for debugging
      throw new AppError('Duplicate value violates unique constraint', 400);

    // Foreign key violation (invalid reference)
    case '23503':
      console.error('DB Error detail:', error.detail);
      throw new AppError('Invalid reference (foreign key violation)', 400);

    // Not null violation (missing required field)
    case '23502':
      console.error('DB Error column:', error.column);
      throw new AppError('Missing required field', 400);

    // Default case for all other database errors
    default:
      console.error('DB Error:', error);
      throw new AppError('Database error', 500);
  }
};