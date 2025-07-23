'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaSave, 
  FaArrowLeft, 
  FaImage,
  FaPlus,
  FaTrash,
  FaUpload
} from 'react-icons/fa';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  sku: string;
  weight: number;
  dimensions: string;
  status: 'active' | 'inactive';
  featured: boolean;
  images: File[];
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

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: '',
    sku: '',
    weight: 0,
    dimensions: '',
    status: 'active',
    featured: false,
    images: []
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('فقط فایل‌های JPG، PNG و WebP مجاز هستند');
      return;
    }

    // Check file sizes (max 5MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('حجم هر تصویر نباید بیش از 5 مگابایت باشد');
      return;
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreview[index]);
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('نام محصول الزامی است');
      return;
    }
    
    if (formData.price <= 0) {
      alert('قیمت باید بیشتر از صفر باشد');
      return;
    }
    
    if (!formData.category) {
      alert('انتخاب دسته‌بندی الزامی است');
      return;
    }

    setLoading(true);

    try {
      // آپلود تصاویر
      const imageUrls: string[] = [];
      
      for (const image of formData.images) {
        const imageFormData = new FormData();
        imageFormData.append('file', image);
        
        const uploadResponse = await fetch('/api/admin/products/images', {
          method: 'POST',
          body: imageFormData,
          credentials: 'include'
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          imageUrls.push(url);
        }
      }

      // ایجاد محصول
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        categoryL3Id: parseInt(formData.category),
        brand: formData.brand,
        imageUrls: imageUrls
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        credentials: 'include'
      });

      if (response.ok) {
        alert('محصول با موفقیت ایجاد شد');
        router.push('/admin/products');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'خطا در ایجاد محصول');
      }
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert('خطا در ایجاد محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FaArrowLeft className="h-4 w-4" />
            بازگشت
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">افزودن محصول جدید</h1>
            <p className="mt-2 text-gray-600">اطلاعات محصول جدید را وارد کنید</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900">اطلاعات پایه</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام محصول *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="نام محصول را وارد کنید"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (کد محصول)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="کد محصول"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.categoryL2.categoryL1.name} / {category.categoryL2.name} / {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  برند
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="نام برند را وارد کنید (مثال: Omron، B.Braun، سایر)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قیمت (تومان) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موجودی
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock || ''}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وزن (گرم)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ابعاد
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="مثال: 10×5×3 سانتی‌متر"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="توضیحات کامل محصول را بنویسید..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900">تصاویر محصول</h2>
            
            <div className="space-y-6">
              {/* Upload Button */}
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
                    <p className="font-medium">انتخاب تصاویر</p>
                    <p className="text-sm">JPG، PNG یا WebP - حداکثر 5MB</p>
                  </div>
                </button>
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900">پیش‌نمایش تصاویر</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                              تصویر اصلی
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900">تنظیمات</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وضعیت محصول
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-auto"
                >
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  محصول ویژه (نمایش در صفحه اصلی)
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              انصراف
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  ذخیره محصول
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 