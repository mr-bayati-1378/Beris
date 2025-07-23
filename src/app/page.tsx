import Image from "next/image";
import Link from 'next/link';
import { headers } from 'next/headers';
import CategorySlider from '@/components/CategorySlider';
import HeroSlider from '@/components/HeroSlider';
import BrandPartners from '@/components/BrandPartners';
import TopRatedProductsSlider from '@/components/TopRatedProductsSlider';
import ConsultationWidget from '@/components/ConsultationWidget';
import DiscountSlider from '@/components/DiscountSlider';
import { formatPriceWithFont, toPersianNumerals } from '@/lib/utils';
import {
  FaArrowLeft,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaCreditCard,
  FaStar,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaTruck,
  FaCheckCircle,
  FaAward,
  FaHeart,
  FaArrowRight,
  FaRocket,
  FaGift,
  FaPercent
} from 'react-icons/fa';
import AddToCartButton from '@/components/AddToCartButton';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  categoryL3Id: number;
  isActive: boolean;
}

interface CategoryWithProducts {
  id: number;
  name: string;
  slug: string;
  products: {
    id: number;
    name: string;
    price: number;
    slug: string;
    img: string;
    brand?: string;
    description?: string;
  }[];
  productCount: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

async function getProducts() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/products?limit=8`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategoriesWithProducts() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/categories/with-products`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch categories with products:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/categories/tree`, {
      cache: 'no-store',
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    if (!res.ok) {
      console.error('Failed to fetch categories:', res.status, res.statusText);
      // Return fallback categories
      return [
        { id: 1, name: 'سرنگ و تزریقات', slug: 'سرنگ-و-تزریقات' },
        { id: 2, name: 'ملزومات جراحی', slug: 'ملزومات-جراحی' },
        { id: 3, name: 'منسوجات پزشکی', slug: 'منسوجات-پزشکی' },
        { id: 4, name: 'گاز و پانسمان', slug: 'گاز-و-پانسمان' },
        { id: 5, name: 'دستکش پزشکی', slug: 'دستکش-پزشکی' },
        { id: 6, name: 'تجهیزات اتاق عمل', slug: 'تجهیزات-اتاق-عمل' }
      ];
    }
    
    const data = await res.json();
    return data.categories?.slice(0, 6) || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return fallback categories
    return [
      { id: 1, name: 'سرنگ و تزریقات', slug: 'سرنگ-و-تزریقات' },
      { id: 2, name: 'ملزومات جراحی', slug: 'ملزومات-جراحی' },
      { id: 3, name: 'منسوجات پزشکی', slug: 'منسوجات-پزشکی' },
      { id: 4, name: 'گاز و پانسمان', slug: 'گاز-و-پانسمان' },
      { id: 5, name: 'دستکش پزشکی', slug: 'دستکش-پزشکی' },
      { id: 6, name: 'تجهیزات اتاق عمل', slug: 'تجهیزات-اتاق-عمل' }
    ];
  }
}

export default async function Home() {
  const [allProducts, categoriesWithProducts, categories] = await Promise.all([
    getProducts(),
    getCategoriesWithProducts(),
    getCategories(),
  ]);

  // Get active products only
  const activeProducts = allProducts.filter(product => product.isActive);
  
  // Get featured products (first 8)
  const featuredProducts = activeProducts.slice(0, 8);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Slider */}
      <div className="app-container">
        <HeroSlider />
      </div>

      {/* Amazing Offers Slider */}
      <div className="app-container">
        <DiscountSlider />
      </div>

      {/* Enhanced Quick Categories */}
      <section className="app-container">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaRocket className="text-blue-500" />
            دسته‌بندی‌های محبوب
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">گروه کالاهای ما</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg sm:text-xl">
            انواع تجهیزات پزشکی و مصرفی را از دسته‌بندی‌های مختلف انتخاب کنید
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative h-40 sm:h-48 md:h-56 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeIn card-hover z-[10] pointer-events-auto"
              style={{ 
                animationDelay: `${index * 150}ms`,
                position: 'relative',
                isolation: 'isolate'
              }}
            >
              {/* Enhanced Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                index % 6 === 0 ? 'from-blue-500 via-blue-600 to-purple-700' :
                index % 6 === 1 ? 'from-green-500 via-green-600 to-teal-700' :
                index % 6 === 2 ? 'from-purple-500 via-purple-600 to-pink-700' :
                index % 6 === 3 ? 'from-orange-500 via-orange-600 to-red-700' :
                index % 6 === 4 ? 'from-teal-500 via-teal-600 to-cyan-700' :
                'from-pink-500 via-pink-600 to-rose-700'
              }`}></div>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
              
              {/* Hover Animation Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/20 transition-all duration-300"></div>
              
              {/* Content */}
              <div className="relative h-full flex items-center justify-center p-4 sm:p-6 md:p-8 text-white">
                <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                  {/* Enhanced Icon Container */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/35 group-hover:border-white/50 transition-all duration-300 shadow-xl">
                    {/* Dynamic Icons based on category */}
                    <div className="text-2xl sm:text-3xl md:text-4xl">
                      {category.name.includes('سرنگ') || category.name.includes('تزریق') ? '💉' :
                       category.name.includes('جراحی') || category.name.includes('اتاق') ? '🔬' :
                       category.name.includes('گاز') || category.name.includes('پانسمان') ? '🩹' :
                       category.name.includes('دستکش') ? '🧤' :
                       category.name.includes('ماسک') ? '😷' :
                       '🏥'}
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg leading-tight line-clamp-2">
                    {category.name}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-sm sm:text-base text-white/90 font-medium">
                      مشاهده محصولات
                    </span>
                    <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/90 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Products */}
      <div className="app-container">
        <TopRatedProductsSlider />
      </div>

      {/* Why Choose Us - Enhanced */}
      <div className="app-container">
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 sm:py-12 rounded-2xl">
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FaAward className="text-blue-500" />
              چرا بریس؟
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">مزایای خرید از بریس</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg sm:text-xl">
              دلایل انتخاب فروشگاه بریس برای خرید تجهیزات پزشکی
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: FaShippingFast,
                title: 'ارسال رایگان',
                description: 'ارسال رایگان برای سفارشات بالای ۱۰ میلیون تومان',
                color: 'from-green-500 to-emerald-600',
                bgColor: 'bg-green-100'
              },
              {
                icon: FaShieldAlt,
                title: 'ضمانت اصالت',
                description: 'تمام محصولات دارای ضمانت اصالت و کیفیت',
                color: 'from-blue-500 to-indigo-600',
                bgColor: 'bg-blue-100'
              },
              {
                icon: FaHeadset,
                title: 'پشتیبانی ۲۴/۷',
                description: 'پشتیبانی و راهنمایی در تمام ساعات شبانه‌روز',
                color: 'from-purple-500 to-violet-600',
                bgColor: 'bg-purple-100'
              },
              {
                icon: FaCreditCard,
                title: 'پرداخت امن',
                description: 'پرداخت آنلاین امن با تمام کارت‌های بانکی',
                color: 'from-orange-500 to-red-600',
                bgColor: 'bg-orange-100'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group text-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 animate-slideInUp card-hover border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`text-2xl sm:text-3xl bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 leading-tight">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Stats Section - Enhanced */}
      <section className="app-container">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 price-text group-hover:scale-110 transition-transform duration-300">{toPersianNumerals('+۱۰۰۰')}</div>
              <div className="text-sm sm:text-base md:text-lg text-white/90">محصول متنوع</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 price-text group-hover:scale-110 transition-transform duration-300">{toPersianNumerals('+۵۰۰۰')}</div>
              <div className="text-sm sm:text-base md:text-lg text-white/90">مشتری راضی</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 price-text group-hover:scale-110 transition-transform duration-300">{toPersianNumerals('۹۸٪')}</div>
              <div className="text-sm sm:text-base md:text-lg text-white/90">رضایت مشتری</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 price-text group-hover:scale-110 transition-transform duration-300">{toPersianNumerals('۲۴/۷')}</div>
              <div className="text-sm sm:text-base md:text-lg text-white/90">پشتیبانی</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Enhanced */}
      <div className="app-container">
        <section className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 py-8 sm:py-12 rounded-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FaGift className="text-yellow-300" />
              پیشنهادات ویژه
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">عضویت در خبرنامه</h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-white/90 max-w-2xl mx-auto">
              از جدیدترین محصولات و تخفیف‌های ویژه آگاه شوید
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="tel"
                  placeholder="شماره تلفن همراه"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 text-base sm:text-lg shadow-lg"
                />
                <button className="btn btn-white text-green-600 hover:bg-white/90 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  عضویت
                </button>
              </div>
              <p className="text-sm sm:text-base text-white/70 mt-4 sm:mt-6">
                با عضویت در خبرنامه، شرایط و قوانین را می‌پذیرید
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Brand Partners */}
      <div className="app-container">
        <BrandPartners />
      </div>

      {/* Contact CTA - Enhanced */}
      <div className="app-container">
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12 sm:py-16 rounded-3xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FaHeadset className="text-blue-300" />
              پشتیبانی ۲۴/۷
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">نیاز به مشاوره دارید؟</h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-white/90 max-w-3xl mx-auto">
              تیم متخصص ما آماده راهنمایی و مشاوره رایگان است
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <a 
                href="tel:09029161829"
                className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaPhone className="text-xl" />
                تماس تلفنی
              </a>
              <a 
                href="https://wa.me/989029161829"
                className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                <FaWhatsapp className="text-xl" />
                واتساپ
              </a>
              <a 
                href="mailto:beris.medical@gmail.com"
                className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                style={{ 
                  position: 'relative',
                  zIndex: 1000,
                  isolation: 'isolate' 
                }}
              >
                <FaEnvelope className="text-xl" />
                ایمیل
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* گجت مشاوره */}
      <ConsultationWidget />
    </div>
  );
}
