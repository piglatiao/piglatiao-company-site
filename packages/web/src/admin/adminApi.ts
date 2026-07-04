import { useAuth } from './AuthContext.js';

export function useAdminApi() {
  const { accessToken } = useAuth();

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options?.headers,
      },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || '请求失败');
    }
    return json.data as T;
  }

  return {
    // Products
    getProducts: (page = 1) => request<any>(`/admin/products?page=${page}`),
    createProduct: (data: any) =>
      request<any>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: number, data: any) =>
      request<any>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: number) =>
      request(`/admin/products/${id}`, { method: 'DELETE' }),

    // Articles
    getArticles: (page = 1) => request<any>(`/admin/articles?page=${page}`),
    createArticle: (data: any) =>
      request<any>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
    updateArticle: (id: number, data: any) =>
      request<any>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteArticle: (id: number) =>
      request(`/admin/articles/${id}`, { method: 'DELETE' }),

    // Contacts
    getContacts: (page = 1) => request<any>(`/admin/contacts?page=${page}`),
    replyContact: (id: number, reply: string) =>
      request<any>(`/admin/contacts/${id}/reply`, { method: 'PUT', body: JSON.stringify({ reply }) }),
    deleteContact: (id: number) =>
      request(`/admin/contacts/${id}`, { method: 'DELETE' }),

    // Admins
    getAdmins: (page = 1) => request<any>(`/admin/admins?page=${page}`),
    createAdmin: (data: any) =>
      request<any>('/admin/admins', { method: 'POST', body: JSON.stringify(data) }),
    updateAdmin: (id: number, data: any) =>
      request<any>(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAdmin: (id: number) =>
      request(`/admin/admins/${id}`, { method: 'DELETE' }),

    // Company
    getCompany: () => request<any>('/admin/company'),
    updateCompany: (data: any) =>
      request<any>('/admin/company', { method: 'PUT', body: JSON.stringify(data) }),

    // Settings
    getSettings: () => request<any>('/admin/settings'),
    updateSetting: (key: string, value: string) =>
      request<any>(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  };
}
