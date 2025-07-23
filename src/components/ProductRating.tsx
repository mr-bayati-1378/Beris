'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProductRatingProps {
  productId: number;
  initialRating?: number;
  averageRating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showText?: boolean;
  onRatingChange?: (rating: number, averageRating: number, totalRatings: number) => void;
}

export default function ProductRating({
  productId,
  initialRating = 0,
  averageRating = 0,
  reviewCount = 0,
  size = 'md',
  readonly = false,
  showText = true,
  onRatingChange
}: ProductRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAverageRating, setCurrentAverageRating] = useState(averageRating);
  const [currentReviewCount, setCurrentReviewCount] = useState(reviewCount);
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Fetch user's existing rating and current product ratings
  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        // Get user's rating if logged in
        if (user) {
          const userRatingRes = await fetch(`/api/rating?productId=${productId}&userId=${user.id}`);
          if (userRatingRes.ok) {
            const userData = await userRatingRes.json();
            if (userData.userRating) {
              setRating(userData.userRating);
            }
          }
        }

        // Get current product ratings
        const ratingsRes = await fetch(`/api/rating?productId=${productId}`);
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          setCurrentAverageRating(parseFloat(ratingsData.averageRating) || 0);
          setCurrentReviewCount(ratingsData.totalRatings || 0);
        }
      } catch (error) {
        console.error('Error fetching rating data:', error);
      }
    };

    fetchRatingData();
  }, [productId, user]);

  const handleRatingClick = async (value: number) => {
    if (readonly || !user) {
      if (!user) {
        toast.error('برای امتیازدهی لطفاً وارد حساب کاربری خود شوید');
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating: value
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAverageRating = parseFloat(data.averageRating);
        const newTotalRatings = data.totalRatings;
        
        setRating(value);
        setCurrentAverageRating(newAverageRating);
        setCurrentReviewCount(newTotalRatings);
        
        // Notify parent component about the change
        onRatingChange?.(value, newAverageRating, newTotalRatings);
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('productRatingUpdated', {
          detail: {
            productId,
            userRating: value,
            averageRating: newAverageRating,
            totalRatings: newTotalRatings
          }
        }));

        toast.success(`امتیاز ${value} ستاره ثبت شد`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'خطا در ثبت امتیاز');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = readonly ? currentAverageRating : (hoveredRating || rating);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={readonly || isSubmitting || !user}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => !readonly && user && setHoveredRating(star)}
            onMouseLeave={() => !readonly && user && setHoveredRating(0)}
            className={`transition-all duration-200 ${readonly || !user ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
              isSubmitting ? 'opacity-50' : ''
            }`}
            title={readonly ? `میانگین: ${currentAverageRating.toFixed(1)} از ${currentReviewCount} رای` : `امتیاز ${star} ستاره`}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-200 ${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {showText && readonly && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span className="font-medium">{currentAverageRating.toFixed(1)}</span>
          {currentReviewCount > 0 && (
            <span>({currentReviewCount} نظر)</span>
          )}
        </div>
      )}
      
      {showText && !readonly && user && rating > 0 && (
        <span className="text-sm text-gray-600">
          امتیاز شما: {rating} ستاره
        </span>
      )}

      {showText && !readonly && !user && (
        <span className="text-sm text-gray-500">
          برای امتیازدهی وارد شوید
        </span>
      )}
    </div>
  );
} 