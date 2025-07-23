'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter, Star, Heart, Share2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddToCartButton } from '@/components';
import { formatPriceWithFont, formatPriceSimple } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent?: Category;
}

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  description: string | null;
  brand: string | null;
  slug: string;
  img: string;
  images: string[];
  stock: number;
  averageRating: number;
  reviewCount: number;
  hasDiscount?: boolean;
  discountPercent?: number;
}

interface CategoryPageClientProps {
  initialData: any;
  slug: string;
  searchParams?: { [key: string]: string | undefined };
}

export default function CategoryPageClient({ initialData, slug, searchParams }: CategoryPageClientProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states - درست کردن مقادیر اولیه از searchParams
  const [selectedSort, setSelectedSort] = useState(searchParams?.sortBy || 'newest');
  const [selectedBrand, setSelectedBrand] = useState(searchParams?.brand || '');
  const [minPrice, setMinPrice] = useState(searchParams?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchParams?.maxPrice || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams?.inStock === 'true');
  const [discountOnly, setDiscountOnly] = useState(searchParams?.hasDiscount === 'true');

  const router = useRouter();

  useEffect(() => {
    // وقتی searchParams تغییر می‌کند، داده‌ها را بازگیری کن
    if (searchParams && Object.keys(searchParams).length > 0) {
      fetchFilteredData();
    }
  }, [searchParams, fetchFilteredData]);

  async function fetchFilteredData() {
    if (!searchParams || Object.keys(searchParams).length === 0) {
      setData(initialData);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          queryParams.set(key, value);
        }
      });
      
      const res = await fetch(`/api/category/${slug}?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFilters(newFilters: Record<string, string>) {
    const current = new URLSearchParams();
    
    // اضافه کردن مقادیر موجود
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) current.set(key, value);
      });
    }
    
    // به‌روزرسانی پارامترها
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    // Navigate to new URL
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/category/${slug}${query}`);
  }

  function handleSortChange(newSort: string) {
    setSelectedSort(newSort);
    updateFilters({ sortBy: newSort });
  }

  function handleBrandChange(brand: string) {
    setSelectedBrand(brand);
    updateFilters({ brand });
  }

  function handlePriceFilter() {
    updateFilters({ 
      minPrice: minPrice || '',
      maxPrice: maxPrice || ''
    });
  }

  function handleStockFilter(checked: boolean) {
    setInStockOnly(checked);
    updateFilters({ inStock: checked ? 'true' : '' });
  }

  function handleDiscountFilter(checked: boolean) {
    setDiscountOnly(checked);
    updateFilters({ hasDiscount: checked ? 'true' : '' });
  }

  function clearFilters() {
    setSelectedSort('newest');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setDiscountOnly(false);
    router.push(`/category/${slug}`);
  }

  function renderBreadcrumbs(category: Category | undefined) {
    if (!category) return null;
    const crumbs: { name: string; slug: string }[] = [];
    let current: any = category;
    while (current) {
      crumbs.unshift({ name: current.name, slug: current.slug });
      current = current.parent;
    }
    return (
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        {crumbs.map((c, i) => (
          <span key={c.slug} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {i === crumbs.length - 1 ? (
              <span className="font-bold text-primary">{c.name}</span>
            ) : (
              <Link href={`/category/${c.slug}`} className="hover:text-primary transition-colors">
                {c.name}
              </Link>
            )}
          </span>
        ))}
      </motion.nav>
    );
  }

  // L1: Show L2 children
  if (data.type === 'L1') {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderBreadcrumbs(data.category)}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-3xl font-bold text-gray-800 md:text-4xl text-center"
        >
          {data.category.name}
        </motion.h1>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {data.children.map((cat: Category, index: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center rounded-xl bg-white p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-2"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <ChevronLeft className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-center font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // L2: Show L3 children
  if (data.type === 'L2') {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderBreadcrumbs(data.category)}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-3xl font-bold text-gray-800 md:text-4xl text-center"
        >
          {data.category.name}
        </motion.h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {data.children.map((cat: Category, index: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center rounded-xl bg-white p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-2"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <ChevronLeft className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-center font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Show products with sidebar filters
  if (data.products) {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderBreadcrumbs(data.category)}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-3xl font-bold text-gray-800 md:text-4xl text-center"
        >
          {data.category.name}
        </motion.h1>
        
        {/* Mobile Filter Toggle */}
        <div className="mb-6 lg:hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Filter className="h-5 w-5" />
            فیلترها
          </motion.button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-4">
              
              {/* Filters Section */}
              {data.filters && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    فیلترها
                  </h3>
                  
                  {/* Brand Filter */}
                  {data.filters.brands.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">برند</label>
                      <select 
                        value={selectedBrand}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white shadow-sm"
                      >
                        <option value="">همه برندها</option>
                        {data.filters.brands.map((brand: string) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      {selectedBrand && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                            {selectedBrand}
                            <button
                              onClick={() => handleBrandChange('')}
                              className="mr-2 text-primary hover:text-primary/80 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Price Range Filter */}
                  {data.filters.priceRange.max > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">محدوده قیمت (تومان)</label>
                      <div className="space-y-4">
                        <input 
                          type="number" 
                          placeholder="حداقل قیمت"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm"
                        />
                        <input 
                          type="number" 
                          placeholder="حداکثر قیمت"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePriceFilter}
                          className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl text-sm hover:shadow-lg transition-all duration-300 font-medium"
                        >
                          اعمال فیلتر قیمت
                        </motion.button>
                        {(minPrice || maxPrice) && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                            فیلتر فعال: {minPrice && `از ${formatPriceSimple(parseInt(minPrice))}`} {maxPrice && `تا ${formatPriceSimple(parseInt(maxPrice))}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Filters */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">فیلترهای سریع</h4>
                    
                    {/* Stock Filter */}
                    <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={inStockOnly}
                        onChange={(e) => handleStockFilter(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <span className="mr-3 text-sm text-gray-700 font-medium">فقط کالاهای موجود</span>
                    </label>

                    {/* Discount Filter */}
                    <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={discountOnly}
                        onChange={(e) => handleDiscountFilter(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500" 
                      />
                      <span className="mr-3 text-sm text-gray-700 font-medium">فقط کالاهای تخفیف‌دار</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Clear Filters Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="w-full text-sm text-red-600 hover:text-red-700 transition-colors py-3 bg-red-50 hover:bg-red-100 rounded-xl font-medium"
                >
                  پاک کردن همه فیلترها
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Loading overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[20]"
                >
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile-First Responsive Sorting Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  مرتب‌سازی بر اساس
                </h3>
                
                {/* Mobile Dropdown */}
                <div className="lg:hidden">
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white shadow-sm"
                  >
                    <option value="newest">جدیدترین</option>
                    <option value="popular">پرفروش‌ترین</option>
                    <option value="price-asc">ارزان‌ترین</option>
                    <option value="price-desc">گران‌ترین</option>
                    <option value="discount">بیشترین تخفیف</option>
                  </select>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden lg:flex gap-3">
                  {[
                    { value: 'newest', label: 'جدیدترین' },
                    { value: 'popular', label: 'پرفروش‌ترین' },
                    { value: 'price-asc', label: 'ارزان‌ترین' },
                    { value: 'price-desc', label: 'گران‌ترین' },
                    { value: 'discount', label: 'بیشترین تخفیف' },
                  ].map((sort) => (
                    <motion.button
                      key={sort.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSortChange(sort.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedSort === sort.value
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      {sort.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {data.products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center text-gray-700"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-xl font-semibold mb-4">محصولی با این مشخصات یافت نشد</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  پاک کردن فیلترها
                </motion.button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                  <span className="font-medium">{data.products.length}</span> محصول یافت شد
                </div>
                {/* Enhanced Mobile-First Product Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {data.products.map((product: Product, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="group relative flex flex-col rounded-2xl bg-white p-4 shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:border-primary/30 h-full"
                    >
                      {/* Discount Badge */}
                      {(product.hasDiscount && product.discountPercent) || (product.comparePrice && product.comparePrice > product.price) ? (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 left-3 z-[15]"
                        >
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg">
                            {product.hasDiscount && product.discountPercent 
                              ? `${product.discountPercent}% تخفیف`
                              : `${Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% تخفیف`
                            }
                          </span>
                        </motion.div>
                      ) : null}

                      {/* Stock Badge */}
                      {product.stock === 0 && (
                        <div className="absolute top-3 right-3 z-[15]">
                          <span className="rounded-xl bg-red-100 px-3 py-1 text-xs text-red-800 font-bold border border-red-200">
                            ناموجود
                          </span>
                        </div>
                      )}

                      {/* Quick Action Buttons */}
                      <div className="absolute top-3 right-3 z-[15] opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </motion.button>
                      </div>

                      {/* Enhanced Product Image for Mobile */}
                      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
                        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          <Image
                            src={product.img}
                            alt={product.name}
                            fill
                            className="object-cover p-3 transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          {/* View Product Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              whileHover={{ scale: 1 }}
                              className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <Eye className="w-5 h-5 text-gray-800" />
                            </motion.div>
                          </div>
                        </div>
                      </Link>

                      {/* Product Info - Flexible container */}
                      <div className="flex flex-col flex-1 space-y-3">
                        {/* Product Title */}
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2.5rem] group-hover:text-primary">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Brand */}
                        {product.brand && (
                          <p className="text-xs text-gray-500 font-medium hidden sm:block">برند: {product.brand}</p>
                        )}

                        {/* Rating */}
                        {product.averageRating > 0 && (
                          <div className="flex items-center gap-1 hidden sm:flex">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < Math.round(product.averageRating) ? 'fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviewCount})</span>
                          </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `فقط ${product.stock} عدد` : 'ناموجود'}
                          </span>
                        </div>

                        {/* Flexible spacer to push price and button to bottom */}
                        <div className="flex-1"></div>

                        {/* Enhanced Price Display */}
                        <div className="space-y-2">
                          {(product.hasDiscount && product.discountPercent) || (product.comparePrice && product.comparePrice > product.price) ? (
                            <>
                              <span className="block text-xs text-gray-400 line-through price-text hidden sm:block">
                                {product.hasDiscount && product.discountPercent
                                  ? formatPriceWithFont(Math.round(product.price / (1 - product.discountPercent / 100)))
                                  : formatPriceWithFont(product.comparePrice!)
                                }
                              </span>
                              <div className="flex flex-col space-y-1">
                                <span className="text-lg font-bold text-red-600 price-text">
                                  {formatPriceWithFont(product.price)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col space-y-1">
                              <span className="text-lg font-bold text-primary price-text">
                                {formatPriceWithFont(product.price)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Add to Cart Button - Always at bottom */}
                        <div className="pt-3 mt-auto">
                          <AddToCartButton 
                            productId={product.id} 
                            className="w-full text-sm py-3 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-xl font-bold transition-all duration-300 hover:shadow-lg group-hover:shadow-xl"
                            showIcon={false}
                          >
                            افزودن به سبد
                          </AddToCartButton>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
} 