'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import PriceDisplay from '@/components/ui/price-display';
import { Card } from '@/components/ui/card';
import { CartItem } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaMapMarkerAlt, FaShoppingCart, FaCheck, FaSpinner, FaUser, FaHome, FaDollarSign, FaArrowRight, FaCreditCard } from 'react-icons/fa';

interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  phone: string;
  phoneVerified: boolean;
  email: string | null;
  nationalCode: string | null;
  isProfileComplete: boolean;
  addresses: Array<{
    id: number;
    city: string;
    address: string;
    postCode: string;
    zipCode: string;
    isDefault: boolean;
  }>;
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Phone Verification State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  // Address State
  const [addressForm, setAddressForm] = useState({
    city: '',
    address: '',
    postCode: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Selected Address
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  
  // Billing Address State
  const [useSameAddressForBilling, setUseSameAddressForBilling] = useState(true);
  const [billingAddressForm, setBillingAddressForm] = useState({
    city: '',
    address: '',
    postCode: '',
    recipient: '',
    phone: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // دریافت سبد خرید
        const cartRes = await fetch('/api/cart');
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData.items);
        }

        // دریافت پروفایل کاربر
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData.user);
          
          // تنظیم مراحل بر اساس وضعیت کاربر
          setPhoneNumber(profileData.user.phone || profileData.user.phoneNumber || '');
          
          if (profileData.user.phoneVerified) {
            // شماره تایید شده
            setPhoneVerified(true);
            
            if (profileData.user.addresses && profileData.user.addresses.length > 0) {
              // آدرس هم دارد - برو به مرحله نهایی
              setCurrentStep(3);
              // انتخاب آدرس پیش‌فرض یا اولین آدرس
              const defaultAddress = profileData.user.addresses.find(addr => addr.isDefault) || profileData.user.addresses[0];
              setSelectedAddress(defaultAddress.id);
            } else {
              // آدرس ندارد - برو به مرحله آدرس
              setCurrentStep(2);
            }
          } else {
            // شماره تایید نشده - شروع از تایید شماره
            setCurrentStep(1);
          }

        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [user, loading]);

  // اطمینان از اینکه اگر شماره تایید شده، در step 1 نمانیم
  useEffect(() => {
    if (phoneVerified && currentStep === 1) {
      if (userProfile?.addresses && userProfile.addresses.length > 0) {
        setCurrentStep(3);
        const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
        setSelectedAddress(defaultAddress.id);
      } else {
        setCurrentStep(2);
      }
    }
  }, [phoneVerified, currentStep, userProfile]);

  // محاسبه مجموع قیمت
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = total >= 10000000 ? 0 : 0; // هزینه ارسال با تماس - در API محاسبه می‌شود
  const finalTotal = total + shippingCost;

  // ارسال کد تایید (موقت - کد ثابت)
  const handleSendVerification = async () => {
    if (!phoneNumber) return;
    
    setIsVerifying(true);
    try {
      // فعلاً کد ثابت ارسال می‌کنیم
      const tempCode = '12345';
      
      // ذخیره کد در localStorage برای تست
      localStorage.setItem('tempVerificationCode', tempCode);
      
      setIsVerificationSent(true);
      
      // نمایش کد در کنسول برای تست
      console.log('کد تایید موقت:', tempCode);
      
    } catch (error) {
      alert('خطا در ارسال کد تایید');
    } finally {
      setIsVerifying(false);
    }
  };

  // تایید کد (موقت)
  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    
    setIsVerifying(true);
    try {
      // بررسی کد موقت
      const tempCode = localStorage.getItem('tempVerificationCode');
      
      if (verificationCode === tempCode || verificationCode === '12345') {
        setPhoneVerified(true);
        
        // بروزرسانی وضعیت تایید در دیتابیس
        await fetch('/api/user/verify-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber }),
        });
        
        // بررسی اینکه آیا کاربر آدرس دارد یا نه
        if (userProfile?.addresses && userProfile.addresses.length > 0) {
          // آدرس دارد - برو به مرحله نهایی
          setCurrentStep(3);
          const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
          setSelectedAddress(defaultAddress.id);
        } else {
          // آدرس ندارد - برو به مرحله آدرس
          setCurrentStep(2);
        }
      } else {
        alert('کد تایید اشتباه است');
      }
    } catch (error) {
      alert('خطا در تایید کد');
    } finally {
      setIsVerifying(false);
    }
  };

  // بررسی پشتیبانی و دسترسی GPS
  const checkGPSSupport = () => {
    if (!navigator.geolocation) {
      return { supported: false, message: 'مرورگر شما از GPS پشتیبانی نمی‌کند' };
    }
    
    if (!window.isSecureContext) {
      return { supported: false, message: 'GPS تنها در محیط امن (HTTPS) کار می‌کند' };
    }
    
    return { supported: true, message: 'GPS پشتیبانی می‌شود' };
  };

  // دریافت موقعیت جغرافیایی
  const handleGetLocation = () => {
    const gpsCheck = checkGPSSupport();
    if (!gpsCheck.supported) {
      alert(gpsCheck.message);
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationError(null);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'خطا در دریافت موقعیت جغرافیایی';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'دسترسی به موقعیت رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'موقعیت جغرافیایی در دسترس نیست.';
            break;
          case error.TIMEOUT:
            errorMessage = 'زمان دریافت موقعیت تمام شد. دوباره تلاش کنید.';
            break;
          default:
            errorMessage = 'خطای نامشخص در دریافت موقعیت.';
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // ذخیره آدرس
  const handleSaveAddress = async () => {
    if (!addressForm.city || !addressForm.address || !addressForm.postCode) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStep(3);
        
        // بروزرسانی پروفایل
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData.user);
          if (profileData.user.addresses.length > 0) {
            setSelectedAddress(profileData.user.addresses[0].id);
          }
        }
      } else {
        const data = await response.json();
        alert(data.error || 'خطا در ذخیره آدرس');
      }
    } catch (error) {
      alert('خطا در ذخیره آدرس');
    } finally {
      setIsLoading(false);
    }
  };

  // ادامه به پرداخت
  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      alert('لطفاً آدرس تحویل را انتخاب کنید');
      return;
    }

    // بررسی آدرس فاکتور
    if (!useSameAddressForBilling) {
      if (!billingAddressForm.city || !billingAddressForm.address || !billingAddressForm.postCode) {
        alert('لطفاً اطلاعات آدرس فاکتور را تکمیل کنید');
        return;
      }
    }

    try {
      // بررسی مجدد سبد خرید
      const cartRes = await fetch('/api/cart');
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData.items.length === 0) {
          alert('سبد خرید خالی است. لطفاً ابتدا محصولی اضافه کنید.');
          router.push('/products');
          return;
        }
      }

      console.log('Creating order with addressId:', selectedAddress);
      console.log('User:', user);
      
      // آماده‌سازی داده‌های آدرس
      const selectedAddressData = userProfile?.addresses.find(addr => addr.id === selectedAddress);
      
      const orderData = {
        addressId: selectedAddress,
        useSameAddressForBilling,
        billingAddress: useSameAddressForBilling ? null : {
          city: billingAddressForm.city,
          address: billingAddressForm.address,
          postCode: billingAddressForm.postCode,
          recipient: billingAddressForm.recipient,
          phone: billingAddressForm.phone
        }
      };
      
      const orderRes = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });
      
      console.log('Order response status:', orderRes.status);
      console.log('Order response headers:', Object.fromEntries(orderRes.headers.entries()));

      if (!orderRes.ok) {
        let errorData;
        try {
          const responseText = await orderRes.text();
          console.log('Order response text:', responseText);
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: 'خطا در پردازش پاسخ سرور' };
        }
        console.error('Order creation error:', errorData);
        throw new Error(errorData.error || 'خطا در ایجاد سفارش');
      }

      let orderResponseData;
      try {
        const responseText = await orderRes.text();
        console.log('Order response text:', responseText);
        orderResponseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error('خطا در پردازش پاسخ سرور');
      }
      
      console.log('Order created successfully:', orderResponseData);
      
      if (!orderResponseData.order || !orderResponseData.order.slug) {
        throw new Error('پاسخ نامعتبر از سرور');
      }
      
      router.push(`/payment/${orderResponseData.order.slug}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`خطا در ایجاد سفارش: ${error.message}`);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
          ></motion.div>
          <p className="mt-6 text-gray-600 text-lg">در حال بارگذاری...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to login');
    router.push('/auth/login?redirect=' + encodeURIComponent('/checkout'));
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="mx-auto max-w-md">
          <FaShoppingCart className="mx-auto mb-4 text-6xl text-gray-300" />
          <h1 className="mb-4 text-2xl font-bold text-gray-800">سبد خرید خالی است</h1>
        <p className="mb-6 text-gray-600">برای تسویه حساب ابتدا محصولی به سبد خرید اضافه کنید</p>
          <Button onClick={() => router.push('/products')} className="w-full">
          مشاهده محصولات
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">تسویه حساب</h1>
          <p className="text-gray-600 text-lg">مراحل نهایی خرید شما</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            {[1, 2, 3].map((step) => {
              let stepStatus = 'pending'; // pending, current, completed
              
              if (step === 1) {
                stepStatus = phoneVerified ? 'completed' : (currentStep === 1 ? 'current' : 'pending');
              } else if (step === 2) {
                stepStatus = currentStep > 2 ? 'completed' : (currentStep === 2 ? 'current' : 'pending');
              } else if (step === 3) {
                stepStatus = currentStep === 3 ? 'current' : 'pending';
              }

              return (
                <motion.div 
                  key={step} 
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: step * 0.2 }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`
                      flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold transition-all duration-300 shadow-lg
                      ${stepStatus === 'completed' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : stepStatus === 'current'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {stepStatus === 'completed' ? <FaCheck className="text-xl" /> : step}
                  </motion.div>
                  {step < 3 && (
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: stepStatus === 'completed' ? 1 : 0.3 }}
                      className={`
                        h-2 w-20 md:w-32 transition-all duration-500 rounded-full
                        ${stepStatus === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'}
                      `} 
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center text-sm text-gray-600">
            <div className="grid grid-cols-3 gap-20 md:gap-32 text-center">
              <span className={`font-medium ${phoneVerified ? 'text-green-600' : ''}`}>
                تایید شماره {phoneVerified && '✓'}
              </span>
              <span className="font-medium">آدرس تحویل</span>
              <span className="font-medium">پرداخت</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Content - Phone Verification */}
          <div className="lg:col-span-1">
            {/* پیام برای کاربران تایید شده */}
            {phoneVerified && currentStep === 1 && (
              <Card className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <FaCheck className="text-2xl text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">شماره موبایل تایید شده</h2>
                <p className="text-gray-600 mb-4">شماره {phoneNumber} قبلاً تایید شده است</p>
                <p className="text-sm text-gray-500">در حال انتقال به مرحله بعد...</p>
              </Card>
            )}

            {/* مرحله 1: تایید شماره موبایل */}
            {currentStep === 1 && !phoneVerified && (
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <FaPhone className="text-2xl text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">تایید شماره موبایل</h2>
                  <p className="mt-2 text-gray-600">برای ادامه خرید ابتدا شماره موبایل خود را تایید کنید</p>
                </div>

                {!isVerificationSent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره موبایل
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="09123456789"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        dir="ltr"
                      />
                    </div>
                    <Button
                      onClick={handleSendVerification}
                      disabled={!phoneNumber || isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? (
                        <>
                          <FaSpinner className="animate-spin ml-2" />
                          در حال ارسال...
                        </>
                      ) : (
                        'ارسال کد تایید'
                      )}
                </Button>
              </div>
            ) : (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      کد تایید به شماره <span className="font-medium">{phoneNumber}</span> ارسال شد
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-yellow-800">
                        💡 کد تایید موقت: <span className="font-bold">12345</span>
                      </p>
                    </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        کد تایید
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="12345"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest text-lg"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setIsVerificationSent(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        تغییر شماره
                      </Button>
                      <Button
                        onClick={handleVerifyCode}
                        disabled={!verificationCode || isVerifying}
                        className="flex-1"
                      >
                        {isVerifying ? (
                          <>
                            <FaSpinner className="animate-spin ml-2" />
                            در حال تایید...
                          </>
                        ) : (
                          'تایید کد'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* مرحله 2: آدرس تحویل */}
            {currentStep === 2 && (
            <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FaMapMarkerAlt className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">آدرس تحویل</h2>
                  <p className="mt-2 text-gray-600">آدرس تحویل سفارش خود را وارد کنید</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شهر
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="نام شهر"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آدرس کامل
                    </label>
                    <textarea
                      value={addressForm.address}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="آدرس دقیق خود را وارد کنید"
                    />
                      </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      کد پستی
                    </label>
                    <input
                      type="text"
                      value={addressForm.postCode}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, postCode: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                      maxLength={10}
                      dir="ltr"
                    />
                  </div>

                                     {/* موقعیت جغرافیایی */}
                   <div className="border-t pt-4">
                     <div className="flex items-center justify-between mb-2">
                       <label className="text-sm font-medium text-gray-700">
                         موقعیت جغرافیایی (اختیاری)
                       </label>
                       <Button
                         onClick={handleGetLocation}
                         disabled={isGettingLocation}
                         size="sm"
                         variant="outline"
                       >
                         {isGettingLocation ? (
                           <>
                             <FaSpinner className="animate-spin ml-2" />
                             در حال دریافت...
                           </>
                         ) : (
                           <>
                             <FaMapMarkerAlt className="ml-2" />
                             دریافت موقعیت
                           </>
                         )}
                       </Button>
                     </div>
                     
                     {addressForm.latitude && addressForm.longitude ? (
                       <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                         <div className="flex items-center mb-1">
                           <FaMapMarkerAlt className="ml-2" />
                           ✓ موقعیت جغرافیایی دریافت شد
                         </div>
                         <div className="text-xs text-gray-600">
                           Lat: {addressForm.latitude.toFixed(6)}, Lng: {addressForm.longitude.toFixed(6)}
                         </div>
                       </div>
                     ) : locationError ? (
                       <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                         <div className="font-medium mb-1">خطا در دریافت موقعیت</div>
                         <div className="text-xs">{locationError}</div>
                         <Button
                           onClick={handleGetLocation}
                           disabled={isGettingLocation}
                           size="sm"
                           variant="outline"
                           className="mt-2 text-xs h-8"
                         >
                           تلاش مجدد
                         </Button>
                       </div>
                     ) : (
                       <div className="text-xs text-gray-500 mt-1 space-y-1">
                         <div>💡 نکته: برای دقت بیشتر در تحویل، موقعیت جغرافیایی خود را ثبت کنید</div>
                         <details className="cursor-pointer">
                           <summary className="text-blue-600 hover:text-blue-700">راهنمای فعال‌سازی GPS</summary>
                           <div className="mt-1 text-xs text-gray-600 space-y-1">
                             <div>• در Chrome: نماد قفل کنار آدرس → Location → Allow</div>
                             <div>• در موبایل: Settings → Privacy → Location Services را فعال کنید</div>
                             <div>• اطمینان حاصل کنید که GPS گوشی روشن است</div>
                           </div>
                         </details>
                       </div>
                     )}
                   </div>

                  <Button
                    onClick={handleSaveAddress}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin ml-2" />
                        در حال ذخیره...
                      </>
                    ) : (
                      'ذخیره آدرس و ادامه'
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* مرحله 3: نهایی کردن سفارش */}
            {currentStep === 3 && (
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <FaCheck className="text-2xl text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">آماده پرداخت</h2>
                  <p className="mt-2 text-gray-600">اطلاعات شما تایید شد، می‌توانید به پرداخت ادامه دهید</p>
                </div>

                {/* نمایش اطلاعات تایید شده */}
                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaPhone className="text-green-600 ml-2" />
                      <span className="font-medium text-green-800">شماره موبایل تایید شده</span>
                    </div>
                    <p className="text-green-700">{phoneNumber}</p>
                  </div>

                  {userProfile?.addresses && userProfile.addresses.length > 0 && (
                    <div className="space-y-4">
                      {/* آدرس تحویل */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <FaMapMarkerAlt className="text-blue-600 ml-2" />
                          <span className="font-medium text-blue-800">آدرس تحویل</span>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">{userProfile.addresses[0].city}</p>
                          <p className="text-blue-600 text-sm">{userProfile.addresses[0].address}</p>
                          <p className="text-blue-600 text-sm">کد پستی: {userProfile.addresses[0].postCode || userProfile.addresses[0].zipCode}</p>
                        </div>
                      </div>

                      {/* آدرس فاکتور */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <FaDollarSign className="text-purple-600 ml-2" />
                            <span className="font-medium text-purple-800">آدرس فاکتور</span>
                          </div>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={useSameAddressForBilling}
                              onChange={(e) => setUseSameAddressForBilling(e.target.checked)}
                              className="ml-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-purple-700">همان آدرس تحویل</span>
                          </label>
                        </div>
                        
                        {useSameAddressForBilling ? (
                          <div className="text-purple-600 text-sm">
                            ✓ از همان آدرس تحویل استفاده می‌شود
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">
                                نام گیرنده
                              </label>
                              <input
                                type="text"
                                value={billingAddressForm.recipient}
                                onChange={(e) => setBillingAddressForm(prev => ({ ...prev, recipient: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="نام گیرنده فاکتور"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">
                                شهر
                              </label>
                              <input
                                type="text"
                                value={billingAddressForm.city}
                                onChange={(e) => setBillingAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="نام شهر"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">
                                آدرس
                              </label>
                              <textarea
                                value={billingAddressForm.address}
                                onChange={(e) => setBillingAddressForm(prev => ({ ...prev, address: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="آدرس فاکتور"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  کد پستی
                                </label>
                                <input
                                  type="text"
                                  value={billingAddressForm.postCode}
                                  onChange={(e) => setBillingAddressForm(prev => ({ ...prev, postCode: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="1234567890"
                                  maxLength={10}
                                  dir="ltr"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-purple-700 mb-1">
                                  شماره تماس
                                </label>
                                <input
                                  type="tel"
                                  value={billingAddressForm.phone}
                                  onChange={(e) => setBillingAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="09123456789"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* محاسبات */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-600 text-white p-2 rounded-full mr-3">
                      <FaDollarSign className="text-sm" />
                    </div>
                    <h4 className="font-bold text-gray-800">محاسبات</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">جمع فاکتور:</span>
                      <span className="font-bold text-gray-800">{total.toLocaleString()} تومان</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">هزینه ارسال:</span>
                      <span className={`font-bold ${total >= 10000000 ? 'text-green-600' : 'text-orange-600'}`}>
                        {total >= 10000000 ? 'رایگان' : 'تماس با مشتری'}
                      </span>
                    </div>
                    <hr className="my-3 border-gray-300" />
                    <div className="flex justify-between font-bold text-lg bg-blue-50 p-3 rounded-lg">
                      <span className="text-gray-800">مجموع نهایی:</span>
                      <span className="text-blue-600">{finalTotal.toLocaleString()} تومان</span>
                    </div>
                    
                    {/* اطلاعات هزینه ارسال */}
                    {total < 10000000 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                        <div className="text-orange-800 font-bold text-sm mb-1">📞 هزینه ارسال با تماس تعیین می‌شود</div>
                        <div className="text-orange-600 text-xs">پس از ثبت سفارش با شما تماس می‌گیریم</div>
                        <div className="text-orange-500 text-xs mt-1">⏰ پاسخگویی ۲۴ ساعته</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    ویرایش آدرس
                  </Button>
                  <Button
                    onClick={handleProceedToPayment}
                    className="flex-1 h-12 text-lg font-medium"
                  >
                    ادامه به پرداخت
                  </Button>
                </div>
            </Card>
          )}
        </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-3">
          <Card className="p-6 sticky top-4 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white p-3 rounded-full mr-3">
                  <FaShoppingCart className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">خلاصه سفارش</h3>
                  <p className="text-sm text-gray-600">مرور نهایی خرید شما</p>
                </div>
              </div>
            
              {/* اطلاعات مشتری */}
              {userProfile && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-600 text-white p-2 rounded-full mr-3">
                      <FaUser className="text-sm" />
                    </div>
                    <span className="font-bold text-green-800">اطلاعات مشتری</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                    <p className="text-xs opacity-75">{phoneNumber}</p>
                  </div>
                </div>
              )}

              {/* محصولات */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 text-white p-2 rounded-full mr-3">
                    <FaShoppingCart className="text-sm" />
                  </div>
                  <h4 className="font-bold text-gray-800">محصولات سفارش</h4>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            fill
                            className="rounded-lg object-cover"
                          />
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-600">قیمت واحد: {<PriceDisplay price={item.price} showCurrency={false} />} تومان</p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-xs text-blue-600 font-medium">موجود</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">
                            {<PriceDisplay price={(item.price * item.quantity)} showCurrency={false} />} تومان
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>





              {/* اطلاعات اضافی */}
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>🔒 تمام اطلاعات شما محفوظ است</p>
                  <p>📦 ارسال در کمترین زمان ممکن</p>
                  <p>💯 ضمانت کیفیت محصولات</p>
                </div>
              </div>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 