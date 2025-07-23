'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaBox,
  FaTags,
  FaWarehouse,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaImage,
  FaSpinner,
  FaDollarSign
} from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  hasDiscount: boolean;
  stock: number;
  brand: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryL3: {
    id: number;
    name: string;
    categoryL2: {
      id: number;
      name: string;
      categoryL1: {
        id: number;
        name: string;
      };
    };
  };
  images: Array<{
    id: number;
    url: string;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('محصول یافت نشد');
      }
      
      const data = await response.json();
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری محصول');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'ناموجود', color: 'text-red-600 bg-red-100' };
    if (stock <= 10) return { label: 'کم موجود', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'موجود', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">در حال بارگذاری...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600">{error || 'محصول یافت نشد'}</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              بازگشت به لیست محصولات
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FaArrowLeft className="h-4 w-4" />
              بازگشت
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">جزئیات محصول</h1>
              <p className="mt-2 text-gray-600">نمایش کامل اطلاعات محصول</p>
            </div>
          </div>
          
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <FaEdit className="h-4 w-4" />
            ویرایش محصول
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* تصاویر محصول */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">تصاویر محصول</h2>
              
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <Image
                        src={image.url}
                        alt={`${product.name} - تصویر ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                          تصویر اصلی
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">بدون تصویر</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* اطلاعات محصول */}
          <div className="lg:col-span-2 space-y-6">
            {/* اطلاعات کلی */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">اطلاعات کلی</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">نام محصول</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{product.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">برند</label>
                  <p className="mt-1 text-lg text-gray-900">{product.brand || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">دسته‌بندی</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.categoryL3.categoryL2.categoryL1.name} / {product.categoryL3.categoryL2.name} / {product.categoryL3.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">کد محصول (Slug)</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{product.slug}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">توضیحات</label>
                  <p className="mt-1 text-gray-900">{product.description || 'بدون توضیحات'}</p>
                </div>
              </div>
            </div>

            {/* قیمت و موجودی */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">قیمت و موجودی</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">قیمت فعلی</label>
                  <div className="mt-1 flex items-center gap-2">
                    <FaDollarSign className="h-5 w-5 text-green-600" />
                    <p className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                </div>

                {product.hasDiscount && product.originalPrice && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">قیمت اصلی</label>
                      <p className="mt-1 text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">درصد تخفیف</label>
                      <p className="mt-1 text-lg font-semibold text-red-600">{product.discountPercent}%</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">موجودی</label>
                  <div className="mt-1 flex items-center gap-2">
                    <FaWarehouse className="h-5 w-5 text-blue-600" />
                    <p className="text-xl font-bold text-gray-900">{product.stock.toLocaleString('fa-IR')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">وضعیت موجودی</label>
                  <span className={`mt-1 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color}`}>
                    {stockStatus.label}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">وضعیت محصول</label>
                  <div className="mt-1 flex items-center gap-2">
                    {product.isActive ? (
                      <>
                        <FaCheck className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-semibold">فعال</span>
                      </>
                    ) : (
                      <>
                        <FaTimes className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-semibold">غیرفعال</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* اطلاعات سیستمی */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">اطلاعات سیستمی</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">تاریخ ایجاد</label>
                  <div className="mt-1 flex items-center gap-2">
                    <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{new Intl.DateTimeFormat('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(product.createdAt))}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">آخرین بروزرسانی</label>
                  <div className="mt-1 flex items-center gap-2">
                    <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{new Intl.DateTimeFormat('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(product.updatedAt))}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">شناسه محصول</label>
                  <p className="mt-1 text-gray-900 font-mono">#{product.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">ارزش کل موجودی</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatPrice(product.stock * product.price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 