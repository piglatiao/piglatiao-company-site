import { prisma } from '@noteapp/database';
import { AppError } from '../middleware/error.js';

export async function getPublicArticles(params: {
  page?: number;
  pageSize?: number;
  category?: string;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const where = {
    status: 1,
    ...(params.category ? { category: params.category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ isTop: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        isTop: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getPublicArticleById(id: number) {
  const article = await prisma.article.findFirst({
    where: { id, status: 1 },
    include: {
      author: {
        select: { id: true, username: true },
      },
    },
  });

  if (!article) {
    throw new AppError(404, '文章不存在', 'NOT_FOUND');
  }

  await prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return article;
}

export async function getAdminArticles(params: {
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
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createArticle(
  data: {
    title: string;
    summary?: string;
    content: string;
    coverImage?: string;
    category?: string;
    isTop?: boolean;
    status?: number;
    publishedAt?: Date;
  },
  authorId: number,
) {
  return prisma.article.create({
    data: { ...data, authorId },
  });
}

export async function updateArticle(id: number, data: Partial<{
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  isTop: boolean;
  status: number;
  publishedAt: Date;
}>) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new AppError(404, '文章不存在', 'NOT_FOUND');

  return prisma.article.update({ where: { id }, data });
}

export async function deleteArticle(id: number) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new AppError(404, '文章不存在', 'NOT_FOUND');

  await prisma.article.delete({ where: { id } });
  return { id };
}
