'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaTimes, FaCheck, FaStar } from 'react-icons/fa';
import { Product } from '@/types';
import { formatPriceWithFont } from '@/lib/utils';
import { AddToCartButton } from '@/components';

function ComparePageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const productIds = searchParams.get('products');
    if (productIds) {
      fetchProducts(productIds.split(',').map(id => parseInt(id)));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchProducts = async (ids: number[]) => {
    try {
      const responses = await Promise.all(
        ids.map(id => fetch(`/api/products?id=${id}`))
      );
      
      const productData = await Promise.all(
        responses.map(res => res.json())
      );

      setProducts(productData.filter(p => p.product).map(p => p.product));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (productId: number) => {
    setProducts(products.filter(p => p.id !== productId));
    
    // Update URL
    const newIds = products.filter(p => p.id !== productId).map(p => p.id);
    const newUrl = newIds.length > 0 
      ? `?products=${newIds.join(',')}`
      : '';
    window.history.replaceState({}, '', `/compare${newUrl}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">مقایسه محصولات</h1>
          <p className="text-gray-600 mb-8">هیچ محصولی برای مقایسه انتخاب نشده است</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">مقایسه محصولات</h1>
        <p className="text-gray-600">{products.length} محصول در حال مقایسه</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full bg-white rounded-lg border border-gray-200">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right p-4 font-semibold text-gray-900 bg-gray-50 min-w-32">
                  مشخصات
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 min-w-64">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-[15]"
                        title="حذف از مقایسه"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                      
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <Image
                            src={product.img || product.images?.[0] || '/default-product.png'}
                            alt={product.name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {/* قیمت */}
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-900 bg-gray-50">قیمت</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="price-text text-blue-600 font-bold text-lg">
                      {formatPriceWithFont(product.price)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* امتیاز */}
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-900 bg-gray-50">امتیاز</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {renderStars(Math.round(product.averageRating || 0))}
                      <span className="text-sm text-gray-600">
                        ({(product.averageRating ?? 0).toFixed(1)})
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* برند */}
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-900 bg-gray-50">برند</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.brand || '-'}
                  </td>
                ))}
              </tr>

              {/* موجودی */}
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-900 bg-gray-50">موجودی</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      product.stock > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0 ? (
                        <>
                          <FaCheck className="text-xs" />
                          موجود
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-xs" />
                          ناموجود
                        </>
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              {/* مشخصات فنی */}
              {products.some(p => (p as any).specifications && Object.keys((p as any).specifications).length > 0) && (
                <>
                  <tr className="border-b border-gray-100">
                    <td colSpan={products.length + 1} className="p-4 font-semibold text-gray-900 bg-gray-100">
                      مشخصات فنی
                    </td>
                  </tr>
                  {Array.from(new Set(
                    products.flatMap(p => (p as any).specifications ? Object.keys((p as any).specifications) : [])
                  )).map((spec) => (
                    <tr key={spec} className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50">{spec}</td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 text-center">
                          {(product as any).specifications?.[spec] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}

              {/* دکمه‌های اقدام */}
              <tr>
                <td className="p-4 font-medium text-gray-900 bg-gray-50">اقدامات</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    <div className="space-y-2">
                      <AddToCartButton
                        productId={product.id}
                        className="w-full"
                        showIcon={false}
                      >
                        {product.stock > 0 ? 'افزودن به سبد' : 'ناموجود'}
                      </AddToCartButton>
                      
                      <Link
                        href={`/product/${product.slug}`}
                        className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        مشاهده جزئیات
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* پیشنهادات */}
      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          مشاهده محصولات بیشتر
        </Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
} 