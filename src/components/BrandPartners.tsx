'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaAward, FaStar } from 'react-icons/fa';
import TrustStats from './TrustStats';

interface Brand {
  id: number;
  name: string;
  logo: string;
  description: string;
  category: string;
  trust: number;
}

const BrandPlaceholder = ({ name }: { name: string }) => (
  <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
    <span className="text-2xl font-bold text-gray-600">{name.charAt(0)}</span>
  </div>
);

const brands: Brand[] = [
  {
    id: 1,
    name: 'Omron',
    logo: '',
    description: 'تولیدکننده پیشرو در زمینه تجهیزات پزشکی خانگی و فشار سنج',
    category: 'فشار سنج',
    trust: 98
  },
  {
    id: 2,
    name: 'Beurer',
    logo: '',
    description: 'تولیدکننده تجهیزات پزشکی با کیفیت آلمانی و استاندارد اروپا',
    category: 'تجهیزات دیجیتال',
    trust: 96
  },
  {
    id: 3,
    name: 'Microlife',
    logo: '',
    description: 'تولیدکننده دستگاه‌های دقیق اندازه‌گیری و ترمومتر',
    category: 'ترمومتر',
    trust: 94
  },
  {
    id: 4,
    name: 'Rossmax',
    logo: '',
    description: 'تولیدکننده تجهیزات پزشکی با تکنولوژی پیشرفته سوئیسی',
    category: 'دستگاه تنفسی',
    trust: 95
  },
  {
    id: 5,
    name: 'Medisana',
    logo: '',
    description: 'تولیدکننده تجهیزات پزشکی با استانداردهای جهانی اروپا',
    category: 'ترازوی دیجیتال',
    trust: 97
  },
  {
    id: 6,
    name: 'Hartmann',
    logo: '',
    description: 'تولیدکننده محصولات پانسمان و مراقبت از زخم',
    category: 'پانسمان',
    trust: 99
  },
  {
    id: 7,
    name: '3M Medical',
    logo: '',
    description: 'تولیدکننده چسب‌های پزشکی و محصولات پیشرفته',
    category: 'چسب پزشکی',
    trust: 100
  },
  {
    id: 8,
    name: 'BD Medical',
    logo: '',
    description: 'تولیدکننده سرنگ و سوزن‌های تزریق استریل',
    category: 'سرنگ و سوزن',
    trust: 98
  }
];

const BrandPartners = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slidesToShow, setSlidesToShow] = useState(4);

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

  const maxSlides = Math.max(0, brands.length - slidesToShow);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => prev < maxSlides ? prev + 1 : 0);
  }, [maxSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => prev > 0 ? prev - 1 : maxSlides);
  }, [maxSlides]);

  useEffect(() => {
    if (isAutoPlaying) {
      const timer = setInterval(nextSlide, 4000);
      return () => clearInterval(timer);
    }
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="bg-white py-16 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaAward className="text-blue-500" />
            برندهای مطمئن
          </div>
          <h2 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">
            مشتریان ما
          </h2>
          <p className="text-gray-600 text-base">
            ما با بهترین کلینیک ها همکاری می‌کنیم
          </p>
        </div>

        <div
          className="relative group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute -left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg border border-gray-200 transition-all hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <FaChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide >= maxSlides}
            className="absolute -right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg border border-gray-200 transition-all hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <FaChevronRight className="h-5 w-5" />
          </button>

          {/* Brands Slider */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div 
              className="flex transition-transform duration-500 ease-out gap-6 p-6"
              style={{
                transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`
              }}
            >
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="group/brand relative flex-shrink-0 rounded-lg bg-gray-50 p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white"
                  style={{ width: `${100 / slidesToShow}%` }}
                >
                  {/* Trust Badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold z-50 shadow-md">
                    <FaStar className="inline mr-1 text-yellow-300" />
                    {brand.trust}%
                  </div>

                  {/* Logo */}
                  <div className="relative mb-4 h-16 overflow-hidden rounded-lg bg-white p-3 shadow-sm">
                    {brand.logo && brand.logo.trim() !== '' ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain filter grayscale transition-all duration-300 group-hover/brand:grayscale-0"
                      />
                    ) : (
                      <BrandPlaceholder name={brand.name} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="mb-2 text-base font-bold text-gray-800 transition-colors group-hover/brand:text-blue-600">
                      {brand.name}
                    </h3>
                    
                    <div className="mb-3 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {brand.category}
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {brand.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          {maxSlides > 0 && (
            <div className="mt-8 flex justify-center gap-3">
              {Array.from({ length: maxSlides + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentSlide === i
                      ? 'w-10 bg-blue-500'
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <TrustStats />
      </div>
    </section>
  );
};

export default BrandPartners;
