import type {
  Product,
  Category,
  Settings,
  User,
  DashboardData,
  ProductsResponse,
  ActivityLog
} from '../types';

const TOKEN_KEY = 'katalog_pondok_auth_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }
};

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'Terjadi kesalahan pada server';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Public
  getInitialData: () => apiRequest<{
    settings: Settings;
    categories: Category[];
    featuredProducts: Product[];
    latestProducts: Product[];
    stats: { totalProducts: number; totalCategories: number; totalUnits: number };
  }>('/api/public/initial'),

  getCategories: () => apiRequest<Category[]>('/api/public/categories'),

  getProducts: (params: {
    q?: string;
    category?: string | number;
    status?: string;
    unit_usaha?: string;
    sort?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category) query.set('category', String(params.category));
    if (params.status) query.set('status', params.status);
    if (params.unit_usaha) query.set('unit_usaha', params.unit_usaha);
    if (params.sort) query.set('sort', params.sort);
    if (params.featured) query.set('featured', '1');
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return apiRequest<ProductsResponse>(`/api/public/products?${query.toString()}`);
  },

  getProductDetail: (slugOrId: string | number) =>
    apiRequest<{ product: Product; relatedProducts: Product[] }>(`/api/public/products/${slugOrId}`),

  recordInquiry: (id: number) =>
    apiRequest<{ success: boolean }>(`/api/public/inquiry/${id}`, { method: 'POST' }),

  // Auth
  login: (username: string, password: string) =>
    apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getCurrentUser: () => apiRequest<{ user: User }>('/api/auth/me'),

  logout: () =>
    apiRequest<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Admin
  getDashboard: () => apiRequest<DashboardData>('/api/admin/dashboard'),

  getAdminProducts: () => apiRequest<Product[]>('/api/admin/products'),

  createProduct: (data: Partial<Product>) =>
    apiRequest<{ success: boolean; productId: number; slug: string }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProduct: (id: number, data: Partial<Product>) =>
    apiRequest<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProduct: (id: number) =>
    apiRequest<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE'
    }),

  createCategory: (data: Partial<Category>) =>
    apiRequest<{ success: boolean; categoryId: number; slug: string }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCategory: (id: number, data: Partial<Category>) =>
    apiRequest<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteCategory: (id: number) =>
    apiRequest<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    }),

  getSettings: () => apiRequest<Settings>('/api/admin/settings'),

  updateSettings: (settings: Partial<Settings>) =>
    apiRequest<{ success: boolean }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  changePassword: (current_password: string, new_password: string) =>
    apiRequest<{ success: boolean; message: string }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    }),

  uploadImage: (base64Data: string, filename?: string) =>
    apiRequest<{ url: string; filename?: string }>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ base64Data, filename })
    }),

  getLogs: () => apiRequest<ActivityLog[]>('/api/admin/logs')
};
