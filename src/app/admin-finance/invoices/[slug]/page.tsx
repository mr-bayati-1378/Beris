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
  FaPrint,
  FaDownload,
  FaSave,
  FaCreditCard,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFileAlt
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

interface PaymentDocument {
  type: 'check' | 'bank_transfer' | 'cash';
  amount: number;
  date: string;
  checkNumber?: string;
  checkDate?: string;
  accountNumber?: string;
  bankName?: string;
  notes?: string;
}

export default function InvoicePage({ params }: { params: { slug: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDocuments, setPaymentDocuments] = useState<PaymentDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<PaymentDocument>({
    type: 'check',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

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
        // اگر سفارش تایید مالی شده، مستندات پرداخت را بارگذاری کن
        if (data.order.financeApprovedBy) {
          // TODO: بارگذاری مستندات پرداخت از API
        }
      } else {
        console.error('خطا در دریافت سفارش');
      }
    } catch (error) {
      console.error('خطا در دریافت سفارش:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentDocument = () => {
    if (currentDocument.amount > 0 && currentDocument.date) {
      setPaymentDocuments([...paymentDocuments, { ...currentDocument }]);
      setCurrentDocument({
        type: 'check',
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      });
      setShowPaymentForm(false);
    }
  };

  const removePaymentDocument = (index: number) => {
    setPaymentDocuments(paymentDocuments.filter((_, i) => i !== index));
  };

  const saveInvoice = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order?.id,
          paymentDocuments,
          role: 'finance'
        }),
      });

      if (response.ok) {
        // بروزرسانی وضعیت سفارش به تایید مالی
        await updateOrderStatus('FINANCE_APPROVED');
      } else {
        console.error('خطا در ذخیره فاکتور');
      }
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order?.id,
          status: newStatus,
          role: 'finance',
          notes: `فاکتور ایجاد شد - مستندات پرداخت: ${paymentDocuments.length} مورد`
        }),
      });

      if (response.ok) {
        await fetchOrder();
      }
    } catch (error) {
      console.error('خطا در بروزرسانی وضعیت سفارش:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'check': return 'چک';
      case 'bank_transfer': return 'کارت به کارت';
      case 'cash': return 'نقدی';
      default: return type;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'check': return <FaFileAlt className="text-blue-500" />;
      case 'bank_transfer': return <FaCreditCard className="text-green-500" />;
      case 'cash': return <FaMoneyBillWave className="text-yellow-500" />;
      default: return <FaDollarSign className="text-gray-500" />;
    }
  };

  const totalPaid = paymentDocuments.reduce((sum, doc) => sum + doc.amount, 0);
  const remainingAmount = (order?.total || 0) - totalPaid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری فاکتور...</p>
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
                <FaFileInvoice className="text-green-500" />
                فاکتور سفارش #{order.slug}
              </h1>
              <p className="mt-2 text-gray-600">ایجاد فاکتور و ثبت مستندات پرداخت</p>
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
            {/* Invoice Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">اطلاعات فاکتور</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">تاریخ فاکتور</p>
                  <p className="font-medium">{new Date().toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">اطلاعات مشتری</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">نام:</span> {order.user.firstName} {order.user.lastName}</p>
                    <p><span className="text-gray-600">تلفن:</span> {order.user.phone}</p>
                    <p><span className="text-gray-600">آدرس:</span> {order.deliveryAddress}</p>
                    <p><span className="text-gray-600">شهر:</span> {order.deliveryCity}، {order.deliveryState}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">جزئیات سفارش</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">شماره سفارش:</span> #{order.slug}</p>
                    <p><span className="text-gray-600">تاریخ سفارش:</span> {new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
                    <p><span className="text-gray-600">منبع:</span> {order.orderSource === 'WEBSITE' ? 'سایت' : 'مسئول فروش'}</p>
                    {order.salesRep && (
                      <p><span className="text-gray-600">مسئول فروش:</span> {order.salesRep}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">آیتم‌های سفارش</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">ردیف</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">محصول</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">تعداد</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">قیمت واحد</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">جمع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {item.product?.name || item.userPack?.name}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold">مجموع فاکتور</td>
                      <td className="px-4 py-3 font-bold text-lg text-blue-600">{formatCurrency(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">مستندات پرداخت</h2>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  افزودن مستند
                </button>
              </div>

              {paymentDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaFileAlt className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p>هیچ مستند پرداختی ثبت نشده است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentDocuments.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPaymentTypeIcon(doc.type)}
                          <div>
                            <p className="font-medium">{getPaymentTypeText(doc.type)}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(doc.amount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{doc.date}</span>
                          <button
                            onClick={() => removePaymentDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                      {doc.checkNumber && (
                        <div className="mt-2 text-sm text-gray-600">
                          شماره چک: {doc.checkNumber} - تاریخ چک: {doc.checkDate}
                        </div>
                      )}
                      {doc.accountNumber && (
                        <div className="mt-2 text-sm text-gray-600">
                          شماره حساب: {doc.accountNumber} - بانک: {doc.bankName}
                        </div>
                      )}
                      {doc.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          یادداشت: {doc.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">مجموع فاکتور</p>
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">پرداخت شده</p>
                    <p className="font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">باقی‌مانده</p>
                    <p className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(remainingAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invoice Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">عملیات فاکتور</h3>
              <div className="space-y-3">
                <button
                  onClick={saveInvoice}
                  disabled={saving || remainingAmount > 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {saving ? 'در حال ذخیره...' : 'تایید و ذخیره فاکتور'}
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FaPrint />
                  چاپ فاکتور
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <FaDownload />
                  دانلود PDF
                </button>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">وضعیت پرداخت</h3>
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
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">وضعیت پرداخت</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      remainingAmount === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {remainingAmount === 0 ? 'تکمیل شده' : 'ناقص'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">افزودن مستند پرداخت</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع پرداخت</label>
                  <select
                    value={currentDocument.type}
                    onChange={(e) => setCurrentDocument({...currentDocument, type: e.target.value as any})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="check">چک</option>
                    <option value="bank_transfer">کارت به کارت</option>
                    <option value="cash">نقدی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ</label>
                  <input
                    type="number"
                    value={currentDocument.amount}
                    onChange={(e) => setCurrentDocument({...currentDocument, amount: Number(e.target.value)})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="مبلغ را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ</label>
                  <input
                    type="date"
                    value={currentDocument.date}
                    onChange={(e) => setCurrentDocument({...currentDocument, date: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {currentDocument.type === 'check' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">شماره چک</label>
                      <input
                        type="text"
                        value={currentDocument.checkNumber || ''}
                        onChange={(e) => setCurrentDocument({...currentDocument, checkNumber: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="شماره چک"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ چک</label>
                      <input
                        type="date"
                        value={currentDocument.checkDate || ''}
                        onChange={(e) => setCurrentDocument({...currentDocument, checkDate: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {currentDocument.type === 'bank_transfer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">شماره حساب</label>
                      <input
                        type="text"
                        value={currentDocument.accountNumber || ''}
                        onChange={(e) => setCurrentDocument({...currentDocument, accountNumber: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="شماره حساب"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام بانک</label>
                      <input
                        type="text"
                        value={currentDocument.bankName || ''}
                        onChange={(e) => setCurrentDocument({...currentDocument, bankName: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="نام بانک"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت (اختیاری)</label>
                  <textarea
                    value={currentDocument.notes || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, notes: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="یادداشت اضافی"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addPaymentDocument}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  افزودن
                </button>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 