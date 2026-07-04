import type {
  ApiDataResponse,
  ApiResponse,
  Article,
  ArticleListItem,
  CompanyInfo,
  Contact,
  CreateContactInput,
  PaginatedApiResponse,
  Product,
  ProductListItem,
  SettingMap,
} from "@noteapp/shared";

const API_BASE = "/api";

/**
 * 公开站点接口基础请求方法。
 * 分页接口需要消费完整响应，因此这里先保留原始结构。
 */
async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message || "请求失败");
  }
  return json;
}

/**
 * 返回单个数据体，适用于详情、配置等非分页接口。
 */
async function requestData<T>(path: string, options?: RequestInit): Promise<T> {
  const json = (await request<T>(path, options)) as ApiDataResponse<T>;
  return json.data;
}

/**
 * 返回分页数据体，保留 `meta` 供页面读取总数和分页信息。
 */
async function requestPaginated<T>(path: string, options?: RequestInit): Promise<PaginatedApiResponse<T>> {
  return (await request<T[]>(path, options)) as PaginatedApiResponse<T>;
}

export const api = {
  // 公司信息
  getCompany: () => requestData<CompanyInfo>("/public/company"),

  // 公开设置（后台配置的文案等）
  getSettings: () => requestData<SettingMap>("/public/settings"),

  // 产品
  getProducts: (page = 1, pageSize = 10) =>
    requestPaginated<ProductListItem>(`/public/products?page=${page}&pageSize=${pageSize}`),
  getProduct: (id: number) => requestData<Product>(`/public/products/${id}`),

  // 新闻
  getArticles: (page = 1, pageSize = 10) =>
    requestPaginated<ArticleListItem>(`/public/articles?page=${page}&pageSize=${pageSize}`),
  getArticle: (id: number) => requestData<Article>(`/public/articles/${id}`),

  // 留言
  submitContact: (data: CreateContactInput) =>
    requestData<Contact>("/public/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
