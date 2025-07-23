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
  FaBoxOpen,
  FaDollarSign,
  FaChartLine
} from 'react-icons/fa';

interface Inbound {
  id: number;
  invoiceNumber: string;
  productTitle: string;
  supplier?: {
    id: number;
    name: string;
    phone?: string;
  };
  supplierName?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  date: string;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  createdByUser: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
}

interface InboundStats {
  totalAmount: number;
  totalQuantity: number;
  totalRecords: number;
}

export default function InboundPage() {
  const [inbounds, setInbounds] = useState<Inbound[]>([]);
  const [stats, setStats] = useState<InboundStats>({
    totalAmount: 0,
    totalQuantity: 0,
    totalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedInbound, setSelectedInbound] = useState<Inbound | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    productTitle: '',
    supplierName: '',
    supplierPhone: '',
    supplierAddress: '',
    date: PersianDate.today(),
    quantity: '',
    totalPrice: ''
  });

  useEffect(() => {
    fetchInbounds();
  }, [currentPage, searchTerm, selectedSupplier, dateFrom, dateTo, fetchInbounds]);

  const fetchInbounds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        ...(selectedSupplier && { supplierId: selectedSupplier }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await fetch(`/api/admin/inbound?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInbounds(data.data);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching inbounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // تبدیل تاریخ شمسی به میلادی برای ارسال به API
      const submitData = {
        ...formData,
        date: PersianDate.toInputFormat(formData.date)
      };

      const response = await fetch('/api/admin/inbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          productTitle: '',
          supplierName: '',
          supplierPhone: '',
          supplierAddress: '',
          date: PersianDate.today(),
          quantity: '',
          totalPrice: ''
        });
        fetchInbounds();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error saving inbound:', error);
      alert('خطا در ذخیره اطلاعات');
    }
  };

  const calculateUnitPrice = (totalPrice: string, quantity: string) => {
    const total = parseFloat(totalPrice);
    const qty = parseInt(quantity);
    if (total && qty) {
      return (total / qty).toFixed(2);
    }
    return '0';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return PersianDate.toPersian(dateString);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مدیریت ورودی کالا</h1>
          <p className="text-gray-600 mt-2">مدیریت و پیگیری ورودی کالاها از تامین‌کنندگان</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          ثبت ورودی جدید
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل مبلغ ورودی</CardTitle>
            <FaDollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold price-text">
              {<PriceDisplay price={stats.totalAmount} />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل تعداد کالا</CardTitle>
            <FaBoxOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalQuantity.toLocaleString('fa-IR')} عدد
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                setDateFrom('');
                setDateTo('');
                setSelectedSupplier('');
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaFilter />
              پاک کردن فیلترها
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inbounds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            لیست ورودی کالاها
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
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">شماره فاکتور</th>
                      <th className="text-right py-3 px-4">عنوان محصول</th>
                      <th className="text-right py-3 px-4">تامین کننده</th>
                      <th className="text-right py-3 px-4">تاریخ</th>
                      <th className="text-right py-3 px-4">تعداد</th>
                      <th className="text-right py-3 px-4">قیمت کل</th>
                      <th className="text-right py-3 px-4">قیمت واحد</th>
                      <th className="text-right py-3 px-4">ثبت‌کننده</th>
                      <th className="text-right py-3 px-4">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inbounds.map((inbound) => (
                      <tr key={inbound.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-blue-600">{inbound.invoiceNumber}</td>
                        <td className="py-3 px-4">{inbound.productTitle}</td>
                        <td className="py-3 px-4">
                          {inbound.supplier?.name || inbound.supplierName}
                          {(inbound.supplier?.phone || inbound.supplierPhone) && (
                            <div className="text-sm text-gray-500">
                              {inbound.supplier?.phone || inbound.supplierPhone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">{formatDate(inbound.date)}</td>
                        <td className="py-3 px-4 text-center font-medium">
                          {inbound.quantity.toLocaleString('fa-IR')}
                        </td>
                        <td className="py-3 px-4 price-text">{<PriceDisplay price={inbound.totalPrice} />}</td>
                        <td className="py-3 px-4 price-text">{<PriceDisplay price={inbound.unitPrice} />}</td>
                        <td className="py-3 px-4">
                          {inbound.createdByUser.firstName && inbound.createdByUser.lastName
                            ? `${inbound.createdByUser.firstName} ${inbound.createdByUser.lastName}`
                            : inbound.createdByUser.username}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInbound(inbound);
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

              {/* Pagination */}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {selectedInbound ? 'ویرایش ورودی' : 'ثبت ورودی جدید'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">عنوان محصول *</label>
                  <input
                    type="text"
                    required
                    value={formData.productTitle}
                    onChange={(e) => setFormData({ ...formData, productTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">نام تامین کننده</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">شماره تامین کننده</label>
                  <input
                    type="text"
                    value={formData.supplierPhone}
                    onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاریخ *</label>
                  <PersianDateInput
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.date && (
                    <div className="text-xs text-gray-500 mt-1">
                      📅 {PersianDate.toPersianFull(PersianDate.toInputFormat(formData.date))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تعداد *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">قیمت کل *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">آدرس تامین کننده</label>
                <textarea
                  value={formData.supplierAddress}
                  onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {formData.totalPrice && formData.quantity && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">قیمت واحد محاسبه شده: </span>
                  <span className="font-medium price-text">
                    <PriceDisplay price={parseFloat(calculateUnitPrice(formData.totalPrice, formData.quantity))} />
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedInbound(null);
                  }}
                >
                  انصراف
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {selectedInbound ? 'به‌روزرسانی' : 'ثبت ورودی'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 