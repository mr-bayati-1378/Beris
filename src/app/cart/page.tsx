'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { CartItem } from '@/types';
import PriceDisplay from '@/components/ui/price-display';
import CartItemCard from '@/components/CartItemCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaUser, FaPhone, FaMapMarkerAlt, FaClipboardList, FaShoppingCart, FaHeart, FaShare, FaTrash, FaArrowLeft, FaBox } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ProductRequestModal from '@/components/ProductRequestModal';

interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  addresses: Array<{
    id: number;
    city: string;
    address: string;
    postCode: string;
    title: string;
  }>;
}

export default function CartPage() {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cartSearchQuery, setCartSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showProductRequestModal, setShowProductRequestModal] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter cart items based on search
  const filteredCartItems = cartItems.filter(item => 
    item.name.toLowerCase().includes(cartSearchQuery.toLowerCase())
  );

  // محاسبه قیمت‌ها
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // هزینه ارسال: ۰ - با تماس تعیین می‌شود
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  // Search for products and packs
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // جستجوی محصولات
      const productsRes = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
      
      // جستجوی پک‌ها
      const packsRes = await fetch(`/api/search/packs?q=${encodeURIComponent(query)}&limit=5`);
      const packsData = packsRes.ok ? await packsRes.json() : { packs: [] };
      
      // ترکیب نتایج
      const allResults = [
        ...(productsData.products || []),
        ...(packsData.packs || [])
      ];
      
      setSearchResults(allResults);
    } catch (error) {
      console.error('Error searching products and packs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add product or pack to cart
  const addToCart = async (item: any) => {
    try {
      const isPack = item.type === 'pack';
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [isPack ? 'packId' : 'productId']: item.id, 
          quantity: 1 
        }),
      });
      
      if (res.ok) {
        // Refresh cart items
        fetchCart();
        // Clear search
        setSearchQuery('');
        setSearchResults([]);
        // Dispatch cart update event for header counter
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        // Show success message
        toast.success(`${isPack ? 'پک' : 'محصول'} با موفقیت به سبد خرید اضافه شد`);
      } else {
        const error = await res.json();
        toast.error(error.error || `خطا در افزودن ${isPack ? 'پک' : 'محصول'} به سبد خرید`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('خطا در برقراری ارتباط');
    }
  };

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?from=/cart');
          return;
        }
        throw new Error('Failed to fetch cart');
      }
      const data = await res.json();
      setCartItems(data.items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
        // Set first address as default if none selected
        if (data.user.addresses && data.user.addresses.length > 0 && !selectedAddressId) {
          setSelectedAddressId(data.user.addresses[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [user, selectedAddressId]);

  useEffect(() => {
    if (!loading) {
      fetchCart();
      fetchUserProfile();
    }
  }, [loading, fetchCart, fetchUserProfile]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">لطفا ابتدا وارد حساب کاربری خود شوید</h2>
          <Link
            href="/auth/login?from=/cart"
            className="btn btn-primary"
          >
            ورود به حساب کاربری
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">سبد خرید</h1>
          <p className="text-gray-600 text-center">مدیریت محصولات انتخابی شما</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                اطلاعات مشتری
              </h3>
              
              {userProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {userProfile.firstName} {userProfile.lastName}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <FaPhone className="text-primary" />
                        {userProfile.phone}
                      </p>
                      {userProfile.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          📧 {userProfile.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {userProfile.addresses && userProfile.addresses.length > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-green-600" />
                        انتخاب آدرس ارسال ({userProfile.addresses.length})
                      </h4>
                      <div className="space-y-4">
                        {userProfile.addresses.map((address, index) => (
                          <motion.div 
                            key={address.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gray-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              selectedAddressId === address.id 
                                ? 'border-primary bg-primary/5 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedAddressId(address.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                <input
                                  type="radio"
                                  name="address"
                                  checked={selectedAddressId === address.id}
                                  onChange={() => setSelectedAddressId(address.id)}
                                  className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 mb-2">{address.title}</p>
                                <p className="text-sm text-gray-600 mb-2">{address.city}</p>
                                <p className="text-sm text-gray-500 line-clamp-2">{address.address}</p>
                                {address.postCode && (
                                  <p className="text-sm text-gray-500 mt-2">کد پستی: {address.postCode}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <div className="flex gap-3">
                      <Link
                        href="/dashboard?tab=settings"
                        className="flex-1 text-center text-sm text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 py-3 px-4 rounded-xl transition-all duration-300 font-medium"
                      >
                        ویرایش پروفایل
                      </Link>
                      <Link
                        href="/dashboard?tab=addresses"
                        className="flex-1 text-center text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 py-3 px-4 rounded-xl transition-all duration-300 font-medium"
                      >
                        مدیریت آدرس‌ها
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
                  ></motion.div>
                  <p className="text-gray-500">در حال بارگذاری اطلاعات...</p>
                </div>
              )}
            </motion.div>

            {/* Product Request Section */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaClipboardList className="text-purple-600" />
                افزودن کالای سفارشی
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  محصول مورد نظر شما موجود نیست؟ می‌توانید درخواست خود را ثبت کنید و ما در اسرع وقت با شما تماس خواهیم گرفت.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProductRequestModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg font-bold text-lg flex items-center justify-center gap-3"
                >
                  <FaClipboardList className="text-xl" />
                  افزودن کالای سفارشی
                </motion.button>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  📋
                </div>
                خلاصه سفارش
              </h3>
              
              {/* Selected Address Summary */}
              {userProfile && selectedAddressId && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl"
                >
                  <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" />
                    آدرس ارسال انتخابی
                  </h4>
                  {(() => {
                    const selectedAddress = userProfile.addresses.find(addr => addr.id === selectedAddressId);
                    return selectedAddress ? (
                      <div className="text-sm text-primary">
                        <p className="font-bold">{selectedAddress.title}</p>
                        <p className="text-xs opacity-80">{selectedAddress.city}</p>
                        <p className="text-xs opacity-80 line-clamp-2">{selectedAddress.address}</p>
                      </div>
                    ) : null;
                  })()}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>تعداد محصولات:</span>
                  <span className="font-bold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} عدد</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>جمع فاکتور:</span>
                  <span className="font-bold">{subtotal.toLocaleString()} تومان</span>
                </div>
                
                {/* Shipping Cost with Better Logic */}
                <div className="flex justify-between text-gray-700">
                  <span>هزینه ارسال:</span>
                  <span className="font-bold text-orange-600">
                    <span className="flex items-center gap-2">
                      📞 تماس با مشتری
                    </span>
                  </span>
                </div>

                {/* Shipping Status Messages */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm"
                >
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="text-orange-600">📞</span>
                    <span className="font-bold">هزینه ارسال با تماس</span>
                  </div>
                  <p className="text-orange-600 text-xs mt-2">
                    هزینه ارسال بر اساس وزن، مسافت و روش ارسال تعیین می‌شود
                  </p>
                </motion.div>

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>مجموع کل:</span>
                    <span>{total.toLocaleString()} تومان</span>
                  </div>
                </div>

                {/* Checkout Button */}
                {cartItems.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4"
                  >
                    <Link
                      href="/checkout"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg font-bold text-lg flex items-center justify-center gap-3"
                    >
                      <FaShoppingCart className="text-xl" />
                      تکمیل سفارش
                    </Link>
                  </motion.div>
                )}

                {/* Empty Cart Actions */}
                {cartItems.length === 0 && (
                  <div className="pt-4 space-y-3">
                    <Link
                      href="/products"
                      className="w-full btn btn-outline flex items-center justify-center gap-3 py-4 text-lg font-bold rounded-xl"
                    >
                      ➕ افزودن محصول بیشتر
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Cart Items */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaShoppingCart className="text-primary" />
                  محصولات سبد خرید
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="جستجو در سبد خرید..."
                      value={cartSearchQuery}
                      onChange={(e) => setCartSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                  ></motion.div>
                </div>
              ) : filteredCartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">سبد خرید شما خالی است</h3>
                  <p className="text-gray-600 mb-8 text-lg">محصولات مورد نظر خود را به سبد خرید اضافه کنید</p>
                  <Link href="/products" className="btn btn-primary text-lg px-8 py-4 rounded-xl">
                    مشاهده محصولات
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {filteredCartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CartItemCard 
                        item={item} 
                        onUpdate={fetchCart} 
                        onRemove={fetchCart}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Search Products - Always Visible */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 pt-8 border-t border-gray-200"
              >
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaSearch className="text-primary" />
                  جستجوی محصولات و پک‌ها
                </h4>
                <div className="relative" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="جستجوی محصولات و پک‌ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  {isSearching && (
                    <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      ></motion.div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {searchResults.map((item: any, index: number) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                            {item.type === 'pack' ? (
                              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                <FaBox className="w-6 h-6 text-purple-600" />
                              </div>
                            ) : (
                              <Image
                                src={item.image || '/default-product.png'}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</p>
                              {item.type === 'pack' && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                  پک
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-primary font-medium">
                              {<PriceDisplay price={item.price} showCurrency={false} />} تومان
                              {item.type === 'pack' && item.itemCount && (
                                <span className="text-gray-500 text-xs mr-2">({item.itemCount} آیتم)</span>
                              )}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors shadow-lg"
                          >
                            <FaPlus className="w-3 h-3" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Product Request Modal */}
      <AnimatePresence>
        {showProductRequestModal && (
          <ProductRequestModal
            onClose={() => setShowProductRequestModal(false)}
            onSuccess={() => {
              toast.success('درخواست شما با موفقیت ثبت شد');
              setShowProductRequestModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
