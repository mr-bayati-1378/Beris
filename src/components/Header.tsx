'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, LogOut, MapPin, Trash2, Clock, Home, MenuIcon, ChevronDown, Heart, Bell, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryMenu from './CategoryMenu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    slug: string;
    isActive: boolean;
  };
}

interface SearchSuggestion {
  id: number;
  name: string;
  image: string;
  slug: string;
  price: number;
  isActive: boolean;
}

interface UserAddress {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [activeAddress, setActiveAddress] = useState<UserAddress | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [categoryMenuDelay, setCategoryMenuDelay] = useState<NodeJS.Timeout | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, []);

  // Save search query to history
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const trimmedQuery = query.trim();
    const newHistory = [trimmedQuery, ...searchHistory.filter(h => h !== trimmedQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('searchHistory');
    }
  };

  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const response = await fetch(`/api/search/simple?q=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSearchSuggestions(data.products || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(query.length === 0);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    addToSearchHistory(suggestion.name);
    router.push(`/product/${suggestion.slug}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Handle search all results click
  const handleSearchAll = () => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setSearchQuery(historyQuery);
    router.push(`/products?search=${encodeURIComponent(historyQuery)}`);
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Force refresh the page to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error('خطا در خروج:', error);
    }
  };

  return (
    <header className={`sticky top-0 z-[80] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-md' 
        : 'bg-white border-b border-gray-100 shadow-sm'
    }`}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1.5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span>ارسال رایگان برای خرید بالای ۱۰ میلیون تومان</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>پشتیبانی ۲۴ ساعته</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/contact" className="hover:text-blue-200 transition-colors">
                تماس با ما
              </Link>
              <Link href="/faq" className="hover:text-blue-200 transition-colors">
                سوالات متداول
              </Link>
              <Link href="/shipping" className="hover:text-blue-200 transition-colors">
                راهنمای ارسال
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>

          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image 
                src="/beris-logo.png" 
                alt="لوگو بریس" 
                width={40} 
                height={40}
                className="rounded-lg shadow-md"
              />
            </motion.div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">بریس</span>
            </div>
          </Link>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white shadow-lg"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative group">
              <input
                type="text"
                placeholder="جستجو در محصولات..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm py-3.5 pr-20 pl-12 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-gray-300 group-hover:border-primary/50"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Search className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                  جستجو
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50"
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl"
              >
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Image 
                        src="/beris-logo.png" 
                        alt="لوگو بریس" 
                        width={32} 
                        height={32}
                        className="rounded-lg"
                      />
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">بریس</span>
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>

                  {/* Menu Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* User Section */}
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary mx-auto"></div>
                      </div>
                    ) : user ? (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.phone}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            پنل کاربری
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            سفارشات من
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            تنظیمات
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="block text-sm text-red-600 hover:text-red-700 transition-colors"
                          >
                            خروج از حساب
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="block w-full text-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 no-underline shadow-lg"
                          data-navigation="mobile-user-login"
                          role="button"
                          aria-label="ورود کاربران "
                        >
                          ورود کاربران 
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => {
                            setIsMenuOpen(false);
                            window.location.href = '/auth/register';
                          }}
                          className="block w-full text-center py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors no-underline"
                          data-navigation="mobile-user-register"
                          role="button"
                          aria-label="ثبت نام کاربران "
                        >
                          ثبت نام کاربران عادی
                        </Link>
                      </div>
                    )}

                    {/* Categories */}
                    <div className="pt-4 border-t border-gray-200">
                      <CategoryMenu onMobileMenuClose={() => setIsMenuOpen(false)} />
                    </div>

                    {/* Address Section for Mobile */}
                    {user && activeAddress && (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">آدرس تحویل</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-gray-900">{activeAddress.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{activeAddress.city} - {activeAddress.address}</div>
                            </div>
                          </div>
                          {userAddresses.length > 1 && (
                            <Link
                              href="/dashboard?tab=addresses"
                              onClick={() => setIsMenuOpen(false)}
                              className="text-xs text-blue-600 hover:text-blue-700 mt-2 block"
                            >
                              تغییر آدرس
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image 
                  src="/beris-logo.png" 
                  alt="لوگو بریس" 
                  width={48} 
                  height={48}
                  className="rounded-xl shadow-lg transition-transform duration-200 group-hover:scale-105"
                />
              </motion.div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">بریس</span>
                <p className="text-sm text-gray-600">تجهیزات پزشکی</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="جستجو در محصولات..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchQuery.length > 0 || searchHistory.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm py-4 pr-24 pl-14 text-base focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-gray-300 group-hover:border-primary/50"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                      جستجو
                    </div>
                  </button>
                </div>
              </form>
              
              {/* Search Suggestions and History */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[85] max-h-80 overflow-y-auto"
                  >
                    {/* Search Results */}
                    {searchSuggestions.length > 0 && (
                      <div>
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-xl">
                          <span className="text-sm font-medium text-gray-600">نتایج جستجو</span>
                        </div>
                        {searchSuggestions.map((suggestion) => (
                          <motion.div
                            key={suggestion.id}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                          >
                            <div 
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {suggestion.image ? (
                                  <Image
                                    src={suggestion.image}
                                    alt={suggestion.name}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="text-gray-400 text-xs">بدون تصویر</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{suggestion.name}</div>
                                <div className="text-sm text-gray-600">{suggestion.price.toLocaleString()} تومان</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Show All Results */}
                        {searchQuery.trim() && (
                          <motion.div
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            onClick={handleSearchAll}
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-t border-gray-100 transition-colors"
                          >
                            <Search className="w-5 h-5" />
                            <span className="text-base">جستجوی &quot;{searchQuery}&quot; در همه محصولات</span>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Search History */}
                    {searchHistory.length > 0 && searchQuery.length === 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                          <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            تاریخچه جستجو
                          </span>
                          <button
                            onClick={clearSearchHistory}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            پاک کردن
                          </button>
                        </div>
                        {searchHistory.map((historyQuery, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            onClick={() => handleHistoryClick(historyQuery)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-base text-gray-700">{historyQuery}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-3">
              {/* Category Menu */}
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <MenuIcon className="h-5 w-5" />
                  <span>دسته‌بندی‌ها</span>
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
                <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[85]">
                  <CategoryMenu />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/"
                  className="btn btn-outline btn-sm flex items-center gap-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <Home className="h-5 w-5" />
                  <span className="hidden md:inline">خانه</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/cart"
                  className="btn btn-outline btn-sm relative flex items-center gap-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden md:inline">سبد خرید</span>
                  {cartItemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white shadow-lg"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {loading ? (
                <div className="btn btn-outline btn-sm flex items-center gap-2 rounded-xl">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                  <span className="hidden md:inline">...</span>
                </div>
              ) : user ? (
                <div className="relative group">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/dashboard"
                      className="btn btn-outline btn-sm flex items-center gap-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden md:inline">{user.firstName}</span>
                    </Link>
                  </motion.div>
                  
                  {/* منوی dropdown */}
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[85]">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-xl">
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-700">{user.phone}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="inline-block w-4 h-4 mr-2" />
                        پنل کاربری
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingCart className="inline-block w-4 h-4 mr-2" />
                        سفارشات من
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="inline-block w-4 h-4 mr-2" />
                        تنظیمات
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        خروج از حساب
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/auth/login"
                      className="btn btn-outline btn-sm rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      ورود
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/auth/register"
                      className="btn btn-primary btn-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      ثبت نام
                    </Link>
                  </motion.div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
