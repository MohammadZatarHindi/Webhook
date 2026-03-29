import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny, type: 'body' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Make sure req.body is always an object so Zod can validate missing fields
    if (type === 'body' && (!req.body || typeof req.body !== 'object')) {
      req.body = {};
    }

    const result = schema.safeParse(req[type]);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        errors: result.error.issues.map(issue => ({
          path: issue.path.join('.') || '(root)',
          message: issue.message,
        })),
      });
    }

    req[type] = result.data;
    next();
  };
};