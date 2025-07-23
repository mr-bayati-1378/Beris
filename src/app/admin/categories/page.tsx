'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaImage,
  FaBox,
  FaSortAmountUp,
  FaSortAmountDown,
  FaChevronDown,
  FaChevronRight,
  FaList,
  FaLayerGroup
} from 'react-icons/fa';

interface CategoryL1 {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  categoryL2s: CategoryL2[];
  _count: {
    categoryL2s: number;
  };
}

interface CategoryL2 {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  categoryL1Id: number;
  categoryL3s: CategoryL3[];
  _count: {
    categoryL3s: number;
  };
}

interface CategoryL3 {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  categoryL2Id: number;
  _count: {
    products: number;
  };
  products?: Product[];
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string | null;
  isActive: boolean;
}

export default function CategoriesManagement() {
  const [categoryL1s, setCategoryL1s] = useState<CategoryL1[]>([]);
  const [totalL2, setTotalL2] = useState(0);
  const [totalL3, setTotalL3] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedL3Categories, setExpandedL3Categories] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/categories/tree');
      if (!response.ok) {
        throw new Error(`خطا در دریافت دسته‌بندی‌ها: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('داده‌های دریافتی نامعتبر است');
      }

      // تبدیل ساختار categoryL2s به ساختار مورد نیاز
      const processedData = data.categories.map((l1: any) => ({
        ...l1,
        categoryL2s: l1.categoryL2s?.map((l2: any) => ({
          ...l2,
          categoryL1Id: l1.id,
          categoryL3s: l2.categoryL3s?.map((l3: any) => ({
            ...l3,
            categoryL2Id: l2.id,
            _count: {
              products: l3._count?.products || 0
            }
          })) || [],
          _count: {
            categoryL3s: l2.categoryL3s?.length || 0
          }
        })) || [],
        _count: {
          categoryL2s: l1.categoryL2s?.length || 0
        }
      }));

      setCategoryL1s(processedData);
      
      // محاسبه totals
      const l2Count = processedData.reduce((sum: number, l1: any) => 
        sum + l1.categoryL2s.length, 0);
      const l3Count = processedData.reduce((sum: number, l1: any) => 
        sum + l1.categoryL2s.reduce((l2Sum: number, l2: any) => 
          l2Sum + l2.categoryL3s.length, 0), 0);
      
      setTotalL2(l2Count);
      setTotalL3(l3Count);
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
      setError(error instanceof Error ? error.message : 'خطا در دریافت دسته‌بندی‌ها');
      setCategoryL1s([]);
      setTotalL2(0);
      setTotalL3(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleL3Category = async (categoryId: number) => {
    const newExpanded = new Set(expandedL3Categories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      // Load products if not already loaded
      await loadCategoryProducts(categoryId);
    }
    setExpandedL3Categories(newExpanded);
  };

  const loadCategoryProducts = async (categoryL3Id: number) => {
    try {
      const response = await fetch(`/api/admin/products?category=${categoryL3Id}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        // Update the category with products
        setCategoryL1s(prev => 
          prev.map(l1 => ({
            ...l1,
            categoryL2s: l1.categoryL2s.map(l2 => ({
              ...l2,
              categoryL3s: l2.categoryL3s.map(l3 => 
                l3.id === categoryL3Id 
                  ? { ...l3, products: data.products || [] }
                  : l3
              )
            }))
          }))
        );
      }
    } catch (error) {
      console.error('خطا در دریافت محصولات دسته‌بندی:', error);
    }
  };

  // حذف دسته‌بندی سطح اول
  const deleteL1Category = async (categoryId: number, categoryName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید دسته‌بندی "${categoryName}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/l1/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategoryL1s(prev => prev.filter(l1 => l1.id !== categoryId));
        setTotalL2(prev => prev - categoryL1s.find(l1 => l1.id === categoryId)?._count.categoryL2s || 0);
        alert('دسته‌بندی با موفقیت حذف شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف دسته‌بندی:', error);
      alert('خطا در حذف دسته‌بندی');
    }
  };

  // حذف دسته‌بندی سطح دوم
  const deleteL2Category = async (categoryId: number, categoryName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید دسته‌بندی "${categoryName}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/l2/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategoryL1s(prev => 
          prev.map(l1 => ({
            ...l1,
            categoryL2s: l1.categoryL2s.filter(l2 => l2.id !== categoryId),
            _count: {
              categoryL2s: l1.categoryL2s.filter(l2 => l2.id !== categoryId).length
            }
          }))
        );
        setTotalL2(prev => prev - 1);
        alert('دسته‌بندی با موفقیت حذف شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف دسته‌بندی:', error);
      alert('خطا در حذف دسته‌بندی');
    }
  };

  // حذف دسته‌بندی سطح سوم
  const deleteL3Category = async (categoryId: number, categoryName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید دسته‌بندی "${categoryName}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/l3/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategoryL1s(prev => 
          prev.map(l1 => ({
            ...l1,
            categoryL2s: l1.categoryL2s.map(l2 => ({
              ...l2,
              categoryL3s: l2.categoryL3s.filter(l3 => l3.id !== categoryId),
              _count: {
                categoryL3s: l2.categoryL3s.filter(l3 => l3.id !== categoryId).length
              }
            }))
          }))
        );
        setTotalL3(prev => prev - 1);
        alert('دسته‌بندی با موفقیت حذف شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف دسته‌بندی:', error);
      alert('خطا در حذف دسته‌بندی');
    }
  };

  // محاسبه آمار
  const totalL1 = categoryL1s.length;
  const totalProducts = categoryL1s.reduce((sum, l1) => 
    sum + l1.categoryL2s.reduce((l2Sum, l2) => 
      l2Sum + l2.categoryL3s.reduce((l3Sum, l3) => 
        l3Sum + l3._count.products, 0), 0), 0);

  // فیلتر بر اساس جستجو
  const filteredCategories = categoryL1s.filter(l1 =>
    l1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l1.categoryL2s.some(l2 => 
      l2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l2.categoryL3s.some(l3 => 
        l3.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="mr-3">در حال بارگذاری دسته‌بندی‌ها...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-lg text-red-600">{error}</div>
            <button
              onClick={() => fetchCategories()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مدیریت دسته‌بندی‌ها</h1>
            <p className="mt-2 text-gray-600">سازماندهی محصولات در ساختار سه سطحی</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/categories/new/l1"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <FaPlus className="h-4 w-4" />
              سطح ۱
            </Link>
            <Link
              href="/admin/categories/new/l2"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
            >
              <FaPlus className="h-4 w-4" />
              سطح ۲
            </Link>
            <Link
              href="/admin/categories/new/l3"
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-white transition-colors hover:bg-purple-700"
            >
              <FaPlus className="h-4 w-4" />
              سطح ۳
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">سطح اول</p>
                <p className="text-2xl font-bold text-blue-600">{totalL1}</p>
                <p className="text-xs text-gray-500">دسته‌بندی اصلی</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaLayerGroup className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">سطح دوم</p>
                <p className="text-2xl font-bold text-green-600">{totalL2}</p>
                <p className="text-xs text-gray-500">زیر دسته</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaList className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">سطح سوم</p>
                <p className="text-2xl font-bold text-purple-600">{totalL3}</p>
                <p className="text-xs text-gray-500">زیر زیر دسته</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaBox className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل محصولات</p>
                <p className="text-2xl font-bold text-orange-600">{totalProducts}</p>
                <p className="text-xs text-gray-500">محصول موجود</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <FaBox className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در دسته‌بندی‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Categories Tree */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">ساختار دسته‌بندی‌ها</h3>
          </div>
          
          <div className="p-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <FaLayerGroup className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">هیچ دسته‌بندی‌ای یافت نشد</p>
                <Link
                  href="/admin/categories/new/l1"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <FaPlus className="h-4 w-4" />
                  اولین دسته‌بندی را ایجاد کنید
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((l1) => (
                  <div key={l1.id} className="border border-gray-200 rounded-lg">
                    {/* Level 1 */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategory(l1.id)}
                    >
                      <div className="flex items-center gap-3">
                        {l1.categoryL2s.length > 0 ? (
                          expandedCategories.has(l1.id) ? (
                            <FaChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FaChevronRight className="h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <div className="rounded-full bg-blue-100 p-2">
                          <FaLayerGroup className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{l1.name}</h4>
                          <p className="text-sm text-gray-500">
                            {l1._count.categoryL2s} زیر دسته
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/categories/new/l2?parent=${l1.id}`}
                          className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200"
                          onClick={(e) => e.stopPropagation()}
                          title="افزودن زیر دسته"
                        >
                          <FaPlus className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/categories/${l1.id}/edit`}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          onClick={(e) => e.stopPropagation()}
                          title="ویرایش دسته‌بندی"
                        >
                          <FaEdit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteL1Category(l1.id, l1.name);
                          }}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                          title="حذف دسته‌بندی"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Level 2 & 3 */}
                    {expandedCategories.has(l1.id) && l1.categoryL2s.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        {l1.categoryL2s.map((l2) => (
                          <div key={l2.id} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-2">
                                  <FaList className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">{l2.name}</h5>
                                  <p className="text-sm text-gray-500">
                                    {l2._count.categoryL3s} زیر زیر دسته
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/categories/new/l3?parent=${l2.id}`}
                                  className="rounded-lg bg-purple-100 p-2 text-purple-600 hover:bg-purple-200"
                                  title="افزودن زیر دسته"
                                >
                                  <FaPlus className="h-4 w-4" />
                                </Link>
                                <Link
                                  href={`/admin/categories/${l2.id}/edit`}
                                  className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                                  title="ویرایش دسته‌بندی"
                                >
                                  <FaEdit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => deleteL2Category(l2.id, l2.name)}
                                  className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                  title="حذف دسته‌بندی"
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Level 3 */}
                            {l2.categoryL3s.length > 0 && (
                              <div className="mt-2 mr-6 space-y-2">
                                {l2.categoryL3s.map((l3) => (
                                  <div key={l3.id} className="bg-white border border-gray-200 rounded-lg">
                                    <div 
                                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                                      onClick={() => toggleL3Category(l3.id)}
                                    >
                                      <div className="flex items-center gap-3">
                                        {l3._count.products > 0 ? (
                                          expandedL3Categories.has(l3.id) ? (
                                            <FaChevronDown className="h-3 w-3 text-gray-400" />
                                          ) : (
                                            <FaChevronRight className="h-3 w-3 text-gray-400" />
                                          )
                                        ) : (
                                          <div className="w-3 h-3" />
                                        )}
                                        <div className="rounded-full bg-purple-100 p-2">
                                          <FaBox className="h-3 w-3 text-purple-600" />
                                        </div>
                                        <div>
                                          <h6 className="text-sm font-medium text-gray-900">{l3.name}</h6>
                                          <p className="text-xs text-gray-500">
                                            {l3._count.products} محصول
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Link
                                          href={`/admin/products/new?category=${l3.id}`}
                                          className="rounded-lg bg-green-100 p-1 text-green-600 hover:bg-green-200"
                                          onClick={(e) => e.stopPropagation()}
                                          title="افزودن محصول"
                                        >
                                          <FaPlus className="h-3 w-3" />
                                        </Link>
                                        <Link
                                          href={`/admin/categories/${l3.id}/edit`}
                                          className="rounded-lg bg-blue-100 p-1 text-blue-600 hover:bg-blue-200"
                                          onClick={(e) => e.stopPropagation()}
                                          title="ویرایش دسته‌بندی"
                                        >
                                          <FaEdit className="h-3 w-3" />
                                        </Link>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteL3Category(l3.id, l3.name);
                                          }}
                                          className="rounded-lg bg-red-100 p-1 text-red-600 hover:bg-red-200"
                                          title="حذف دسته‌بندی"
                                        >
                                          <FaTrash className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Products */}
                                    {expandedL3Categories.has(l3.id) && (
                                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                                        {l3.products && l3.products.length > 0 ? (
                                          <div className="space-y-2">
                                            {l3.products.map((product) => (
                                              <div key={product.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                                                    {product.image ? (
                                                      <Image 
                                                        src={product.image} 
                                                        alt={product.name}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                      />
                                                    ) : (
                                                      <div className="w-full h-full flex items-center justify-center">
                                                        <FaBox className="h-3 w-3 text-gray-400" />
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <h6 className="text-xs font-medium text-gray-900">{product.name}</h6>
                                                    <p className="text-xs text-gray-500">
                                                      {product.price.toLocaleString()} تومان | موجودی: {product.stock}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    product.isActive 
                                                      ? 'bg-green-100 text-green-800' 
                                                      : 'bg-red-100 text-red-800'
                                                  }`}>
                                                    {product.isActive ? 'فعال' : 'غیرفعال'}
                                                  </span>
                                                  <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="rounded-lg bg-blue-100 p-1 text-blue-600 hover:bg-blue-200"
                                                    title="ویرایش محصول"
                                                  >
                                                    <FaEdit className="h-3 w-3" />
                                                  </Link>
                                                </div>
                                              </div>
                                            ))}
                                            {l3._count.products > 10 && (
                                              <Link
                                                href={`/admin/products?category=${l3.id}`}
                                                className="flex items-center justify-center gap-2 p-2 text-blue-600 hover:text-blue-700 text-xs font-medium"
                                              >
                                                <FaEye className="h-3 w-3" />
                                                مشاهده همه محصولات ({l3._count.products})
                                              </Link>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-center py-4">
                                            <FaBox className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 mb-3">هیچ محصولی در این دسته‌بندی وجود ندارد</p>
                                            <Link
                                              href={`/admin/products/new?category=${l3.id}`}
                                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                                            >
                                              <FaPlus className="h-3 w-3" />
                                              افزودن اولین محصول
                                            </Link>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 