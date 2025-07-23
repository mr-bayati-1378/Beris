'use client';

import { useState } from 'react';
import { FaStar, FaComment, FaCheck, FaTimes } from 'react-icons/fa';
import { toPersianNumerals } from '@/lib/utils';

interface PurchaseCommentFormProps {
  orderId: string;
  orderSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PurchaseCommentForm({ 
  orderId, 
  orderSlug, 
  onSuccess, 
  onCancel 
}: PurchaseCommentFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('لطفاً امتیاز خود را انتخاب کنید');
      return;
    }

    if (comment.trim().length < 10) {
      setError('نظر باید حداقل ۱۰ کاراکتر باشد');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/purchase-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          rating,
          comment: comment.trim(),
          isPublic
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setError(data.error || 'خطا در ثبت نظر');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <FaCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          نظر شما با موفقیت ثبت شد
        </h3>
        <p className="text-green-600">
          نظر شما پس از بررسی توسط تیم ما منتشر خواهد شد
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ثبت نظر</h3>
          <p className="text-sm text-gray-500">
            سفارش شماره: {toPersianNumerals(orderSlug)}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            امتیاز شما
          </label>
          <div className="flex items-center space-x-2 space-x-reverse">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-colors duration-200"
              >
                <FaStar
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  } hover:text-yellow-400`}
                />
              </button>
            ))}
            <span className="mr-3 text-sm text-gray-600">
              {rating === 0 
                ? 'امتیاز دهید' 
                : `${toPersianNumerals(rating.toString())} از ۵`
              }
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نظر شما
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="تجربه خود از خرید و استفاده از محصول را بنویسید..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            حداقل ۱۰ کاراکتر - {toPersianNumerals(comment.length.toString())} کاراکتر
          </p>
        </div>

        {/* Public checkbox */}
        <div className="flex items-center">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="isPublic" className="mr-2 block text-sm text-gray-700">
            موافقم نظر من برای سایر کاربران نمایش داده شود
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              انصراف
            </button>
          )}
          <button
            type="submit"
            disabled={loading || rating === 0 || comment.trim().length < 10}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                در حال ثبت...
              </>
            ) : (
              <>
                <FaComment className="h-4 w-4" />
                ثبت نظر
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 