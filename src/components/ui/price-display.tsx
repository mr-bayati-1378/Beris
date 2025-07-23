import React from 'react';
import { formatPriceWithSeparator } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCurrency?: boolean;
}

export default function PriceDisplay({ 
  price, 
  currency = 'تومان', 
  className = '', 
  size = 'md',
  showCurrency = true 
}: PriceDisplayProps) {
  const formattedPrice = formatPriceWithSeparator(price);
  const displayText = showCurrency ? `${formattedPrice} ${currency}` : formattedPrice;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <span className={`price-text persian-number ${sizeClasses[size]} ${className}`}>
      {displayText}
    </span>
  );
}

// کامپوننت برای نمایش قیمت‌های بزرگ
export function LargePriceDisplay({ 
  price, 
  currency = 'تومان', 
  className = '' 
}: Omit<PriceDisplayProps, 'size'>) {
  return (
    <PriceDisplay 
      price={price} 
      currency={currency} 
      className={`text-2xl font-bold text-green-600 ${className}`}
      size="xl"
    />
  );
}

// کامپوننت برای نمایش قیمت‌های کوچک
export function SmallPriceDisplay({ 
  price, 
  currency = 'تومان', 
  className = '' 
}: Omit<PriceDisplayProps, 'size'>) {
  return (
    <PriceDisplay 
      price={price} 
      currency={currency} 
      className={`text-sm text-gray-600 ${className}`}
      size="sm"
    />
  );
}

// کامپوننت برای نمایش قیمت‌های متوسط
export function MediumPriceDisplay({ 
  price, 
  currency = 'تومان', 
  className = '' 
}: Omit<PriceDisplayProps, 'size'>) {
  return (
    <PriceDisplay 
      price={price} 
      currency={currency} 
      className={`text-base font-medium ${className}`}
      size="md"
    />
  );
} 