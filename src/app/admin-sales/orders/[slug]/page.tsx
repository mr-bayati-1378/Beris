'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaCalendarAlt,
  FaMoneyBill,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaTruck,
  FaBox,
  FaSpinner,
  FaPrint,
  FaDownload,
  FaShare,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    price: number;
    images: Array<{ url: string }>;
  };
  userPack?: {
    name: string;
    totalPrice: number;
  };
}

interface Order {
  id: string;
  slug: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderSource: string;
  salesRep?: string;
  notes?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipCode: string;
  deliveryPhone?: string;
  deliveryRecipient?: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  payment?: {
    status: string;
    amount: number;
    gateway?: {
      displayName: string;
    };
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderSlug = params.slug as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderSlug}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else {
          setError('سفارش یافت نشد');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('خطا در دریافت اطلاعات سفارش');
      } finally {
        setLoading(false);
      }
    };

    if (orderSlug) {
      fetchOrder();
    }
  }, [orderSlug]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: FaExclamationCircle },
      'processing': { color: 'bg-blue-100 text-blue-800', icon: FaTruck },
      'shipped': { color: 'bg-purple-100 text-purple-800', icon: FaTruck },
      'delivered': { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
      'approved': { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {getStatusText(status)}
      </span>
    );
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'pending': 'در انتظار',
      'processing': 'در حال پردازش',
      'shipped': 'ارسال شده',
      'delivered': 'تحویل داده شده',
      'cancelled': 'لغو شده',
      'approved': 'تایید شده',
      'rejected': 'رد شده',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getSourceText = (source: string) => {
    return source === 'WEBSITE' ? 'وب‌سایت' : 'مسئول فروش';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">خطا</h2>
          <p className="text-gray-600">{error || 'سفارش یافت نشد'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">جزئیات سفارش</h1>
                <p className="text-gray-600">سفارش #{order.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* اطلاعات مشتری */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                اطلاعات مشتری
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {order.user.firstName} {order.user.lastName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <span>{order.user.phone}</span>
                    </div>
                    {order.user.email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span>{order.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" />
                    آدرس تحویل
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{order.deliveryAddress}</p>
                    <p>{order.deliveryCity}، {order.deliveryState}</p>
                    <p>کد پستی: {order.deliveryZipCode}</p>
                    {order.deliveryPhone && (
                      <p>تلفن: {order.deliveryPhone}</p>
                    )}
                    {order.deliveryRecipient && (
                      <p>گیرنده: {order.deliveryRecipient}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* آمار سفارش */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaShoppingCart className="text-green-600" />
                آمار سفارش
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaMoneyBill className="text-blue-600" />
                    <span className="text-blue-800 font-medium">مبلغ کل</span>
                  </div>
                  <span className="text-blue-900 font-bold">{formatPrice(order.total)} تومان</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    <span className="text-green-800 font-medium">تاریخ سفارش</span>
                  </div>
                  <span className="text-green-900 font-bold">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-purple-600" />
                    <span className="text-purple-800 font-medium">منبع سفارش</span>
                  </div>
                  <span className="text-purple-900 font-bold">{getSourceText(order.orderSource)}</span>
                </div>

                {order.salesRep && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-orange-600" />
                      <span className="text-orange-800 font-medium">مسئول فروش</span>
                    </div>
                    <span className="text-orange-900 font-bold">{order.salesRep}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* آیتم‌های سفارش */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-600" />
                آیتم‌های سفارش
              </h2>

              {order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaBox className="text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.product?.name || item.userPack?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              تعداد: {item.quantity} عدد
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">
                            {formatPrice(item.price)} تومان
                          </p>
                          <p className="text-sm text-gray-600">
                            کل: {formatPrice(item.quantity * item.price)} تومان
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaBox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">آیتمی یافت نشد</h3>
                  <p className="text-gray-600">این سفارش هیچ آیتمی ندارد.</p>
                </div>
              )}
            </div>

            {/* یادداشت‌ها */}
            {order.notes && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">یادداشت‌ها</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 