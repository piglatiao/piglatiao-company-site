import type {
  AdminUser,
  ApiDataResponse,
  ApiResponse,
  Article,
  CompanyInfo,
  Contact,
  CreateAdminInput,
  CreateArticleInput,
  CreateProductInput,
  LoginResult,
  PaginatedApiResponse,
  Product,
  Setting,
  SettingMap,
  UpdateAdminInput,
  UpdateArticleInput,
  UpdateCompanyInfoInput,
  UpdateProductInput,
} from '@noteapp/shared';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 管理后台基础请求方法。
 * 列表接口需要完整响应结构，因此这里统一返回原始响应。
 */
async function adminRequest<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
    throw new Error('未授权');
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message || '请求失败');
  }
  return json;
}

/**
 * 后台非分页接口统一拆出 `data` 字段，避免页面重复解包。
 */
async function adminRequestData<T>(path: string, options?: RequestInit): Promise<T> {
  const json = (await adminRequest<T>(path, options)) as ApiDataResponse<T>;
  return json.data;
}

/**
 * 后台分页接口保留 `meta`，供统计卡片和列表总数使用。
 */
async function adminRequestPaginated<T>(
  path: string,
  options?: RequestInit,
): Promise<PaginatedApiResponse<T>> {
  return (await adminRequest<T[]>(path, options)) as PaginatedApiResponse<T>;
}

export const adminApi = {
  // Auth
  login: (data: { username: string; password: string }) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json() as Promise<ApiResponse<LoginResult>>),

  getMe: () => adminRequestData<AdminUser>('/auth/me'),

  // Dashboard
  getProducts: (page = 1) =>
    adminRequestPaginated<Product>(`/admin/products?page=${page}&pageSize=100`),
  getArticles: (page = 1) =>
    adminRequestPaginated<Article>(`/admin/articles?page=${page}&pageSize=100`),
  getContacts: (page = 1) =>
    adminRequestPaginated<Contact>(`/admin/contacts?page=${page}&pageSize=100`),
  getAdmins: () => adminRequestPaginated<AdminUser>('/admin/admins?page=1&pageSize=100'),
  getSettings: () => adminRequestData<SettingMap>('/admin/settings'),

  // Products CRUD
  createProduct: (data: CreateProductInput) =>
    adminRequestData<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: UpdateProductInput) =>
    adminRequestData<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    adminRequestData<{ id: number }>(`/admin/products/${id}`, { method: 'DELETE' }),

  // Articles CRUD
  createArticle: (data: CreateArticleInput) =>
    adminRequestData<Article>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: number, data: UpdateArticleInput) =>
    adminRequestData<Article>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: number) =>
    adminRequestData<{ id: number }>(`/admin/articles/${id}`, { method: 'DELETE' }),

  // Contacts
  replyContact: (id: number, reply: string) =>
    adminRequestData<Contact>(`/admin/contacts/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reply }),
    }),
  deleteContact: (id: number) =>
    adminRequestData<{ id: number }>(`/admin/contacts/${id}`, { method: 'DELETE' }),

  // Company
  getCompany: () => adminRequestData<CompanyInfo>('/admin/company'),
  updateCompany: (data: UpdateCompanyInfoInput) =>
    adminRequestData<CompanyInfo>('/admin/company', { method: 'PUT', body: JSON.stringify(data) }),

  // Settings
  updateSetting: (key: string, value: string) =>
    adminRequestData<Setting>(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),

  // Admins
  createAdmin: (data: CreateAdminInput) =>
    adminRequestData<AdminUser>('/admin/admins', { method: 'POST', body: JSON.stringify(data) }),
  updateAdmin: (id: number, data: UpdateAdminInput) =>
    adminRequestData<AdminUser>(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdmin: (id: number) =>
    adminRequestData<{ id: number }>(`/admin/admins/${id}`, { method: 'DELETE' }),
};
