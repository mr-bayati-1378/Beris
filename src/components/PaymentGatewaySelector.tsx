'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Loader, CreditCard } from 'lucide-react';

interface Gateway {
  id: number;
  name: string;
  displayName: string;
}

interface PaymentGatewaySelectorProps {
  selectedGateway: string;
  onGatewayChange: (gatewayName: string) => void;
  className?: string;
}

export default function PaymentGatewaySelector({
  selectedGateway,
  onGatewayChange,
  className = ""
}: PaymentGatewaySelectorProps) {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGateways = useCallback(async () => {
    try {
      const response = await fetch('/api/payment/gateways');
      const data = await response.json();

      if (data.success) {
        setGateways(data.gateways);
        // اگر هیچ gateway انتخاب نشده، اولی را انتخاب کن
        if (!selectedGateway && data.gateways.length > 0) {
          onGatewayChange(data.gateways[0].name);
        }
      } else {
        setError('خطا در دریافت درگاه‌های پرداخت');
      }
    } catch (error) {
      setError('خطا در دریافت درگاه‌های پرداخت');
    } finally {
      setLoading(false);
    }
  }, [selectedGateway, onGatewayChange]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const getGatewayLogo = (gatewayName: string) => {
    const logos: { [key: string]: string } = {
      zarinpal: '/images/zarinpal-logo.png',
      saman: '/images/saman-logo.png',
      mellat: '/images/mellat-logo.png',
      parsian: '/images/parsian-logo.png',
      pasargad: '/images/pasargad-logo.png',
    };
    
    return logos[gatewayName] || null;
  };

  const getGatewayDescription = (gatewayName: string) => {
    const descriptions: { [key: string]: string } = {
      zarinpal: 'پرداخت امن با کارت‌های بانکی',
      saman: 'درگاه اینترنتی بانک سامان',
      mellat: 'درگاه پرداخت بانک ملت',
      parsian: 'درگاه اینترنتی بانک پارسیان',
      pasargad: 'درگاه پرداخت بانک پاسارگاد',
    };
    
    return descriptions[gatewayName] || 'درگاه پرداخت';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <span className="mr-2">بارگذاری درگاه‌های پرداخت...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchGateways}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <p className="text-yellow-700">هیچ درگاه پرداختی در دسترس نیست</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">انتخاب روش پرداخت</h3>
      
      <div className="space-y-3">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedGateway === gateway.name
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => onGatewayChange(gateway.name)}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="radio"
                name="payment_gateway"
                value={gateway.name}
                checked={selectedGateway === gateway.name}
                onChange={() => onGatewayChange(gateway.name)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">{gateway.displayName}</h4>
                <p className="text-sm text-gray-600">
                  {getGatewayDescription(gateway.name)}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                {getGatewayLogo(gateway.name) ? (
                  <div className="relative h-8 w-16">
                    <Image
                      src={getGatewayLogo(gateway.name)!}
                      alt={gateway.displayName}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // اگر لوگو لود نشد، آیکن پیش‌فرض نمایش بده
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <CreditCard className="w-8 h-6 text-gray-600" />
                )}
              </div>
            </div>

            {/* نشانگر انتخاب شده */}
            {selectedGateway === gateway.name && (
              <div className="absolute top-2 left-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          🔒 تمامی پرداخت‌ها از طریق درگاه‌های معتبر بانکی و با رمزنگاری SSL انجام می‌شود
        </p>
      </div>
    </div>
  );
} 