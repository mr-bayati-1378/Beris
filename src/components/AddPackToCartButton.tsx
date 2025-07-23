'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Check, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AddPackToCartButtonProps {
  userPackId: number;
  packName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function AddPackToCartButton({
  userPackId,
  packName,
  className = '',
  size = 'md',
  variant = 'primary'
}: AddPackToCartButtonProps) {
  const { addPackToCart, isPackInCart, loading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const isInCart = isPackInCart(userPackId);

  const handleAddToCart = async () => {
    if (isInCart || isAdding) return;

    if (!user) {
      toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
      router.push('/auth/login');
      return;
    }

    setIsAdding(true);
    try {
      const success = await addPackToCart(userPackId, 1);
      if (success) {
        toast.success(`${packName} به سبد خرید اضافه شد`);
      } else {
        toast.error('خطا در افزودن پک به سبد خرید');
      }
    } catch (error) {
      console.error('Error adding pack to cart:', error);
      toast.error('خطا در افزودن پک به سبد خرید');
    } finally {
      setIsAdding(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const baseClasses = 'flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  if (isInCart) {
    return (
      <button
        disabled
        className={`${baseClasses} ${sizeClasses[size]} bg-green-100 text-green-700 ${className}`}
      >
        <Check className="w-4 h-4" />
        در سبد خرید
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isAdding ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {isAdding ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
    </button>
  );
} 