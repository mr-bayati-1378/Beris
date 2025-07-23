'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { FaTrash, FaMinus, FaPlus, FaEye, FaHeart, FaShare } from 'react-icons/fa';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: (item: CartItem) => void;
  onRemove: (itemId: number) => void;
}

export default function CartItemCard({ item, onUpdate, onRemove }: CartItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPackDetails, setShowPackDetails] = useState(false);
  const [inputQuantity, setInputQuantity] = useState(item.quantity.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // همگام‌سازی input با quantity
  useEffect(() => {
    setInputQuantity(item.quantity.toString());
  }, [item.quantity]);

  const handleQuantityChange = async (delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    if (newQuantity === item.quantity) return;

    // لغو timeout قبلی
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          quantity: newQuantity,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update cart');
      }

      onUpdate({ ...item, quantity: newQuantity });
      // حذف toast برای جلوگیری از نوتیف‌های پیاپی
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('خطا در به‌روزرسانی تعداد');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputQuantity(value);
    
    // لغو timeout قبلی
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // تایمر برای به‌روزرسانی خودکار
    updateTimeoutRef.current = setTimeout(() => {
      const newQuantity = parseInt(value) || 1;
      if (newQuantity !== item.quantity && newQuantity > 0) {
        handleQuantityInputUpdate(newQuantity);
      }
    }, 1000); // 1 ثانیه تاخیر
  };

  const handleQuantityInputUpdate = async (newQuantity: number) => {
    if (newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          quantity: newQuantity,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update cart');
      }

      onUpdate({ ...item, quantity: newQuantity });
      toast.success('تعداد محصول به‌روزرسانی شد');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('خطا در به‌روزرسانی تعداد');
      // بازگرداندن مقدار قبلی
      setInputQuantity(item.quantity.toString());
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const newQuantity = parseInt(inputQuantity) || 1;
    if (newQuantity !== item.quantity) {
      handleQuantityInputUpdate(newQuantity);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleRemoveClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    setIsUpdating(true);
    setShowDeleteConfirm(false);
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (!res.ok) {
        throw new Error('Failed to remove item');
      }

      onRemove(item.id);
      toast.success('محصول از سبد خرید حذف شد');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('خطا در حذف محصول');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* اگر آیتم یک پک است */}
      {item.type === 'pack' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-2xl bg-white p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-lg">
              <div className="text-purple-600 text-3xl">📦</div>
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                پک
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                  پک ویژه
                </span>
              </div>
              
              {item.description && (
                <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>تعداد محصولات: <span className="font-bold text-purple-600">{item.itemCount} آیتم</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>قیمت پک: <span className="font-bold text-purple-600">{item.price.toLocaleString()} تومان</span></span>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="font-bold text-primary">مجموع: {(item.price * item.quantity).toLocaleString()} تومان</span>
                </div>
              </div>

              {/* نمایش محصولات پک */}
              {item.packItems && item.packItems.length > 0 && (
                <div className="mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPackDetails(!showPackDetails)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-medium bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    {showPackDetails ? '↑' : '↓'} نمایش محصولات پک
                  </motion.button>
                  
                  <AnimatePresence>
                    {showPackDetails && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200"
                      >
                        {item.packItems.map((packItem, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex justify-between text-sm items-center"
                          >
                            <span className="text-gray-700 font-medium">{packItem.name}</span>
                            <span className="text-purple-600 font-bold">
                              {packItem.quantity}× {packItem.price.toLocaleString()} تومان
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isUpdating}
                    className="w-10 h-10 bg-white text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <FaMinus className="w-4 h-4" />
                  </motion.button>
                  
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      type="number"
                      min="1"
                      value={inputQuantity}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyPress={handleInputKeyPress}
                      className="w-16 text-center font-bold text-gray-900 bg-white py-2 px-3 rounded-lg border-2 border-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => {
                        setIsEditing(true);
                        setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                      className="w-16 text-center font-bold text-gray-900 bg-white py-2 px-3 rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:border-primary transition-colors"
                    >
                      {item.quantity}
                    </span>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(1)}
                    disabled={isUpdating}
                    className="w-10 h-10 bg-white text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <FaPlus className="w-4 h-4" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemoveClick}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  حذف
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* اگر آیتم یک محصول عادی است */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
        >
          <Link href={`/product/${item.slug}`} className="relative h-24 w-24 block group">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="rounded-xl object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
              <FaEye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>

          <div className="flex-1">
            <Link href={`/product/${item.slug}`} className="block hover:text-primary transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
            </Link>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>قیمت واحد: <span className="font-bold text-primary">{item.price.toLocaleString()} تومان</span></span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="font-bold text-primary">مجموع: {(item.price * item.quantity).toLocaleString()} تومان</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isUpdating}
                  className="w-10 h-10 bg-white text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center transition-colors shadow-sm"
                >
                  <FaMinus className="w-4 h-4" />
                </motion.button>
                
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    value={inputQuantity}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyPress={handleInputKeyPress}
                    className="w-16 text-center font-bold text-gray-900 bg-white py-2 px-3 rounded-lg border-2 border-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => {
                      setIsEditing(true);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="w-16 text-center font-bold text-gray-900 bg-white py-2 px-3 rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:border-primary transition-colors"
                  >
                    {item.quantity}
                  </span>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(1)}
                  disabled={isUpdating}
                  className="w-10 h-10 bg-white text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center transition-colors shadow-sm"
                >
                  <FaPlus className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FaHeart className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FaShare className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemoveClick}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  حذف
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleRemoveCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="w-8 h-8 text-red-600" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  حذف از سبد خرید
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  آیا مطمئن هستید که می‌خواهید <span className="font-bold text-gray-900">{item.name}</span> را از سبد خرید حذف کنید؟
                </p>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveCancel}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    انصراف
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveConfirm}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        در حال حذف...
                      </div>
                    ) : (
                      'حذف کن'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
