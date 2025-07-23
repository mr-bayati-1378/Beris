'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface CartItem {
  id: number;
  productId?: number;
  userPackId?: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'pack';
  slug?: string;
  description?: string;
  itemCount?: number;
  packItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isInCart: (productId: number) => boolean;
  isPackInCart: (userPackId: number) => boolean;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  addPackToCart: (userPackId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cart', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => refreshCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [refreshCart]);

  const itemCount = items.length; // تعداد آیتم‌ها نه تعداد کل محصولات

  const isInCart = (productId: number) => {
    return items.some(item => item.productId === productId);
  };

  const isPackInCart = (userPackId: number) => {
    return items.some(item => item.userPackId === userPackId);
  };

  const addToCart = async (productId: number, quantity = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('Adding product to cart:', { productId, quantity, type: typeof productId });
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: Number(productId), quantity: Number(quantity) }),
      });

      if (res.ok) {
        // Force refresh cart immediately
        await refreshCart();
        // Dispatch event after refresh is complete
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }, 100);
        return true;
      }
      
      // اگر خطای 401 دریافت کردیم، کاربر وارد نشده است
      if (res.status === 401) {
        console.log('User not authenticated');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const addPackToCart = async (userPackId: number, quantity = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('Adding pack to cart:', { userPackId, quantity, type: typeof userPackId });
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userPackId: Number(userPackId), quantity: Number(quantity) }),
      });

      if (res.ok) {
        // Force refresh cart immediately
        await refreshCart();
        // Dispatch event after refresh is complete
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }, 100);
        return true;
      }
      
      // اگر خطای 401 دریافت کردیم، کاربر وارد نشده است
      if (res.status === 401) {
        console.log('User not authenticated');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding pack to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (itemId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId }),
      });

      if (res.ok) {
        await refreshCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, quantity }),
      });

      if (res.ok) {
        await refreshCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const value: CartContextType = {
    items,
    itemCount,
    isInCart,
    isPackInCart,
    addToCart,
    addPackToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    loading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 