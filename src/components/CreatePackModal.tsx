'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaPlus, FaMinus, FaSearch, FaSave, FaTimes, FaSpinner, FaFilter, FaTh, FaList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  brand?: string;
  slug?: string;
  category?: { id: number; name: string; slug: string };
  categoryL3?: { id: number; name: string; slug: string }; // Added for categoryL3
}

interface PackItem {
  productId: number;
  quantity: number;
  product: Product;
}

interface CreatePackModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePackModal({ onClose, onSuccess }: CreatePackModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<PackItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);

  // محاسبه قیمت کل
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // دریافت محصولات
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products?limit=all');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // دریافت دسته‌بندی‌ها
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        console.log('Categories response:', data);
        const categoriesData = data.categories || data || [];
        // تبدیل به فرمت مورد نیاز
        const formattedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        }));
        setCategories(formattedCategories);
      } else {
        console.error('Failed to fetch categories:', res.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // فیلتر محصولات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || 
                           (product.categoryL3 && product.categoryL3.slug === selectedCategory) ||
                           (product.categoryL3 && product.categoryL3.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // اضافه کردن محصول به پک
  const addProduct = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    if (existingItem) {
      setItems(items.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`${product.name} به پک اضافه شد`);
    } else {
      setItems([...items, { productId: product.id, quantity: 1, product }]);
      toast.success(`${product.name} به پک اضافه شد`);
    }
  };

  // بروزرسانی تعداد آیتم
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setItems(items.filter(item => item.productId !== productId));
      toast.success('محصول از پک حذف شد');
    } else {
      setItems(items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // حذف محصول از پک
  const removeProduct = (productId: number) => {
    setItems(items.filter(item => item.productId !== productId));
    toast.success('محصول از پک حذف شد');
  };

  // ذخیره پک
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('نام پک الزامی است');
      return;
    }

    if (items.length === 0) {
      toast.error('حداقل یک محصول باید به پک اضافه شود');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: null,
          })),
        }),
      });

      if (response.ok) {
        toast.success('پک با موفقیت ایجاد شد');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'خطا در ایجاد پک');
      }
    } catch (error) {
      console.error('Error creating pack:', error);
      toast.error('خطا در ایجاد پک');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">ایجاد پک جدید</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* اطلاعات پایه */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">اطلاعات پک</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام پک *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="نام پک را وارد کنید"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="توضیحات پک را وارد کنید"
              />
            </div>


          </div>

          {/* محصولات انتخاب شده */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">محصولات انتخاب شده ({items.length})</h3>
                <div className="text-sm text-gray-600">
                  قیمت کل: <span className="font-bold text-green-600">{totalPrice.toLocaleString()} تومان</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div 
                    key={item.productId}
                    className="bg-white rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product.image ? (
                          <Image 
                            src={item.product.image} 
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-white font-bold text-sm">
                            {item.product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">{item.product.name}</div>
                        <div className="text-xs text-gray-600 mb-2">
                          {item.product.price.toLocaleString()} تومان × {item.quantity}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-red-500 transition-colors bg-gray-100 rounded hover:bg-red-100"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-blue-500 transition-colors bg-gray-100 rounded hover:bg-blue-100"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(item.productId)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors bg-red-100 rounded hover:bg-red-200"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* انتخاب محصولات */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">انتخاب محصولات</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    placeholder="جستجوی محصولات..."
                  />
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <FaTh className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <FaList className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-2xl text-blue-600" />
                <span className="mr-3 text-gray-600">در حال بارگذاری محصولات...</span>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6">
                {filteredProducts.length > 0 ? (
                                <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' 
                : 'space-y-2'
              }>
                    {filteredProducts.map(product => {
                      const isInPack = items.some(item => item.productId === product.id);
                      return (
                        <div
                          key={product.id}
                          className={`bg-white rounded-xl p-3 border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                            isInPack ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => !isInPack && addProduct(product)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              {product.image ? (
                                                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                width={48}
                                height={48}
                                className="object-cover rounded-lg" 
                              />
                              ) : (
                                <div className="text-white text-lg font-bold">
                                  {product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm truncate">{product.name}</h4>
                              {product.brand && (
                                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                              )}
                              <p className="text-sm font-bold text-blue-600">
                                {product.price.toLocaleString()} تومان
                              </p>
                              <p className="text-xs text-gray-500">موجودی: {product.stock}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addProduct(product);
                              }}
                              disabled={isInPack}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                isInPack 
                                  ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                            >
                              {isInPack ? <FaPlus className="text-xs" /> : <FaPlus />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSearch className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-500">محصولی یافت نشد</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSave />
              )}
              {loading ? 'در حال ذخیره...' : 'ایجاد پک'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 