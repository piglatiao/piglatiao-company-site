import { prisma } from '@noteapp/database';
import { AppError } from '../middleware/error.js';

export async function getPublicProducts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const where = { status: 1, ...(params.category ? { category: params.category } : {}) };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getPublicProductById(id: number) {
  const product = await prisma.product.findFirst({
    where: { id, status: 1 },
  });

  if (!product) {
    throw new AppError(404, '产品不存在', 'NOT_FOUND');
  }

  return product;
}

export async function getAdminProducts(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  status?: number;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const where = {
    ...(params.keyword ? { title: { contains: params.keyword } } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.status !== undefined ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createProduct(data: {
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  category?: string;
  sort?: number;
  status?: number;
}) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: number, data: Partial<{
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  sort: number;
  status: number;
}>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, '产品不存在', 'NOT_FOUND');

  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, '产品不存在', 'NOT_FOUND');

  await prisma.product.delete({ where: { id } });
  return { id };
}
