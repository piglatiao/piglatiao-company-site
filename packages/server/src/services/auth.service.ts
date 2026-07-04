import { prisma } from '@noteapp/database';
import { comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, type JwtPayload } from '../utils/jwt.js';
import { AppError } from '../middleware/error.js';

export async function login(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    throw new AppError(401, '用户名或密码错误', 'INVALID_CREDENTIALS');
  }

  if (admin.status !== 1) {
    throw new AppError(403, '账号已被禁用', 'ACCOUNT_DISABLED');
  }

  const valid = await comparePassword(password, admin.password);
  if (!valid) {
    throw new AppError(401, '用户名或密码错误', 'INVALID_CREDENTIALS');
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  const payload: JwtPayload = {
    userId: admin.id,
    username: admin.username,
    role: admin.role,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
    },
  };
}

export async function refreshToken(token: string) {
  let payload: JwtPayload;

  try {
    payload = await import('../utils/jwt.js').then((m) => m.verifyRefreshToken(token));
  } catch {
    throw new AppError(401, 'Refresh token 无效或已过期', 'TOKEN_EXPIRED');
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.userId },
  });

  if (!admin || admin.status !== 1) {
    throw new AppError(401, '用户不存在或已禁用', 'INVALID_USER');
  }

  const newPayload: JwtPayload = {
    userId: admin.id,
    username: admin.username,
    role: admin.role,
  };

  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload),
  };
}

export async function getCurrentUser(userId: number) {
  const admin = await prisma.admin.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      status: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw new AppError(404, '用户不存在', 'NOT_FOUND');
  }

  return admin;
}
