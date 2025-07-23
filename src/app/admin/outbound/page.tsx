'use client';

import { useState, useEffect } from 'react';
import { PersianDate, PersianDateInput } from '@/lib/persian-date';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import PriceDisplay from '@/components/ui/price-display';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaFileExport,
  FaShippingFast,
  FaDollarSign,
  FaChartLine,
  FaCheck,
  FaTruck,
  FaClock,
  FaTimes
} from 'react-icons/fa';

interface OutboundItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  pack?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Outbound {
  id: number;
  invoiceCode: string;
  status: 'OPEN' | 'IN_TRANSIT' | 'SHIPPED';
  orderDate: string;
  deliveryDate: string;
  customerName: string;
  customerPhone?: string;
  settlementPeriod: 'CASH' | 'ONE_MONTH' | 'TWO_MONTHS' | 'THREE_MONTHS';
  customerOrder: string;
  productDescription: string;
  totalQuantity: number;
  purchaseAmount: number;
  marginPercent: number;
  salesAmount: number;
  items: OutboundItem[];
  createdByUser: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  approvedByUser?: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  shippedByUser?: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
}

interface OutboundStats {
  totalSalesAmount: number;
  totalPurchaseAmount: number;
  totalProfit: number;
  averageMargin: number;
  totalQuantity: number;
  totalRecords: number;
}

