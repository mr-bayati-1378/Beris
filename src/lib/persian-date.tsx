import React from 'react';

// تابع تبدیل تاریخ میلادی به شمسی
function gregorianToJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + parseInt(String((gy2 + 3) / 4)) - parseInt(String((gy2 + 99) / 100)) + 
             parseInt(String((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
  jy += 400 * parseInt(String(days / 146097));
  days %= 146097;
  if (days > 36524) {
    jy += 100 * parseInt(String(--days / 36524));
    days %= 36524;
    if (days >= 365) days++;
  }
  jy += 4 * parseInt(String(days / 1461));
  days %= 1461;
  if (days > 365) {
    jy += parseInt(String((days - 1) / 365));
    days = (days - 1) % 365;
  }
  let jm = (days < 186) ? 1 + parseInt(String(days / 31)) : 7 + parseInt(String((days - 186) / 30));
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { year: jy, month: jm, day: jd };
}

// تابع تبدیل تاریخ شمسی به میلادی
function jalaliToGregorian(jy: number, jm: number, jd: number) {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let gy2 = (jm > 2) ? (jy + 1) : jy;
  let days = (365 * jy) + ((parseInt(String(jy / 33))) * 8) + parseInt(String(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * parseInt(String(days / 146097));
  days %= 146097;
  if (days > 36524) {
    gy += 100 * parseInt(String(--days / 36524));
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * parseInt(String(days / 1461));
  days %= 1461;
  if (days > 365) {
    gy += parseInt(String((days - 1) / 365));
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  let gm = (days < 186) ? 1 + parseInt(String(days / 31)) : 7 + parseInt(String((days - 186) / 30));
  return { year: gy, month: gm, day: gd };
}

// نام‌های ماه‌های شمسی
const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// نام‌های روزهای هفته
const jalaliDays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

export const PersianDate = {
  // تبدیل تاریخ میلادی به شمسی
  toPersian(date: string | Date): string {
    const d = new Date(date);
    const jalali = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jalali.year}/${String(jalali.month).padStart(2, '0')}/${String(jalali.day).padStart(2, '0')}`;
  },

  // تبدیل تاریخ شمسی به میلادی
  toGregorian(persianDate: string): string {
    const parts = persianDate.split('/');
    if (parts.length !== 3) return '';
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    const gregorian = jalaliToGregorian(year, month, day);
    return `${gregorian.year}-${String(gregorian.month).padStart(2, '0')}-${String(gregorian.day).padStart(2, '0')}`;
  },

  // تبدیل به فرمت کامل فارسی
  toPersianFull(date: string | Date): string {
    const d = new Date(date);
    const jalali = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jalali.day} ${jalaliMonths[jalali.month - 1]} ${jalali.year}`;
  },

  // تبدیل به فرمت کامل با روز هفته
  toPersianWithDay(date: string | Date): string {
    const d = new Date(date);
    const jalali = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const gregorian = jalaliToGregorian(jalali.year, jalali.month, jalali.day);
    const dateObj = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
    const dayOfWeek = jalaliDays[dateObj.getDay()];
    return `${dayOfWeek}، ${jalali.day} ${jalaliMonths[jalali.month - 1]} ${jalali.year}`;
  },

  // دریافت تاریخ امروز شمسی
  today(): string {
    const now = new Date();
    const jalali = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return `${jalali.year}/${String(jalali.month).padStart(2, '0')}/${String(jalali.day).padStart(2, '0')}`;
  },

  // تبدیل برای input date (میلادی برای HTML input)
  toInputFormat(persianDate: string): string {
    if (!persianDate) return '';
    return this.toGregorian(persianDate);
  },

  // تبدیل از input date به شمسی
  fromInputFormat(gregorianDate: string): string {
    if (!gregorianDate) return '';
    return this.toPersian(gregorianDate);
  },

  // بررسی معتبر بودن تاریخ شمسی
  isValid(persianDate: string): boolean {
    const parts = persianDate.split('/');
    if (parts.length !== 3) return false;
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // بررسی روزهای ماه شمسی
    const jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
    if (month === 12 && ((year + 12) % 33) % 4 === 1) {
      if (day > 30) return false;
    } else {
      if (day > jalaliDaysInMonth[month - 1]) return false;
    }
    
    return true;
  },

  // محاسبه تفاوت روزها
  diffDays(date1: string | Date, date2: string | Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // فرمت‌بندی نسبی (مثل "2 روز پیش")
  fromNow(date: string | Date): string {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'امروز';
    if (diffDays === 1) return 'دیروز';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} روز پیش`;
    if (diffDays >= 7 && diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
    if (diffDays >= 30 && diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`;
    return `${Math.floor(diffDays / 365)} سال پیش`;
  },

  // تبدیل تاریخ و زمان کامل
  toPersianDateTime(date: string | Date): string {
    const d = new Date(date);
    const jalali = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${jalali.year}/${String(jalali.month).padStart(2, '0')}/${String(jalali.day).padStart(2, '0')} - ${hours}:${minutes}`;
  }
};

// کامپوننت Input تاریخ شمسی
export interface PersianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export const PersianDateInput: React.FC<PersianDateInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'YYYY/MM/DD',
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gregorianValue = e.target.value;
    if (gregorianValue) {
      const persianValue = PersianDate.fromInputFormat(gregorianValue);
      onChange(persianValue);
    } else {
      onChange('');
    }
  };

  const inputValue = value ? PersianDate.toInputFormat(value) : '';

  return (
    <input
      type="date"
      value={inputValue}
      onChange={handleChange}
      className={`${className} text-left`}
      placeholder={placeholder}
      required={required}
      dir="ltr"
    />
  );
};

export default PersianDate; 