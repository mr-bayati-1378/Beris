'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFilter, FaSort, FaTimes, FaSearch, FaStar, FaFire, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FilterData {
  brands: string[];
  categories: Array<{
    slug: string;
    name: string;
    count: number;
    parent: string;
    parentSlug: string;
    grandParent: string;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
  counts: {
    total: number;
    discounted: number;
    inStock: number;
  };
}

export default function ProductsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    hasDiscount: searchParams.get('hasDiscount') === 'true',
    inStock: searchParams.get('inStock') === 'true',
  });

  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    features: true
  });

  // Fetch filter data
  useEffect(() => {
    async function fetchFilters() {
      try {
        const response = await fetch('/api/products/filters');
        if (response.ok) {
          const data = await response.json();
          setFilterData(data);
        }
      } catch (error) {
        console.error('خطا در دریافت فیلترها:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilters();
  }, []);

  const updateFilters = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Build URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        params.set(k, v.toString());
      }
    });
    
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      sortBy: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      hasDiscount: false,
      inStock: false,
    });
    router.push('/products');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.hasDiscount) count++;
    if (filters.inStock) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaFilter className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">فیلتر و مرتب‌سازی</h3>
            <p className="text-sm text-gray-600">
              {filterData ? `${filterData.counts.total} محصول موجود` : 'محصولات را بر اساس نیاز خود فیلتر کنید'}
            </p>
          </div>
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
            پاک کردن
          </button>
        )}
      </div>

      {/* Sort Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <FaSort className="text-gray-500" />
          <span className="font-medium text-gray-700">مرتب‌سازی</span>
        </div>
        <select 
          value={filters.sortBy}
          onChange={(e) => updateFilters('sortBy', e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
        >
          <option value="">جدیدترین</option>
          <option value="price_asc">قیمت: کم به زیاد</option>
          <option value="price_desc">قیمت: زیاد به کم</option>
          <option value="rating">بهترین امتیاز</option>
          <option value="popular">پرفروش‌ترین</option>
        </select>
      </div>

      {/* Category Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaSearch className="text-blue-600 w-4 h-4" />
            </div>
            <span className="font-medium text-gray-700">دسته‌بندی</span>
            {filters.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                انتخاب شده
              </span>
            )}
          </div>
          {expandedSections.category ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {expandedSections.category && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl">
            <select 
              value={filters.category}
              onChange={(e) => updateFilters('category', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
            >
              <option value="">همه دسته‌ها</option>
              {filterData?.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Brand Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FaStar className="text-green-600 w-4 h-4" />
            </div>
            <span className="font-medium text-gray-700">برند</span>
            {filters.brand && (
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                انتخاب شده
              </span>
            )}
          </div>
          {expandedSections.brand ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {expandedSections.brand && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl">
            <select 
              value={filters.brand}
              onChange={(e) => updateFilters('brand', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
            >
              <option value="">همه برندها</option>
              {filterData?.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-sm font-bold">₺</span>
            </div>
            <span className="font-medium text-gray-700">محدوده قیمت</span>
            {(filters.minPrice || filters.maxPrice) && (
              <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                تنظیم شده
              </span>
            )}
          </div>
          {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {expandedSections.price && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">از</label>
                <input 
                  type="number" 
                  placeholder={filterData ? `حداقل ${filterData.priceRange.min.toLocaleString('fa-IR')}` : "حداقل قیمت"} 
                  value={filters.minPrice}
                  onChange={(e) => updateFilters('minPrice', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تا</label>
                <input 
                  type="number" 
                  placeholder={filterData ? `حداکثر ${filterData.priceRange.max.toLocaleString('fa-IR')}` : "حداکثر قیمت"}
                  value={filters.maxPrice}
                  onChange={(e) => updateFilters('maxPrice', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaFire className="text-orange-600 w-4 h-4" />
            </div>
            <span className="font-medium text-gray-700">ویژگی‌ها</span>
            {(filters.hasDiscount || filters.inStock) && (
              <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                انتخاب شده
              </span>
            )}
          </div>
          {expandedSections.features ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {expandedSections.features && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
            <button 
              onClick={() => updateFilters('hasDiscount', !filters.hasDiscount)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                filters.hasDiscount 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FaFire className={`w-4 h-4 ${filters.hasDiscount ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">فقط تخفیف‌دار</span>
              </div>
              {filterData && (
                <span className="text-sm text-gray-500">({filterData.counts.discounted})</span>
              )}
              {filters.hasDiscount && <FaCheck className="w-4 h-4 text-blue-600" />}
            </button>
            
            <button 
              onClick={() => updateFilters('inStock', !filters.inStock)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                filters.inStock 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FaCheck className={`w-4 h-4 ${filters.inStock ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">فقط موجود</span>
              </div>
              {filterData && (
                <span className="text-sm text-gray-500">({filterData.counts.inStock})</span>
              )}
              {filters.inStock && <FaCheck className="w-4 h-4 text-green-600" />}
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-blue-600 w-4 h-4" />
            <span className="font-medium text-blue-800">فیلترهای فعال</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                دسته: {filterData?.categories.find(c => c.slug === filters.category)?.name}
              </span>
            )}
            {filters.brand && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                برند: {filters.brand}
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                قیمت: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
              </span>
            )}
            {filters.hasDiscount && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                تخفیف‌دار
              </span>
            )}
            {filters.inStock && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                موجود
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 