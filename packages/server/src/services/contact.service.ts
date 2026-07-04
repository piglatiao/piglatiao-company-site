import { prisma } from '@noteapp/database';
import { AppError } from '../middleware/error.js';

export async function createContact(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message: string;
}) {
  return prisma.contact.create({ data });
}

export async function getContacts(params: {
  page?: number;
  pageSize?: number;
  status?: number;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const where = {
    ...(params.status !== undefined ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function replyContact(id: number, reply: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new AppError(404, '留言不存在', 'NOT_FOUND');

  return prisma.contact.update({
    where: { id },
    data: { reply, status: 1 },
  });
}

export async function deleteContact(id: number) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new AppError(404, '留言不存在', 'NOT_FOUND');

  await prisma.contact.delete({ where: { id } });
  return { id };
}
