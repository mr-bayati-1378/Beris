'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaBoxOpen, FaShippingFast, FaShieldAlt, FaHeadset, FaCreditCard, FaPlay, FaPause, FaStar, FaUsers, FaTruck } from 'react-icons/fa';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
  badge?: string;
  stats?: {
    value: string;
    label: string;
  }[];
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'تجهیزات پزشکی',
    subtitle: 'با کیفیت برتر',
    description: 'فروشگاه آنلاین تجهیزات پزشکی، مصرفی و درمانی با بهترین کیفیت، ارسال رایگان و ضمانت اصالت کالا',
    buttonText: 'مشاهده محصولات',
    buttonLink: '/products',
    backgroundImage: '/hero-bg-1.jpg',
    backgroundColor: 'from-blue-600 via-blue-500 to-purple-600',
    textColor: 'text-white',
    icon: '🏥',
    badge: 'پیشنهاد ویژه',
    stats: [
      { value: '+۱۰۰۰', label: 'محصول متنوع' },
      { value: '۹۸٪', label: 'رضایت مشتری' }
    ]
  },
  {
    id: 2,
    title: 'سرنگ و تزریقات',
    subtitle: 'استریل و ایمن',
    description: 'انواع سرنگ‌ها و سوزن‌های تزریق با بالاترین کیفیت و استاندارد‌های بین‌المللی',
    buttonText: 'خرید سرنگ',
    buttonLink: '/category/injections',
    backgroundImage: '/hero-bg-2.jpg',
    backgroundColor: 'from-green-600 via-green-500 to-teal-600',
    textColor: 'text-white',
    icon: '💉',
    badge: 'محصولات جدید',
    stats: [
      { value: '+۵۰۰', label: 'نوع سرنگ' },
      { value: '۱۰۰٪', label: 'استریل' }
    ]
  },
  {
    id: 3,
    title: 'ملزومات جراحی',
    subtitle: 'حرفه‌ای و دقیق',
    description: 'تجهیزات جراحی با کیفیت بالا، مناسب برای تمام عمل‌های جراحی و پزشکی',
    buttonText: 'خرید ملزومات جراحی',
    buttonLink: '/category/surgical-supplies',
    backgroundImage: '/hero-bg-3.jpg',
    backgroundColor: 'from-purple-600 via-purple-500 to-pink-600',
    textColor: 'text-white',
    icon: '🔬',
    badge: 'تخفیف ویژه',
    stats: [
      { value: '+۲۰۰', label: 'محصول جراحی' },
      { value: '۲۴/۷', label: 'پشتیبانی' }
    ]
  },
  {
    id: 4,
    title: 'منسوجات پزشکی',
    subtitle: 'بهداشتی و ایمن',
    description: 'انواع گاز، پانسمان، دستکش و محصولات بهداشتی با کیفیت بالا و قیمت مناسب',
    buttonText: 'خرید منسوجات',
    buttonLink: '/category/medical-textiles',
    backgroundImage: '/hero-bg-4.jpg',
    backgroundColor: 'from-orange-600 via-orange-500 to-red-600',
    textColor: 'text-white',
    icon: '🧤',
    badge: 'پرفروش‌ترین',
    stats: [
      { value: '+۱۰۰۰', label: 'مشتری راضی' },
      { value: 'رایگان', label: 'ارسال' }
    ]
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered]);

  const handleSlideChange = (direction: 'next' | 'prev' | number) => {
    setIsAutoPlaying(false);
    if (typeof direction === 'number') {
      setCurrentSlide(direction);
    } else {
      setCurrentSlide(prev => {
        if (direction === 'next') {
          return (prev + 1) % heroSlides.length;
        } else {
          return (prev - 1 + heroSlides.length) % heroSlides.length;
        }
      });
    }
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < 50) return;
    handleSlideChange(distance > 0 ? 'next' : 'prev');
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <div 
      ref={sliderRef}
      className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with Parallax Effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.backgroundColor} transition-all duration-1000`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Content Container */}
      <div className="relative h-full z-10">
        <div className="container mx-auto px-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
            {/* Text Content */}
            <div className={`${currentSlideData.textColor} text-center lg:text-right font-yekan`}>
              {/* Badge */}
              {currentSlideData.badge && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-4">
                  <FaStar className="text-yellow-300 text-xs" />
                  {currentSlideData.badge}
                </div>
              )}

              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-xl">
                      <span className="text-3xl sm:text-4xl md:text-5xl animate-bounce">
                        {currentSlideData.icon}
                      </span>
                    </div>
                    <div className="absolute -inset-3 bg-white/10 rounded-full blur-lg animate-pulse" />
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                      {currentSlideData.title}
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-yellow-300 leading-tight">
                      {currentSlideData.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 opacity-95 font-light">
                  {currentSlideData.description}
                </p>
              </div>

              {/* Stats */}
              {currentSlideData.stats && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                  {currentSlideData.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-yellow-300">{stat.value}</div>
                      <div className="text-xs text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-center lg:justify-start mb-6">
                <Link
                  href={currentSlideData.buttonLink}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-base hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaBoxOpen className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                  <span>{currentSlideData.buttonText}</span>
                </Link>
              </div>

              {/* Features Grid - Compact */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center group-hover:bg-yellow-500/30 transition-all duration-300">
                    <FaShippingFast className="text-yellow-300 text-xs group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-medium">ارسال رایگان</span>
                </div>
                <div className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-all duration-300">
                    <FaShieldAlt className="text-green-300 text-xs group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-medium">ضمانت اصالت</span>
                </div>
                <div className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-all duration-300">
                    <FaHeadset className="text-blue-300 text-xs group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-medium">پشتیبانی ۲۴/۷</span>
                </div>
                <div className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-300">
                    <FaCreditCard className="text-purple-300 text-xs group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-medium">پرداخت امن</span>
                </div>
              </div>
            </div>

            {/* Decorative Right Side */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="w-64 h-64 relative">
                  {/* Animated Background Circles */}
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute inset-4 bg-white/5 rounded-full blur-xl animate-pulse delay-1000" />
                  
                  {/* Main Icon Container */}
                  <div className="relative z-10 w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-500 hover:scale-110">
                      <span className="text-6xl animate-bounce hover:animate-pulse transition-all duration-300">
                        {currentSlideData.icon}
                      </span>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 animate-bounce delay-300 hover:bg-white/20 hover:scale-110 transition-all duration-300">
                    <FaUsers className="text-white text-sm hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="absolute bottom-2 left-2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 animate-bounce delay-700 hover:bg-white/20 hover:scale-110 transition-all duration-300">
                    <FaTruck className="text-white text-sm hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={() => handleSlideChange('prev')}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[30] pointer-events-auto group"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:text-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg backdrop-blur-sm">
          <FaChevronRight className="w-4 h-4" />
        </div>
      </button>

      <button
        onClick={() => handleSlideChange('next')}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[30] pointer-events-auto group"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:text-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg backdrop-blur-sm">
          <FaChevronLeft className="w-4 h-4" />
        </div>
      </button>

      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-4 left-4 z-[30] pointer-events-auto group"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border border-white/30">
          {isAutoPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
        </div>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[30] pointer-events-auto">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/80 hover:scale-110'
            }`}
            aria-label={`اسلاید ${index + 1}`}
            style={{ touchAction: 'manipulation' }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-white to-yellow-300 transition-all duration-[5000ms] ease-linear rounded-r-full"
          style={{
            width: isAutoPlaying && !isHovered ? '100%' : '0%',
            transitionProperty: 'width',
          }}
        />
      </div>
    </div>
  );
} 