'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaTrash, 
  FaSearch,
  FaBoxes,
  FaBox,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaShoppingCart,
  FaChartLine,
  FaTag,
  FaExclamationTriangle,
  FaClinicMedical,
  FaUserMd,
  FaFilter,
  FaSort,
  FaSortAmountUp,
  FaSortAmountDown
} from 'react-icons/fa';

interface ProductPack {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
  totalPrice: number;
  discountPrice?: number;
  isActive: boolean;
  isCustomPack: boolean;
  clinicInfo?: {
    id: number;
    name: string;
    owner: string;
  };
  userInfo?: {
    id: number;
    name: string;
    phone: string;
  };
  items: {
    id: number;
    quantity: number;
    product: {
      name: string;
      price: number;
      stock: number;
      image?: string;
    };
  }[];
  createdAt: string;
  salesCount?: number;
  revenue?: number;
  discountPercentage?: number;
  salesStats: {
    totalSales: number;
    totalRevenue: number;
  };
  stockWarnings: {
    productName: string;
    required: number;
    available: number;
    shortage: number;
  }[];
}

// Components
function PackCard({ pack }: { pack: ProductPack }) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
      {/* Header with badges */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{pack.name}</h3>
            {pack.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{pack.description}</p>
            )}
          </div>
          
          {/* Status badges */}
          <div className="flex flex-col gap-2 items-end">
            {pack.isCustomPack && pack.userInfo && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                <FaUserMd className="w-3 h-3" />
                پک مشتری: {pack.userInfo.name}
              </div>
            )}
            {pack.isCustomPack && !pack.userInfo && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                <FaClinicMedical className="w-3 h-3" />
                پک کلینیک
              </div>
            )}
            {!pack.isCustomPack && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                <FaBoxes className="w-3 h-3" />
                پک عمومی
              </div>
            )}
            {pack.stockWarnings.length > 0 && (
              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                <FaExclamationTriangle className="w-3 h-3" />
                کمبود موجودی
              </div>
            )}
          </div>
        </div>

        {/* Price and stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('fa-IR').format(pack.totalPrice)} تومان
            </div>
            {pack.discountPrice && pack.discountPrice < pack.totalPrice && (
              <div className="text-lg text-gray-500 line-through">
                {new Intl.NumberFormat('fa-IR').format(pack.discountPrice)} تومان
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {pack.salesStats && (
              <div className="text-right">
                <div className="text-sm text-gray-500">فروش</div>
                <div className="font-semibold text-gray-900">{pack.salesStats.totalSales}</div>
              </div>
            )}
          </div>
        </div>

        {/* Customer info for custom packs */}
        {pack.isCustomPack && pack.userInfo && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <FaUserMd className="w-4 h-4" />
              <span className="font-medium">مشتری:</span>
              <span>{pack.userInfo.name}</span>
              <span className="text-gray-500">|</span>
              <span>{pack.userInfo.phone}</span>
            </div>
          </div>
        )}

        {/* Items preview */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">محصولات:</div>
          <div className="flex flex-wrap gap-2">
            {pack.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                <FaBox className="w-3 h-3 text-gray-500" />
                <span>{item.product.name}</span>
                <span className="text-gray-500">({item.quantity})</span>
              </div>
            ))}
            {pack.items.length > 3 && (
              <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded text-xs text-blue-700">
                <span>+{pack.items.length - 3} محصول دیگر</span>
              </div>
            )}
          </div>
        </div>

        {/* Stock warnings */}
        {pack.stockWarnings.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <div className="text-sm font-medium text-red-700 mb-2">هشدار موجودی:</div>
            <div className="space-y-1">
              {pack.stockWarnings.slice(0, 2).map((warning, index) => (
                <div key={index} className="text-xs text-red-600">
                  {warning.productName}: نیاز {warning.required}، موجود {warning.available}
                </div>
              ))}
              {pack.stockWarnings.length > 2 && (
                <div className="text-xs text-red-600">
                  و {pack.stockWarnings.length - 2} محصول دیگر
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin-sales/packs/${pack.id}/analytics`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <FaChartLine className="w-4 h-4" />
              تحلیل
            </Link>
            <Link
              href={`/admin-sales/packs/${pack.id}/edit`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              <FaEdit className="w-4 h-4" />
              ویرایش
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href={`/admin-sales/packs/${pack.id}`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FaEye className="w-4 h-4" />
              مشاهده
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function PackCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-3" />
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        </div>
        
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-200 rounded-xl" />
          <div className="h-16 bg-gray-200 rounded-xl" />
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function SalesPacksPage() {
  const [packs, setPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'totalPrice'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await fetch('/api/admin/packs?role=sales');
        if (!res.ok) {
          throw new Error('Failed to fetch packs');
        }
        const data = await res.json();
        setPacks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  // Filter and sort packs
  const filteredPacks = packs
    .filter(pack => {
      const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pack.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (pack.userInfo?.name && pack.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'regular' && !pack.isCustomPack) ||
                           (filterType === 'custom' && pack.isCustomPack);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'totalPrice':
          valueA = a.totalPrice;
          valueB = b.totalPrice;
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

  const stats = {
    total: packs.length,
    regular: packs.filter(p => !p.isCustomPack).length,
    custom: packs.filter(p => p.isCustomPack).length,
    customerPacks: packs.filter(p => p.isCustomPack && p.userInfo).length,
    clinicPacks: packs.filter(p => p.isCustomPack && !p.userInfo).length,
    withStockWarnings: packs.filter(p => p.stockWarnings.length > 0).length
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-500 mb-4 text-lg">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
        >
          تلاش مجدد
        </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">پک‌های محصول</h1>
              <p className="text-gray-600">مدیریت و تحلیل پک‌های محصول و کلینیک</p>
            </div>
        <Link
          href="/admin-sales/packs/new"
              className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
        >
              <FaPlus className="w-4 h-4" />
          <span>ایجاد پک جدید</span>
        </Link>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">کل پک‌ها</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FaBoxes className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">پک‌های عمومی</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.regular}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <FaBox className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">پک‌های مشتری</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.customerPacks}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <FaUserMd className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">پک‌های کلینیک</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.clinicPacks}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FaClinicMedical className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">کمبود موجودی</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.withStockWarnings}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="جستجو در نام و توضیحات پک..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  <option value="all">همه پک‌ها</option>
                  <option value="regular">پک‌های عمومی</option>
                  <option value="custom">پک‌های سفارشی</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  <option value="createdAt">تاریخ ایجاد</option>
                  <option value="name">نام</option>
                  <option value="totalPrice">قیمت</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => <PackCardSkeleton key={i} />)
          ) : filteredPacks.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBoxes className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">هیچ پکی یافت نشد</h3>
              <p className="text-gray-600 mb-6">پک‌های موجود با فیلترهای انتخاب شده مطابقت ندارند</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            filteredPacks.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))
        )}
        </div>
      </div>
    </div>
  );
} 