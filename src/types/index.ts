// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  price: number;
  finalPrice: number;
  originalPrice: number;
  comparePrice: number | null;
  img: string;
  images: string[];
  stock: number;
  hasDiscount: boolean;
  discountPercent: number | null;
  averageRating: number;
  reviewCount: number;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  id: number;
  productId?: number;
  userPackId?: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'pack';
  slug?: string;
  description?: string;
  itemCount?: number;
  packItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  product?: Product;
}

// Order Types
export interface Order {
  id: string;
  slug: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

// Address Types
export interface Address {
  id: number;
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// Search Types
export interface SearchResult {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filter Types
export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  inStock?: boolean;
  hasDiscount?: boolean;
  rating?: number;
}

// Admin Types
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'SUPPORT';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: Date;
}

// Settings Types
export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  language: 'fa' | 'en';
  theme: 'light' | 'dark' | 'auto';
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface Analytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Product[];
  recentOrders: Order[];
  salesChart: {
    labels: string[];
    data: number[];
  };
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId?: string;
  gateway: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shipping Types
export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
}

// Coupon Types
export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// FAQ Types
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Blog Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Types
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Types
export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  productId: number;
  supplierId: number;
  quantity: number;
  cost: number;
  expiryDate: Date;
  batchNumber: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  supplier: Supplier;
}

// Report Types
export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: Category;
    sales: number;
    orders: number;
  }>;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: Order[];
  topProducts: Product[];
  salesChart: {
    labels: string[];
    data: number[];
  };
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Form Types
export interface LoginForm {
  phone: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface AddressForm {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

// Utility Types
export type SortOrder = 'asc' | 'desc';
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
