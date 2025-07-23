'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface PaymentResult {
  success: boolean;
  verified: boolean;
  trackingCode?: string;
  refId?: string;
  error?: string;
  message?: string;
}

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const verifyPayment = useCallback(async () => {
    try {
      setLoading(true);

      // دریافت پارامترها از URL
      const paymentId = searchParams.get('payment_id');
      const authority = searchParams.get('Authority');
      const status = searchParams.get('Status');

      if (!paymentId) {
        setResult({
          success: false,
          verified: false,
          error: 'شناسه پرداخت یافت نشد'
        });
        setLoading(false);
        return;
      }

      // ارسال درخواست تایید
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          authority,
          status
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        verified: false,
        error: 'خطا در تایید پرداخت'
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  const handleBackToOrders = () => {
    router.push('/orders');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            در حال تایید پرداخت...
          </h2>
          <p className="text-gray-600">
            لطفا چند لحظه صبر کنید
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        {result?.verified ? (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              پرداخت موفق
            </h2>
            <p className="text-gray-600 mb-4">
              پرداخت شما با موفقیت انجام شد
            </p>
            
            {result.trackingCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>کد پیگیری:</strong> {result.trackingCode}
                </p>
                {result.refId && (
                  <p className="text-sm text-green-800 mt-1">
                    <strong>شماره مرجع:</strong> {result.refId}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleBackToOrders}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                مشاهده سفارشات
              </button>
              <button
                onClick={handleBackToHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                بازگشت به خانه
              </button>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              پرداخت ناموفق
            </h2>
            <p className="text-gray-600 mb-4">
              {result?.error || 'پرداخت شما انجام نشد'}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                در صورت کسر مبلغ از حساب شما، طی ۷۲ ساعت آینده به حساب شما بازگردانده خواهد شد.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.back()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                تلاش مجدد
              </button>
              <button
                onClick={handleBackToHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                بازگشت به خانه
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            در حال بارگذاری...
          </h2>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
} 