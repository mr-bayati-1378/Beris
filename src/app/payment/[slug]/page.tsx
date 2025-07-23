'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import PriceDisplay from '@/components/ui/price-display';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { FaCheck, FaPrint, FaDownload, FaShare } from 'react-icons/fa';

interface OrderItem {
  id: number;
  productId?: number;
  userPackId?: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    price: number;
    images: any[];
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
  deliveryAddress?: {
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
  };
  useSameAddressForBilling?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderSlug = params.slug as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${orderSlug}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else if (res.status === 401) {
          // اگر کاربر لاگین نیست، به صفحه لاگین هدایت شود
          router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
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
  }, [orderSlug, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // در آینده می‌توان PDF تولید کرد
    alert('دانلود فاکتور در نسخه‌های بعدی اضافه خواهد شد');
  };

  const handleShareInvoice = () => {
    if (navigator.share) {
      navigator.share({
        title: `فاکتور سفارش ${order?.slug}`,
        text: `فاکتور سفارش شما با کد ${order?.slug}`,
        url: window.location.href,
      });
    } else {
      // کپی لینک
      navigator.clipboard.writeText(window.location.href);
      alert('لینک فاکتور کپی شد');
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
    <div className="container mx-auto px-4 py-6" dir="rtl">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FaCheck className="text-2xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">فاکتور سفارش</h1>
          <p className="text-gray-600">سفارش شما با موفقیت ثبت شد</p>
          <p className="text-sm text-gray-500 mt-2">کد سفارش: {order.slug}</p>
          <p className="text-xs text-gray-400">تاریخ ثبت: {formatDate(order.createdAt)}</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-center gap-3">
          <Button onClick={handlePrintInvoice} variant="outline" className="flex items-center gap-2">
            <FaPrint />
            چاپ فاکتور
          </Button>
          <Button onClick={handleDownloadInvoice} variant="outline" className="flex items-center gap-2">
            <FaDownload />
            دانلود
          </Button>
          <Button onClick={handleShareInvoice} variant="outline" className="flex items-center gap-2">
            <FaShare />
            اشتراک‌گذاری
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
              <h2 className="text-xl font-semibold mb-4">آدرس تحویل</h2>
              <div className="space-y-2">
                <p><span className="font-medium">شهر:</span> {order.deliveryAddress?.city}</p>
                <p><span className="font-medium">آدرس:</span> {order.deliveryAddress?.address}</p>
                <p><span className="font-medium">استان:</span> {order.deliveryAddress?.state}</p>
                <p><span className="font-medium">کد پستی:</span> {order.deliveryAddress?.zipCode}</p>
              </div>
            </Card>
          </div>

          {/* اطلاعات فاکتور */}
          <div>
            <Card className="p-6 sticky top-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">وضعیت سفارش</h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  در انتظار پرداخت
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-blue-800">
                      <p className="font-medium text-sm">نکات مهم</p>
                      <p className="text-xs">سیستم پرداخت آنلاین در حال راه‌اندازی است. با ما تماس بگیرید.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">مبلغ قابل پرداخت:</span>
                    <span className="text-xl font-bold text-green-600">{<PriceDisplay price={order.total} />} تومان</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/orders')}
                    className="w-full py-3 text-lg"
                  >
                    مشاهده سفارش‌های من
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