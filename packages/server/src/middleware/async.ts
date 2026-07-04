import type { NextFunction, Request, Response, RequestHandler } from "express";

/**
 * 包装异步路由处理函数。
 * @param handler 原始异步控制器方法
 * @returns 可被 Express 4 正确捕获异常的路由处理函数
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}
