'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import PersianDateInput from '@/components/ui/persian-date-input';
import { 
  FaUpload, 
  FaTrash, 
  FaSave, 
  FaArrowRight,
  FaSpinner
} from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPercent: number | null;
  hasDiscount: boolean;
  discountStartDate: string | null;
  discountEndDate: string | null;
  stock: number;
  brand: string | null;
  categoryL3Id: number;
  image: string | null;
  isActive: boolean;
  images: Array<{
    id: number;
    url: string;
  }>;
  categoryL3: {
    id: number;
    name: string;
    categoryL2: {
      id: number;
      name: string;
      categoryL1: {
        id: number;
        name: string;
      };
    };
  };
}

interface Category {
  id: number;
  name: string;
  categoryL2: {
    id: number;
    name: string;
    categoryL1: {
      id: number;
      name: string;
    };
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discountPercent: 0,
    hasDiscount: false,
    discountStartDate: '',
    discountEndDate: '',
    stock: 0,
    brand: '',
    categoryL3Id: 0,
    isActive: true,
    newImages: [] as File[]
  });
  
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: number, url: string}>>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // بارگذاری محصول
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('محصول یافت نشد');
        }
        const responseData = await response.json();
        const productData = responseData.product;
        setProduct(productData);
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || 0,
          discountPercent: productData.discountPercent || 0,
          hasDiscount: productData.hasDiscount || false,
          discountStartDate: productData.discountStartDate ? productData.discountStartDate.split('T')[0] : '',
          discountEndDate: productData.discountEndDate ? productData.discountEndDate.split('T')[0] : '',
          stock: productData.stock || 0,
          brand: productData.brand || '',
          categoryL3Id: productData.categoryL3Id || 0,
          isActive: productData.isActive,
          newImages: []
        });
        setExistingImages(productData.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری محصول');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // بارگذاری دسته‌بندی‌ها
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/categories/tree', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // فلت کردن categories برای نمایش
          const flatCategories: Category[] = [];
          data.forEach((l1: any) => {
            l1.categoryL2s.forEach((l2: any) => {
              l2.categoryL3s.forEach((l3: any) => {
                flatCategories.push({
                  id: l3.id,
                  name: l3.name,
                  categoryL2: {
                    id: l2.id,
                    name: l2.name,
                    categoryL1: {
                      id: l1.id,
                      name: l1.name
                    }
                  }
                });
              });
            });
          });
          setCategories(flatCategories);
        }
      } catch (err) {
        console.error('خطا در بارگذاری دسته‌بندی‌ها:', err);
      }
    }

    fetchCategories();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('فقط فایل‌های JPG، PNG و WebP مجاز هستند');
      return;
    }

    const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('حجم هر تصویر نباید بیش از 5 مگابایت باشد');
      return;
    }

    setFormData(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...validFiles]
    }));

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreview[index]);
    
    setFormData(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
    
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Client-side validation
    const fieldErrors: {[key: string]: string} = {};
    const validationErrorsList: string[] = [];
    
    if (!formData.name.trim()) {
      fieldErrors.name = 'نام محصول الزامی است';
      validationErrorsList.push('نام محصول الزامی است');
    }
    
    if (!formData.price || formData.price <= 0) {
      fieldErrors.price = 'قیمت باید بیشتر از صفر باشد';
      validationErrorsList.push('قیمت باید بیشتر از صفر باشد');
    }
    
    if (formData.stock < 0) {
      fieldErrors.stock = 'موجودی نمی‌تواند منفی باشد';
      validationErrorsList.push('موجودی نمی‌تواند منفی باشد');
    }
    
    if (!formData.categoryL3Id || formData.categoryL3Id === 0) {
      fieldErrors.categoryL3Id = 'انتخاب دسته‌بندی الزامی است';
      validationErrorsList.push('انتخاب دسته‌بندی الزامی است');
    }

    // If discount is enabled, validate discount fields
    if (formData.hasDiscount) {
      if (!formData.discountPercent || formData.discountPercent <= 0 || formData.discountPercent >= 100) {
        fieldErrors.discountPercent = 'درصد تخفیف باید بین 1 تا 99 باشد';
        validationErrorsList.push('درصد تخفیف باید بین 1 تا 99 باشد');
      }
      
      // در این سیستم قیمت فروش (price) قیمت نهایی است، comparePrice محاسبه می‌شود
      if (!formData.price || formData.price <= 0) {
        fieldErrors.price = 'قیمت فروش برای محصولات تخفیف‌دار الزامی است';
        validationErrorsList.push('قیمت فروش برای محصولات تخفیف‌دار الزامی است');
      }
    }

    setValidationErrors(fieldErrors);

    if (validationErrorsList.length > 0) {
      setError('خطاهای اعتبارسنجی:\n• ' + validationErrorsList.join('\n• '));
      setSaving(false);
      return;
    }

    try {
      // اول تصاویر را آپلود کنیم
      const imageUrls: string[] = [];
      
      for (const file of formData.newImages) {
        const imageFormData = new FormData();
        imageFormData.append('file', file);
        
        const uploadResponse = await fetch('/api/admin/products/images', {
          method: 'POST',
          body: imageFormData,
          credentials: 'include'
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          imageUrls.push(url);
        } else {
          const uploadError = await uploadResponse.json();
          throw new Error(`خطا در آپلود تصویر: ${uploadError.error || 'خطای نامشخص'}`);
        }
      }

      // حالا محصول را به‌روزرسانی کنیم
      const updateData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: Number(formData.price),
        discountPercent: formData.hasDiscount ? Number(formData.discountPercent) : null,
        hasDiscount: formData.hasDiscount,
        discountStartDate: formData.discountStartDate || null,
        discountEndDate: formData.discountEndDate || null,
        stock: Number(formData.stock),
        brand: formData.brand?.trim() || null,
        categoryL3Id: Number(formData.categoryL3Id),
        isActive: formData.isActive,
        newImageUrls: imageUrls,
        imagesToDelete: imagesToDelete
      };

      console.log('Sending update data:', updateData); // Debug log

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (response.ok) {
        // Show success message briefly before redirecting
        setError('');
        setValidationErrors({});
        alert('محصول با موفقیت به‌روزرسانی شد');
        
        // Force refresh the products list page
        if (typeof window !== 'undefined') {
          // Clear any cached data
          window.location.href = '/admin/products';
        } else {
          router.push('/admin/products');
        }
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData); // Debug log
        setError(errorData.error || 'خطا در ذخیره محصول');
      }
    } catch (err) {
      console.error('Submit error:', err); // Debug log
      setError(err instanceof Error ? err.message : 'خطا در ذخیره محصول');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">در حال بارگذاری...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              بازگشت به لیست محصولات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ویرایش محصول</h1>
            <p className="mt-2 text-gray-600">
              ویرایش اطلاعات محصول: {product?.name}
            </p>
          </div>
          
          <button
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <FaArrowRight className="h-4 w-4" />
            بازگشت
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="text-red-600 whitespace-pre-line">
              {error.split('\n').map((line, index) => (
                <div key={index} className={index > 0 ? 'mr-2' : ''}>
                  {index > 0 && '• '}
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* اطلاعات کلی */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900">اطلاعات کلی</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام محصول <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({...prev, name: e.target.value}));
                    if (validationErrors.name) {
                      setValidationErrors(prev => ({...prev, name: ''}));
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                    validationErrors.name 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  placeholder="نام محصول را وارد کنید"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  برند
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({...prev, brand: e.target.value}))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="برند محصول"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قیمت (تومان) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData(prev => ({...prev, price: parseInt(e.target.value) || 0}));
                    if (validationErrors.price) {
                      setValidationErrors(prev => ({...prev, price: ''}));
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                    validationErrors.price 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  placeholder="0"
                />
                {validationErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موجودی <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => {
                    setFormData(prev => ({...prev, stock: parseInt(e.target.value) || 0}));
                    if (validationErrors.stock) {
                      setValidationErrors(prev => ({...prev, stock: ''}));
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                    validationErrors.stock 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  placeholder="0"
                />
                {validationErrors.stock && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.stock}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryL3Id}
                  onChange={(e) => {
                    setFormData(prev => ({...prev, categoryL3Id: parseInt(e.target.value)}));
                    if (validationErrors.categoryL3Id) {
                      setValidationErrors(prev => ({...prev, categoryL3Id: ''}));
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                    validationErrors.categoryL3Id 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                >
                  <option value={0}>انتخاب دسته‌بندی</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryL2.categoryL1.name} / {category.categoryL2.name} / {category.name}
                    </option>
                  ))}
                </select>
                {validationErrors.categoryL3Id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.categoryL3Id}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="توضیحات محصول را وارد کنید"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">محصول فعال باشد</span>
                </label>
              </div>
            </div>
          </div>

          {/* تنظیمات تخفیف */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900">تنظیمات تخفیف</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasDiscount}
                    onChange={(e) => setFormData(prev => ({...prev, hasDiscount: e.target.checked}))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">این محصول تخفیف دارد</span>
                </label>
              </div>

              {formData.hasDiscount && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      درصد تخفیف <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required={formData.hasDiscount}
                      min="1"
                      max="99"
                      value={formData.discountPercent}
                      onChange={(e) => {
                        const discountPercent = parseInt(e.target.value) || 0;
                        setFormData(prev => ({
                          ...prev, 
                          discountPercent
                        }));
                        if (validationErrors.discountPercent) {
                          setValidationErrors(prev => ({...prev, discountPercent: ''}));
                        }
                      }}
                      className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                        validationErrors.discountPercent 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                      }`}
                      placeholder="درصد تخفیف (1-99)"
                    />
                    {validationErrors.discountPercent && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.discountPercent}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      قیمت اصلی خودکار محاسبه می‌شود
                    </p>
                  </div>

                  <div>
                    <PersianDateInput
                      label="تاریخ شروع تخفیف"
                      value={formData.discountStartDate}
                      onChange={(date) => setFormData(prev => ({...prev, discountStartDate: date}))}
                      placeholder="تاریخ شروع را انتخاب کنید"
                    />
                  </div>

                  <div>
                    <PersianDateInput
                      label="تاریخ پایان تخفیف"
                      value={formData.discountEndDate}
                      onChange={(date) => setFormData(prev => ({...prev, discountEndDate: date}))}
                      placeholder="تاریخ پایان را انتخاب کنید"
                    />
                  </div>

                  {formData.discountPercent > 0 && formData.price > 0 && (
                    <div className="md:col-span-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">پیش‌نمایش تخفیف:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">قیمت اصلی:</span>
                            <span className="text-gray-800 line-through">{Math.round(formData.price / (1 - formData.discountPercent / 100)).toLocaleString()} تومان</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">درصد تخفیف:</span>
                            <span className="text-red-600 font-bold">{formData.discountPercent}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">قیمت نهایی:</span>
                            <span className="text-red-600 font-bold text-lg">{formData.price.toLocaleString()} تومان</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">صرفه‌جویی:</span>
                            <span className="text-green-600 font-medium">{(Math.round(formData.price / (1 - formData.discountPercent / 100)) - formData.price).toLocaleString()} تومان</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* تصاویر */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900">تصاویر محصول</h2>
            
            {/* تصاویر موجود */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium text-gray-800">تصاویر موجود</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <Image
                          src={image.url}
                          alt="تصویر محصول"
                          width={200}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* تصاویر جدید */}
            {imagePreview.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium text-gray-800">تصاویر جدید</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <Image
                          src={preview}
                          alt="پیش‌نمایش"
                          width={200}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* آپلود تصاویر جدید */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600"
              >
                <FaUpload className="h-6 w-6" />
                <div>
                  <p className="font-medium">افزودن تصاویر جدید</p>
                  <p className="text-sm">JPG، PNG یا WebP - حداکثر 5MB</p>
                </div>
              </button>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  ذخیره تغییرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 