'use client';

import { useState, useEffect } from 'react';
import { 
  toPersianDigits, 
  toEnglishDigits, 
  gregorianToJalali, 
  jalaliToGregorian,
  persianMonths 
} from '@/lib/utils';

interface PersianDateInputProps {
  value?: string; // ISO date string
  onChange?: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

export default function PersianDateInput({
  value,
  onChange,
  placeholder = 'تاریخ را انتخاب کنید',
  className = '',
  disabled = false,
  required = false,
  label
}: PersianDateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<{year: number, month: number, day: number} | null>(null);
  const [currentView, setCurrentView] = useState<{year: number, month: number}>({
    year: 1403,
    month: 1
  });

  // تبدیل ISO date به نمایش شمسی
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const [jYear, jMonth, jDay] = gregorianToJalali(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        );
        setDisplayValue(`${toPersianDigits(jYear)}/${toPersianDigits(jMonth.toString().padStart(2, '0'))}/${toPersianDigits(jDay.toString().padStart(2, '0'))}`);
        setSelectedDate({ year: jYear, month: jMonth, day: jDay });
        setCurrentView({ year: jYear, month: jMonth });
      }
    } else {
      setDisplayValue('');
      setSelectedDate(null);
    }
  }, [value]);

  // تولید روزهای ماه
  const generateCalendarDays = () => {
    const daysInMonth = currentView.month <= 6 ? 31 : (currentView.month <= 11 ? 30 : 29);
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = { year: currentView.year, month: currentView.month, day };
    setSelectedDate(newDate);
    
    // تبدیل به میلادی و ارسال
    const [gYear, gMonth, gDay] = jalaliToGregorian(newDate.year, newDate.month, newDate.day);
    const isoDate = new Date(gYear, gMonth - 1, gDay).toISOString().split('T')[0];
    
    setDisplayValue(`${toPersianDigits(newDate.year)}/${toPersianDigits(newDate.month.toString().padStart(2, '0'))}/${toPersianDigits(newDate.day.toString().padStart(2, '0'))}`);
    onChange?.(isoDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentView.month === 1) {
      setCurrentView({ year: currentView.year - 1, month: 12 });
    } else {
      setCurrentView({ ...currentView, month: currentView.month - 1 });
    }
  };

  const handleNextMonth = () => {
    if (currentView.month === 12) {
      setCurrentView({ year: currentView.year + 1, month: 1 });
    } else {
      setCurrentView({ ...currentView, month: currentView.month + 1 });
    }
  };

  const handleClear = () => {
    setDisplayValue('');
    setSelectedDate(null);
    onChange?.('');
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onClick={() => !disabled && setIsOpen(true)}
          readOnly
          disabled={disabled}
          required={required}
          className={`w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
          placeholder={placeholder}
        />
        
        {/* آیکون تقویم */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {displayValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* تقویم */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[75]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[80] p-4">
            {/* هدر تقویم */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className="font-semibold">
                  {persianMonths[currentView.month - 1]} {toPersianDigits(currentView.year)}
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* ایام هفته */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* روزهای ماه */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    selectedDate?.year === currentView.year && 
                    selectedDate?.month === currentView.month && 
                    selectedDate?.day === day
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              ))}
            </div>

            {/* دکمه امروز */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const [jYear, jMonth, jDay] = gregorianToJalali(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    today.getDate()
                  );
                  setCurrentView({ year: jYear, month: jMonth });
                  handleDateSelect(jDay);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                امروز
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 