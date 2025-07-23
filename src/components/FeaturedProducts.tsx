'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPriceWithFont } from '@/lib/utils';
import { FaBoxOpen, FaArrowLeft } from 'react-icons/fa';
import AddToCartButton from '@/components/AddToCartButton';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  categoryL3Id: number;
  isActive: boolean;
}

interface FeaturedProductsProps {
  products: Product[];
}

function FeaturedProductCard({ product, index }: { product: Product; index: number }) {
  const { isInCart } = useCart();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const productInCart = isInCart(product.id);

  // Listen for cart updates
  useEffect(() => {
    const handleUpdate = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('cartUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleUpdate);
    };
  }, []);

  return (
    <div
      className="group rounded-lg bg-white p-2 shadow hover:shadow-md transition-all duration-300 card-hover animate-fadeIn border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-white border border-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12vw"
          />
          <div className="absolute right-1 top-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-1 py-0.5 text-[8px] font-bold text-white shadow animate-pulse">
            ویژه
          </div>

          {/* Cart Status Badge */}
          {productInCart && (
            <div className="absolute bottom-1 right-1 bg-green-600 text-white text-[8px] px-1 py-0.5 rounded font-bold shadow-md">
              🛒
            </div>
          )}


        </div>
      </Link>
      
      <Link href={`/product/${product.slug}`}>
        <h3 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-800 transition-colors group-hover:text-blue-600 leading-tight">
          {product.name}
        </h3>
      </Link>
      
      <div className="text-xs font-bold text-blue-600 price-text mb-2">
        {formatPriceWithFont(product.price)}
      </div>
      
      <AddToCartButton
        productId={product.id}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1 rounded text-[10px] font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        showIcon={false}
      >
        {productInCart ? 'در سبد شما' : 'افزودن'}
      </AddToCartButton>
    </div>
  );
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="container mx-auto max-w-screen-2xl px-4 md:px-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
          <FaBoxOpen className="w-5 h-5 animate-pulse" />
          ⚡ انتخاب‌های ویژه
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-3 drop-shadow-sm">
          🌟 محصولات منتخب برای شما
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg">
          بهترین محصولات پزشکی با کیفیت تضمین شده و قیمت مناسب
        </p>
      </div>
        
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {products.map((product, index) => (
          <FeaturedProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow text-sm"
        >
          <FaBoxOpen className="text-sm" />
          مشاهده همه
          <FaArrowLeft />
        </Link>
      </div>
    </section>
  );
} 