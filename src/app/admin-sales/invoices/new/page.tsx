'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSave,
  FaPlus, 
  FaTrash, 
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaMoneyBill,
  FaSpinner,
  FaCalendarAlt,
  FaCalculator,
  FaPercent,
  FaShoppingCart,
  FaUserTie,
  FaGlobe,
  FaCubes,
  FaSearch,
  FaUserPlus,
  FaUsers
} from 'react-icons/fa';
import JalaliDatePicker from '@/components/JalaliDatePicker';
import ProductPackSearch from '@/components/ProductPackSearch';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Pack {
  id: string;
  name: string;
  totalPrice: number;
  description?: string;
  customerName?: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface CartItem {
  productId?: string;
  packId?: string;
  productName?: string;
  packName?: string;
  quantity: number;
  price: number;
  total: number;
  marginPercent: number;
  grossSale: number;
  type: 'product' | 'pack';
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPack, setSelectedPack] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [marginPercent, setMarginPercent] = useState(20); // درصد مارژین پیش‌فرض
  const [itemType, setItemType] = useState<'product' | 'pack'>('product');
  
  // اطلاعات مشتری
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');

  // اطلاعات فاکتور
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [settlementPeriod, setSettlementPeriod] = useState('نقدی');
  const [salesExpert, setSalesExpert] = useState('');
  const [salesChannel, setSalesChannel] = useState('فروش مستقیم');

  // جستجو
  const [productSearch, setProductSearch] = useState('');
  const [packSearch, setPackSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // تولید شماره فاکتور خودکار
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  }, []);

  // تنظیم تاریخ سفارش به امروز (شمسی)
  useEffect(() => {
    const today = new Date();
    const jalaliDate = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setOrderDate(`${jalaliDate.year}/${String(jalaliDate.month).padStart(2, '0')}/${String(jalaliDate.day).padStart(2, '0')}`);
    
    // تاریخ تحویل پیش‌فرض (3 روز بعد)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const jalaliDeliveryDate = gregorianToJalali(deliveryDate.getFullYear(), deliveryDate.getMonth() + 1, deliveryDate.getDate());
    setDeliveryDate(`${jalaliDeliveryDate.year}/${String(jalaliDeliveryDate.month).padStart(2, '0')}/${String(jalaliDeliveryDate.day).padStart(2, '0')}`);
  }, []);

  // دریافت محصولات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=all');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // دریافت پک‌ها
  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await fetch('/api/admin/packs');
        if (response.ok) {
          const data = await response.json();
          setPacks(data || []);
        }
      } catch (error) {
        console.error('Error fetching packs:', error);
      }
    };

    fetchPacks();
  }, []);

  // دریافت مشتریان
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/admin/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers || []);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // محاسبه کل خرید
  const totalPurchase = cartItems.reduce((sum, item) => sum + item.total, 0);

  // محاسبه فروش ناخالص (با مارژین)
  const totalGrossSale = cartItems.reduce((sum, item) => sum + item.grossSale, 0);

  // تبدیل تاریخ میلادی به شمسی
  function gregorianToJalali(gy: number, gm: number, gd: number) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + parseInt(String((gy2 + 3) / 4)) - parseInt(String((gy2 + 99) / 100)) + 
               parseInt(String((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 400 * parseInt(String(days / 146097));
    days %= 146097;
    if (days > 36524) {
      jy += 100 * parseInt(String(--days / 36524));
      days %= 36524;
      if (days >= 365) days++;
    }
    jy += 4 * parseInt(String(days / 1461));
    days %= 1461;
    if (days > 365) {
      jy += parseInt(String((days - 1) / 365));
      days = (days - 1) % 365;
    }
    let jm = (days < 186) ? 1 + parseInt(String(days / 31)) : 7 + parseInt(String((days - 186) / 30));
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return { year: jy, month: jm, day: jd };
  }

  // تبدیل تاریخ شمسی به میلادی
  function jalaliToGregorian(jy: number, jm: number, jd: number) {
    let gy = (jy <= 979) ? 621 : 1600;
    jy -= (jy <= 979) ? 0 : 979;
    let gy2 = (jm > 2) ? (jy + 1) : jy;
    let days = (365 * jy) + ((parseInt(String(jy / 33))) * 8) + parseInt(String(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy += 400 * parseInt(String(days / 146097));
    days %= 146097;
    if (days > 36524) {
      gy += 100 * parseInt(String(--days / 36524));
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * parseInt(String(days / 1461));
    days %= 1461;
    if (days > 365) {
      gy += parseInt(String((days - 1) / 365));
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    let gm = (days < 186) ? 1 + parseInt(String(days / 31)) : 7 + parseInt(String((days - 186) / 30));
    return { year: gy, month: gm, day: gd };
  }

  // انتخاب مشتری
  const handleCustomerSelect = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(`${customer.firstName} ${customer.lastName}`);
    setCustomerPhone(customer.phone);
    // استفاده از آدرس مشتری یا آدرس پیش‌فرض
    setAddress(customer.address || 'تهران، خیابان ولیعصر');
    setCity(customer.city || 'تهران');
    setState(customer.state || 'تهران');
    setZipCode(customer.zipCode || '1234567890');
    setCustomerSearch('');
    
    // نمایش پیام موفقیت
    alert(`اطلاعات مشتری "${customer.firstName} ${customer.lastName}" با موفقیت بارگذاری شد`);
  };

  // ایجاد مشتری جدید
  const handleCreateCustomer = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('نام و شماره تلفن مشتری الزامی است');
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: customerName.split(' ')[0] || customerName,
          lastName: customerName.split(' ').slice(1).join(' ') || '',
          phone: customerPhone,
          email: null,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null
        })
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomerId(newCustomer.customer.id);
        alert('مشتری با موفقیت ایجاد شد');
        setShowNewCustomerForm(false);
      } else {
        const errorData = await response.json();
        alert(`خطا در ایجاد مشتری: ${errorData.error || 'خطای نامشخص'}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('خطا در ایجاد مشتری');
    }
  };

  // فیلتر محصولات بر اساس جستجو
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.id.toString().includes(productSearch)
  );

  // فیلتر پک‌ها بر اساس جستجو
  const filteredPacks = packs.filter(pack =>
    pack.name.toLowerCase().includes(packSearch.toLowerCase()) ||
    (pack.customerName && pack.customerName.toLowerCase().includes(packSearch.toLowerCase()))
  );

  // فیلتر مشتریان بر اساس جستجو
  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  // اضافه کردن محصول یا پک به سبد
  const addToCart = () => {
    if (itemType === 'product') {
      if (!selectedProduct || quantity <= 0) return;

      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      const existingItem = cartItems.find(item => 
        item.type === 'product' && item.productId === selectedProduct
      );
      
      const purchaseTotal = quantity * product.price;
      const grossSale = purchaseTotal * (1 + marginPercent / 100);
      
      if (existingItem) {
        setCartItems(cartItems.map(item => 
          item.type === 'product' && item.productId === selectedProduct
            ? { 
                ...item, 
                quantity: item.quantity + quantity, 
                total: (item.quantity + quantity) * product.price,
                grossSale: (item.quantity + quantity) * product.price * (1 + marginPercent / 100),
                marginPercent
              }
            : item
        ));
      } else {
        setCartItems([...cartItems, {
          productId: selectedProduct,
          productName: product.name,
          quantity,
          price: product.price,
          total: purchaseTotal,
          marginPercent,
          grossSale,
          type: 'product'
        }]);
      }

      setSelectedProduct('');
    } else {
      if (!selectedPack || quantity <= 0) return;

      const pack = packs.find(p => p.id === selectedPack);
      if (!pack) return;

      const existingItem = cartItems.find(item => 
        item.type === 'pack' && item.packId === selectedPack
      );
      
      const purchaseTotal = quantity * pack.totalPrice;
      const grossSale = purchaseTotal * (1 + marginPercent / 100);
      
      if (existingItem) {
        setCartItems(cartItems.map(item => 
          item.type === 'pack' && item.packId === selectedPack
            ? { 
                ...item, 
                quantity: item.quantity + quantity, 
                total: (item.quantity + quantity) * pack.totalPrice,
                grossSale: (item.quantity + quantity) * pack.totalPrice * (1 + marginPercent / 100),
                marginPercent
              }
            : item
        ));
      } else {
        setCartItems([...cartItems, {
          packId: selectedPack,
          packName: pack.name,
          quantity,
          price: pack.totalPrice,
          total: purchaseTotal,
          marginPercent,
          grossSale,
          type: 'pack'
        }]);
      }

      setSelectedPack('');
    }

    setQuantity(1);
  };

  // حذف از سبد
  const removeFromCart = (itemId: string, type: 'product' | 'pack') => {
    setCartItems(cartItems.filter(item => 
      !(item.type === type && (type === 'product' ? item.productId === itemId : item.packId === itemId))
    ));
  };

  // به‌روزرسانی مارژین برای همه آیتم‌ها
  const updateMarginForAll = () => {
    setCartItems(cartItems.map(item => ({
      ...item,
      marginPercent,
      grossSale: item.total * (1 + marginPercent / 100)
    })));
  };

  // ثبت فاکتور
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || cartItems.length === 0) {
      alert('لطفاً اطلاعات مشتری و محصولات را تکمیل کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin-sales/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId || `CUST-${Date.now()}`,
          customerName,
          customerPhone,
          total: totalGrossSale, // استفاده از فروش ناخالص
          items: cartItems.map(item => ({
            productId: item.productId,
            packId: item.packId,
            quantity: item.quantity,
            price: item.price,
            marginPercent: item.marginPercent,
            grossSale: item.grossSale,
            type: item.type
          })),
          address,
          city,
          state,
          zipCode,
          notes,
          // اطلاعات جدید فاکتور
          invoiceNumber,
          orderDate,
          deliveryDate,
          settlementPeriod,
          salesExpert,
          salesChannel,
          totalPurchase: Math.round(totalPurchase),
          totalGrossSale: Math.round(totalGrossSale)
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('فاکتور با موفقیت ثبت شد');
        router.push('/admin-sales/invoices');
      } else {
        const error = await response.json();
        alert(`خطا: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('خطا در ثبت فاکتور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ثبت فاکتور جدید</h1>
          <p className="text-gray-600">ثبت فاکتور جدید برای مشتری</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اطلاعات فاکتور */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalculator className="h-5 w-5 text-blue-600" />
              اطلاعات فاکتور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد فاکتور *
                </label>
                <div className="relative">
                  <FaShoppingCart className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">تولید خودکار</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ سفارش *
                </label>
                <JalaliDatePicker
                  value={orderDate}
                  onChange={setOrderDate}
                  placeholder="انتخاب تاریخ سفارش"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ تحویل
                </label>
                <JalaliDatePicker
                  value={deliveryDate}
                  onChange={setDeliveryDate}
                  placeholder="انتخاب تاریخ تحویل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دوره تسویه
                </label>
                <select
                  value={settlementPeriod}
                  onChange={(e) => setSettlementPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="نقدی">نقدی</option>
                  <option value="یک ماهه">یک ماهه</option>
                  <option value="دو ماهه">دو ماهه</option>
                  <option value="سه ماهه">سه ماهه</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کارشناس فروش
                </label>
                <div className="relative">
                  <FaUserTie className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={salesExpert}
                    onChange={(e) => setSalesExpert(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="نام کارشناس فروش"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کانال فروش
                </label>
                <select
                  value={salesChannel}
                  onChange={(e) => setSalesChannel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="فروش مستقیم">فروش مستقیم</option>
                  <option value="نمایندگی">نمایندگی</option>
                  <option value="آنلاین">آنلاین</option>
                  <option value="تلفنی">تلفنی</option>
                </select>
              </div>
            </div>
          </div>

          {/* انتخاب مشتری */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUsers className="h-5 w-5 text-green-600" />
              انتخاب مشتری
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* جستجو و انتخاب مشتری موجود */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جستجو در مشتریان موجود
                </label>
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="جستجو بر اساس نام یا شماره تلفن..."
                  />
                </div>
                
                {customerSearch && filteredCustomers.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                        <div className="text-sm text-gray-600">{customer.phone}</div>
                        {customer.address && (
                          <div className="text-xs text-gray-500">{customer.address}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ایجاد مشتری جدید */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ایجاد مشتری جدید
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <FaUserPlus className="h-4 w-4" />
                    {showNewCustomerForm ? 'انصراف' : 'ایجاد مشتری جدید'}
                  </button>
                </div>
                
                {showNewCustomerForm && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نام مشتری *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="نام و نام خانوادگی"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        شماره تلفن *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="09123456789"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateCustomer}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ایجاد مشتری
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* اطلاعات مشتری انتخاب شده */}
            {customerName && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <FaUser className="h-4 w-4" />
                  <span className="font-medium">اطلاعات مشتری (قابل ویرایش):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام مشتری
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره تلفن
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      آدرس
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شهر
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      استان
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کد پستی
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* انتخاب محصولات و پک‌ها */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaBox className="h-5 w-5 text-orange-600" />
              انتخاب محصولات و پک‌ها
            </h2>
            
            {/* تنظیمات مارژین */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-gray-700">
                  درصد مارژین:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marginPercent}
                    onChange={(e) => {
                      const newMargin = parseInt(e.target.value) || 0;
                      setMarginPercent(newMargin);
                      updateMarginForAll();
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaPercent className="h-4 w-4 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={updateMarginForAll}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  اعمال به همه
                </button>
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جستجو محصول یا پک
                </label>
                <ProductPackSearch
                  products={products}
                  packs={packs}
                  onProductSelect={(product) => {
                    setSelectedProduct(product.id);
                    setItemType('product');
                  }}
                  onPackSelect={(pack) => {
                    setSelectedPack(pack.id);
                    setItemType('pack');
                  }}
                  placeholder="جستجو محصول یا پک..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تعداد
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="h-4 w-4" />
                  اضافه کردن
                </button>
              </div>
            </div>

            {/* سبد خرید */}
            {cartItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">آیتم‌های انتخاب شده</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">نوع</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">شرح کالا</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">قیمت خرید</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تعداد</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">مبلغ خرید</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">درصد مارژین</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">فروش ناخالص</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {item.type === 'product' ? (
                                <FaBox className="h-4 w-4 text-blue-400" />
                              ) : (
                                <FaCubes className="h-4 w-4 text-purple-400" />
                              )}
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.type === 'product' ? 'محصول' : 'پک'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span>{item.productName || item.packName}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Intl.NumberFormat('fa-IR').format(item.price)} تومان
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{item.quantity}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Intl.NumberFormat('fa-IR').format(item.total)} تومان
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span>{item.marginPercent}%</span>
                              <FaPercent className="h-3 w-3 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-600">
                            {new Intl.NumberFormat('fa-IR').format(item.grossSale)} تومان
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId || item.packId || '', item.type)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        جمع خرید: {new Intl.NumberFormat('fa-IR').format(totalPurchase)} تومان
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        فروش ناخالص: {new Intl.NumberFormat('fa-IR').format(totalGrossSale)} تومان
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* یادداشت */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">یادداشت</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="یادداشت‌های اضافی..."
            />
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaSave className="h-4 w-4" />
              )}
              ثبت فاکتور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}