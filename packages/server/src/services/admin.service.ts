import { prisma } from '@noteapp/database';
import { AdminRole } from '@noteapp/database';
import { hashPassword } from '../utils/password.js';
import { AppError } from '../middleware/error.js';

export async function getAdmins(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const where = params.keyword
    ? {
        OR: [
          { username: { contains: params.keyword } },
          { email: { contains: params.keyword } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    }),
    prisma.admin.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createAdmin(data: {
  username: string;
  email: string;
  password: string;
  role?: AdminRole;
}) {
  const existing = await prisma.admin.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.email }],
    },
  });

  if (existing) {
    throw new AppError(409, '用户名或邮箱已存在', 'CONFLICT');
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.admin.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role || AdminRole.EDITOR,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateAdmin(
  id: number,
  data: {
    email?: string;
    password?: string;
    role?: AdminRole;
    avatar?: string;
    status?: number;
  },
) {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new AppError(404, '用户不存在', 'NOT_FOUND');

  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.admin.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteAdmin(id: number, currentUserId: number) {
  if (id === currentUserId) {
    throw new AppError(400, '不能删除自己的账号', 'BAD_REQUEST');
  }

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new AppError(404, '用户不存在', 'NOT_FOUND');

  if (admin.role === AdminRole.SUPER_ADMIN) {
    throw new AppError(403, '不能删除超级管理员', 'FORBIDDEN');
  }

  await prisma.admin.delete({ where: { id } });
  return { id };
}

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function updateSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
