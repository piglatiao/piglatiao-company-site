import type { Request, Response } from 'express';
import { loginSchema } from '@noteapp/shared';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }

  const data = await authService.login(result.data.username, result.data.password);
  return sendSuccess(res, data);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'refreshToken 不能为空', 'VALIDATION_ERROR', 400);
  }

  const data = await authService.refreshToken(refreshToken);
  return sendSuccess(res, data);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);
  return sendSuccess(res, user);
}
