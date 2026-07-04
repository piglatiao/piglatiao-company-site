import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "未授权访问，请先登录", "UNAUTHORIZED", 401);
    return;
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    sendError(res, "Token 无效或已过期", "TOKEN_EXPIRED", 401);
    return;
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "未授权访问", "UNAUTHORIZED", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "权限不足，禁止访问", "FORBIDDEN", 403);
      return;
    }

    next();
  };
}
