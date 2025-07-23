'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Share2,
  Star,
  X,
  Truck,
  Shield,
  Clock,
  Gift,
  Eye,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react';
import ProductRating from '@/components/ProductRating';
import ProductReviews from '@/components/ProductReviews';
import ProductComparison from '@/components/ProductComparison';
import AddToCartButton from '@/components/AddToCartButton';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import PriceDisplay from '@/components/ui/price-display';
import { Product } from '@/types';

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  img: string;
  slug: string;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const { user } = useAuth();
  const { isInCart } = useCart();

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${params.slug}?_t=${Date.now()}`);
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات محصول');
      const data = await res.json();
      setProduct(data.product);
      setRelatedProducts(data.relatedProducts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  async function shareProduct() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description ?? '',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-4 text-red-500"
        >
          {error}
        </motion.div>
        <Link href="/" className="btn btn-primary">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-4 h-16 w-16 text-gray-300"
        >
          <svg
            className="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.div>
        <h2 className="mb-2 text-xl font-bold text-gray-700">محصول یافت نشد</h2>
        <p className="mb-6 text-gray-500">
          متأسفانه محصول مورد نظر شما در دسترس نیست
        </p>
        <Link href="/" className="btn btn-primary">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-4 z-[95] -translate-x-1/2 rounded-lg border border-green-400 bg-green-100 px-3 sm:px-4 py-2 sm:py-3 text-green-700 shadow-lg text-sm sm:text-base"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto"
      >
        <Link href="/" className="hover:text-primary whitespace-nowrap transition-colors">
          خانه
        </Link>
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-primary whitespace-nowrap transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="text-gray-800 truncate">{product.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Product Gallery */}
        <motion.div 
          className="space-y-3 sm:space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative h-56 sm:h-72 md:h-80 lg:h-96 w-full max-w-md sm:max-w-lg lg:max-w-[500px] mx-auto overflow-hidden rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 cursor-pointer group">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
              priority
              onClick={() => setShowImageModal(true)}
            />
            
            {/* Discount Badge */}
            {product.hasDiscount && product.discountPercent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 left-2 z-[15]"
              >
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {product.discountPercent}% تخفیف
                </span>
              </motion.div>
            )}

            {/* Stock Badge */}
            {product.stock === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-8 left-2 z-[15]"
              >
                <span className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-800 font-medium">
                  ناموجود
                </span>
              </motion.div>
            )}

            {/* Navigation arrows for image slideshow */}
            {product.images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) => (prev + 1) % product.images.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              </>
            )}

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 z-[15] flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleWishlist}
                className={`p-2 rounded-full shadow-lg transition-colors ${
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 hover:bg-white text-gray-800'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={shareProduct}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="hide-scrollbar flex justify-center gap-1 sm:gap-2 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-md sm:rounded-lg border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - تصویر ${index + 1}`}
                    fill
                    className="object-contain p-1 sm:p-2"
                    sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div 
          className="space-y-3 sm:space-y-4 lg:pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            {product.brand && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-1 sm:mb-2 text-xs text-gray-600 font-medium"
              >
                {product.brand}
              </motion.div>
            )}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-gray-900 md:text-2xl leading-tight"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-2 sm:mb-3"
            >
              <ProductRating
                productId={product.id}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount}
                readonly
              />
            </motion.div>

            {/* Price */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-2 sm:mb-3"
            >
              {product.hasDiscount ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-bold text-red-600 price-text">
                      <PriceDisplay price={product.price} size="lg" />
                    </span>
                    <span className="text-sm sm:text-base text-gray-500 line-through price-text">
                      <PriceDisplay price={product.comparePrice || product.price} size="md" />
                    </span>
                  </div>
                  <div className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded">
                    {product.discountPercent}٪ تخفیف
                  </div>
                </div>
              ) : (
                <div className="text-lg sm:text-xl font-bold text-primary price-text">
                  <PriceDisplay price={product.price} size="lg" />
                </div>
              )}
            </motion.div>

            {/* Stock Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`inline-block rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                product.stock > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? 'موجود در انبار' : 'ناموجود'}
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700">ارسال سریع</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">ضمانت اصالت</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-700">پشتیبانی ۲۴/۷</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <Gift className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-700">ارسال رایگان</span>
            </div>
          </motion.div>

          {/* Description */}
          {product.description && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="prose prose-sm max-w-none text-gray-600"
            >
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                توضیحات محصول
              </h3>
              <p className="text-sm">{product.description}</p>
            </motion.div>
          )}

          {/* Specifications */}
          {(product as any).specifications && Object.keys((product as any).specifications).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h3 className="mb-2 text-sm font-semibold text-gray-800">مشخصات فنی</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {Object.entries((product as any).specifications).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
          >
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs sm:text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {product.stock > 0 ? `${product.stock} عدد موجود` : 'ناموجود'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 sm:gap-4">
                <label className="text-gray-700 font-medium text-sm sm:text-base">تعداد:</label>
                <div className="flex items-center rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors rounded-r-lg sm:rounded-r-xl text-sm sm:text-base"
                  >
                    −
                  </motion.button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={e =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(product.stock, Number(e.target.value))
                        )
                      )
                    }
                    className="w-16 sm:w-20 py-2 text-center font-medium border-x-2 border-gray-200 focus:outline-none focus:bg-blue-50 text-sm sm:text-base"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setQuantity(q => Math.min(product.stock, q + 1))
                    }
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors rounded-l-lg sm:rounded-l-xl text-sm sm:text-base"
                  >
                    +
                  </motion.button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <AddToCartButton 
                  productId={product.id}
                  quantity={quantity}
                  className="w-full px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  showIcon={true}
                >
                  {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
                </AddToCartButton>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareProduct}
                className="flex items-center justify-center w-14 h-14 rounded-xl bg-white text-gray-400 border-2 border-gray-200 hover:bg-gray-50 hover:text-blue-500 transition-all duration-200"
                title="اشتراک‌گذاری محصول"
              >
                <Share2 className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Comparison Button */}
            <div className="pt-4 border-t border-gray-200">
              <ProductComparison currentProduct={product} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            محصولات مرتبط
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="group block"
                >
                  <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-gray-50">
                      <Image
                        src={product.img}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-800">
                      {product.name}
                    </h3>
                    <div className="font-bold text-primary price-text">
                      {product.price.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Reviews */}
      <motion.div 
        className="mt-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <ProductReviews productSlug={product.slug} />
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={800}
                height={600}
                className="rounded-lg object-contain max-h-[90vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-xl bg-white p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  اشتراک‌گذاری محصول
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const text = `${product?.name}\n\nقیمت: ${<PriceDisplay price={product?.price} showCurrency={false} />} تومان\n\n${window.location.href}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  اشتراک در واتساپ
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const text = `${product?.name}\n\nقیمت: ${<PriceDisplay price={product?.price} showCurrency={false} />} تومان\n\n${window.location.href}`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  اشتراک در تلگرام
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const text = `${product?.name} - ${window.location.href}`;
                    if (navigator.canShare && navigator.canShare({ title: product?.name, text: text, url: window.location.href })) {
                      navigator.share({
                        title: product?.name,
                        text: text,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback for Instagram (opens Instagram app if available)
                      window.open('https://www.instagram.com/', '_blank');
                    }
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  اشتراک در اینستاگرام
                </motion.button>
              </div>

              {/* Copy Link */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">یا لینک را کپی کنید:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setSuccessMessage('لینک کپی شد');
                      setShowShareModal(false);
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    کپی
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
