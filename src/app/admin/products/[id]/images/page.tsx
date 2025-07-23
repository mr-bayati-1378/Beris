'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaUpload, FaTrash, FaImage } from 'react-icons/fa';

interface ProductImage {
  id: number;
  url: string;
  productId: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  images: ProductImage[];
}

export default function ProductImagesPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        console.error('خطا در دریافت اطلاعات محصول');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات محصول:', error);
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const uploadImages = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }
    formData.append('productId', productId);

    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchProduct();
        setSelectedFiles(null);
        // Reset file input
        const fileInput = document.getElementById('images') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        console.error('خطا در آپلود تصاویر');
      }
    } catch (error) {
      console.error('خطا در آپلود تصاویر:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProduct();
      } else {
        console.error('خطا در حذف تصویر');
      }
    } catch (error) {
      console.error('خطا در حذف تصویر:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">محصول یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin/products" 
              className="text-blue-600 hover:text-blue-700"
            >
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت تصاویر محصول
            </h1>
          </div>
          <p className="text-gray-600">{product.name}</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaUpload className="text-blue-600" />
          آپلود تصاویر جدید
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              انتخاب تصاویر
            </label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <p className="mt-1 text-sm text-gray-500">
              فرمت‌های مجاز: JPG, PNG, GIF | حداکثر اندازه: 5MB
            </p>
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {selectedFiles.length} فایل انتخاب شده
              </p>
              <button
                onClick={uploadImages}
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaUpload />
                {uploading ? 'در حال آپلود...' : 'آپلود تصاویر'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Images */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaImage className="text-green-600" />
          تصاویر موجود ({product.images?.length || 0})
        </h2>

        {product.images && product.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt="تصویر محصول"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>هیچ تصویری برای این محصول آپلود نشده است</p>
          </div>
        )}
      </div>

      {/* Main Image */}
      {product.image && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">تصویر اصلی محصول</h2>
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt="تصویر اصلی محصول"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
} 