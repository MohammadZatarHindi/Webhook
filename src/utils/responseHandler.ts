import { Response } from 'express';

export const sendError = (res: Response, message: string, status: number = 404) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

// Even better: Specific helpers
export const sendNotFound = (res: Response, entity: string = 'Resource') => 
  sendError(res, `${entity} not found`, 404);