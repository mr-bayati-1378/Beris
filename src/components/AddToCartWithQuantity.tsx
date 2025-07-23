'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';

interface AddToCartWithQuantityProps {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  maxStock?: number;
  children?: React.ReactNode;
}

export default function AddToCartWithQuantity({ 
  productId, 
  productName,
  productPrice,
  productImage,
  maxStock,
  children 
}: AddToCartWithQuantityProps) {
  const { addToCart, items, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantity, setShowQuantity] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const existingItem = items.find(item => item.productId === productId);
  const currentQuantity = existingItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (existingItem) {
      // If item exists, update quantity
    setIsAdding(true);
      const newQuantity = currentQuantity + quantity;
      const success = await updateQuantity(existingItem.id, newQuantity);
      if (success) {
        setQuantity(1);
        setShowQuantity(false);
      }
      setIsAdding(false);
    } else {
      // If item doesn't exist, add new item
      setIsAdding(true);
      const success = await addToCart(productId, quantity);
      if (success) {
        setQuantity(1);
        setShowQuantity(false);
      }
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (maxStock && newQuantity > maxStock) return;
    setQuantity(newQuantity);
  };

  if (existingItem) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(existingItem.id, Math.max(0, currentQuantity - 1))}
          disabled={currentQuantity <= 1}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
        >
          <FaMinus className="w-4 h-4" />
        </button>
        
        <span className="min-w-[2rem] text-center font-medium">{currentQuantity}</span>
        
        <button
          onClick={() => updateQuantity(existingItem.id, currentQuantity + 1)}
          disabled={maxStock ? currentQuantity >= maxStock : false}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!showQuantity ? (
        <button
          onClick={() => setShowQuantity(true)}
          className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
        >
          <FaShoppingCart className="w-4 h-4" />
          <span>افزودن به سبد خرید</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
          >
            <FaMinus className="w-4 h-4" />
          </button>
          
          <span className="min-w-[2rem] text-center font-medium">{quantity}</span>
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={maxStock ? quantity >= maxStock : false}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
          </button>
          
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isAdding ? 'در حال افزودن...' : 'افزودن'}
          </button>
          
          <button
            onClick={() => setShowQuantity(false)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-sm">لغو</span>
    </button>
        </div>
      )}
      
      {children}
    </div>
  );
} 