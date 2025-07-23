'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaImage,
  FaBox,
  FaDollarSign,
  FaSortAmountUp,
  FaSortAmountDown,
  FaTimes,
  FaSync
} from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  brand: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  description: string | null;
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

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncingFromSheets, setSyncingFromSheets] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refresh data when page becomes visible (returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Force refresh when page becomes visible
        setLoading(true);
        // Force a complete data refresh
        setTimeout(() => {
          setLoading(false);
          // Trigger a new fetch by updating refreshKey
          setRefreshKey(prev => prev + 1);
        }, 100);
      }
    };

    const handleFocus = () => {
      // Force refresh when window gains focus (returning from edit page)
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Force a complete data refresh
        setRefreshKey(prev => prev + 1);
      }, 100);
    };

    // Also refresh when the page loads (in case user navigated back)
    const handlePageLoad = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Force a complete data refresh
        setRefreshKey(prev => prev + 1);
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageLoad);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageLoad);
    };
  }, []);

  // Auto refresh every 30 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        setRefreshKey(prev => prev + 1);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Force refresh when returning from edit page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Set a flag in sessionStorage to indicate we're going to edit page
      sessionStorage.setItem('editing-product', 'true');
    };

    const handlePageShow = () => {
      // Check if we're returning from edit page
      const wasEditing = sessionStorage.getItem('editing-product');
      if (wasEditing) {
        sessionStorage.removeItem('editing-product');
        // Force refresh after a short delay
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 500);
      }
    };

    // Also check on initial load
    const wasEditing = sessionStorage.getItem('editing-product');
    if (wasEditing) {
      sessionStorage.removeItem('editing-product');
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 500);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // بارگذاری محصولات از API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          search: debouncedSearchTerm,
          category: filterCategory,
          status: filterStatus,
          sortBy: sortBy,
          sortOrder: sortOrder,
          _t: Date.now().toString() // Cache busting
        });

        const response = await fetch(`/api/admin/products?${queryParams}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setTotalPages(data.totalPages);
          setTotalItems(data.total);
        } else {
          console.error('خطا در دریافت محصولات');
        }
      } catch (error) {
        console.error('خطا در دریافت محصولات:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, filterCategory, filterStatus, sortBy, sortOrder, refreshKey]);

  // حذف فیلتر اضافی در فرانت‌اند - محصولات از API آماده می‌آیند
  const currentProducts = products;

  const categories = [...new Set(products.map(p => p.categoryL3.categoryL2.categoryL1.name))];

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
          setTotalItems(prev => prev - 1);
        } else {
          alert('خطا در حذف محصول');
        }
      } catch (error) {
        console.error('خطا در حذف محصول:', error);
        alert('خطا در حذف محصول');
      }
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          brand: product.brand,
          categoryL3Id: product.categoryL3.id,
          isActive: !product.isActive
        }),
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === id 
            ? { ...p, isActive: !p.isActive }
            : p
        ));
      }
    } catch (error) {
      console.error('خطا در تغییر وضعیت محصول:', error);
    }
  };

  const syncFromGoogleSheets = async () => {
    try {
      setSyncingFromSheets(true);
      const response = await fetch('/api/admin/products/sync-from-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`همگام‌سازی با موفقیت انجام شد!\n\nتعداد محصولات به‌روزرسانی شده: ${result.results.updated}\nتعداد محصولات جدید: ${result.results.created}\nکل محصولات پردازش شده: ${result.results.totalProcessed}`);
        // به‌روزرسانی لیست محصولات
        setRefreshKey(prev => prev + 1);
      } else {
        alert(`خطا در همگام‌سازی: ${result.error}`);
      }
    } catch (error) {
      console.error('خطا در همگام‌سازی با Google Sheets:', error);
      alert('خطا در همگام‌سازی با Google Sheets');
    } finally {
      setSyncingFromSheets(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">
                {searchTerm !== debouncedSearchTerm 
                  ? `در حال جستجو برای "${searchTerm}"...`
                  : 'در حال بارگذاری محصولات...'
                }
              </p>
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900">مدیریت محصولات</h1>
            <p className="mt-2 text-gray-600">مدیریت کامل محصولات فروشگاه</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncFromGoogleSheets}
              disabled={syncingFromSheets}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={`h-4 w-4 ${syncingFromSheets ? 'animate-spin' : ''}`} />
              {syncingFromSheets ? 'در حال همگام‌سازی...' : 'همگام‌سازی با Google Sheets'}
            </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <FaPlus className="h-4 w-4" />
            افزودن محصول جدید
          </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">فیلترها و جستجو</h3>
            <button
              onClick={() => {
                setLoading(true);
                // Force a complete refresh
                setRefreshKey(prev => prev + 1);
                setTimeout(() => setLoading(false), 100);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              به‌روزرسانی
            </button>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در محصولات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-10 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                )}
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه دسته‌بندی‌ها</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="name">نام</option>
                  <option value="price">قیمت</option>
                  <option value="stock">موجودی</option>
                  <option value="createdAt">تاریخ</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setSortBy('name');
                    setSortOrder('asc');
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <FaTimes className="h-3 w-3" />
                  پاک کردن همه فیلترها
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Products Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {currentProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 text-gray-400">
                <FaBox className="h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearchTerm ? 'محصولی یافت نشد' : 'هیچ محصولی وجود ندارد'}
              </h3>
              <p className="text-gray-500">
                {debouncedSearchTerm 
                  ? `برای "${debouncedSearchTerm}" محصولی پیدا نشد. لطفاً کلمه کلیدی دیگری امتحان کنید.`
                  : 'برای شروع، محصول جدیدی اضافه کنید.'
                }
              </p>
              {debouncedSearchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  نمایش همه محصولات
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">محصول</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">دسته‌بندی</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">قیمت</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">موجودی</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">وضعیت</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">تاریخ ایجاد</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            <Image
                              src={product.images[0]?.url || (product.images.length === 0 ? product.image : null) || '/default-product.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                              key={`${product.id}-${product.images[0]?.url || (product.images.length === 0 ? product.image : 'no-image')}-${refreshKey}`}
                              onError={(e) => {
                                // اگر تصویر لود نشد، تصویر پیش‌فرض نمایش داده شود
                                const target = e.target as HTMLImageElement;
                                target.src = '/default-product.jpg';
                                // Hide loading indicator on error
                                const loadingElement = document.getElementById(`loading-${product.id}`);
                                if (loadingElement) {
                                  loadingElement.style.display = 'none';
                                }
                              }}
                              onLoad={(e) => {
                                // اگر تصویر با موفقیت لود شد، loading indicator را حذف کن
                                const target = e.target as HTMLImageElement;
                                const loadingElement = document.getElementById(`loading-${product.id}`);
                                if (loadingElement) {
                                  loadingElement.style.display = 'none';
                                }
                              }}
                              priority={true}
                            />
                            {/* Loading indicator */}
                            <div className="absolute inset-0 bg-gray-200 animate-pulse opacity-50" id={`loading-${product.id}`}></div>
                            {/* No image indicator */}
                            {!product.images[0]?.url && (product.images.length === 0 ? !product.image : true) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.categoryL3.categoryL2.categoryL1.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.price.toLocaleString()} تومان</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          product.stock < 20 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 50 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          <FaBox className="h-3 w-3" />
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(product.id)}
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            product.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {product.isActive ? 'فعال' : 'غیرفعال'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded p-1 text-blue-600 hover:bg-blue-100"
                            title="مشاهده"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded p-1 text-green-600 hover:bg-green-100"
                            title="ویرایش"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/images`}
                            className="rounded p-1 text-purple-600 hover:bg-purple-100"
                            title="مدیریت تصاویر"
                          >
                            <FaImage className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-100"
                            title="حذف"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {itemsPerPage >= 1000 
                ? `نمایش همه ${totalItems} محصول`
                : `نمایش ${(currentPage - 1) * itemsPerPage + 1} تا ${Math.min(currentPage * itemsPerPage, totalItems)} از ${totalItems} محصول`
              }
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="10">10 مورد</option>
              <option value="25">25 مورد</option>
              <option value="50">50 مورد</option>
              <option value="100">100 مورد</option>
              <option value="1000">همه محصولات ({totalItems})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {itemsPerPage < 1000 && (
              <>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  قبلی
                </button>
                {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-4 py-2 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  بعدی
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
