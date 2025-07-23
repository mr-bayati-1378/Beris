'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Flame, Sparkles } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { formatPriceWithFont } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  price: number;
  finalPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  image: string;
  slug: string;
  inStock: boolean;
  discountPercent?: number;
  hasDiscount?: number;
  stock?: number;
  img?: string;
  discountStartDate?: string;
  discountEndDate?: string;
}

interface DiscountCountdownProps {
  endTime: Date;
  className?: string;
}

function DiscountCountdown({ endTime, className = "" }: DiscountCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = endTime.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className={`flex items-center gap-1 text-xs font-mono bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full px-2 py-1 shadow-lg border border-white/20 backdrop-blur-sm ${className}`} dir="ltr">
      <Clock className="w-3 h-3" />
      <span className="font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
      <span>:</span>
      <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span>:</span>
      <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span>:</span>
      <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
}

export default function DiscountSlider() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscountProducts() {
      try {
        const response = await fetch('/api/products/discount?limit=20&sortBy=time_remaining');
        if (response.ok) {
          const data = await response.json();
          const formattedProducts = data.products?.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.originalPrice || product.price,
            finalPrice: product.finalPrice || product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discountPercent || 25,
            rating: product.averageRating || 4.5,
            reviewCount: product.reviewCount || 50,
            image: product.img || product.images?.[0] || '/default-product.svg',
            slug: product.slug,
            inStock: product.stock > 0,
            discountPercent: product.discountPercent,
            hasDiscount: product.hasDiscount,
            discountStartDate: product.discountStartDate,
            discountEndDate: product.discountEndDate,
          })) || [];

          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('خطا در بارگذاری محصولات تخفیف‌دار:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDiscountProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || isScrolling) return;

    setIsScrolling(true);
    const container = scrollContainerRef.current;
    const itemWidth = 160; // عرض تقریبی هر محصول + gap
    const scrollAmount = itemWidth * 3; // اسکرول معادل 3 محصول
    
    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });

    setTimeout(() => setIsScrolling(false), 500);
  };

  if (loading) {
    return (
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse font-yekan text-gray-600">در حال بارگذاری محصولات تخفیف‌دار...</div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* متن در سمت چپ */}
            <div className="flex-shrink-0 p-8 text-white w-full md:w-auto md:min-w-[320px] flex flex-col justify-center font-yekan">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Flame className="w-8 h-8 text-red-300" />
                  </div>
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">تخفیف‌های</h2>
                  <h3 className="text-2xl md:text-3xl font-bold text-yellow-300">ویژه</h3>
                </div>
              </div>
              
              <p className="text-white/90 text-base md:text-lg mb-6 leading-tight font-light text-center">
                محصولات تخفیف‌دار<br />با بهترین قیمت
              </p>
              
              <div className="flex justify-center">
                <Link 
                  href="/products?hasDiscount=true" 
                  className="group inline-flex items-center gap-3 bg-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 text-base backdrop-blur-sm border border-white/20 hover:scale-105"
                >
                  <span>مشاهده همه</span>
                  <ChevronLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Products Slider در سمت راست */}
            <div className="flex-1 relative p-6 overflow-hidden">
              <button
                onClick={() => scroll('right')}
                disabled={isScrolling}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
                aria-label="اسکرول به راست"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => scroll('left')}
                disabled={isScrolling}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
                aria-label="اسکرول به چپ"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-12"
                style={{ 
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth'
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group flex-shrink-0 w-44 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-72 hover:scale-105"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-product.svg';
                        }}
                      />
                      
                      {/* Discount Badge */}
                      {product.discountPercent && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          %{product.discountPercent}
                        </div>
                      )}

                      {/* Countdown Timer */}
                      {product.discountEndDate && (
                        <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                          <DiscountCountdown endTime={new Date(product.discountEndDate)} />
                        </div>
                      )}
                    </div>

                    <div className="p-3 text-gray-800 flex flex-col flex-1 font-yekan">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-bold text-sm mb-3 line-clamp-2 text-gray-900 hover:text-red-600 transition-colors h-10 leading-5">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-sm ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>

                      <div className="mb-4 flex-1">
                        {product.hasDiscount && product.originalPrice ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-400 line-through font-light">
                              {Number(product.originalPrice).toLocaleString('fa-IR')} تومان
                            </div>
                            <div className="text-lg font-bold text-red-600">
                              {Number(product.finalPrice).toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                        ) : (
                          <div className="h-12 flex items-end">
                            <div className="text-lg font-bold text-gray-900">
                              {Number(product.finalPrice).toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                        )}
                      </div>

                      <AddToCartButton
                        productId={product.id}
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl text-center text-sm font-bold hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        showIcon={false}
                      >
                        افزودن به سبد
                      </AddToCartButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}