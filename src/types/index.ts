export type ProductStatus = 'available' | 'preorder' | 'out_of_stock';

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  short_desc: string;
  description: string;
  price: number;
  original_price?: number | null;
  unit: string;
  stock: number;
  status: ProductStatus;
  image_url: string;
  gallery?: string; // JSON string or array
  unit_usaha?: string;
  specs?: string; // JSON string
  is_featured: number;
  views: number;
  inquiry_count: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  badge_color: string;
  product_count?: number;
  created_at: string;
}

export interface Settings {
  app_name: string;
  tagline: string;
  description: string;
  whatsapp_number: string;
  email: string;
  address: string;
  open_hours: string;
  bank_info: string;
  logo_url?: string;
  announcement?: string;
  pondok_name?: string;
  [key: string]: string | undefined;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  detail: string;
  actor: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalCategories: number;
  totalAvailable: number;
  totalLowStock: number;
  totalInquiries: number;
  totalViews: number;
  catalogValue: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentProducts: Partial<Product>[];
  lowStockProducts: Partial<Product>[];
  categoryDistribution: { name: string; count: number }[];
  recentActivities: ActivityLog[];
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}
