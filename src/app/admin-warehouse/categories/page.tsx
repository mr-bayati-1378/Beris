'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaFolderOpen, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaEye
} from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
  children?: Category[];
  level: number;
  _count?: {
    products?: number;
    categoryL2s?: number;
    categoryL3s?: number;
  };
}

export default function WarehouseCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories/tree', {
        credentials: 'include'
      });

              if (response.ok) {
          const data = await response.json();
          // Transform the tree structure to flat list for display
          const flattenCategories = (cats: any[], level: number = 1): Category[] => {
            const result: Category[] = [];
            cats.forEach(cat => {
              const flatCat: Category = {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                isActive: true, // Assuming all are active, adjust as needed
                level: level,
                productCount: cat.productCount || cat._count?.products || 0,
                _count: cat._count
              };
              result.push(flatCat);

              // Process L2 categories
              if (cat.categoryL2s && cat.categoryL2s.length > 0) {
                cat.categoryL2s.forEach((l2: any) => {
                  const flatL2: Category = {
                    id: l2.id,
                    name: l2.name,
                    slug: l2.slug,
                    description: l2.description,
                    isActive: true,
                    level: 2,
                    productCount: l2.productCount || l2._count?.products || 0,
                    _count: l2._count
                  };
                  result.push(flatL2);

                  // Process L3 categories
                  if (l2.categoryL3s && l2.categoryL3s.length > 0) {
                    l2.categoryL3s.forEach((l3: any) => {
                      const flatL3: Category = {
                        id: l3.id,
                        name: l3.name,
                        slug: l3.slug,
                        description: l3.description,
                        isActive: true,
                        level: 3,
                        productCount: l3.productCount || l3._count?.products || 0,
                        _count: l3._count
                      };
                      result.push(flatL3);
                    });
                  }
                });
              }
            });
            return result;
          };

          setCategories(flattenCategories(data.categories || []));
        }
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    // Categories are now flat, no children structure for rendering
    const paddingRight = (category.level - 1) * 20;

    if (searchTerm && !category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    if (selectedLevel !== 'all' && category.level.toString() !== selectedLevel) {
      return null;
    }

    return (
      <div key={category.id}>
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          style={{ paddingRight: `${paddingRight + 16}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-5 h-5" />
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                category.level === 1 ? 'bg-blue-500' :
                category.level === 2 ? 'bg-green-500' : 'bg-amber-500'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    سطح {category.level}
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {category.productCount || category._count?.products || 0} محصول
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`/admin/categories/${category.id}/edit`}
                target="_blank"
                className="text-amber-600 hover:text-amber-800 p-1"
                title="ویرایش"
              >
                <FaEdit className="h-4 w-4" />
              </a>
              <button
                className="text-blue-600 hover:text-blue-800 p-1"
                title="مشاهده محصولات"
              >
                <FaEye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال بارگذاری دسته‌بندی‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaFolderOpen className="text-amber-600" />
                مدیریت دسته‌بندی‌ها - انبار
              </h1>
              <p className="mt-1 text-gray-600">
                مدیریت درختواره دسته‌بندی محصولات از پنل انبار
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <a
                href="/admin/categories/new/l1"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="h-4 w-4" />
                دسته سطح 1
              </a>
              <a
                href="/admin/categories/new/l2"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus className="h-4 w-4" />
                دسته سطح 2
              </a>
              <a
                href="/admin/categories/new/l3"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <FaPlus className="h-4 w-4" />
                دسته سطح 3
              </a>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در دسته‌بندی‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">همه سطوح</option>
              <option value="1">سطح 1</option>
              <option value="2">سطح 2</option>
              <option value="3">سطح 3</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setExpandedCategories(new Set(categories.map(c => c.id)));
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                گسترش همه
              </button>
              <button
                onClick={() => setExpandedCategories(new Set())}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                جمع همه
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.level === 1).length}
                </p>
                <p className="text-sm text-gray-600">دسته سطح 1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.level === 2).length}
                </p>
                <p className="text-sm text-gray-600">دسته سطح 2</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.level === 3).length}
                </p>
                <p className="text-sm text-gray-600">دسته سطح 3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">کل محصولات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Tree */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                درختواره دسته‌بندی‌ها ({categories.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>سطح 1</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>سطح 2</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>سطح 3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {categories.length > 0 ? (
              categories.map(category => renderCategory(category))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <FaFolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>هنوز دسته‌بندی‌ای ایجاد نشده است</p>
                <a
                  href="/admin/categories/new/l1"
                  target="_blank"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="h-4 w-4" />
                  ایجاد اولین دسته‌بندی
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">راهنما:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• سطح 1: دسته‌بندی‌های اصلی (مثل: تزریقی زیبایی، ملزومات جراحی)</li>
            <li>• سطح 2: زیردسته‌ها (مثل: نخ ویکریل، سرنگ تزریق)</li>
            <li>• سطح 3: دسته‌بندی‌های نهایی که محصولات در آنها قرار می‌گیرند</li>
            <li>• برای ویرایش هر دسته‌بندی، روی آیکون ویرایش کلیک کنید</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 