'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaArrowRight, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaShoppingCart,
  FaCheck,
  FaTimes,
  FaClock,
  FaDollarSign,
  FaFileInvoice,
  FaTruck,
  FaBox,
  FaPrint,
  FaDownload
} from 'react-icons/fa';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image?: string;
  };
  userPack?: {
    name: string;
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
}

export default function OrderDetailPage({ params }: { params: { slug: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.slug, fetchOrder]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        console.error('خطا در دریافت سفارش');
      }
    } catch (error) {
      console.error('خطا در دریافت سفارش:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order?.id,
          status: newStatus,
          role: 'finance'
        }),
      });

      if (response.ok) {
        await fetchOrder(); // بروزرسانی اطلاعات
      } else {
        console.error('خطا در بروزرسانی وضعیت سفارش');
      }
    } catch (error) {
      console.error('خطا در بروزرسانی وضعیت سفارش:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'در انتظار';
      case 'approved': return 'تایید شده';
      case 'finance_approved': return 'تایید مالی';
      case 'processing': return 'در حال پردازش';
      case 'completed': return 'تکمیل شده';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
      case 'finance_approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'پرداخت شده';
      case 'pending': return 'در انتظار پرداخت';
      case 'failed': return 'ناموفق';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری سفارش...</p>
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
              href="/admin-finance/orders"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaShoppingCart className="text-blue-500" />
                سفارش #{order.slug}
              </h1>
              <p className="mt-2 text-gray-600">جزئیات کامل سفارش و وضعیت پرداخت</p>
            </div>
            <Link
              href="/admin-finance/orders"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              بازگشت
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">وضعیت سفارش</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  {order.payment && (
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                      {getPaymentStatusText(order.payment.status)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">تاریخ سفارش</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                اطلاعات مشتری
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">نام و نام خانوادگی</p>
                  <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">شماره تماس</p>
                  <p className="font-medium flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    {order.user.phone}
                  </p>
                </div>
                {order.user.email && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">ایمیل</p>
                    <p className="font-medium">{order.user.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" />
                آدرس ارسال
              </h2>
              <div className="space-y-2">
                <p className="font-medium">{order.deliveryAddress}</p>
                <p className="text-gray-600">
                  {order.deliveryCity}، {order.deliveryState} - کد پستی: {order.deliveryZipCode}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">آیتم‌های سفارش</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {item.product?.name || item.userPack?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          تعداد: {item.quantity} قلم
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-600">
                        کل: {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">مجموع سفارش</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {order.payment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaDollarSign className="text-green-500" />
                  اطلاعات پرداخت
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">مبلغ پرداختی</p>
                    <p className="font-medium">{formatCurrency(order.payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">درگاه پرداخت</p>
                    <p className="font-medium">{order.payment.gateway?.displayName || 'نامشخص'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">وضعیت پرداخت</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                      {getPaymentStatusText(order.payment.status)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">عملیات</h3>
              <div className="space-y-3">
                <Link
                  href={`/admin-finance/invoices/${order.slug}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaFileInvoice />
                  ایجاد فاکتور
                </Link>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FaPrint />
                  چاپ سفارش
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <FaDownload />
                  دانلود PDF
                </button>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">جزئیات سفارش</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">شماره سفارش</p>
                  <p className="font-medium">#{order.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">منبع سفارش</p>
                  <p className="font-medium">
                    {order.orderSource === 'WEBSITE' ? 'سایت' : 'مسئول فروش'}
                  </p>
                </div>
                {order.salesRep && (
                  <div>
                    <p className="text-sm text-gray-600">مسئول فروش</p>
                    <p className="font-medium">{order.salesRep}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <p className="text-sm text-gray-600">یادداشت</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">وضعیت تایید</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">تایید فروش</span>
                  {order.approvedBy ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaClock className="text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تایید مالی</span>
                  {order.financeApprovedBy ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaClock className="text-yellow-500" />
                  )}
                </div>
                {order.financeNotes && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">یادداشت مالی</p>
                    <p className="text-sm">{order.financeNotes}</p>
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