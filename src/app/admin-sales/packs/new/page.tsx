'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaPlus, FaMinus, FaSearch, FaSave, FaTimes } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  brand: string;
}

interface PackItem {
  productId: number;
  quantity: number;
  product: Product;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  level?: number;
  productCount?: number;
  categoryL2s?: Category[];
  categoryL3s?: Category[];
  children?: Category[];
}

export default function NewPackPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [items, setItems] = useState<PackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total and discounted prices
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountedPrice = totalPrice * (1 - discountPercentage / 100);

  // Search products
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(selectedCategory && { categoryId: selectedCategory.toString() })
      });
      
      const res = await fetch(`/api/admin/products/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      } else {
        console.error('Error searching products:', await res.text());
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [selectedCategory]);

  // Search products with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, handleSearch]);

  // Add product to pack
  const addProduct = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    if (existingItem) {
      setItems(items.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { productId: product.id, quantity: 1, product }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Update item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setItems(items.filter(item => item.productId !== productId));
    } else {
      setItems(items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Save pack
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          image,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          totalPrice,
          discountPrice: discountedPrice,
        }),
      });

      if (response.ok) {
        router.push('/admin-sales/packs');
      } else {
        const error = await response.json();
        alert(error.message || 'خطا در ایجاد پک');
      }
    } catch (error) {
      console.error('Error creating pack:', error);
      alert('خطا در ایجاد پک');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories/tree', {
          credentials: 'include'
        });
        if (!res.ok) {
          throw new Error('خطا در دریافت دسته‌بندی‌ها');
        }
        const data = await res.json();
        // Extract categories from the response structure
        setCategories(data.categories || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('خطا در دریافت دسته‌بندی‌ها');
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Render category options recursively
  const renderCategories = (categories: Category[] = [], level = 0) => {
    if (!Array.isArray(categories)) {
      return null;
    }
    
    return categories.map(category => (
      <div key={category.id}>
        <button
          type="button"
          onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
          className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 ${
            selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
          style={{ paddingRight: `${level * 1}rem` }}
        >
          {category.name}
        </button>
        {((category.children && category.children.length > 0) || 
          (category.categoryL2s && category.categoryL2s.length > 0) ||
          (category.categoryL3s && category.categoryL3s.length > 0)) && 
          renderCategories(category.children || category.categoryL2s || category.categoryL3s || [], level + 1)}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ایجاد پک جدید</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات پایه</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام پک
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تصویر (URL)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">محصولات پک</h2>

          {/* Category Selection */}
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">انتخاب دسته‌بندی</h3>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              {renderCategories(categories)}
            </div>
          </div>

          {/* Product Search */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محصول..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchLoading ? (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            )}

            {searchResults.length > 0 && (
                              <div className="absolute z-[85] w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-auto">
                {searchResults.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-right"
                  >
                    {product.image && (
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={48}
                        height={48}
                        className="object-cover rounded" 
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.price.toLocaleString()} تومان | موجودی: {product.stock}
                      </div>
                    </div>
                    <FaPlus className="text-blue-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Products */}
          <div className="space-y-4">
            {items.map(item => (
              <div 
                key={item.productId}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                {item.product.image && (
                  <Image 
                    src={item.product.image} 
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.product.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.product.price.toLocaleString()} تومان × {item.quantity} = 
                    {(item.product.price * item.quantity).toLocaleString()} تومان
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                محصولی به پک اضافه نشده است
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">قیمت‌گذاری</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                درصد تخفیف
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">قیمت کل</div>
                <div className="text-lg font-bold text-gray-900">
                  {totalPrice.toLocaleString()} تومان
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">قیمت با تخفیف</div>
                <div className="text-lg font-bold text-green-700">
                  {discountedPrice.toLocaleString()} تومان
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg text-white
                ${loading || items.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <FaSave />
                  ذخیره پک
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 