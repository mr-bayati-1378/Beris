'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaBox, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaImage,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTags,
  FaBarcode,
  FaWarehouse,
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  images: string[];
  lastUpdated: string;
  brand?: string;
  description?: string;
}

export default function WarehouseProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        role: 'warehouse'
      });
      
      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter, currentPage]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories/tree');
      if (response.ok) {
        const data = await response.json();
        const categoryNames = data.categories?.map((cat: any) => cat.name) || [];
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const getStatusBadge = (status: string, stock: number, minStock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">
          <FaExclamationTriangle className="h-3 w-3" />
          ناموجود
        </span>
      );
    }
    
    if (stock <= minStock) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border bg-amber-100 text-amber-800 border-amber-200">
          <FaExclamationTriangle className="h-3 w-3" />
          موجودی کم
        </span>
      );
    }

    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
          <FaCheckCircle className="h-3 w-3" />
          فعال
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">
        غیرفعال
      </span>
    );
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(product => product.id !== id));
        alert('محصول با موفقیت حذف شد');
      } else {
        alert('خطا در حذف محصول');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('خطا در حذف محصول');
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                <FaBox className="h-6 w-6 text-white" />
              </div>
              مدیریت محصولات انبار
            </h1>
            <p className="mt-2 text-gray-600">
              مدیریت موجودی و اطلاعات محصولات
            </p>
          </div>
          <Link
            href="/admin-warehouse/products/new"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            <FaPlus className="h-4 w-4" />
            محصول جدید
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام محصول، SKU، برند..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">همه دسته‌ها</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
                <option value="out_of_stock">ناموجود</option>
                <option value="low_stock">موجودی کم</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
              <FaDownload className="h-4 w-4" />
              خروجی Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">کل محصولات</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <FaBox className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">فعال</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.status === 'active' && p.stock > p.minStock).length}
                </p>
              </div>
              <FaCheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">موجودی کم</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.stock > 0 && p.stock <= p.minStock).length}
                </p>
              </div>
              <FaExclamationTriangle className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">ناموجود</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <FaWarehouse className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    دسته‌بندی
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    موجودی
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    قیمت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخرین بروزرسانی
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaSpinner className="inline-block animate-spin text-amber-500 text-2xl mb-4" />
                      <p className="text-gray-600">در حال بارگذاری محصولات...</p>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <FaImage className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.brand && (
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaBarcode className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-900">{product.sku}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaTags className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{product.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaWarehouse className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className={`font-bold ${
                              product.stock === 0 ? 'text-red-600' :
                              product.stock <= product.minStock ? 'text-amber-600' : 'text-green-600'
                            }`}>
                              {product.stock}
                            </span>
                            <span className="text-gray-500 text-sm"> / {product.minStock} حداقل</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          {product.price.toLocaleString()} تومان
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status, product.stock, product.minStock)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.lastUpdated}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin-warehouse/products/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin-warehouse/products/${product.id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="ویرایش محصول"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin-warehouse/products/${product.id}/images`}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="مدیریت تصاویر"
                          >
                            <FaImage className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف محصول"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaBox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">محصولی یافت نشد</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                          ? 'محصولی با این معیارها یافت نشد' 
                          : 'هنوز محصولی ثبت نشده است'
                        }
                      </p>
                      <Link
                        href="/admin-warehouse/products/new"
                        className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors"
                      >
                        <FaPlus className="h-4 w-4" />
                        ایجاد محصول جدید
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                <span className="text-sm text-gray-700">
                  صفحه {currentPage} از {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 