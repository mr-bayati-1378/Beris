'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowRight, 
  FaSave, 
  FaTimes,
  FaEdit,
  FaLayerGroup,
  FaList,
  FaBox
} from 'react-icons/fa';

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  level: 1 | 2 | 3;
  categoryL1?: {
    id: number;
    name: string;
  };
  categoryL2?: {
    id: number;
    name: string;
    categoryL1: {
      id: number;
      name: string;
    };
  };
}

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategory = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try each level to find the category
      const levels = ['l1', 'l2', 'l3'];
      let foundCategory = null;
      
      for (const level of levels) {
        try {
          const response = await fetch(`/api/admin/categories/${level}/${id}`);
          if (response.ok) {
            const data = await response.json();
            foundCategory = {
              ...data.category,
              level: level === 'l1' ? 1 : level === 'l2' ? 2 : 3
            };
            break;
          }
        } catch (err) {
          // Continue trying other levels
        }
      }

      if (foundCategory) {
        setCategory(foundCategory);
        setName(foundCategory.name);
        setSlug(foundCategory.slug);
      } else {
        setError('دسته‌بندی یافت نشد');
      }
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی:', error);
      setError('خطا در دریافت اطلاعات دسته‌بندی');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id, fetchCategory]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(category?.name || '')) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('نام دسته‌بندی الزامی است');
      return;
    }

    if (!slug.trim()) {
      setError('slug الزامی است');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const level = category?.level === 1 ? 'l1' : category?.level === 2 ? 'l2' : 'l3';
      const response = await fetch(`/api/admin/categories/${level}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
        }),
      });

      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const data = await response.json();
        setError(data.error || 'خطا در ویرایش دسته‌بندی');
      }
    } catch (error) {
      console.error('خطا در ویرایش دسته‌بندی:', error);
      setError('خطا در ویرایش دسته‌بندی');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = () => {
    switch (category?.level) {
      case 1:
        return <FaLayerGroup className="h-5 w-5 text-blue-600" />;
      case 2:
        return <FaList className="h-5 w-5 text-green-600" />;
      case 3:
        return <FaBox className="h-5 w-5 text-purple-600" />;
      default:
        return <FaEdit className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryLevelName = () => {
    switch (category?.level) {
      case 1:
        return 'سطح اول';
      case 2:
        return 'سطح دوم';
      case 3:
        return 'سطح سوم';
      default:
        return 'دسته‌بندی';
    }
  };

  const getBreadcrumb = () => {
    if (!category) return '';
    
    switch (category.level) {
      case 2:
        return category.categoryL1?.name || '';
      case 3:
        return `${category.categoryL2?.categoryL1?.name || ''} > ${category.categoryL2?.name || ''}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FaArrowRight className="h-4 w-4" />
              بازگشت به دسته‌بندی‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaArrowRight className="h-4 w-4" />
            بازگشت به دسته‌بندی‌ها
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            {getCategoryIcon()}
            <h1 className="text-2xl font-bold text-gray-900">
              ویرایش {getCategoryLevelName()}
            </h1>
          </div>
          
          {getBreadcrumb() && (
            <p className="text-gray-500 text-sm">مسیر: {getBreadcrumb()}</p>
          )}
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام دسته‌بندی
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="نام دسته‌بندی را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (نام در URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="slug-name"
              />
              <p className="text-xs text-gray-500 mt-1">
                این نام در آدرس URL استفاده می‌شود و باید یکتا باشد
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="h-4 w-4" />
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
            
            <Link
              href="/admin/categories"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <FaTimes className="h-4 w-4" />
              لغو
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 