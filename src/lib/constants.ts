// App Configuration
export const APP_CONFIG = {
  name: 'Beris',
  description: 'Modern e-commerce platform',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  version: '1.0.0',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: '/api',
  timeout: 10000,
  retries: 3,
} as const;

// Pagination
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 12,
  maxLimit: 100,
} as const;

// Product Configuration
export const PRODUCT_CONFIG = {
  maxImages: 5,
  maxNameLength: 100,
  maxDescriptionLength: 1000,
  pricePrecision: 2,
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Sort Options
export const SORT_OPTIONS = {
  PRICE_ASC: { field: 'price', order: 'asc' },
  PRICE_DESC: { field: 'price', order: 'desc' },
  NAME_ASC: { field: 'name', order: 'asc' },
  NAME_DESC: { field: 'name', order: 'desc' },
  NEWEST: { field: 'createdAt', order: 'desc' },
  OLDEST: { field: 'createdAt', order: 'asc' },
} as const;

// Validation Rules
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'لطفا یک ایمیل معتبر وارد کنید',
  },
  phone: {
    pattern: /^(\+98|0)?9\d{9}$/,
    message: 'لطفا یک شماره تلفن معتبر وارد کنید',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message:
      'رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک و اعداد باشد',
  },
} as const;

// File Upload
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 5,
} as const;

// Cache Configuration
export const CACHE = {
  products: 60 * 5, // 5 minutes
  categories: 60 * 30, // 30 minutes
  user: 60 * 10, // 10 minutes
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'خطایی رخ داده است. لطفا دوباره تلاش کنید',
  NETWORK: 'خطا در ارتباط با سرور',
  UNAUTHORIZED: 'دسترسی غیرمجاز',
  NOT_FOUND: 'موردی یافت نشد',
  VALIDATION: 'اطلاعات وارد شده صحیح نیست',
  SERVER_ERROR: 'خطای سرور',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED: 'محصول با موفقیت به سبد خرید اضافه شد',
  PRODUCT_REMOVED: 'محصول از سبد خرید حذف شد',
  ORDER_PLACED: 'سفارش با موفقیت ثبت شد',
  PROFILE_UPDATED: 'پروفایل با موفقیت بروزرسانی شد',
  WISHLIST_ADDED: 'محصول به لیست علاقه‌مندی‌ها اضافه شد',
  WISHLIST_REMOVED: 'محصول از لیست علاقه‌مندی‌ها حذف شد',
} as const;
