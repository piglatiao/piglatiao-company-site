// ========== 通用类型 ==========

/**
 * 接口错误体，统一描述服务端返回的错误码和错误信息。
 */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * 分页元信息，供前后台列表页统一消费总数、页码等数据。
 */
export interface ApiPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

/**
 * 通用接口响应结构。
 * `data` 用于承载业务数据，`meta` 只在分页接口中存在。
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiPaginationMeta;
}

/**
 * 成功返回单个数据体时使用的响应结构。
 */
export interface ApiDataResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * 成功返回分页列表时使用的响应结构。
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  success: true;
  data: T[];
  meta: ApiPaginationMeta;
}

/**
 * 分页查询参数。
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 服务端分页查询结果，供控制器转换为统一接口响应。
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/**
 * 系统设置键值映射。
 */
export type SettingMap = Record<string, string>;

// ========== 管理员相关 ==========

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
}

/**
 * 管理员用户信息。
 */
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: AdminRole;
  avatar: string | null;
  status: number;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 登录成功后返回的令牌信息。
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * 登录接口返回的数据结构。
 */
export interface LoginResult extends AuthTokens {
  user: Omit<AdminUser, "lastLogin" | "createdAt" | "updatedAt">;
}

// ========== 公司信息 ==========

/**
 * 公司基础信息，会被公开页和后台设置共同消费。
 */
export interface CompanyInfo {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  wechat: string | null;
  aboutUs: string | null;
}

// ========== 产品相关 ==========

/**
 * 产品完整数据，用于后台管理和公开详情页。
 */
export interface Product {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  sort: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 产品摘要数据，用于公开列表页卡片展示。
 */
export interface ProductListItem {
  id: number;
  title: string;
  summary: string | null;
  coverImage: string | null;
  category: string | null;
  createdAt: string;
}

// ========== 新闻文章 ==========

/**
 * 新闻文章完整数据，用于后台管理和公开详情页。
 */
export interface Article {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  viewCount: number;
  isTop: boolean;
  status: number;
  authorId: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 新闻摘要数据，用于公开列表页展示。
 */
export interface ArticleListItem {
  id: number;
  title: string;
  summary: string | null;
  coverImage: string | null;
  category: string | null;
  isTop: boolean;
  publishedAt: string | null;
  createdAt: string;
}

// ========== 联系留言 ==========

/**
 * 公开留言与后台留言管理使用的统一数据结构。
 */
export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string;
  status: number;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== 系统设置 ==========

/**
 * 单条系统设置。
 */
export interface Setting {
  key: string;
  value: string;
}
