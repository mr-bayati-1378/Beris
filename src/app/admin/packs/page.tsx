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
  FaSpinner
} from 'react-icons/fa';

interface ProductPack {
  id: number;
  name: string;
  description?: string;
  image?: string;
  totalPrice: number;
  discountPrice?: number;
  isActive: boolean;
  items: {
    id: number;
    quantity: number;
    product: {
      name: string;
      price: number;
      image?: string;
    };
  }[];
  createdAt: string;
}

export default function ProductPacksPage() {
  const [packs, setPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // بارگذاری پک‌ها
  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/admin/packs');
      if (response.ok) {
        const data = await response.json();
        setPacks(data.packs || []);
      } else {
        console.error('خطا در دریافت پک‌ها');
      }
    } catch (error) {
      console.error('خطا در دریافت پک‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  // تغییر وضعیت پک
  const handleToggleStatus = async (id: number, currentStatus: boolean, packName: string) => {
    const action = currentStatus ? 'غیرفعال' : 'فعال';
    if (!confirm(`آیا مطمئن هستید که می‌خواهید پک "${packName}" را ${action} کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/packs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        alert(`پک با موفقیت ${action} شد`);
        fetchPacks();
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در تغییر وضعیت:', error);
      alert('خطا در تغییر وضعیت');
    }
  };

  // حذف پک
  const handleDeletePack = async (id: number, packName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید پک "${packName}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/packs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('پک با موفقیت حذف شد');
        fetchPacks();
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('خطا در حذف پک:', error);
      alert('خطا در حذف پک');
    }
  };

  // فیلتر پک‌ها
  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && pack.isActive) ||
      (statusFilter === 'inactive' && !pack.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const calculateSavings = (totalPrice: number, discountPrice?: number) => {
    if (!discountPrice) return 0;
    return totalPrice - discountPrice;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">در حال بارگذاری پک‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <FaBoxes className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مدیریت پک‌های محصول</h1>
              <p className="text-gray-600">ایجاد و مدیریت پک‌های فروش محصولات</p>
            </div>
          </div>
          <Link
            href="/admin/packs/new"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FaPlus className="h-4 w-4" />
            ایجاد پک جدید
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام پک..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPacks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FaBoxes className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">پکی یافت نشد</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter ? 'پکی با این معیارها یافت نشد' : 'هنوز پکی ایجاد نشده است'}
            </p>
            <Link
              href="/admin/packs/new"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              ایجاد اولین پک
            </Link>
          </div>
        ) : (
          filteredPacks.map((pack) => (
            <div
              key={pack.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
                !pack.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Pack Image */}
              <div className="aspect-video bg-gradient-to-r from-purple-100 to-pink-100 relative">
                {pack.image ? (
                  <Image
                    src={pack.image}
                    alt={pack.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaBoxes className="h-12 w-12 text-purple-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pack.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pack.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {/* Discount Badge */}
                {pack.discountPrice && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                      {Math.round(((pack.totalPrice - pack.discountPrice) / pack.totalPrice) * 100)}% تخفیف
                    </span>
                  </div>
                )}
              </div>

              {/* Pack Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{pack.name}</h3>
                  {pack.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{pack.description}</p>
                  )}
                </div>

                {/* Items */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">محصولات شامل:</p>
                  <div className="space-y-1">
                    {pack.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <FaBox className="h-3 w-3 text-purple-500" />
                        <span>{item.quantity}× {item.product.name}</span>
                      </div>
                    ))}
                    {pack.items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        و {pack.items.length - 3} محصول دیگر...
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {pack.discountPrice ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(pack.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(pack.totalPrice)}
                        </span>
                      </div>
                      <p className="text-sm text-green-600">
                        صرفه‌جویی: {formatCurrency(calculateSavings(pack.totalPrice, pack.discountPrice))}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(pack.totalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/packs/${pack.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <FaEye className="h-3 w-3" />
                    مشاهده
                  </Link>
                  <Link
                    href={`/admin/packs/${pack.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    <FaEdit className="h-3 w-3" />
                    ویرایش
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(pack.id, pack.isActive, pack.name)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                    title={pack.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  >
                    {pack.isActive ? <FaToggleOn className="h-4 w-4" /> : <FaToggleOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeletePack(pack.id, pack.name)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="حذف پک"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل پک‌ها</p>
              <p className="text-3xl font-bold text-gray-900">{packs.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaBoxes className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">پک‌های فعال</p>
              <p className="text-3xl font-bold text-green-600">
                {packs.filter(pack => pack.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaToggleOn className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">پک‌های تخفیف‌دار</p>
              <p className="text-3xl font-bold text-red-600">
                {packs.filter(pack => pack.discountPrice).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <FaBoxes className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط قیمت</p>
              <p className="text-lg font-bold text-blue-600">
                {packs.length > 0 
                  ? formatCurrency(packs.reduce((sum, pack) => sum + (pack.discountPrice || pack.totalPrice), 0) / packs.length)
                  : '0 تومان'
                }
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaBox className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 