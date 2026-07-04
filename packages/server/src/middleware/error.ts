import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = 'ERROR',
  ) {
    super(message);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `路径 ${req.originalUrl} 不存在`, 'NOT_FOUND', 404);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return sendError(res, message, 'VALIDATION_ERROR', 400);
  }

  console.error('Unhandled error:', err);
  return sendError(res, '服务器内部错误', 'INTERNAL_ERROR', 500);
}
