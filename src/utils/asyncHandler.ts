import { Request, Response, NextFunction } from 'express';

export const asyncHandler = <T = any>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) => (req: Request, res: Response, next: NextFunction) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};