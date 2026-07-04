import type { Request, Response } from 'express';
import {
  createProductSchema,
  updateProductSchema,
  createArticleSchema,
  updateArticleSchema,
  replyContactSchema,
  updateCompanyInfoSchema,
  createAdminSchema,
  updateAdminSchema,
} from '@noteapp/shared';
import * as productService from '../services/product.service.js';
import * as articleService from '../services/article.service.js';
import * as contactService from '../services/contact.service.js';
import * as companyService from '../services/company.service.js';
import * as adminService from '../services/admin.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/response.js';

// ========== 公司信息 ==========
export async function getCompanyInfo(_req: Request, res: Response) {
  const info = await companyService.getCompanyInfo();
  return sendSuccess(res, info);
}

export async function updateCompanyInfo(req: Request, res: Response) {
  const result = updateCompanyInfoSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const info = await companyService.updateCompanyInfo(result.data);
  return sendSuccess(res, info);
}

// ========== 产品管理 ==========
export async function getProducts(req: Request, res: Response) {
  const result = await productService.getAdminProducts({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    keyword: req.query.keyword as string | undefined,
    category: req.query.category as string | undefined,
    status: req.query.status !== undefined ? Number(req.query.status) : undefined,
  });
  return sendPaginated(res, result.items, result.total, result.page, result.pageSize);
}

export async function createProduct(req: Request, res: Response) {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const product = await productService.createProduct(result.data);
  return sendSuccess(res, product, 201);
}

export async function updateProduct(req: Request, res: Response) {
  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const product = await productService.updateProduct(Number(req.params.id), result.data);
  return sendSuccess(res, product);
}

export async function deleteProduct(req: Request, res: Response) {
  await productService.deleteProduct(Number(req.params.id));
  return sendSuccess(res, { id: Number(req.params.id) });
}

// ========== 文章管理 ==========
export async function getArticles(req: Request, res: Response) {
  const result = await articleService.getAdminArticles({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    keyword: req.query.keyword as string | undefined,
    category: req.query.category as string | undefined,
    status: req.query.status !== undefined ? Number(req.query.status) : undefined,
  });
  return sendPaginated(res, result.items, result.total, result.page, result.pageSize);
}

export async function createArticle(req: Request, res: Response) {
  const result = createArticleSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const article = await articleService.createArticle(result.data, req.user!.userId);
  return sendSuccess(res, article, 201);
}

export async function updateArticle(req: Request, res: Response) {
  const result = updateArticleSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const article = await articleService.updateArticle(Number(req.params.id), result.data);
  return sendSuccess(res, article);
}

export async function deleteArticle(req: Request, res: Response) {
  await articleService.deleteArticle(Number(req.params.id));
  return sendSuccess(res, { id: Number(req.params.id) });
}

// ========== 留言管理 ==========
export async function getContacts(req: Request, res: Response) {
  const result = await contactService.getContacts({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    status: req.query.status !== undefined ? Number(req.query.status) : undefined,
  });
  return sendPaginated(res, result.items, result.total, result.page, result.pageSize);
}

export async function replyContact(req: Request, res: Response) {
  const result = replyContactSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const contact = await contactService.replyContact(Number(req.params.id), result.data.reply);
  return sendSuccess(res, contact);
}

export async function deleteContact(req: Request, res: Response) {
  await contactService.deleteContact(Number(req.params.id));
  return sendSuccess(res, { id: Number(req.params.id) });
}

// ========== 用户管理 ==========
export async function getAdmins(req: Request, res: Response) {
  const result = await adminService.getAdmins({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    keyword: req.query.keyword as string | undefined,
  });
  return sendPaginated(res, result.items, result.total, result.page, result.pageSize);
}

export async function createAdmin(req: Request, res: Response) {
  const result = createAdminSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const admin = await adminService.createAdmin(result.data);
  return sendSuccess(res, admin, 201);
}

export async function updateAdmin(req: Request, res: Response) {
  const result = updateAdminSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || '参数错误', 'VALIDATION_ERROR', 400);
  }
  const admin = await adminService.updateAdmin(Number(req.params.id), result.data);
  return sendSuccess(res, admin);
}

export async function deleteAdmin(req: Request, res: Response) {
  await adminService.deleteAdmin(Number(req.params.id), req.user!.userId);
  return sendSuccess(res, { id: Number(req.params.id) });
}

// ========== 系统设置 ==========
export async function getSettings(_req: Request, res: Response) {
  const settings = await adminService.getSettings();
  return sendSuccess(res, settings);
}

export async function updateSetting(req: Request, res: Response) {
  const key = String(req.params.key || '');
  const { value } = req.body;
  // 允许保存空字符串，便于管理员主动清空 ICP、统计代码等配置。
  if (value === undefined || value === null) {
    return sendError(res, 'value 不能为空', 'VALIDATION_ERROR', 400);
  }
  const setting = await adminService.updateSetting(key, value);
  return sendSuccess(res, setting);
}
