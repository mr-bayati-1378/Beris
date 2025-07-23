'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaStar, FaShoppingCart } from 'react-icons/fa';
import AddToCartButton from './AddToCartButton';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  slug: string;
}

interface CategorySliderProps {
  categoryName: string;
  categorySlug: string;
  products: Product[];
  categoryImage: string;
}

// کامپوننت کارت محصول دسته‌بندی
function CategoryProductCard({ product, slidesToShow }: { product: Product; slidesToShow: number }) {
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
      className="group/product flex-shrink-0 rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 font-yekan"
      style={{ width: `${100 / slidesToShow}%` }}
    >
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.img || '/default-product.png'}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover/product:scale-110"
          />
          
          {/* Badge */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            ویژه
          </div>

          {/* Cart Status Badge */}
          {productInCart && (
            <div className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1">
              <FaShoppingCart className="w-3 h-3" />
              در سبد
            </div>
          )}
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/product:opacity-100 transition-all flex items-center justify-center">
            <span className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-lg">
              مشاهده سریع
            </span>
          </div>
        </div>
      </Link>
      
      <Link href={`/product/${product.slug}`}>
        <h4 className="mb-4 line-clamp-2 text-base font-bold text-gray-800 transition-colors group-hover/product:text-blue-600 min-h-[3rem] leading-relaxed">
          {product.name}
        </h4>
      </Link>
      
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold text-blue-600 price-text">
          {product.price.toLocaleString('fa-IR')} تومان
        </span>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
      </div>
      
      <AddToCartButton 
        productId={product.id}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold transform hover:scale-105 transition-all shadow-lg hover:shadow-xl text-base"
        showIcon={true}
      >
        {productInCart ? 'در سبد شما' : 'افزودن به سبد'}
      </AddToCartButton>
    </div>
  );
}

export default function CategorySlider({
  categoryName,
  categorySlug,
  products,
  categoryImage,
}: CategorySliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle responsive slides
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 768) {
        setSlidesToShow(2);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlides = Math.max(0, products.length - slidesToShow);

  const nextSlide = () => {
    if (currentSlide < maxSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-screen-2xl px-8 md:px-16">
        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Category Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="relative z-10 flex items-center justify-between p-8 text-white font-yekan">
              <div className="flex flex-col items-center text-center flex-1">
                <div className="relative mb-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white shadow-2xl bg-white/20 backdrop-blur-sm">
                  <Image
                    src={categoryImage || '/default-category.png'}
                    alt={categoryName}
                      width={80}
                      height={80}
                    className="h-full w-full object-cover"
                  />
                  </div>
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl animate-pulse" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">{categoryName}</h3>
                  <p className="text-white/90 text-lg font-light text-center">
                    {products.length} محصول موجود
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link
                  href={`/category/${categorySlug}`}
                  className="group/link flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 text-base font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  <span>مشاهده همه</span>
                  <FaChevronLeft className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          {/* Products Slider */}
          <div className="p-8">
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute -left-8 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl transition-all hover:bg-blue-600 hover:text-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 border border-gray-200"
              >
                <FaChevronRight className="h-6 w-6" />
              </button>
              
              <button
                onClick={nextSlide}
                disabled={currentSlide >= maxSlides}
                className="absolute -right-8 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl transition-all hover:bg-blue-600 hover:text-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 border border-gray-200"
              >
                <FaChevronLeft className="h-6 w-6" />
              </button>

              {/* Products Grid */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-out gap-8"
                  style={{
                    transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`
                  }}
                >
                  {products.map((product, index) => (
                    <CategoryProductCard
                      key={product.id}
                      product={product}
                      slidesToShow={slidesToShow}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            {maxSlides > 0 && (
              <div className="mt-10 flex justify-center gap-3">
                {Array.from({ length: maxSlides + 1 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-4 w-4 rounded-full transition-all duration-300 ${
                      currentSlide === i
                        ? 'w-10 bg-gradient-to-r from-blue-600 to-purple-600'
                        : 'bg-gray-300 hover:bg-blue-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        </div>
      </div>
    </section>
  );
}
