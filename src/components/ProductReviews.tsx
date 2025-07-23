'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar, FaUser, FaThumbsUp, FaThumbsDown, FaReply, FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReviewReply {
  id: number;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  content: string;
  createdAt: string;
}

interface Review {
  id: number;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  rating: number;
  title: string;
  content: string;
  helpfulCount: number;
  unhelpfulCount: number;
  userHelpfulVote?: 'helpful' | 'unhelpful' | null;
  replies: ReviewReply[];
  createdAt: string;
}

interface ProductReviewsProps {
  productSlug: string;
  className?: string;
}

export default function ProductReviews({ productSlug, className = "" }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [replyingToReview, setReplyingToReview] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();

  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productSlug, fetchReviews]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast.error('لطفا عنوان و متن نظر را وارد کنید');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      if (res.ok) {
        toast.success('نظر شما با موفقیت ثبت شد');
        setNewReview({ rating: 5, title: '', content: '' });
        setShowReviewForm(false);
        await fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || 'خطا در ثبت نظر');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('خطا در ثبت نظر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: number, voteType: 'helpful' | 'unhelpful') => {
    if (!user) {
      toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpfulCount: data.helpfulCount,
                unhelpfulCount: data.unhelpfulCount,
                userHelpfulVote: data.userVote
              }
            : review
        ));
        toast.success('رای شما ثبت شد');
      } else {
        const data = await res.json();
        toast.error(data.error || 'خطا در ثبت رای');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('خطا در ثبت رای');
    }
  };

  const submitReply = async (reviewId: number) => {
    if (!user) {
      toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('لطفا متن پاسخ را وارد کنید');
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, replies: [...review.replies, data.reply] }
            : review
        ));
        setReplyContent('');
        setReplyingToReview(null);
        toast.success('پاسخ شما ثبت شد');
      } else {
        const data = await res.json();
        toast.error(data.error || 'خطا در ثبت پاسخ');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('خطا در ثبت پاسخ');
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">نظرات کاربران</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0)}
              <span className="text-sm text-gray-600">
                ({reviews.length} نظر)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          نظر جدید
        </button>
      </div>

      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-4">نظر خود را بنویسید</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                امتیاز شما
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان نظر
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="عنوان کوتاه برای نظر شما"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                متن نظر
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نظر خود را در مورد این محصول بنویسید..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={submitReview}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              {/* Review Header */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {review.user.profileImage ? (
                    <Image
                      src={review.user.profileImage}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <FaUser className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {review.user.firstName} {review.user.lastName}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-700">{review.title}</span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </div>

              {/* Review Actions */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleHelpfulVote(review.id, 'helpful')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                    review.userHelpfulVote === 'helpful'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <FaThumbsUp className="text-sm" />
                  <span className="text-sm">مفید ({review.helpfulCount})</span>
                </button>

                <button
                  onClick={() => handleHelpfulVote(review.id, 'unhelpful')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                    review.userHelpfulVote === 'unhelpful'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                  }`}
                >
                  <FaThumbsDown className="text-sm" />
                  <span className="text-sm">مفید نبود ({review.unhelpfulCount})</span>
                </button>

                <button
                  onClick={() => setReplyingToReview(replyingToReview === review.id ? null : review.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaReply className="text-sm" />
                  <span className="text-sm">پاسخ</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyingToReview === review.id && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    placeholder="پاسخ خود را بنویسید..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitReply(review.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      ارسال پاسخ
                    </button>
                    <button
                      onClick={() => {
                        setReplyingToReview(null);
                        setReplyContent('');
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="ml-8 space-y-3">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {reply.user.profileImage ? (
                            <Image
                              src={reply.user.profileImage}
                              alt={`${reply.user.firstName} ${reply.user.lastName}`}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <FaUser className="text-gray-500 text-sm" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {reply.user.firstName} {reply.user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FaUser className="mx-auto text-4xl mb-4 text-gray-300" />
          <p>هنوز نظری برای این محصول ثبت نشده است</p>
          <p className="text-sm">اولین نفری باشید که نظر می‌دهد!</p>
        </div>
      )}
    </div>
  );
}
