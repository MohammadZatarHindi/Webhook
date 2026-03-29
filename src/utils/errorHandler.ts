import { Request, Response, NextFunction } from 'express';
import { sendResponse } from './responseHandler';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  return sendResponse({
    res,
    error: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  });
};