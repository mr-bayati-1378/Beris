'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaLayerGroup } from 'react-icons/fa';

export default function NewCategoryL1Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);

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
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories/l1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
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
          <FaLayerGroup className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">ایجاد دسته‌بندی سطح 1</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام دسته‌بندی *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: تزریقی زیبایی"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="beauty-injection"
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
                disabled={loading || !formData.name || !formData.slug}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        {formData.name && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">پیش‌نمایش:</h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">{formData.name}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">URL: /{formData.slug}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 