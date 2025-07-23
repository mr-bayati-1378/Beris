'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaLayerGroup } from 'react-icons/fa';

interface CategoryL1 {
  id: number;
  name: string;
  slug: string;
}

export default function NewCategoryL2Page() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryL1[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedL1, setSelectedL1] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError('');
      const response = await fetch('/api/categories/tree');
      if (!response.ok) {
        throw new Error(`خطا در دریافت دسته‌بندی‌ها: ${response.status}`);
      }
        const data = await response.json();
      
      // Validate the response structure
      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('داده‌های دریافتی نامعتبر است');
      }
      
      setCategories(data.categories);
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
      setError(error instanceof Error ? error.message : 'خطا در دریافت دسته‌بندی‌ها');
      setCategories([]); // Ensure categories is always an array
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug from name
      ...(field === 'name' && {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim() || !selectedL1) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories/l2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          categoryL1Id: parseInt(selectedL1),
        }),
      });

      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const data = await response.json();
        alert(data.error || 'خطا در ایجاد دسته‌بندی');
      }
    } catch (error) {
      console.error('خطا در ایجاد دسته‌بندی:', error);
      alert('خطا در ایجاد دسته‌بندی');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">در حال بارگذاری دسته‌بندی‌ها...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-lg text-red-600">{error}</div>
        <button
          onClick={() => fetchCategories()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link 
            href="/admin/categories" 
            className="text-blue-600 hover:text-blue-700"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <FaLayerGroup className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">ایجاد دسته‌بندی سطح 2</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* L1 Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                دسته‌بندی سطح 1 *
              </label>
              <select
                value={selectedL1}
                onChange={(e) => setSelectedL1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">انتخاب کنید...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام دسته‌بندی *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="مثال: بوتاکس"
                required
                disabled={loading}
              />
            </div>

            {/* Slug Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (نام URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="botox"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug به صورت خودکار از نام ایجاد می‌شود
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Link
                href="/admin/categories"
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                انصراف
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.slug || !selectedL1}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    ایجاد دسته‌بندی
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {selectedL1 && formData.name && (
          <div className="mt-6 bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">پیش‌نمایش ساختار:</h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {categories.find(c => c.id.toString() === selectedL1)?.name}
              </span>
              <span className="mx-2">→</span>
              <span className="font-medium text-green-600">
                {formData.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 