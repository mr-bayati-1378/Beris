'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaChartLine, FaShoppingCart, FaUsers, FaMoneyBill, FaCalendar, FaBox, FaClinicMedical } from 'react-icons/fa';
import Image from 'next/image';

interface PackAnalytics {
  id: string | number;
  name: string;
  description?: string;
  isCustomPack?: boolean;
  clinicInfo?: {
    id: number;
    name: string;
    owner: string;
  };
  salesCount: number;
  revenue: number;
  items: {
    id: number;
    quantity: number;
    product: {
      name: string;
      price: number;
      images?: string[];
    };
  }[];
  monthlySales: {
    month: string;
    salesCount: number;
    revenue: number;
  }[];
  channelSales: {
    channel: string;
    salesCount: number;
    revenue: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function PackAnalyticsPage() {
  const params = useParams();
  const [analytics, setAnalytics] = useState<PackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/admin/packs/${params.id}/analytics?role=sales`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg" />
            <div className="h-80 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-gray-500 text-lg">هیچ داده‌ای یافت نشد</div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = analytics.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const averageOrderValue = analytics.salesCount > 0 ? analytics.revenue / analytics.salesCount : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">تحلیل فروش پک</h1>
              <p className="text-gray-600">{analytics.name}</p>
            </div>
            
            {/* Pack Type Badge */}
            <div className="flex items-center gap-2">
              {analytics.isCustomPack ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                  <FaClinicMedical className="w-4 h-4" />
                  <span className="font-medium">پک کلینیک</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                  <FaBox className="w-4 h-4" />
                  <span className="font-medium">پک معمولی</span>
                </div>
              )}
            </div>
          </div>

          {/* Clinic Info for Custom Packs */}
          {analytics.isCustomPack && analytics.clinicInfo && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <FaClinicMedical className="text-blue-600 w-5 h-5" />
                <div>
                  <div className="font-medium text-blue-900">{analytics.clinicInfo.name}</div>
                  <div className="text-sm text-blue-700">مالک: {analytics.clinicInfo.owner}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-blue-900 font-medium">تعداد فروش</h3>
                <p className="text-sm text-blue-600">کل سفارشات</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {(analytics.salesCount || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FaMoneyBill className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-green-900 font-medium">درآمد کل</h3>
                <p className="text-sm text-green-600">مجموع فروش</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {(analytics.revenue || 0).toLocaleString()} تومان
          </p>
        </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FaBox className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-purple-900 font-medium">تعداد آیتم‌ها</h3>
                <p className="text-sm text-purple-600">محصولات در پک</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-700">
              {totalItems.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-orange-900 font-medium">میانگین سفارش</h3>
                <p className="text-sm text-orange-600">درآمد هر سفارش</p>
        </div>
            </div>
            <p className="text-3xl font-bold text-orange-700">
              {averageOrderValue.toLocaleString()} تومان
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">روند فروش ماهانه</h3>
            <div className="space-y-4">
              {analytics.monthlySales && analytics.monthlySales.length > 0 ? (
                analytics.monthlySales.map((month, index) => {
                  const maxSales = Math.max(...analytics.monthlySales.map(m => m.salesCount));
                  const percentage = maxSales > 0 ? (month.salesCount / maxSales) * 100 : 0;
                  
                  return (
                <div key={month.month} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600 font-medium">{month.month}</div>
                  <div className="flex-1">
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-32 text-right">
                        <div className="font-bold text-gray-900">{month.salesCount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{month.revenue.toLocaleString()} تومان</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaChartLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>هیچ داده فروش ماهانه‌ای موجود نیست</p>
                </div>
              )}
            </div>
          </div>

          {/* Channel Sales */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">فروش بر اساس کانال</h3>
            <div className="space-y-4">
              {analytics.channelSales && analytics.channelSales.length > 0 ? (
                analytics.channelSales.map((channel, index) => (
                  <div 
                    key={channel.channel}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">
                        {channel.channel === 'clinic' ? 'کلینیک' : 
                         channel.channel === 'direct' ? 'مستقیم' : channel.channel}
                      </div>
                      <div className="text-sm text-gray-600">
                        {channel.salesCount} سفارش
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {channel.revenue.toLocaleString()} تومان
                      </div>
                      <div className="text-sm text-gray-500">
                        {((channel.revenue / analytics.revenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>هیچ داده کانال فروشی موجود نیست</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pack Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">محصولات پک</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.items && analytics.items.length > 0 ? (
              analytics.items.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {item.product.images && item.product.images.length > 0 && (
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product.name}</div>
                  <div className="text-sm text-gray-600">
                        {item.quantity} عدد | {item.product.price.toLocaleString()} تومان
                  </div>
                </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <FaBox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>هیچ محصولی در این پک موجود نیست</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 