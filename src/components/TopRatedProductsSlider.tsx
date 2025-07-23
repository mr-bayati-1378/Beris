'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Award } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  finalPrice: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  image: string;
  slug: string;
  inStock: boolean;
  discountPercent?: number;
  hasDiscount?: boolean;
  stock?: number;
  img?: string;
}

export default function TopRatedProductsSlider() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBestSellingProducts() {
      try {
        // Use the best-selling products API
        const response = await fetch('/api/products/best-selling?limit=12&orderBy=sold');
        if (response.ok) {
          const data = await response.json();
          const formattedProducts = data.products?.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.comparePrice || product.price,
            finalPrice: product.price,
            originalPrice: product.comparePrice,
            rating: product.averageRating || 0,
            reviewCount: product.reviewCount || 0,
            image: product.image || '/default-product.svg',
            slug: product.slug,
            inStock: true, // Assume in stock since it's top-rated
            discountPercent: product.discountPercent,
            hasDiscount: product.hasDiscount,
          })) || [];
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('خطا در بارگذاری محصولات پرفروش:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBestSellingProducts();
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
            <div className="animate-pulse font-yekan text-gray-600">در حال بارگذاری محصولات پرفروش...</div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* متن در سمت چپ */}
            <div className="flex-shrink-0 p-8 text-white w-full md:w-auto md:min-w-[320px] flex flex-col justify-center font-yekan">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <TrendingUp className="w-8 h-8 text-blue-300" />
                  </div>
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">محصولات</h2>
                  <h3 className="text-2xl md:text-3xl font-bold text-yellow-300">پرفروش</h3>
                </div>
              </div>
              
              <p className="text-white/90 text-base md:text-lg mb-6 leading-tight font-light text-center">
                پرفروش‌ترین محصولات<br />با بهترین کیفیت
              </p>
              
              <div className="flex justify-center">
                <Link 
                  href="/products?sortBy=sales" 
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
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-blue-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
                aria-label="اسکرول به راست"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => scroll('left')}
                disabled={isScrolling}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-blue-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
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
                      
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Award className="w-3 h-3" />
                        پرفروش
                      </div>
                    </div>

                    <div className="p-3 text-gray-800 flex flex-col flex-1 font-yekan">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-bold text-sm mb-3 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors h-10 leading-5">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : ''}`} 
                            />
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
                            <div className="text-lg font-bold text-blue-600">
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

                      <Link
                        href={`/product/${product.slug}`}
                        className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl text-center text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        مشاهده
                      </Link>
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