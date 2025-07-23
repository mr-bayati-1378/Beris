'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaLayerGroup } from 'react-icons/fa';

interface CategoryL1 {
  id: number;
  name: string;
  slug: string;
  categoryL2s: CategoryL2[];
}

interface CategoryL2 {
  id: number;
  name: string;
  slug: string;
  categoryL1Id: number;
}

function NewCategoryL3Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const l2Id = searchParams.get('l2');

  const [categories, setCategories] = useState<CategoryL1[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedL1, setSelectedL1] = useState<string>('');
  const [selectedL2, setSelectedL2] = useState<string>(l2Id || '');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (l2Id && categories.length > 0) {
      // Find L1 category that contains this L2
      const l1Category = categories.find(l1 => 
        l1.categoryL2s.some(l2Category => l2Category.id.toString() === l2Id)
      );
      if (l1Category) {
        setSelectedL1(l1Category.id.toString());
        setSelectedL2(l2Id);
      }
    }
  }, [l2Id, categories]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError('');
      const response = await fetch('/api/categories/tree');
      if (!response.ok) {
        throw new Error(`خطا در دریافت دسته‌بندی‌ها: ${response.status}`);
      }
        const data = await response.json();
      if (!Array.isArray(data.categories)) {
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
    
    if (!formData.name.trim() || !formData.slug.trim() || !selectedL2) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories/l3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          categoryL2Id: parseInt(selectedL2),
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

  const getL2Categories = () => {
    if (!selectedL1) return [];
    const l1Category = categories.find(cat => cat.id.toString() === selectedL1);
    return l1Category?.categoryL2s || [];
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/categories" 
          className="text-blue-600 hover:text-blue-700"
        >
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <FaLayerGroup className="text-2xl text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">ایجاد دسته‌بندی سطح 3</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* L1 Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              دسته‌بندی سطح 1 *
            </label>
            <select
              value={selectedL1}
              onChange={(e) => {
                setSelectedL1(e.target.value);
                setSelectedL2(''); // Reset L2 when L1 changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* L2 Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              دسته‌بندی سطح 2 *
            </label>
            <select
              value={selectedL2}
              onChange={(e) => setSelectedL2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedL1}
            >
              <option value="">انتخاب کنید...</option>
              {getL2Categories().map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام دسته‌بندی *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: سرنگ 5 میلی‌لیتر"
              required
            />
          </div>

          {/* Category Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نامک (Slug) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="syringe-5ml"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              نامک برای URL استفاده می‌شود و باید منحصر به فرد باشد
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave />
              {loading ? 'در حال ذخیره...' : 'ایجاد دسته‌بندی'}
            </button>

            <Link
              href="/admin/categories"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              انصراف
            </Link>
          </div>
        </form>
      </div>

      {/* Category Hierarchy Preview */}
      {selectedL1 && selectedL2 && formData.name && (
        <div className="bg-blue-50 rounded-lg p-4 max-w-2xl">
          <h3 className="text-sm font-medium text-gray-700 mb-2">پیش‌نمایش ساختار:</h3>
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {categories.find(c => c.id.toString() === selectedL1)?.name}
            </span>
            <span className="mx-2">→</span>
            <span className="font-medium">
              {getL2Categories().find(c => c.id.toString() === selectedL2)?.name}
            </span>
            <span className="mx-2">→</span>
            <span className="font-medium text-blue-600">
              {formData.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewCategoryL3Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    }>
      <NewCategoryL3Content />
    </Suspense>
  );
} 