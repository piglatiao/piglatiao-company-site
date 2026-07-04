import type { Response } from 'express';
import type { ApiResponse } from '@noteapp/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response {
  const response: ApiResponse<T> = { success: true, data };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  code = 'ERROR',
  statusCode = 400,
): Response {
  const response: ApiResponse = {
    success: false,
    error: { code, message },
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Response {
  const response: ApiResponse<T[]> = {
    success: true,
    data: items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
  return res.status(200).json(response);
}
