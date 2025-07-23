'use client';

import { useState } from 'react';
import { FaTimes, FaShoppingCart, FaSpinner, FaBoxes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import AddPackToCartButton from './AddPackToCartButton';

interface UserPack {
  id: number;
  name: string;
  description?: string;
  totalPrice?: number;
  itemCount: number;
  isActive: boolean;
  createdAt: string;
}

interface OrderPackModalProps {
  pack: UserPack;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderPackModal({ pack, onClose, onSuccess }: OrderPackModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addPackToCart } = useCart();

  const handleAddToCart = async () => {
    if (!pack.isActive) {
      toast.error('این پک غیرفعال است');
      return;
    }

    setLoading(true);

    try {
      const success = await addPackToCart(pack.id, quantity);
      if (success) {
        toast.success('پک با موفقیت به سبد خرید اضافه شد');
        onSuccess();
      } else {
        toast.error('خطا در افزودن پک به سبد خرید');
      }
    } catch (error) {
      console.error('Error adding pack to cart:', error);
      toast.error('خطا در افزودن پک به سبد خرید');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (pack.totalPrice || 0) * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaBoxes className="text-blue-600" />
            سفارش پک
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* اطلاعات پک */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{pack.name}</h3>
            {pack.description && (
              <p className="text-sm text-gray-600 mb-3">{pack.description}</p>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">تعداد محصولات:</span>
              <span className="font-medium">{pack.itemCount} محصول</span>
            </div>
            {pack.totalPrice && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">قیمت واحد:</span>
                <span className="font-medium text-blue-600">
                  {pack.totalPrice.toLocaleString()} تومان
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">وضعیت:</span>
              <span className={`font-medium ${pack.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {pack.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>

          {/* انتخاب تعداد */}
          {pack.isActive && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعداد
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* قیمت کل */}
          {pack.isActive && pack.totalPrice && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">قیمت کل:</span>
                <span className="text-xl font-bold text-blue-600">
                  {totalPrice.toLocaleString()} تومان
                </span>
              </div>
            </div>
          )}

          {/* دکمه‌های عملیات */}
          <div className="flex gap-3">
            {pack.isActive ? (
              <AddPackToCartButton
                userPackId={pack.id}
                packName={pack.name}
                className="flex-1 text-center"
              />
            ) : (
              <div className="flex-1 px-4 py-3 bg-gray-300 text-gray-500 rounded-lg text-center cursor-not-allowed">
                پک غیرفعال
              </div>
            )}
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 