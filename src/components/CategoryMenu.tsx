'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface CategoryL3 {
  id: number;
  name: string;
  slug: string;
  categoryL2Id: number;
  _count?: {
    products: number;
  };
}

interface CategoryL2 {
  id: number;
  name: string;
  slug: string;
  categoryL1Id: number;
  categoryL3s: CategoryL3[];
  _count?: {
    categoryL3s: number;
  };
}

interface CategoryL1 {
  id: number;
  name: string;
  slug: string;
  categoryL2s: CategoryL2[];
  _count?: {
    categoryL2s: number;
  };
}

interface CategoryMenuProps {
  onMobileMenuClose?: () => void;
}

export default function CategoryMenu({ onMobileMenuClose }: CategoryMenuProps = {}) {
  const [categories, setCategories] = useState<CategoryL1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeL1, setActiveL1] = useState<number | null>(null);
  const [activeL2, setActiveL2] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileL1, setMobileL1] = useState<number | null>(null);
  const [mobileL2, setMobileL2] = useState<number | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [hoverTimeout, closeTimeout]);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const res = await fetch('/api/categories/tree', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('خطا در دریافت دسته‌بندی‌ها');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('درخواست با مشکل مواجه شد');
      } else {
        setError(err.message || 'خطا در بارگذاری دسته‌بندی‌ها');
      }
    } finally {
      setLoading(false);
    }
  }

  // Close mobile menu function
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileL1(null);
    setMobileL2(null);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  // Handle hover for desktop menu - show menu immediately
  const handleHover = (categoryId: number, level: 'L1' | 'L2') => {
    // Clear any close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    // Clear previous hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Set a delay for opening submenu
    const timeout = setTimeout(() => {
    if (level === 'L1') {
      setActiveL1(categoryId);
      setActiveL2(null); // Reset L2 when L1 changes
    } else if (level === 'L2') {
      setActiveL2(categoryId);
    }
    }, 80); // 80ms delay for open
    setHoverTimeout(timeout);
  };

  // Handle mouse leave - close menu after delay
  const handleMouseLeave = () => {
    // Clear any existing close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    
    // Set new close timeout
    const timeout = setTimeout(() => {
      setActiveL1(null);
      setActiveL2(null);
    }, 800); // 800ms delay before closing
    
    setCloseTimeout(timeout);
  };

  // Handle mouse enter on dropdown - cancel close timeout
  const handleDropdownMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
  };

  // Clear hover timeout
  const clearHoverTimeout = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  // Professional three-level dropdown for header
  const headerDropdown = (
    <div className="py-2">
      {loading ? (
        <div className="px-4 py-3 text-gray-500 text-sm text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            در حال بارگذاری...
          </div>
        </div>
      ) : error ? (
        <div className="px-4 py-3 text-red-500 text-sm text-center">{error}</div>
      ) : categories.length === 0 ? (
        <div className="px-4 py-3 text-gray-500 text-sm text-center">هیچ دسته‌بندی یافت نشد</div>
      ) : (
        <div className="flex">
          {/* Level 1 - Main Categories */}
          <div className="w-64 border-l border-gray-200">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="relative group"
                onMouseEnter={() => handleHover(category.id, 'L1')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200 group-hover:shadow-sm"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {category.name}
                  </span>
                  {category.categoryL2s.length > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </Link>
                
                {/* Level 2 - Sub Categories */}
                <AnimatePresence>
                  {category.categoryL2s.length > 0 && activeL1 === category.id && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-full top-0 w-64 bg-white border border-gray-200 rounded-r-lg shadow-xl z-[90]"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex">
                        <div className="w-full border-l border-gray-200">
                          {category.categoryL2s.map((subCategory, subIndex) => (
                            <motion.div
                              key={subCategory.id}
                              className="relative group"
                              onMouseEnter={() => {
                                handleHover(subCategory.id, 'L2');
                                handleDropdownMouseEnter();
                              }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.03 }}
                            >
                              <Link
                                href={`/category/${subCategory.slug}`}
                                className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-200"
                              >
                                <span className="font-medium">{subCategory.name}</span>
                                {subCategory.categoryL3s.length > 0 && (
                                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                )}
                              </Link>
                              
                              {/* Level 3 - Sub Sub Categories */}
                              <AnimatePresence>
                                {subCategory.categoryL3s.length > 0 && activeL2 === subCategory.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-full top-0 w-64 bg-white border border-gray-200 rounded-r-lg shadow-xl z-[95]"
                                    onMouseEnter={handleDropdownMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                  >
                                    <div className="py-2">
                                      {subCategory.categoryL3s.map((subSubCategory, subSubIndex) => (
                                        <motion.div
                                          key={subSubCategory.id}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: subSubIndex * 0.02 }}
                                        >
                                          <Link
                                            href={`/category/${subSubCategory.slug}`}
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-600 transition-all duration-200"
                                          >
                                            {subSubCategory.name}
                                          </Link>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Menu Component
  const mobileMenu = (
    <div className="z-[85] md:hidden">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-base font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 active:scale-95"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <MenuIcon className="h-5 w-5" />
        <span>دسته‌بندی کالاها</span>
        <div className="flex-1"></div>
        <motion.div
          animate={{ rotate: mobileOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="p-3 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    در حال بارگذاری...
                  </div>
                </div>
              ) : error ? (
                <div className="px-4 py-3 text-red-500 text-center">{error}</div>
              ) : categories.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-center">هیچ دسته‌بندی یافت نشد</div>
              ) : (
                categories.map((category, index) => (
                  <motion.div 
                    key={category.id} 
                    className="border-b border-gray-100 last:border-b-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={closeMobileMenu}
                        className="flex-1 rounded-lg px-3 py-3 font-medium text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 active:scale-95"
                      >
                        {category.name}
                      </Link>
                      {category.categoryL2s.length > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          onClick={() =>
                            setMobileL1(mobileL1 === category.id ? null : category.id)
                          }
                        >
                          <motion.div
                            animate={{ rotate: mobileL1 === category.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </motion.button>
                      )}
                    </div>
                    {/* Level 2 */}
                    <AnimatePresence>
                      {category.categoryL2s.length > 0 && mobileL1 === category.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-r-2 border-blue-200 mr-2 pl-4 pt-2"
                        >
                          {category.categoryL2s.map((subCategory, subIndex) => (
                            <motion.div 
                              key={subCategory.id} 
                              className="border-b border-gray-50 last:border-b-0"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.03 }}
                            >
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/category/${subCategory.slug}`}
                                  onClick={closeMobileMenu}
                                  className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 active:scale-95"
                                >
                                  {subCategory.name}
                                </Link>
                                {subCategory.categoryL3s.length > 0 && (
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
                                    onClick={() =>
                                      setMobileL2(
                                        mobileL2 === subCategory.id ? null : subCategory.id
                                      )
                                    }
                                  >
                                    <motion.div
                                      animate={{ rotate: mobileL2 === subCategory.id ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </motion.div>
                                  </motion.button>
                                )}
                              </div>
                              {/* Level 3 */}
                              <AnimatePresence>
                                {subCategory.categoryL3s.length > 0 &&
                                mobileL2 === subCategory.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-r-2 border-green-200 mr-2 pl-3 pt-1"
                                  >
                                    {subCategory.categoryL3s.map((subSubCategory, subSubIndex) => (
                                      <motion.div
                                        key={subSubCategory.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: subSubIndex * 0.02 }}
                                      >
                                        <Link
                                          href={`/category/${subSubCategory.slug}`}
                                          onClick={closeMobileMenu}
                                          className="block rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-600 active:scale-95"
                                        >
                                          {subSubCategory.name}
                                        </Link>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
              {/* Close button for mobile */}
              <motion.div 
                className="mt-3 pt-3 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={closeMobileMenu}
                  className="w-full py-2 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-lg font-medium transition-colors hover:from-gray-200 hover:to-gray-300 active:scale-95"
                >
                  بستن منو
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Return appropriate component based on context
  if (onMobileMenuClose) {
    return mobileMenu;
  }

  return headerDropdown;
}
