'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

interface JalaliDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

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

// تابع محاسبه تعداد روزهای ماه شمسی
function getJalaliDaysInMonth(year: number, month: number): number {
  const jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
  
  // سال کبیسه شمسی
  if (month === 12 && ((year + 12) % 33) % 4 === 1) {
    return 30;
  }
  
  return jalaliDaysInMonth[month - 1];
}

// تابع محاسبه روز هفته برای تاریخ شمسی
function getJalaliDayOfWeek(year: number, month: number, day: number): number {
  const gregorian = jalaliToGregorian(year, month, day);
  const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
  return date.getDay(); // 0 = یکشنبه
}

export default function JalaliDatePicker({ 
  value, 
  onChange, 
  placeholder = "انتخاب تاریخ", 
  className = "",
  required = false 
}: JalaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // تبدیل تاریخ میلادی به رشته ISO
  function dateToISOString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // تبدیل رشته ISO به تاریخ میلادی
  function isoStringToDate(isoString: string): Date {
    return new Date(isoString);
  }

  useEffect(() => {
    if (value) {
      setSelectedDate(isoStringToDate(value));
    }
  }, [value]);

  const handleDateSelect = (year: number, month: number, day: number) => {
    const gregorian = jalaliToGregorian(year, month, day);
    const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
    setSelectedDate(date);
    onChange(dateToISOString(date));
    setIsOpen(false);
  };

  const getCurrentJalali = () => {
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  };

  const getJalaliDate = (date: Date) => {
    return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  };

  const currentJalali = getCurrentJalali();
  const displayJalali = selectedDate ? getJalaliDate(selectedDate) : currentJalali;

  const jalaliMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const jalaliDays = [
    'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
  ];

  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = getJalaliDaysInMonth(year, month);
    const firstDayOfWeek = getJalaliDayOfWeek(year, month, 1); // 0 = یکشنبه
    
    const days = [];
    
    // روزهای خالی ابتدای ماه
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // روزهای ماه
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(displayJalali.year, displayJalali.month);

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    const jalali = getJalaliDate(selectedDate);
    return `${jalali.year}/${jalali.month.toString().padStart(2, '0')}/${jalali.day.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={formatDisplayValue()}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={placeholder}
          required={required}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const newDate = new Date(displayJalali.year - 1, displayJalali.month - 1, displayJalali.day);
                setCurrentDate(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ‹‹
            </button>
            <button
              onClick={() => {
                const newDate = new Date(displayJalali.year, displayJalali.month - 2, displayJalali.day);
                setCurrentDate(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ‹
            </button>
            <span className="font-semibold">
              {jalaliMonths[displayJalali.month - 1]} {displayJalali.year}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(displayJalali.year, displayJalali.month, displayJalali.day);
                setCurrentDate(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ›
            </button>
            <button
              onClick={() => {
                const newDate = new Date(displayJalali.year + 1, displayJalali.month - 1, displayJalali.day);
                setCurrentDate(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ››
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {jalaliDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                {day.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(displayJalali.year, displayJalali.month, day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded hover:bg-blue-100 disabled:opacity-0
                  ${day && selectedDate && 
                    getJalaliDate(selectedDate).year === displayJalali.year &&
                    getJalaliDate(selectedDate).month === displayJalali.month &&
                    getJalaliDate(selectedDate).day === day
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'text-gray-700'
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-2 border-t">
            <button
              onClick={() => {
                const today = new Date();
                const todayJalali = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
                handleDateSelect(todayJalali.year, todayJalali.month, todayJalali.day);
              }}
              className="w-full text-center text-sm text-blue-600 hover:bg-blue-50 py-1 rounded"
            >
              امروز
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 