import type { Request, Response } from "express";
import { createContactSchema } from "@noteapp/shared";
import * as companyService from "../services/company.service.js";
import * as productService from "../services/product.service.js";
import * as articleService from "../services/article.service.js";
import * as contactService from "../services/contact.service.js";
import { sendSuccess, sendPaginated, sendError } from "../utils/response.js";

export async function getCompanyInfo(_req: Request, res: Response) {
  const info = await companyService.getCompanyInfo();
  return sendSuccess(res, info);
}

export async function getPublicSettings(_req: Request, res: Response) {
  const settings = await companyService.getPublicSettings();
  return sendSuccess(res, settings);
}

export async function getProducts(req: Request, res: Response) {
  const result = await productService.getPublicProducts({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    category: req.query.category as string | undefined,
  });
  return sendPaginated(res, result.items, result.total, result.page, result.pageSize);
}

export async function getProductById(req: Request, res: Response) {
  const product = await productService.getPublicProductById(Number(req.params.id));
  return sendSuccess(res, product);
}

export async function getArticles(req: Request, res: Response) {
  const result = await articleService.getPublicArticles({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    category: req.query.category as string | undefined,
  });
  return sendPaginated(res, result.items, result.total, result.page, result.pageSize);
}

export async function getArticleById(req: Request, res: Response) {
  const article = await articleService.getPublicArticleById(Number(req.params.id));
  return sendSuccess(res, article);
}

export async function submitContact(req: Request, res: Response) {
  const result = createContactSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, result.error.errors[0]?.message || "参数错误", "VALIDATION_ERROR", 400);
  }
  const contact = await contactService.createContact(result.data);
  return sendSuccess(res, contact, 201);
}
