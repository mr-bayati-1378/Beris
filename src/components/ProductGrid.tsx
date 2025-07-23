'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPriceWithFont } from '@/lib/utils';
import AddToCartButton from './AddToCartButton';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  finalPrice: number;
  originalPrice: number;
  img: string;
  images: string[];
  stock: number;
  hasDiscount: boolean;
  discountPercent: number | null;
  averageRating: number;
  reviewCount: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ProductGridProps {
  initialProducts?: Product[];
  categoryId?: number;
  className?: string;
  title?: string;
  limit?: number;
}

export default function ProductGrid({ 
  initialProducts = [],
  categoryId,
  className = "",
  title = "محصولات",
  limit = 12
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  // Fetch products on mount if not provided
  useEffect(() => {
    const fetchProducts = async () => {
      if (initialProducts.length > 0) return;
      
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId.toString());
        if (limit) params.append('limit', limit.toString());
        
        const res = await fetch(`/api/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, limit, initialProducts.length]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 rounded"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">محصولی یافت نشد</h3>
        <p className="text-gray-600">در حال حاضر محصولی در این دسته‌بندی موجود نیست</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {products.map((product) => (
        <div key={product.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
            <Link href={`/product/${product.slug}`}>
              <Image
                src={product.img || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            {/* Discount Badge */}
            {product.hasDiscount && product.discountPercent && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {product.discountPercent}٪
              </div>
            )}

            {/* Stock Badge */}
            {product.stock === 0 && (
              <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                ناموجود
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3">
            {/* Category */}
            <div className="mb-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {product.category.name}
              </span>
            </div>

            {/* Product Name */}
            <Link href={`/product/${product.slug}`} className="block mb-2">
              <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-600">({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-gray-900">
                {formatPriceWithFont(product.finalPrice)}
              </span>
              {product.hasDiscount && product.originalPrice > product.finalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPriceWithFont(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <AddToCartButton 
              productId={product.id} 
              className="w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
} 