import { Response } from 'express';

/**
 * notFound
 * ----------
 * Sends a standardized 404 Not Found response.
 *
 * @param res - Express Response object
 * @param message - Optional custom message (default: 'Resource not found')
 */
export const notFound = (res: Response, message = 'Resource not found') =>
  res.status(404).json({
    success: false, // Indicates the request failed
    message,        // Provides a human-readable message
  });