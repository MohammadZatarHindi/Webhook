// Import types from Express
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * catchAsync
 * -------------
 * Utility to wrap asynchronous route handlers and middleware.
 * Automatically catches errors and passes them to Express's error handler.
 *
 * @param fn - An async Express request handler
 * @returns A new request handler with error-catching logic
 */
export const catchAsync =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    // Execute the async function and catch any errors
    // If an error occurs, pass it to the next middleware (usually errorHandler)
    Promise.resolve(fn(req, res, next)).catch(next);
  };