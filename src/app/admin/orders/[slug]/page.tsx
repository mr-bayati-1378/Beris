'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PersianDate from '@/components/ui/persian-date';
import { 
  FaArrowRight,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaCreditCard,
  FaTruck,
  FaCheck,
  FaTimes,
  FaClock,
  FaEdit,
  FaPrint,
  FaDownload,
  FaEnvelope
} from 'react-icons/fa';
import Image from 'next/image';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    images?: Array<{
      url: string;
    }>;
  };
}

interface Order {
  id: string;
  slug: string;
  status: string;
  total: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipCode: string;
  createdAt: string;
  updatedAt: string;
  orderSource: string;
  salesRep?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  financeApprovedBy?: string;
  financeApprovedAt?: string;
  financeNotes?: string;
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
  paymentStatus: string;
}

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.slug]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        console.error('خطا در دریافت جزئیات سفارش');
      }
    } catch (error) {
      console.error('خطا در دریافت جزئیات سفارش:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: Order['status']) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی وضعیت:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': 
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'تحویل شده';
      case 'completed': return 'تکمیل شده';
      case 'shipped': return 'ارسال شده';
      case 'processing': return 'در حال پردازش';
      case 'pending': return 'در انتظار';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'پرداخت شده';
      case 'pending': return 'در انتظار پرداخت';
      case 'failed': return 'پرداخت ناموفق';
      case 'refunded': return 'بازگردانی';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری جزئیات سفارش...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-20">
            <FaTimes className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">سفارش یافت نشد</h2>
            <p className="text-gray-600 mb-6">سفارش مورد نظر وجود ندارد یا حذف شده است.</p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              بازگشت به لیست سفارشات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/admin/orders"
                  className="text-blue-600 hover:text-blue-700"
                >
                  سفارشات
                </Link>
                <FaArrowRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">جزئیات سفارش</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                سفارش #{order.slug}
              </h1>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <FaPrint className="h-4 w-4" />
                چاپ
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FaDownload className="h-4 w-4" />
                دانلود فاکتور
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">وضعیت سفارش</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(e.target.value as Order['status'])}
                    disabled={updating}
                    className="text-sm rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="processing">پردازش</option>
                    <option value="shipped">ارسال</option>
                    <option value="delivered">تحویل</option>
                    <option value="completed">تکمیل</option>
                    <option value="cancelled">لغو</option>
                  </select>
                </div>
              </div>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-gray-500">تاریخ سفارش:</span>
                   <p className="font-medium">
                     <PersianDate date={order.createdAt} />
                   </p>
                 </div>
                 <div>
                   <span className="text-gray-500">آخرین بروزرسانی:</span>
                   <p className="font-medium">
                     <PersianDate date={order.updatedAt} />
                   </p>
                 </div>
               </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">آیتم‌های سفارش</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaShoppingCart className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">تعداد: {item.quantity}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{item.price.toLocaleString()} تومان</p>
                      <p className="text-sm text-gray-500">قیمت واحد</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-blue-600">{(item.price * item.quantity).toLocaleString()} تومان</p>
                      <p className="text-sm text-gray-500">قیمت کل</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>مجموع:</span>
                  <span className="text-blue-600">{order.total.toLocaleString()} تومان</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات مشتری</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaUser className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">نام مشتری</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{order.user.phone}</p>
                    <p className="text-sm text-gray-500">شماره تماس</p>
                  </div>
                </div>
                {order.user.email && (
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{order.user.email}</p>
                      <p className="text-sm text-gray-500">ایمیل</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">آدرس ارسال</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                    <p className="text-sm text-gray-500">
                      {order.deliveryCity}، {order.deliveryState} - {order.deliveryZipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات پرداخت</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">وضعیت پرداخت:</span>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">مبلغ کل:</span>
                  <span className="font-bold text-gray-900">{order.total.toLocaleString()} تومان</span>
                </div>
                {order.payment?.gateway && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">درگاه پرداخت:</span>
                    <span className="font-medium text-gray-900">{order.payment.gateway.displayName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 