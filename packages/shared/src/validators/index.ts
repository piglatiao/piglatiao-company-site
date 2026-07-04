import { z } from 'zod';

// ==================== 认证校验 ====================
export const loginSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符').max(50, '用户名最多 50 个字符'),
  password: z.string().min(6, '密码至少 6 个字符').max(100, '密码最多 100 个字符'),
});

// ==================== 产品校验 ====================
export const createProductSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 个字符'),
  summary: z.string().max(500, '摘要最多 500 个字符').optional(),
  content: z.string().min(1, '内容不能为空'),
  coverImage: z.string().url('封面图片必须是有效 URL').optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  sort: z.number().int().min(0).default(0),
  status: z.number().int().min(0).max(1).default(1),
});

export const updateProductSchema = createProductSchema.partial();

// ==================== 文章校验 ====================
export const createArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 个字符'),
  summary: z.string().max(500, '摘要最多 500 个字符').optional(),
  content: z.string().min(1, '内容不能为空'),
  coverImage: z.string().url('封面图片必须是有效 URL').optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  isTop: z.boolean().default(false),
  status: z.number().int().min(0).max(1).default(1),
  publishedAt: z.coerce.date().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

// ==================== 留言校验 ====================
export const createContactSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多 50 个字符'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  phone: z.string().max(50, '电话最多 50 个字符').optional(),
  company: z.string().max(100, '公司名最多 100 个字符').optional(),
  message: z.string().min(1, '留言内容不能为空').max(2000, '留言最多 2000 个字符'),
});

export const replyContactSchema = z.object({
  reply: z.string().min(1, '回复内容不能为空').max(2000, '回复最多 2000 个字符'),
});

// ==================== 公司信息校验 ====================
export const updateCompanyInfoSchema = z.object({
  name: z.string().min(1, '公司名不能为空').max(100),
  logo: z.string().optional(),
  description: z.string().optional(),
  address: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  wechat: z.string().max(100).optional(),
  aboutUs: z.string().optional(),
});

// ==================== 管理员校验 ====================
export const createAdminSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符').max(50),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 个字符').max(100),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).default('EDITOR'),
});

export const updateAdminSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
  avatar: z.string().optional(),
  status: z.number().int().min(0).max(1).optional(),
});

// ==================== 分页校验 ====================
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().optional(),
  category: z.string().optional(),
  status: z.coerce.number().int().optional(),
});

// ==================== 类型推导 ====================
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type ReplyContactInput = z.infer<typeof replyContactSchema>;
export type UpdateCompanyInfoInput = z.infer<typeof updateCompanyInfoSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