export default function OutboundPage() {
  const [outbounds, setOutbounds] = useState<Outbound[]>([]);
  const [stats, setStats] = useState<OutboundStats>({
    totalSalesAmount: 0,
    totalPurchaseAmount: 0,
    totalProfit: 0,
    averageMargin: 0,
    totalQuantity: 0,
    totalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOutbound, setSelectedOutbound] = useState<Outbound | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    orderDate: PersianDate.today(),
    deliveryDate: PersianDate.today(),
    customerName: '',
    customerPhone: '',
    settlementPeriod: 'CASH',
    customerOrder: '',
    productDescription: '',
    marginPercent: '20',
    items: [{
      productName: '',
      quantity: '',
      unitPrice: ''
    }]
  });

  useEffect(() => {
    fetchOutbounds();
  }, [currentPage, searchTerm, selectedStatus, selectedSettlement, dateFrom, dateTo, fetchOutbounds]);

  const fetchOutbounds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedSettlement && { settlementPeriod: selectedSettlement }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await fetch(`/api/admin/outbound?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOutbounds(data.data || []);
        setStats(data.stats || {
          totalSalesAmount: 0,
          totalPurchaseAmount: 0,
          totalProfit: 0,
          averageMargin: 0,
          totalQuantity: 0,
          totalRecords: 0
        });
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching outbounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (outboundId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/outbound/${outboundId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOutbounds();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('خطا در به‌روزرسانی وضعیت');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // تبدیل تاریخ‌های شمسی به میلادی برای ارسال به API
      const submitData = {
        ...formData,
        orderDate: PersianDate.toInputFormat(formData.orderDate),
        deliveryDate: PersianDate.toInputFormat(formData.deliveryDate)
      };

      const response = await fetch('/api/admin/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setShowForm(false);
        resetForm();
        fetchOutbounds();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error saving outbound:', error);
      alert('خطا در ذخیره اطلاعات');
    }
  };

  const resetForm = () => {
    setFormData({
      orderDate: PersianDate.today(),
      deliveryDate: PersianDate.today(),
      customerName: '',
      customerPhone: '',
      settlementPeriod: 'CASH',
      customerOrder: '',
      productDescription: '',
      marginPercent: '20',
      items: [{
        productName: '',
        quantity: '',
        unitPrice: ''
      }]
    });
    setSelectedOutbound(null);
  };

  const addFormItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productName: '', quantity: '', unitPrice: '' }]
    });
  };

  const removeFormItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateFormItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SHIPPED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <FaClock className="w-3 h-3" />;
      case 'IN_TRANSIT':
        return <FaTruck className="w-3 h-3" />;
      case 'SHIPPED':
        return <FaCheck className="w-3 h-3" />;
      default:
        return <FaTimes className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'باز';
      case 'IN_TRANSIT':
        return 'درحال ارسال';
      case 'SHIPPED':
        return 'ارسال شده';
      default:
        return 'نامشخص';
    }
  };

  const getSettlementText = (period: string) => {
    switch (period) {
      case 'CASH':
        return 'نقدی';
      case 'ONE_MONTH':
        return 'یک ماهه';
      case 'TWO_MONTHS':
        return 'دو ماهه';
      case 'THREE_MONTHS':
        return 'سه ماهه';
      default:
        return 'نامشخص';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return PersianDate.toPersian(dateString);
  };

  const calculateTotals = () => {
    const totalQuantity = formData.items.reduce((sum, item) => {
      return sum + (parseInt(item.quantity) || 0);
    }, 0);

    const purchaseAmount = formData.items.reduce((sum, item) => {
      return sum + ((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 0));
    }, 0);

    const marginAmount = purchaseAmount * (parseInt(formData.marginPercent) / 100);
    const salesAmount = purchaseAmount + marginAmount;

    return { totalQuantity, purchaseAmount, salesAmount, marginAmount };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مدیریت خروجی کالا</h1>
          <p className="text-gray-600 mt-2">مدیریت و پیگیری فروش و ارسال کالاها</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          ثبت خروجی جدید
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ فروش</CardTitle>
            <FaDollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold price-text">
              {<PriceDisplay price={stats.totalSalesAmount} />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سود خالص</CardTitle>
            <FaChartLine className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold price-text">
              {<PriceDisplay price={stats.totalProfit} />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین مارژین</CardTitle>
            <FaShippingFast className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد فاکتورها</CardTitle>
            <FaChartLine className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRecords.toLocaleString('fa-IR')} فاکتور
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در فاکتورها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="OPEN">باز</option>
              <option value="IN_TRANSIT">درحال ارسال</option>
              <option value="SHIPPED">ارسال شده</option>
            </select>
            <select
              value={selectedSettlement}
              onChange={(e) => setSelectedSettlement(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه دوره‌ها</option>
              <option value="CASH">نقدی</option>
              <option value="ONE_MONTH">یک ماهه</option>
              <option value="TWO_MONTHS">دو ماهه</option>
              <option value="THREE_MONTHS">سه ماهه</option>
            </select>
            <PersianDateInput
              value={dateFrom}
              onChange={setDateFrom}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="از تاریخ"
            />
            <PersianDateInput
              value={dateTo}
              onChange={setDateTo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="تا تاریخ"
            />
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
                setSelectedSettlement('');
                setDateFrom('');
                setDateTo('');
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaFilter />
              پاک کردن
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Outbounds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            لیست خروجی کالاها
            <Button variant="outline" className="flex items-center gap-2">
              <FaFileExport />
              خروجی Excel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {outbounds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">هیچ خروجی یافت نشد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">کد فاکتور</th>
                        <th className="text-right py-3 px-4">وضعیت</th>
                        <th className="text-right py-3 px-4">مشتری</th>
                        <th className="text-right py-3 px-4">تاریخ سفارش</th>
                        <th className="text-right py-3 px-4">تاریخ تحویل</th>
                        <th className="text-right py-3 px-4">دوره تسویه</th>
                        <th className="text-right py-3 px-4">مبلغ فروش</th>
                        <th className="text-right py-3 px-4">مارژین</th>
                        <th className="text-right py-3 px-4">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outbounds.map((outbound) => (
                        <tr key={outbound.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-blue-600">{outbound.invoiceCode}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(outbound.status)}`}>
                              {getStatusIcon(outbound.status)}
                              {getStatusText(outbound.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {outbound.customerName}
                            {outbound.customerPhone && (
                              <div className="text-sm text-gray-500">{outbound.customerPhone}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">{formatDate(outbound.orderDate)}</td>
                          <td className="py-3 px-4">
                            <span className={new Date(outbound.deliveryDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                              {formatDate(outbound.deliveryDate)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getSettlementText(outbound.settlementPeriod)}</td>
                          <td className="py-3 px-4 price-text">{<PriceDisplay price={outbound.salesAmount} />}</td>
                          <td className="py-3 px-4 text-center font-medium">{outbound.marginPercent}%</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {outbound.status === 'OPEN' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(outbound.id, 'IN_TRANSIT')}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                  title="تایید مالی"
                                >
                                  <FaTruck />
                                </Button>
                              )}
                              {outbound.status === 'IN_TRANSIT' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(outbound.id, 'SHIPPED')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  title="ارسال شده"
                                >
                                  <FaCheck />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOutbound(outbound);
                                  setShowForm(true);
                                }}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-700">
                    صفحه {currentPage} از {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      قبلی
                    </Button>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      بعدی
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {selectedOutbound ? 'ویرایش خروجی' : 'ثبت خروجی جدید'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">تاریخ سفارش *</label>
                  <PersianDateInput
                    value={formData.orderDate}
                    onChange={(value) => setFormData({ ...formData, orderDate: value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.orderDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      📅 {PersianDate.toPersianFull(PersianDate.toInputFormat(formData.orderDate))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاریخ تحویل *</label>
                  <PersianDateInput
                    value={formData.deliveryDate}
                    onChange={(value) => setFormData({ ...formData, deliveryDate: value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.deliveryDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      📅 {PersianDate.toPersianFull(PersianDate.toInputFormat(formData.deliveryDate))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">نام مشتری *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">شماره مشتری</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">دوره تسویه</label>
                  <select
                    value={formData.settlementPeriod}
                    onChange={(e) => setFormData({ ...formData, settlementPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CASH">نقدی</option>
                    <option value="ONE_MONTH">یک ماهه</option>
                    <option value="TWO_MONTHS">دو ماهه</option>
                    <option value="THREE_MONTHS">سه ماهه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">درصد مارژین</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.marginPercent}
                    onChange={(e) => setFormData({ ...formData, marginPercent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">سفارش مشتری *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerOrder}
                    onChange={(e) => setFormData({ ...formData, customerOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">شرح کالا</label>
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">آیتم‌های فاکتور *</label>
                  <Button type="button" onClick={addFormItem} variant="outline" size="sm">
                    <FaPlus className="mr-2" />
                    افزودن آیتم
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        placeholder="نام محصول"
                        required
                        value={item.productName}
                        onChange={(e) => updateFormItem(index, 'productName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="تعداد"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateFormItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="قیمت واحد"
                        required
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateFormItem(index, 'unitPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 price-text">
                          {item.quantity && item.unitPrice ? 
                            <PriceDisplay price={parseFloat(item.unitPrice) * parseInt(item.quantity)} /> : 
                            '0 تومان'
                          }
                        </span>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeFormItem(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">کل تعداد: </span>
                    <span className="font-medium">{calculateTotals().totalQuantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">مبلغ خرید: </span>
                    <span className="font-medium price-text"><PriceDisplay price={calculateTotals().purchaseAmount} /></span>
                  </div>
                  <div>
                    <span className="text-gray-600">مارژین: </span>
                    <span className="font-medium price-text"><PriceDisplay price={calculateTotals().marginAmount} /></span>
                  </div>
                  <div>
                    <span className="text-gray-600">مبلغ فروش: </span>
                    <span className="font-bold price-text text-blue-600"><PriceDisplay price={calculateTotals().salesAmount} /></span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  انصراف
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {selectedOutbound ? 'به‌روزرسانی' : 'ثبت خروجی'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 