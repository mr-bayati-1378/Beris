'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  User,
  LogOut,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPriceWithFont, formatJalaliDate, toPersianNumerals } from '@/lib/utils';
import CreatePackModal from '@/components/CreatePackModal';
import OrderPackModal from '@/components/OrderPackModal';
import UserProductRequests from '@/components/UserProductRequests';
import toast from 'react-hot-toast';

interface UserPack {
  id: number;
  name: string;
  description?: string;
  totalPrice?: number;
  itemCount: number;
  createdAt: string;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  rating?: number;
  reviewCount?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  purchaseCount?: number;
  lastPurchased?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  slug: string;
}

interface Address {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface PurchaseAnalytics {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  discountPercent: number;
  mostFrequentCategory: string;
  lastOrderDate: string;
}

interface UserBalance {
  balance: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [userPacks, setUserPacks] = useState<UserPack[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [frequentProducts, setFrequentProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [analytics, setAnalytics] = useState<PurchaseAnalytics>({
    totalSpent: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    discountPercent: 0,
    mostFrequentCategory: '',
    lastOrderDate: ''
  });
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePackModal, setShowCreatePackModal] = useState(false);
  const [showOrderPackModal, setShowOrderPackModal] = useState(false);
  const [selectedPackForOrder, setSelectedPackForOrder] = useState<UserPack | null>(null);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams?.toString());
    if (tabId === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // دریافت تراز کاربر
      const balanceResponse = await fetch('/api/user/balance');
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setUserBalance(balanceData);
      }
      
      // دریافت پک‌های کاربر
      const packsResponse = await fetch('/api/user/packs');
      if (packsResponse.ok) {
        const packsData = await packsResponse.json();
        setUserPacks(packsData.packs || []);
      }
      
      // دریافت سفارشات اخیر
      const ordersResponse = await fetch('/api/user/orders?limit=5');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }

