'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaCheck, FaPrint, FaDownload, FaShare, FaArrowLeft, FaTruck, FaBoxOpen, FaClock, FaUndo } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PriceDisplay from '@/components/ui/price-display';
import OrderAddressDisplay from '@/components/OrderAddressDisplay';
import Image from 'next/image';

interface OrderItem {
  id: number;
  productId?: number;
  userPackId?: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    images: any[];
    slug: string;
    price: number;
  };
  userPack?: {
    id: number;
    name: string;
    totalPrice: number;
  };
}

interface OrderDetails {
  id: number;
  slug: string;
  status: string;
  total: number;
  items: OrderItem[];
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    recipient?: string;
  };
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    recipient?: string;
  } | null;
  useSameAddressForBilling: boolean;
  createdAt: string;
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderSlug = params.slug as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${orderSlug}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else if (res.status === 401) {
          router.push('/auth/login');
          return;
        } else {
          setError('سفارش یافت نشد');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('خطا در دریافت اطلاعات سفارش');
      } finally {
        setLoading(false);
      }
    };

    if (orderSlug) {
      fetchOrder();
    }
  }, [orderSlug, session, status, router]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <FaClock className="text-yellow-500" />;
      case 'PROCESSING': return <FaBoxOpen className="text-blue-500" />;
      case 'COMPLETED': return <FaCheck className="text-green-500" />;
      case 'CANCELLED': return <FaUndo className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در انتظار پردازش';
      case 'PROCESSING': return 'در حال پردازش';
      case 'COMPLETED': return 'تحویل داده شده';
      case 'CANCELLED': return 'لغو شده';
      default: return 'نامشخص';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    alert('دانلود فاکتور در نسخه‌های بعدی اضافه خواهد شد');
  };

  const handleShareInvoice = () => {
    if (navigator.share) {
      navigator.share({
        title: `سفارش ${order?.slug}`,
        text: `سفارش شما با کد ${order?.slug}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک سفارش کپی شد');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-red-50 p-6 border border-red-200">
            <h1 className="text-2xl font-bold text-red-800 mb-2">خطا</h1>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => router.push('/orders')} variant="outline">
              بازگشت به سفارش‌ها
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">سفارش یافت نشد</h1>
        <Button onClick={() => router.push('/orders')}>
          بازگشت به سفارش‌ها
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/orders')}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <FaArrowLeft />
            بازگشت به سفارش‌ها
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">سفارش #{order.slug}</h1>
              <p className="text-gray-600">جزئیات کامل سفارش شما</p>
              <p className="text-sm text-gray-500 mt-2">تاریخ ثبت: {formatDate(order.createdAt)}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={handlePrintInvoice} variant="outline" className="flex items-center gap-2">
                <FaPrint />
                چاپ
              </Button>
              <Button onClick={handleDownloadInvoice} variant="outline" className="flex items-center gap-2">
                <FaDownload />
                دانلود
              </Button>
              <Button onClick={handleShareInvoice} variant="outline" className="flex items-center gap-2">
                <FaShare />
                اشتراک
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* جزئیات سفارش */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">محصولات سفارش</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 space-x-reverse pb-4 border-b last:border-b-0">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product?.name || item.userPack?.name || 'محصول'}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {item.product?.name || item.userPack?.name || 'محصول'}
                      </h3>
                      <p className="text-sm text-gray-500">تعداد: {item.quantity}</p>
                      <p className="text-sm text-gray-500">
                        قیمت واحد: {<PriceDisplay price={item.price} />} تومان
                      </p>
                      {item.userPack && (
                        <p className="text-xs text-blue-600">پک محصولات</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{<PriceDisplay price={item.price * item.quantity} />} تومان</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>مجموع کل:</span>
                  <span>{<PriceDisplay price={order.total} />} تومان</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">آدرس‌های سفارش</h2>
              <OrderAddressDisplay
                deliveryAddress={order.deliveryAddress}
                billingAddress={order.billingAddress}
                useSameAddressForBilling={order.useSameAddressForBilling}
              />
            </Card>
          </div>

          {/* اطلاعات سفارش */}
          <div>
            <Card className="p-6 sticky top-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">وضعیت سفارش</h2>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <div className="flex items-center">
                    <FaTruck className="h-5 w-5 text-blue-600 ml-2" />
                    <div className="text-blue-800">
                      <p className="font-medium text-sm">پیگیری سفارش</p>
                      <p className="text-xs">برای اطلاع از وضعیت ارسال با پشتیبانی تماس بگیرید</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">مبلغ سفارش:</span>
                    <span className="text-xl font-bold text-green-600">{<PriceDisplay price={order.total} />} تومان</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/orders')}
                    className="w-full py-3 text-lg"
                  >
                    مشاهده تمام سفارش‌ها
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    بازگشت به صفحه اصلی
                  </Button>
                </div>

                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>برای اطلاعات بیشتر با پشتیبانی تماس بگیرید</p>
                  <p className="mt-1">📞 ۰۲۱-۱۲۳۴۵۶۷۸</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">اطلاعات تماس</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-800">پشتیبانی:</p>
                <p className="text-gray-600">۰۲۱-۱۲۳۴۵۶۷۸</p>
                <p className="text-gray-600">support@beris.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">ساعات کاری:</p>
                <p className="text-gray-600">شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر</p>
                <p className="text-gray-600">پنجشنبه: ۹ صبح تا ۱ ظهر</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 