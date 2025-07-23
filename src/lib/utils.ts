import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// CSS Class Utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Price Formatting with Yekan Font and Triple Separator
export function formatPrice(price: number, currency: string = 'تومان'): string {
  const formattedPrice = formatPriceWithSeparator(price);
  return formattedPrice + ' ' + currency;
}

export function formatPriceWithoutCurrency(price: number): string {
  return formatPriceWithSeparator(price);
}

// New function for formatting price with triple separator
export function formatPriceWithSeparator(price: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  // Convert to string and add thousand separators
  const priceStr = price.toString();
  const parts = priceStr.split('.');
  const integerPart = parts[0];
  
  // Add thousand separators (every 3 digits from right)
  let formattedInteger = '';
  for (let i = integerPart.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formattedInteger = '،' + formattedInteger;
    }
    formattedInteger = integerPart[i] + formattedInteger;
  }
  
  // Convert English digits to Persian
  let result = formattedInteger;
  for (let i = 0; i < englishDigits.length; i++) {
    const regex = new RegExp(englishDigits[i], 'g');
    result = result.replace(regex, persianDigits[i]);
  }
  
  // Add decimal part if exists
  if (parts.length > 1) {
    let decimalPart = parts[1];
    for (let i = 0; i < englishDigits.length; i++) {
      const regex = new RegExp(englishDigits[i], 'g');
      decimalPart = decimalPart.replace(regex, persianDigits[i]);
    }
    result += '.' + decimalPart;
  }
  
  return result;
}

// Date Formatting
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// String Utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Array Utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Validation Utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+98|0)?9\d{9}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  );
}

// File Utilities
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// URL Utilities
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function buildUrl(
  path: string,
  params?: Record<string, string>
): string {
  const url = new URL(path, getBaseUrl());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
}

// Debounce Utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle Utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Local Storage Utilities
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Error Handling
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'خطایی رخ داده است';
}

// Pagination Utilities
export function calculatePagination(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const halfVisible = Math.floor(maxVisible / 2);
    const start = Math.max(1, currentPage - halfVisible);
    const end = Math.min(totalPages, currentPage + halfVisible);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
  }

  return pages;
}

// Persian Date Utilities
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const persianWeekDays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

// تبدیل اعداد انگلیسی به فارسی
export function toPersianDigits(num: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

// تبدیل اعداد فارسی به انگلیسی
export function toEnglishDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    result = result.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return result;
}

// تبدیل تاریخ میلادی به شمسی - الگوریتم معتبر و تست‌شده
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm, jd;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

// تبدیل تاریخ شمسی به میلادی
export function jalaliToGregorian(jYear: number, jMonth: number, jDay: number): [number, number, number] {
  const jy = jYear - 979;
  const jp = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 
            (jMonth < 7 ? (jMonth - 1) * 31 : (jMonth - 7) * 30 + 186) + jDay - 1;

  let gy = 1600;
  let gm = 1;
  let gd = 1;

  let gp = jp + 79;
  
  const cycle = Math.floor(gp / 146097);
  gp %= 146097;
  
  let tmp = Math.floor(gp / 36524);
  if (tmp !== 4) {
    gp %= 36524;
    gy += tmp * 100;
    
    tmp = Math.floor(gp / 1461);
    gp %= 1461;
    gy += tmp * 4;
    
    tmp = Math.floor(gp / 365);
    if (tmp !== 4) {
      gp %= 365;
      gy += tmp;
    }
  }
  
  gy += cycle * 400;
  
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  gm = 0;
  while (gm < 13 && gd + sal_a[gm] <= gp) {
    gp -= sal_a[gm++];
  }
  
  return [gy, gm, gp + 1];
}

// فرمت کردن تاریخ شمسی
export function formatJalaliDate(date: Date | string, includeTime = false): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const [jYear, jMonth, jDay] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  
  const formattedDate = `${toPersianDigits(jDay)} ${persianMonths[jMonth - 1]} ${toPersianDigits(jYear)}`;
  
  if (includeTime) {
    const hours = toPersianDigits(d.getHours().toString().padStart(2, '0'));
    const minutes = toPersianDigits(d.getMinutes().toString().padStart(2, '0'));
    return `${formattedDate} - ${hours}:${minutes}`;
  }
  
  return formattedDate;
}

// تبدیل تاریخ شمسی به ISO string برای input
export function jalaliToISOString(jYear: number, jMonth: number, jDay: number): string {
  const [gYear, gMonth, gDay] = jalaliToGregorian(jYear, jMonth, jDay);
  return new Date(gYear, gMonth - 1, gDay).toISOString().split('T')[0];
}

// گرفتن تاریخ شمسی از ISO string
export function getJalaliFromISOString(isoString: string): [number, number, number] | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// تبدیل اعداد انگلیسی به فارسی
export function toPersianNumerals(input: number | string | null | undefined): string {
  if (input === null || input === undefined) {
    return '۰';
  }

  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = String(input);
  
  for (let i = 0; i < englishNumbers.length; i++) {
    const regex = new RegExp(englishNumbers[i], 'g');
    result = result.replace(regex, persianNumbers[i]);
  }
  
  return result;
}

// قیمت با فونت یکان و سپریتور سه‌تایی
export function formatPriceWithFont(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return '۰';
  }

  return formatPriceWithSeparator(price);
}

// نسخه ساده با فونت یکان و سپریتور سه‌تایی
export function formatPriceSimple(price: number, currency: string = 'تومان'): string {
  return formatPriceWithSeparator(price) + ' ' + currency;
}