      // دریافت آدرس‌های کاربر
      const addressesResponse = await fetch('/api/user/addresses');
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData.addresses || []);
      } else {
        console.error('Error fetching addresses:', addressesResponse.status);
        setAddresses([]);
      }
      
      // دریافت محصولات پرتکرار (فعلا خالی)
      setFrequentProducts([]);

      // دریافت تحلیل خرید از سفارشات
      const allOrdersResponse = await fetch('/api/user/orders?limit=100');
      if (allOrdersResponse.ok) {
        const allOrdersData = await allOrdersResponse.json();
        const orders = allOrdersData.orders || [];
        
        if (orders.length > 0) {
          const totalSpent = orders.reduce((sum: number, order: any) => sum + Number(order.total), 0);
          const totalOrders = orders.length;
          const averageOrderValue = totalSpent / totalOrders;
          const lastOrderDate = orders[0]?.createdAt || '';
          
          setAnalytics({
            totalSpent,
            totalOrders,
            averageOrderValue,
            discountPercent: 0, // فعلاً محاسبه نمی‌شود
            mostFrequentCategory: '', // فعلاً محاسبه نمی‌شود
            lastOrderDate
          });
        } else {
          setAnalytics({
            totalSpent: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            discountPercent: 0,
            mostFrequentCategory: '',
            lastOrderDate: ''
          });
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'delivered':
        return 'تحویل شده';
      case 'processing':
        return 'در حال پردازش';
      case 'pending':
        return 'در انتظار';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      title: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      title: address.title,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('آیا از حذف این آدرس اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        alert('خطا در حذف آدرس');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('خطا در حذف آدرس');
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.title || !addressForm.address || !addressForm.city || !addressForm.zipCode) {
      alert('لطفا تمام فیلدهای اجباری را پر کنید');
      return;
    }

    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: addressForm.title,
          address: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.zipCode,
          isDefault: addressForm.isDefault,
        }),
      });

      if (response.ok) {
        setShowAddressModal(false);
        fetchDashboardData();
        alert(editingAddress ? 'آدرس با موفقیت ویرایش شد' : 'آدرس با موفقیت اضافه شد');
      } else {
        alert('خطا در ذخیره آدرس');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('خطا در ذخیره آدرس');
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchDashboardData();
        alert('آدرس پیش‌فرض با موفقیت تنظیم شد');
      } else {
        alert('خطا در تنظیم آدرس پیش‌فرض');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('خطا در تنظیم آدرس پیش‌فرض');
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) return;

    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setShowProfileImageModal(false);
        setProfileImage(null);
        setProfileImagePreview('');
        
        // Update session with new profile image
        await fetch('/api/auth/session');
        
        // Reload page to show updated image
        window.location.reload();
      } else {
        alert('خطا در آپلود تصویر');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('خطا در آپلود تصویر');
    }
  };

  const handleOrderPack = (pack: UserPack) => {
    setSelectedPackForOrder(pack);
    setShowOrderPackModal(true);
  };

  const handleDeletePack = async (packId: number) => {
    if (!confirm('آیا از حذف این پک اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/packs/${packId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh packs data
        fetchDashboardData();
        toast.success('پک با موفقیت حذف شد');
      } else {
        const error = await response.json();
        toast.error(error.error || 'خطا در حذف پک');
      }
    } catch (error) {
      console.error('Error deleting pack:', error);
      toast.error('خطا در برقراری ارتباط');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('لطفا تمام فیلدها را پر کنید');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('رمز عبور جدید باید حداقل 6 کاراکتر باشد');
      return;
    }

    try {
      setChangingPassword(true);
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      });

      if (response.ok) {
        alert('رمز عبور با موفقیت تغییر یافت');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        alert(`خطا: ${error.error}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('خطا در تغییر رمز عبور');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  // Get default address for header
  const defaultAddress = addresses.find(addr => addr.isDefault);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                پنل کاربری
              </h1>
              <p className="text-gray-600 mt-2 text-lg">خوش آمدید، {user.name}</p>
              {defaultAddress && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 ml-1" />
                  <span>آدرس پیش‌فرض: {defaultAddress.title} - {defaultAddress.city}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
              >
                <ChevronLeft className="w-4 h-4 ml-1" />
                بازگشت به فروشگاه
              </Link>
              <button
                onClick={() => router.push('/auth/logout')}
                className="flex items-center text-red-600 hover:text-red-700 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
              >
                <LogOut className="w-4 h-4 ml-1" />
                خروج
              </button>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'Profile'}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0) || 'U'
                )}
              </div>
              <button
                onClick={() => setShowProfileImageModal(true)}
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 text-lg">{user.phone}</p>
              {user.email && <p className="text-gray-600">{user.email}</p>}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'نمای کلی', icon: Eye },
                { id: 'packs', label: 'پک‌های من', icon: Package },
                { id: 'orders', label: 'سفارشات', icon: ShoppingCart },
                { id: 'requests', label: 'درخواست‌ها', icon: Clock },
                { id: 'addresses', label: 'آدرس‌ها', icon: MapPin },
                { id: 'profile', label: 'پروفایل', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center py-6 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 ml-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* تراز کاربر */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <div className="w-8 h-8 flex items-center justify-center text-2xl">💰</div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium opacity-90">تراز فعلی</p>
                      <p className="text-2xl font-bold">
                        {userBalance ? formatPriceWithFont(userBalance.balance) : '0 تومان'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium opacity-90">کل خرید</p>
                      <p className="text-2xl font-bold">
                        {formatPriceWithFont(analytics.totalSpent)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium opacity-90">تعداد سفارشات</p>
                      <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium opacity-90">میانگین سفارش</p>
                      <p className="text-2xl font-bold">
                        {formatPriceWithFont(Math.round(analytics.averageOrderValue))} تومان
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium opacity-90">آخرین سفارش</p>
                      <p className="text-lg font-bold">
                        {analytics.lastOrderDate ? formatJalaliDate(analytics.lastOrderDate) : 'ندارد'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">سفارشات اخیر</h3>
                </div>
                <div className="p-8">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                            <p className="text-gray-600">{formatJalaliDate(order.createdAt)}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900 text-lg">{formatPriceWithFont(order.totalAmount)}</p>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">هنوز سفارشی ثبت نکرده‌اید</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Frequent Products */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">محصولات پرتکرار</h3>
                </div>
                <div className="p-8">
                  {frequentProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {frequentProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{product.name}</p>
                            <p className="text-gray-600">{product.purchaseCount} بار خرید</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">هنوز محصولی خریداری نکرده‌اید</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <UserProductRequests />
          )}

          {/* Packs Tab */}
          {activeTab === 'packs' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">پک‌های من</h3>
                <button
                  onClick={() => setShowCreatePackModal(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  ایجاد پک جدید
                </button>
              </div>
              <div className="p-8">
                {userPacks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPacks.map((pack) => (
                      <div key={pack.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{pack.name}</h4>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            pack.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pack.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                        {pack.description && (
                          <p className="text-gray-600 mb-4">{pack.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{pack.itemCount} محصول</span>
                          <span>{typeof pack.createdAt === 'string' ? pack.createdAt : new Date(pack.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => handleOrderPack(pack)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center"
                          >
                            <ShoppingCart className="w-5 h-5 ml-2" />
                            سفارش پک
                          </button>
                          <button
                            onClick={() => handleDeletePack(pack.id)}
                            className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف پک
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز پکی ایجاد نکرده‌اید</h3>
                    <p className="text-gray-500 mb-6">پک‌های خود را ایجاد کنید تا راحت‌تر خرید کنید</p>
                    <button
                      onClick={() => setShowCreatePackModal(true)}
                      className="flex items-center mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-5 h-5 ml-2" />
                      ایجاد پک جدید
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">سفارشات من</h3>
                <button
                  onClick={() => handleTabChange('packs')}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 ml-2" />
                  سفارش پک جدید
                </button>
              </div>
              <div className="p-8">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{order.orderNumber}</h4>
                            <p className="text-gray-600">{formatJalaliDate(order.createdAt)}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900 text-lg">{formatPriceWithFont(order.totalAmount)}</p>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{order.itemCount} محصول</span>
                          <Link
                            href={`/order/${order.slug}`}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            مشاهده جزئیات
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز سفارشی ثبت نکرده‌اید</h3>
                    <p className="text-gray-500">سفارشات شما اینجا نمایش داده می‌شود</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">آدرس‌های من</h3>
                <button
                  onClick={handleAddAddress}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  افزودن آدرس
                </button>
              </div>
              <div className="p-8">
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">{address.title}</h4>
                              {address.isDefault && (
                                <span className="mr-2 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  پیش‌فرض
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{address.address}</p>
                            <p className="text-sm text-gray-500">
                              {address.city}، {address.state} - {address.zipCode}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                                title="تنظیم به عنوان پیش‌فرض"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                              title="ویرایش"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز آدرسی ثبت نکرده‌اید</h3>
                    <p className="text-gray-500 mb-6">آدرس‌های خود را اضافه کنید تا راحت‌تر خرید کنید</p>
                    <button
                      onClick={handleAddAddress}
                      className="flex items-center mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-5 h-5 ml-2" />
                      افزودن آدرس
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">ویرایش پروفایل</h3>
              </div>
              <div className="p-8">
                <div className="max-w-4xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* اطلاعات پروفایل */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">اطلاعات شخصی</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام و نام خانوادگی
                          </label>
                          <input
                            type="text"
                            defaultValue={user.name || ''}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            شماره تلفن
                          </label>
                          <input
                            type="tel"
                            defaultValue={user.phone || ''}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                          />
                        </div>
                        {user.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ایمیل
                            </label>
                            <input
                              type="email"
                              defaultValue={user.email}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-6">
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium">
                          ذخیره تغییرات
                        </button>
                      </div>
                    </div>

                    {/* تغییر رمز عبور */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">تغییر رمز عبور</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رمز عبور فعلی
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="رمز عبور فعلی خود را وارد کنید"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رمز عبور جدید
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="رمز عبور جدید را وارد کنید"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تکرار رمز عبور جدید
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="رمز عبور جدید را دوباره وارد کنید"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                        <button 
                          onClick={handleChangePassword}
                          disabled={changingPassword}
                          className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium"
                        >
                          {changingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Pack Modal */}
      {showCreatePackModal && (
        <CreatePackModal
          onClose={() => setShowCreatePackModal(false)}
          onSuccess={() => {
            setShowCreatePackModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Order Pack Modal */}
      {showOrderPackModal && selectedPackForOrder && (
        <OrderPackModal
          pack={selectedPackForOrder}
          onClose={() => {
            setShowOrderPackModal(false);
            setSelectedPackForOrder(null);
          }}
          onSuccess={() => {
            setShowOrderPackModal(false);
            setSelectedPackForOrder(null);
            fetchDashboardData();
          }}
        />
      )}

      {/* Profile Image Modal */}
      {showProfileImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">تغییر تصویر پروفایل</h3>
              <button
                onClick={() => setShowProfileImageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {profileImagePreview ? (
                      <Image
                        src={profileImagePreview}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0) || 'U'
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  انتخاب تصویر
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProfileImageModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  onClick={handleUploadProfileImage}
                  disabled={!profileImage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  آپلود
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان آدرس *
                </label>
                <input
                  type="text"
                  value={addressForm.title}
                  onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                  placeholder="مثل: منزل، محل کار"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  آدرس کامل *
                </label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  placeholder="آدرس کامل را وارد کنید"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شهر *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="نام شهر"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    استان
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="نام استان"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد پستی *
                </label>
                <input
                  type="text"
                  value={addressForm.zipCode}
                  onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                  placeholder="کد پستی ۱۰ رقمی"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="mr-3 text-sm text-gray-700">
                  این آدرس را به عنوان پیش‌فرض تنظیم کن
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  {editingAddress ? 'ویرایش' : 'افزودن'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

