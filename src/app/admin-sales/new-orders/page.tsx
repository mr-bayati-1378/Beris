'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaGlobe,
  FaCalendarAlt,
  FaMoneyBillWave
} from 'react-icons/fa';

interface NewOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  date: string;
  source: 'WEBSITE' | 'SALES_REP';
  salesRep?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  notes?: string;
}

interface SalesRep {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
}

export default function NewOrdersPage() {
  const [orders, setOrders] = useState<NewOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<NewOrder | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [approvalForm, setApprovalForm] = useState({
    salesRepName: '',
    notes: ''
  });

  useEffect(() => {
    const fetchNewOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/new-orders?role=sales');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.newOrders || []);
        } else {
          console.error('Failed to fetch new orders');
        }
      } catch (error) {
        console.error('Error fetching new orders:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSalesReps = async () => {
      try {
        const response = await fetch('/api/admin/sales-reps');
        if (response.ok) {
          const data = await response.json();
          setSalesReps(data.salesReps || []);
        } else {
          console.error('Failed to fetch sales representatives');
        }
      } catch (error) {
        console.error('Error fetching sales representatives:', error);
      }
    };

    fetchNewOrders();
    fetchSalesReps();
  }, []);

  const handleApprove = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/new-orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalForm),
      });

      if (response.ok) {
        setShowApprovalModal(false);
        setApprovalForm({ salesRepName: '', notes: '' });
        // Refresh the list
        const refreshResponse = await fetch('/api/admin/new-orders?role=sales');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setOrders(data.newOrders || []);
        }
        alert('سفارش با موفقیت تایید شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('خطا در تایید سفارش');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/new-orders/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh the list
        const refreshResponse = await fetch('/api/admin/new-orders?role=sales');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setOrders(data.newOrders || []);
        }
        alert('سفارش با موفقیت رد شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('خطا در رد سفارش');
    }
  };

  const getSourceIcon = (source: string) => {
    return source === 'WEBSITE' ? <FaGlobe className="text-blue-600" /> : <FaUserTie className="text-green-600" />;
  };

  const getSourceText = (source: string) => {
    return source === 'WEBSITE' ? 'وب‌سایت' : 'فروشنده';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'در انتظار تایید';
      case 'APPROVED': return 'تایید شده';
      case 'REJECTED': return 'رد شده';
      default: return status;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSource = filterSource === 'all' || order.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری سفارشات جدید...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <FaHourglassHalf />
                سفارشات جدید
              </h1>
              <p className="mt-2 text-gray-600 text-lg">تایید و مدیریت سفارشات جدید</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                <FaHourglassHalf className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">در انتظار تایید</span>
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                  {orders.filter(o => o.status === 'PENDING_APPROVAL').length} مورد
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در سفارشات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="PENDING_APPROVAL">در انتظار تایید</option>
                <option value="APPROVED">تایید شده</option>
                <option value="REJECTED">رد شده</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه منابع</option>
                <option value="WEBSITE">وب‌سایت</option>
                <option value="SALES_REP">فروشنده</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} سفارش یافت شد
              </span>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    منبع
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مسئول فروش
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-semibold">
                        {order.total.toLocaleString()} تومان
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(order.source)}
                        <span className="text-sm text-gray-900">{getSourceText(order.source)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.salesRep || 'نامشخص'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        {order.status === 'PENDING_APPROVAL' && (
                          <>
                            <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowApprovalModal(true);
                                }}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                title="تایید سفارش"
                              >
                                <FaCheckCircle className="text-sm" />
                              </button>
                            <button 
                              onClick={() => handleRejectOrder(order.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="رد سفارش"
                            >
                              <FaTimesCircle className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      سفارش جدیدی یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">جزئیات سفارش</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">اطلاعات مشتری</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>نام:</strong> {selectedOrder.customerName}</p>
                    <p><strong>تلفن:</strong> {selectedOrder.customerPhone}</p>
                    <p><strong>ایمیل:</strong> {selectedOrder.customerEmail || 'ثبت نشده'}</p>
                    <p><strong>تاریخ سفارش:</strong> {selectedOrder.date}</p>
                    <p><strong>منبع:</strong> {selectedOrder.source === 'WEBSITE' ? 'وب‌سایت' : 'مسئول فروش'}</p>
                    {selectedOrder.salesRep && (
                      <p><strong>مسئول فروش:</strong> {selectedOrder.salesRep}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">محصولات سفارش</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <span>{item.name}</span>
                        <span className="text-sm text-gray-600">
                          {item.quantity} عدد × {item.price.toLocaleString()} تومان = {item.total.toLocaleString()} تومان
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 font-semibold text-lg">
                      <span>جمع کل:</span>
                      <span>{selectedOrder.total.toLocaleString()} تومان</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">یادداشت</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">منبع: {getSourceText(selectedOrder.source)}</span>
                    <span className="text-sm text-gray-600">تاریخ: {selectedOrder.date}</span>
                  </div>
                  {selectedOrder.status === 'PENDING_APPROVAL' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedOrder(null);
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        تایید سفارش
                      </button>
                      <button 
                        onClick={() => {
                          handleRejectOrder(selectedOrder.id);
                          setSelectedOrder(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        رد سفارش
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تایید سفارش</h3>
                <button 
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalForm({ salesRepName: '', notes: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مسئول فروش (اختیاری)
                  </label>
                  <select
                    value={approvalForm.salesRepName}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, salesRepName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">انتخاب کنید (مستقیم از سایت)</option>
                    {salesReps.map((rep) => (
                      <option key={rep.id} value={rep.name}>
                        {rep.name} - {rep.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    اگر این سفارش توسط مسئول فروش انجام شده، نام او را انتخاب کنید
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    یادداشت (اختیاری)
                  </label>
                  <textarea
                    value={approvalForm.notes}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="یادداشت اضافی..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => handleApprove(selectedOrder.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      تایید سفارش
                    </button>
                    <button 
                      onClick={() => {
                        setShowApprovalModal(false);
                        setApprovalForm({ salesRepName: '', notes: '' });
                      }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      انصراف
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 