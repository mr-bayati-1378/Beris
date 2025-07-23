'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PersianDateInput from '@/components/ui/persian-date-input';
import { 
  FaPlus, 
  FaTrash, 
  FaSearch,
  FaUser,
  FaBox,
  FaBoxes,
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface ProductPack {
  id: number;
  name: string;
  totalPrice: number;
  discountPrice?: number;
  image?: string;
}

interface InvoiceItem {
  id: string;
  type: 'product' | 'pack';
  productId?: number;
  packId?: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  grossAmount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<ProductPack[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [settlementType, setSettlementType] = useState('cash');
  const [salesChannel, setSalesChannel] = useState('');

  // بارگذاری داده‌ها
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, productsRes, packsRes] = await Promise.all([
          fetch('/api/admin/customers'),
          fetch('/api/admin/products'),
          fetch('/api/admin/packs')
        ]);

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(customersData.customers || []);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }

        if (packsRes.ok) {
          const packsData = await packsRes.json();
          setPacks(packsData.packs || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // اضافه کردن مشتری جدید
  const handleAddNewCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      alert('نام، نام خانوادگی و شماره تلفن الزامی است');
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers([...customers, data.customer]);
        setSelectedCustomer(data.customer.id);
        setNewCustomer({
          firstName: '',
          lastName: '',
          phone: '',
          email: ''
        });
        setShowNewCustomerForm(false);
        alert('مشتری جدید با موفقیت اضافه شد');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('خطا در اضافه کردن مشتری');
    }
  };

  // اضافه کردن محصول یا پک به فاکتور
  const handleAddItem = (type: 'product' | 'pack', id: number) => {
    let item: InvoiceItem;
    
    if (type === 'product') {
      const product = products.find(p => p.id === id);
      if (!product) return;
      
      item = {
        id: `product-${id}-${Date.now()}`,
        type: 'product',
        productId: id,
        name: product.name,
        description: '',
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        grossAmount: product.price
      };
    } else {
      const pack = packs.find(p => p.id === id);
      if (!pack) return;
      
      item = {
        id: `pack-${id}-${Date.now()}`,
        type: 'pack',
        packId: id,
        name: pack.name,
        description: '',
        quantity: 1,
        unitPrice: pack.discountPrice || pack.totalPrice,
        totalPrice: pack.discountPrice || pack.totalPrice,
        grossAmount: pack.discountPrice || pack.totalPrice
      };
    }

    setInvoiceItems([...invoiceItems, item]);
  };

  // تغییر تعداد آیتم
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === itemId) {
        const totalPrice = item.unitPrice * quantity;
        return {
          ...item,
          quantity,
          totalPrice,
          grossAmount: totalPrice // مبلغ ناخالص برابر مبلغ کل قبل از تخفیف
        };
      }
      return item;
    }));
  };

  // حذف آیتم
  const handleRemoveItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  // تغییر توضیحات آیتم
  const handleDescriptionChange = (itemId: string, description: string) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          description
        };
      }
      return item;
    }));
  };

  // محاسبه مجموع
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const grossTotal = invoiceItems.reduce((sum, item) => sum + item.grossAmount, 0);
  const total = subtotal - discountAmount + taxAmount;

  // ثبت فاکتور
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invoiceItems.length === 0) {
      alert('لطفاً حداقل یک آیتم به فاکتور اضافه کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          items: invoiceItems.map(item => ({
            productId: item.productId,
            packId: item.packId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            grossAmount: item.grossAmount
          })),
          deliveryDate,
          notes,
          taxAmount,
          discountAmount,
          grossSalesAmount: grossTotal,
          settlementType,
          salesChannel
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('فاکتور با موفقیت ثبت شد');
        router.push('/admin/invoices');
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('خطا در ثبت فاکتور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
            <FaPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ثبت فاکتور جدید</h1>
            <p className="text-gray-600">ایجاد فاکتور فروش با کد خودکار</p>
          </div>
        </div>
        <Link
          href="/admin/invoices"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaTimes className="h-4 w-4" />
          انصراف
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="h-5 w-5 text-blue-600" />
            انتخاب مشتری
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={selectedCustomer || ''}
                  onChange={(e) => setSelectedCustomer(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب مشتری موجود</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                {showNewCustomerForm ? 'انصراف' : 'مشتری جدید'}
              </button>
            </div>

            {showNewCustomerForm && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="font-medium text-gray-900">اضافه کردن مشتری جدید</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="نام"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="نام خانوادگی"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="شماره تلفن"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="ایمیل (اختیاری)"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCustomer}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  افزودن مشتری
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sales Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات فروش</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع تسویه
              </label>
              <select
                value={settlementType}
                onChange={(e) => setSettlementType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">نقدی</option>
                <option value="one_month">یک ماهه</option>
                <option value="two_month">دو ماهه</option>
                <option value="three_month">سه ماهه</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کانال فروش
              </label>
              <select
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">انتخاب کانال فروش</option>
                <option value="direct">مستقیم</option>
                <option value="divar">دیوار</option>
                <option value="basalam">باسلام</option>
                <option value="sheypoor">شیپور</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBox className="h-5 w-5 text-purple-600" />
            افزودن آیتم‌ها
          </h2>

          <div className="space-y-6">
            {/* Products */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">محصولات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleAddItem('product', product.id)}
                        className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                    </p>
                    <p className="text-xs text-gray-500">موجودی: {product.stock}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Packs */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FaBoxes className="h-4 w-4" />
                پک‌های محصول
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.slice(0, 6).map(pack => (
                  <div key={pack.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{pack.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleAddItem('pack', pack.id)}
                        className="p-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {pack.discountPrice && (
                        <p className="text-sm text-green-600 font-medium">
                          {new Intl.NumberFormat('fa-IR').format(pack.discountPrice)} تومان
                        </p>
                      )}
                      <p className={`text-sm ${pack.discountPrice ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                        {new Intl.NumberFormat('fa-IR').format(pack.totalPrice)} تومان
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        {invoiceItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">آیتم‌های فاکتور</h2>
            
            <div className="space-y-4">
              {invoiceItems.map(item => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'product' ? (
                          <FaBox className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FaBoxes className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">تعداد:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      />
                      <span className="text-sm text-gray-500">×</span>
                      <span className="w-24 text-sm text-gray-600">
                        {new Intl.NumberFormat('fa-IR').format(item.unitPrice)} ت
                      </span>
                      <span className="text-sm text-gray-500">=</span>
                      <span className="w-32 font-medium text-gray-900">
                        {new Intl.NumberFormat('fa-IR').format(item.totalPrice)} تومان
                      </span>
                      <span className="text-xs text-gray-500">
                        (ناخالص: {new Intl.NumberFormat('fa-IR').format(item.grossAmount)} ت)
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شرح کالا
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                      placeholder="توضیحات مربوط به این کالا..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Summary */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>مبلغ ناخالص کل:</span>
                  <span className="font-medium text-purple-600">{new Intl.NumberFormat('fa-IR').format(grossTotal)} تومان</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>جمع کل:</span>
                  <span>{new Intl.NumberFormat('fa-IR').format(subtotal)} تومان</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>تخفیف:</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-left"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>مالیات:</span>
                  <input
                    type="number"
                    min="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-left"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                  <span>مبلغ نهایی:</span>
                  <span className="text-green-600">{new Intl.NumberFormat('fa-IR').format(total)} تومان</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="h-5 w-5 text-orange-600" />
            اطلاعات تکمیلی
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ تحویل (اختیاری)
              </label>
              <PersianDateInput
                value={deliveryDate}
                onChange={(value) => setDeliveryDate(value)}
                placeholder="تاریخ تحویل"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                یادداشت‌ها
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="توضیحات اضافی..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/invoices"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            disabled={loading || invoiceItems.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <FaSave className="h-4 w-4" />
                ثبت فاکتور
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 