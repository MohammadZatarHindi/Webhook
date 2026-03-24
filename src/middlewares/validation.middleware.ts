import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * validate
 * ----------
 * Middleware factory for validating request data using Zod schemas.
 * Can validate `req.body` or `req.params` (default: body).
 *
 * @param schema - Zod schema to validate against
 * @param type - Either 'body' or 'params' to specify which part of the request to validate
 * @returns Express middleware function
 */
export const validate = (schema: ZodTypeAny, type: 'body' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate the specified part of the request (body or params)
    const result = schema.safeParse(req[type]);

    // If validation fails, return 422 Unprocessable Entity with detailed errors
    if (!result.success) {
      return res.status(422).json({
        success: false, // Indicates validation failed
        errors: result.error.issues.map(issue => ({
          path: issue.path.join('.'), // Path to the invalid field
          message: issue.message,     // Validation error message
        })),
      });
    }

    // Validation passed: replace original request data with parsed & typed data
    req[type] = result.data;

    // Continue to next middleware / route handler
    next();
  };
};