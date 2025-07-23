'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { AddToCartButton } from '@/components';
import { Badge } from '@/components/ui/badge';
import { formatPriceWithFont } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ 
  product, 
  className = ""
}: ProductCardProps) {
  const { isInCart } = useCart();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const isOutOfStock = product.stock <= 0;
  const isLowStock = false; // We don't have stock quantity in type, so this is false
  const productInCart = isInCart(product.id);

  // Listen for cart updates
  useEffect(() => {
    const handleUpdate = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('cartUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleUpdate);
    };
  }, []);

  return (
    <div className={`group relative rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${className}`}>
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {isOutOfStock && (
          <Badge variant="destructive" className="text-xs">
            ناموجود
          </Badge>
        )}
        {isLowStock && (
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
            موجودی کم
          </Badge>
        )}
        {(product.hasDiscount && product.discountPercent) || (product.comparePrice && product.comparePrice > product.price) ? (
          <Badge variant="destructive" className="text-xs bg-red-500 text-white">
            {product.hasDiscount && product.discountPercent 
              ? `${product.discountPercent}% تخفیف`
              : `${Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% تخفیف`
            }
          </Badge>
        ) : null}
        {productInCart && (
          <Badge className="text-xs bg-green-600 text-white">
            🛒 در سبد
          </Badge>
        )}

      </div>



      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative h-40 w-full overflow-hidden bg-gray-50">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-600">بدون تصویر</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="text-xs text-gray-700 mb-2">
            برند: {product.brand}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            {product.hasDiscount && product.discountPercent ? (
              <>
                <span className="text-sm text-gray-500 line-through price-text">
                  {formatPriceWithFont(Math.round(product.price / (1 - product.discountPercent / 100)))}
                </span>
                <span className="text-lg font-bold text-red-600 price-text">
                  {formatPriceWithFont(product.price)}
                </span>
              </>
            ) : product.comparePrice ? (
              <>
                <span className="text-sm text-gray-500 line-through price-text">
                  {formatPriceWithFont(product.comparePrice)}
                </span>
                <span className="text-lg font-bold text-red-600 price-text">
                  {formatPriceWithFont(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600 price-text">
                {formatPriceWithFont(product.price)}
              </span>
            )}
          </div>
          
          {/* Stock Info */}
          <div className="text-xs text-gray-700">
            {isOutOfStock ? (
              <span className="text-red-500">ناموجود</span>
            ) : (
              <span>موجود</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <AddToCartButton 
            productId={product.id}
            className={`flex-1 text-sm ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            showIcon={false}
          >
            {isOutOfStock ? 'ناموجود' : productInCart ? 'مشاهده سبد' : 'افزودن به سبد'}
          </AddToCartButton>
          
          <Link 
            href={`/product/${product.slug}`}
            className="btn btn-outline btn-sm px-3 text-sm"
          >
            مشاهده
          </Link>
        </div>
      </div>
    </div>
  );
} 