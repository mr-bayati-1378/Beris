'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaPlus, FaTimes, FaBalanceScale } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { formatPriceWithFont } from '@/lib/utils';
import { Product } from '@/types';

interface ProductComparisonProps {
  currentProduct: Product;
  className?: string;
}

export default function ProductComparison({ currentProduct, className = "" }: ProductComparisonProps) {
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load comparison list from localStorage
  useEffect(() => {
    const loadComparison = () => {
      const stored = localStorage.getItem('productComparison');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setComparisonList(parsed);
          }
        } catch (error) {
          console.error('Error loading comparison list:', error);
          localStorage.removeItem('productComparison');
        }
      }
    };

    // Load immediately
    loadComparison();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'productComparison') {
        loadComparison();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage when list changes
  useEffect(() => {
    try {
      localStorage.setItem('productComparison', JSON.stringify(comparisonList));
      // Dispatch custom event for cross-component communication
      window.dispatchEvent(new CustomEvent('comparisonUpdated', { 
        detail: { count: comparisonList.length } 
      }));
    } catch (error) {
      console.error('Error saving comparison list:', error);
    }
  }, [comparisonList]);

  const addToComparison = () => {
    if (comparisonList.length >= 4) {
      toast.error('حداکثر ۴ محصول قابل مقایسه است');
      return;
    }

    if (comparisonList.some(p => p.id === currentProduct.id)) {
      toast.error('این محصول در لیست مقایسه موجود است');
      return;
    }

    setComparisonList([...comparisonList, currentProduct]);
    toast.success('محصول به لیست مقایسه اضافه شد');
  };

  const removeFromComparison = (productId: number) => {
    setComparisonList(comparisonList.filter(p => p.id !== productId));
    toast.success('محصول از لیست مقایسه حذف شد');
  };

  const clearComparison = () => {
    setComparisonList([]);
    toast.success('لیست مقایسه پاک شد');
  };

  const isInComparison = comparisonList.some(p => p.id === currentProduct.id);

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FaBalanceScale className="text-white text-lg" />
          </div>
          مقایسه محصولات
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          {isOpen ? 'بستن' : `نمایش (${comparisonList.length})`}
        </button>
      </div>

      {/* Add current product button */}
      <div className="mb-6">
        <button
          onClick={addToComparison}
          disabled={isInComparison || comparisonList.length >= 4}
          className={`w-full py-3 px-6 rounded-xl border-2 transition-all duration-300 text-lg font-semibold ${
            isInComparison
              ? 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed shadow-inner'
              : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          <FaPlus className="inline ml-2" />
          {isInComparison ? '✓ در لیست مقایسه' : 'افزودن به مقایسه'}
        </button>
        {comparisonList.length >= 4 && !isInComparison && (
          <p className="text-orange-600 text-sm mt-2 text-center">
            حداکثر ۴ محصول قابل مقایسه است
          </p>
        )}
      </div>

      {/* Comparison list */}
      {isOpen && comparisonList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
            <span className="text-lg font-semibold text-gray-800">
              محصولات در حال مقایسه ({comparisonList.length})
            </span>
            <button
              onClick={clearComparison}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
            >
              پاک کردن همه
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {comparisonList.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={product.img || product.images?.[0] || '/default-product.png'}
                    alt={product.name}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-blue-600 font-bold mt-1">
                    {formatPriceWithFont(product.price)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition-colors"
                    title="حذف از مقایسه"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {comparisonList.length >= 2 && (
            <div className="pt-4 border-t border-gray-200">
              <Link
                href={`/compare?products=${comparisonList.map(p => p.id).join(',')}`}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl text-center block hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold text-lg"
              >
                🔍 مقایسه کن ({comparisonList.length} محصول)
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {isOpen && comparisonList.length === 0 && (
        <div className="text-center py-6 text-gray-500">
                        <FaBalanceScale className="mx-auto text-3xl mb-2 text-gray-300" />
          <p className="text-sm">هنوز محصولی برای مقایسه اضافه نکرده‌اید</p>
        </div>
      )}
    </div>
  );
} 