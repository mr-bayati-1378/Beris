import React from 'react';
import { FaMapMarkerAlt, FaDollarSign, FaPhone, FaUser } from 'react-icons/fa';

interface AddressData {
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  recipient?: string;
}

interface OrderAddressDisplayProps {
  deliveryAddress: AddressData;
  billingAddress?: AddressData | null;
  useSameAddressForBilling: boolean;
}

export default function OrderAddressDisplay({
  deliveryAddress,
  billingAddress,
  useSameAddressForBilling
}: OrderAddressDisplayProps) {
  return (
    <div className="space-y-4">
      {/* آدرس تحویل */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <FaMapMarkerAlt className="text-blue-600 ml-2" />
          <span className="font-medium text-blue-800">آدرس تحویل</span>
        </div>
        <div className="space-y-2">
          {deliveryAddress.recipient && (
            <div className="flex items-center text-blue-700">
              <FaUser className="text-blue-500 ml-2 text-sm" />
              <span className="text-sm">{deliveryAddress.recipient}</span>
            </div>
          )}
          <div className="text-blue-700 font-medium">
            {deliveryAddress.city}
            {deliveryAddress.state && deliveryAddress.state !== deliveryAddress.city && (
              <span className="text-blue-600 text-sm mr-2">، {deliveryAddress.state}</span>
            )}
          </div>
          <div className="text-blue-600 text-sm">
            {deliveryAddress.address}
          </div>
          <div className="text-blue-600 text-sm">
            کد پستی: {deliveryAddress.zipCode || 'تعیین نشده'}
          </div>
          {deliveryAddress.phone && (
            <div className="flex items-center text-blue-600 text-sm">
              <FaPhone className="text-blue-500 ml-2" />
              <span>{deliveryAddress.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* آدرس فاکتور */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <FaDollarSign className="text-purple-600 ml-2" />
          <span className="font-medium text-purple-800">آدرس فاکتور</span>
        </div>
        
        {useSameAddressForBilling ? (
          <div className="text-purple-600 text-sm">
            ✓ از همان آدرس تحویل استفاده می‌شود
          </div>
        ) : billingAddress ? (
          <div className="space-y-2">
            {billingAddress.recipient && (
              <div className="flex items-center text-purple-700">
                <FaUser className="text-purple-500 ml-2 text-sm" />
                <span className="text-sm">{billingAddress.recipient}</span>
              </div>
            )}
            <div className="text-purple-700 font-medium">
              {billingAddress.city}
              {billingAddress.state && billingAddress.state !== billingAddress.city && (
                <span className="text-purple-600 text-sm mr-2">، {billingAddress.state}</span>
              )}
            </div>
            <div className="text-purple-600 text-sm">
              {billingAddress.address}
            </div>
            <div className="text-purple-600 text-sm">
              کد پستی: {billingAddress.zipCode || 'تعیین نشده'}
            </div>
            {billingAddress.phone && (
              <div className="flex items-center text-purple-600 text-sm">
                <FaPhone className="text-purple-500 ml-2" />
                <span>{billingAddress.phone}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-purple-600 text-sm">
            آدرس فاکتور تعیین نشده
          </div>
        )}
      </div>
    </div>
  );
} 