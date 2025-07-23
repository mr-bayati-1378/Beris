'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLayerGroup, FaPlus, FaArrowLeft } from 'react-icons/fa';

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link 
            href="/admin/categories" 
            className="text-blue-600 hover:text-blue-700"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <FaLayerGroup className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">ایجاد دسته‌بندی جدید</h1>
        </div>

        {/* Category Level Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">انتخاب سطح دسته‌بندی</h3>
            <p className="text-sm text-gray-600 mt-1">نوع دسته‌بندی مورد نظر خود را انتخاب کنید</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level 1 */}
            <Link 
              href="/admin/categories/new/l1"
              className="group block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4 group-hover:bg-blue-700 transition-colors">
                  <span className="text-xl font-bold">۱</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">دسته‌بندی سطح ۱</h3>
                <p className="text-sm text-gray-600 mb-4">
                  دسته‌بندی‌های اصلی و کلی
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                  <FaPlus className="w-4 h-4" />
                  <span>ایجاد سطح ۱</span>
                </div>
              </div>
            </Link>

            {/* Level 2 */}
            <Link 
              href="/admin/categories/new/l2"
              className="group block p-6 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-all duration-200"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4 group-hover:bg-green-700 transition-colors">
                  <span className="text-xl font-bold">۲</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">دسته‌بندی سطح ۲</h3>
                <p className="text-sm text-gray-600 mb-4">
                  زیر دسته‌های میانی
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <FaPlus className="w-4 h-4" />
                  <span>ایجاد سطح ۲</span>
                </div>
              </div>
            </Link>

            {/* Level 3 */}
            <Link 
              href="/admin/categories/new/l3"
              className="group block p-6 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-200"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-4 group-hover:bg-purple-700 transition-colors">
                  <span className="text-xl font-bold">۳</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">دسته‌بندی سطح ۳</h3>
                <p className="text-sm text-gray-600 mb-4">
                  دسته‌های نهایی محصولات
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <FaPlus className="w-4 h-4" />
                  <span>ایجاد سطح ۳</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">راهنما</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">۱</div>
              <p><strong>سطح ۱:</strong> دسته‌بندی‌های اصلی مانند &quot;تزریقی زیبایی&quot; یا &quot;ملزومات جراحی&quot;</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">۲</div>
              <p><strong>سطح ۲:</strong> زیر دسته‌های میانی مانند &quot;بوتاکس&quot; یا &quot;تیغه‌های جراحی&quot;</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">۳</div>
              <p><strong>سطح ۳:</strong> دسته‌های نهایی که محصولات مستقیماً در آن‌ها قرار می‌گیرند</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 