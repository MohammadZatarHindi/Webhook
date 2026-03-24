import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * errorHandler
 * -------------
 * Global Express error-handling middleware.
 * Catches errors thrown in routes or middleware and sends standardized JSON responses.
 *
 * @param err - The error object caught
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction (not used here, but required by Express)
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging
  console.error(err);

  // If the error is an instance of AppError (custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,      // Indicates request failed
      message: err.message, // Provides error message
    });
  }

  // Handle unexpected or generic errors
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error', // Default message for unexpected errors

    // Include stack trace only in non-production environments for debugging
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};