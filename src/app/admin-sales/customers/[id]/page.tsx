'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShoppingCart,
  FaChartLine,
  FaEdit,
  FaArrowRight,
  FaSpinner,
  FaFileInvoice,
  FaBox
} from 'react-icons/fa';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent?: number;
  lastOrderDate: string | null;
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomerData = useCallback(async () => {
    try {
      const [customerRes, ordersRes] = await Promise.all([
        fetch(`/api/admin/customers/${customerId}`),
        fetch(`/api/admin/customers/${customerId}/orders`)
      ]);

      if (customerRes.ok) {
        const customerData = await customerRes.json();
        setCustomer(customerData.customer);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId, fetchCustomerData]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'در انتظار', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'ارسال شده', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'تحویل داده شده', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری اطلاعات مشتری...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">مشتری یافت نشد</p>
        <Link
          href="/admin-sales/customers"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          بازگشت به لیست مشتریان
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/admin-sales/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowRight className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FaUser className="text-blue-500" />
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              کد مشتری: {customer.id}
            </p>
          </div>
          <Link
            href={`/admin-sales/customers/${customer.id}/edit`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaEdit className="h-4 w-4" />
            ویرایش
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* اطلاعات مشتری */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات شخصی</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">نام کامل</p>
                  <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaPhone className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">شماره تلفن</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">ایمیل</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">تاریخ عضویت</p>
                  <p className="font-medium">{customer.createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* آدرس */}
          {(customer.address || customer.city) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">آدرس</h2>
              
              <div className="space-y-3">
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">آدرس</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                )}

                {customer.city && (
                  <div className="flex items-center gap-3">
                    <div className="w-5"></div>
                    <div>
                      <p className="text-sm text-gray-600">شهر</p>
                      <p className="font-medium">{customer.city}</p>
                    </div>
                  </div>
                )}

                {customer.postalCode && (
                  <div className="flex items-center gap-3">
                    <div className="w-5"></div>
                    <div>
                      <p className="text-sm text-gray-600">کد پستی</p>
                      <p className="font-medium">{customer.postalCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* آمار خرید */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">آمار خرید</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaShoppingCart className="text-blue-600" />
                  <span className="text-blue-800 font-medium">تعداد سفارشات</span>
                </div>
                <span className="text-blue-900 font-bold">{customer.totalOrders}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-green-600" />
                  <span className="text-green-800 font-medium">مجموع خرید</span>
                </div>
                <span className="text-green-900 font-bold">{(customer.totalSpent || 0).toLocaleString()} تومان</span>
              </div>

              {customer.lastOrderDate && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-600" />
                    <span className="text-purple-800 font-medium">آخرین سفارش</span>
                  </div>
                  <span className="text-purple-900 font-bold">{customer.lastOrderDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* سفارشات */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaFileInvoice className="text-blue-600" />
                سفارشات مشتری
              </h2>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">سفارش #{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{order.total.toLocaleString()} تومان</p>
                        <p className="text-sm text-gray-600">{order.createdAt}</p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">آیتم‌های سفارش:</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <FaBox className="text-gray-400" />
                                <span>{item.product.name}</span>
                              </div>
                              <div className="text-left">
                                <span className="text-gray-600">
                                  {item.quantity} × {item.price.toLocaleString()} = {(item.quantity * item.price).toLocaleString()} تومان
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">سفارشی یافت نشد</h3>
                <p className="text-gray-600">این مشتری هنوز سفارشی ثبت نکرده است.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* یادداشت‌ها */}
      {customer.notes && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">یادداشت‌ها</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
} 