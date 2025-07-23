import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import AddToCartButton from '@/components/AddToCartButton';
import { formatPriceWithFont, toPersianNumerals } from '@/lib/utils';
import { Suspense } from 'react';
import ProductsFilters from '@/components/ProductsFilters';
import { FaSearch, FaFilter, FaSort, FaTh, FaList, FaStar, FaEye, FaHeart, FaShoppingCart } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  slug: string;
  brand?: string;
  description?: string;
  comparePrice?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  stock?: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function getProducts(page: number = 1, filters: any = {}): Promise<ProductsResponse> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      ...filters
    });
    
    const res = await fetch(`${protocol}://${host}/api/products?${params}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status, res.statusText);
      return {
        products: [],
        pagination: { page: 1, limit: 12, total: 0, pages: 0 }
      };
    }
    
    const data = await res.json();
    return {
      products: data.products || [],
      pagination: data.pagination || { page: 1, limit: 12, total: 0, pages: 0 }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    };
  }
}

// کامپوننت پاگینیشن
function Pagination({ 
  pagination, 
  searchParams 
}: { 
  pagination: ProductsResponse['pagination'],
  searchParams: { [key: string]: string | undefined }
}) {
  const { page, pages, total } = pagination;
  
  if (pages <= 1) return null;

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });
    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    }
    return `?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages);
    } else {
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  return (
    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600">
        نمایش {toPersianNumerals(((page - 1) * 12) + 1)} تا {toPersianNumerals(Math.min(page * 12, total))} از {toPersianNumerals(total)} محصول
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        {page > 1 && (
          <Link
            href={buildUrl(page - 1)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            قبلی
          </Link>
        )}
        
        {getPageNumbers().map((pageNum, index) => (
          typeof pageNum === 'number' ? (
            <Link
              key={pageNum}
              href={buildUrl(pageNum)}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                pageNum === page
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
            >
              {toPersianNumerals(pageNum)}
            </Link>
          ) : (
            <span key={index} className="px-2 py-2 text-sm text-gray-400">
              {pageNum}
            </span>
          )
        ))}
        
        {page < pages && (
          <Link
            href={buildUrl(page + 1)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            بعدی
          </Link>
        )}
      </div>
    </div>
  );
}

// کامپوننت لودینگ
function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="rounded-xl bg-white p-3 sm:p-4 shadow-md animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Search Box Component
function SearchBox({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="relative max-w-3xl mx-auto">
        <div className="relative group">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search || ''}
            placeholder="جستجو در محصولات، برند، دسته‌بندی..."
            className="w-full px-6 py-5 pr-28 pl-20 text-gray-900 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-3xl shadow-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 text-base sm:text-lg hover:shadow-2xl hover:border-gray-300 group-hover:border-primary/50"
          />
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaSearch className="h-5 w-5 text-white" />
            </div>
          </div>
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
              جستجو
            </div>
          </button>
        </div>
        
        {/* Quick Search Tags */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {['سرنگ', 'دستکش', 'ماسک', 'گاز', 'پانسمان', 'ملزومات جراحی'].map((tag) => (
            <Link
              key={tag}
              href={`/products?search=${encodeURIComponent(tag)}`}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 text-sm rounded-2xl hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-300 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced Products Grid Component
async function ProductsGrid({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined }
}) {
  const page = parseInt(searchParams.page || '1');
  const data = await getProducts(page, searchParams);
  const { products, pagination } = data;

  return (
    <>
      {/* Search Box */}
      <SearchBox searchParams={searchParams} />
      
      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-7M6 9h7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">محصولی یافت نشد</h3>
            <p className="text-gray-500">متاسفانه محصولی با این مشخصات پیدا نشد</p>
          </div>
        ) : (
          products.map(product => (
            <div
              key={product.id}
              className="group rounded-2xl bg-white p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-2 mobile-product-card relative overflow-hidden"
            >
              {/* Product Image Container */}
              <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-gray-50">
                <Image
                  src={product.img || '/default-product.png'}
                  alt={product.name}
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                
                {/* Enhanced Discount Badge */}
                {(product.hasDiscount && product.discountPercent) || (product.comparePrice && product.comparePrice > product.price) ? (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1">
                      <span>🔥</span>
                      <span>
                        {product.hasDiscount && product.discountPercent 
                          ? `${product.discountPercent}% تخفیف`
                          : `${Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% تخفیف`
                        }
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Stock Badge */}
                {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      فقط {product.stock} عدد
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                  <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors shadow-md">
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors shadow-md">
                    <FaHeart className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-3">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-gray-800 transition-colors group-hover:text-blue-600 leading-tight">
                    {product.name}
                  </h3>
                </Link>
                
                {product.brand && (
                  <p className="text-xs text-gray-500 font-medium">{product.brand}</p>
                )}

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating!)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}
                
                {/* Enhanced Price Display */}
                <div className="space-y-1">
                  {(product.hasDiscount && product.discountPercent) || (product.comparePrice && product.comparePrice > product.price) ? (
                    <>
                      <span className="block text-xs text-gray-400 line-through price-text">
                        {product.hasDiscount && product.discountPercent
                          ? formatPriceWithFont(Math.round(product.price / (1 - product.discountPercent / 100)))
                          : formatPriceWithFont(product.comparePrice)
                        }
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-red-600 price-text">
                        {formatPriceWithFont(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold text-blue-600 price-text">
                      {formatPriceWithFont(product.price)}
                    </span>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <div className="add-to-cart-mobile">
                  <AddToCartButton 
                    productId={product.id} 
                    className="w-full text-sm py-3 px-4 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
                    showIcon={true}
                  >
                    <span className="block sm:hidden">افزودن</span>
                    <span className="hidden sm:block">افزودن به سبد</span>
                  </AddToCartButton>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} searchParams={searchParams} />
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  // For static generation, provide stable defaults
  const stableSearchParams = searchParams || {};
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 sm:py-8">
        <div className="container mx-auto max-w-screen-2xl px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">محصولات فروشگاه</h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              مجموعه کاملی از تجهیزات پزشکی با بهترین کیفیت و قیمت مناسب
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-screen-2xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-16 rounded-xl mb-6"></div>}>
                <ProductsFilters />
              </Suspense>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ProductsLoading />}>
              <ProductsGrid searchParams={stableSearchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
