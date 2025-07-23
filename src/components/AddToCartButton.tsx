'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { FaShoppingCart, FaSpinner, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';

interface AddToCartButtonProps {
  productId: number;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  quantity?: number;
}

export default function AddToCartButton({ 
  productId, 
  className = "", 
  children,
  showIcon = true,
  quantity = 1
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const isProductInCart = isInCart(productId);
  
  // Check if this is an out-of-stock product based on children text
  const isOutOfStock = typeof children === 'string' && children.includes('ناموجود');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('این محصول در حال حاضر موجود نیست');
      return;
    }

    if (!user) {
      toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isProductInCart) {
      // If already in cart, redirect to cart page
      router.push('/cart');
      return;
    }

    setLoading(true);

    try {
      const success = await addToCart(productId, quantity);
      if (success) {
        toast.success('محصول با موفقیت به سبد خرید اضافه شد');
      } else {
        toast.error('خطا در افزودن به سبد خرید');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('خطا در افزودن به سبد خرید');
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <FaSpinner className="animate-spin" />
          <span>در حال افزودن...</span>
        </>
      );
    }
    
    if (isOutOfStock) {
      return (
        <>
          <div className="w-5 h-5 rounded-full bg-gray-400" />
          <span>ناموجود</span>
        </>
      );
    }
    
    if (isProductInCart) {
      return (
        <>
          {showIcon && <FaCheck className="text-lg" />}
          <span>{children && typeof children === 'string' && !children.includes('ناموجود') ? children : 'مشاهده سبد خرید'}</span>
        </>
      );
    }
    
    return (
      <>
        {showIcon && <FaShoppingCart className="text-lg" />}
        <span>{children || 'افزودن به سبد خرید'}</span>
      </>
    );
  };

  const getButtonClass = () => {
    // Check if this is a smaller button based on className
    const isSmall = className.includes('text-sm') || className.includes('btn-sm');
    const baseClass = `flex items-center justify-center gap-2 ${isSmall ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
    
    if (isOutOfStock) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed ${className}`;
    }
    
    if (isProductInCart) {
      return `${baseClass} cart-button-success ${className}`;
    }
    return `${baseClass} cart-button-primary ${className}`;
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || isOutOfStock}
      className={getButtonClass()}
      style={{ touchAction: 'manipulation' }}
      title={
        isOutOfStock 
          ? 'این محصول موجود نیست' 
          : isProductInCart 
            ? 'مشاهده سبد خرید' 
            : 'افزودن به سبد خرید'
      }
    >
      {getButtonContent()}
    </button>
  );
} 