'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaTruck, FaCheckCircle, FaUndo, FaClock, FaBoxOpen, FaComment, FaStar } from 'react-icons/fa';
import PurchaseCommentForm from '@/components/PurchaseCommentForm';

type OrderItem = {
  product?: { id: number; name: string; slug: string; price: number };
  userPack?: { id: number; name: string; totalPrice: number };
  quantity: number;
};

type Order = { 
  id: string; 
  slug: string; 
  createdAt: string; 
  items: OrderItem[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  purchaseComment?: {
    id: number;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: string;
  };
};

export default function OrdersMainView() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'delivered' | 'returned'>('current');
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.orders) {
            setOrders(data.orders);
          } else {
            setOrders([]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          setError('خطا در بارگذاری سفارشات');
          setIsLoading(false);
        });
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  // Filter orders by status (convert to uppercase for comparison)
  const currentOrders = orders.filter(order => 
    ['pending', 'processing'].includes(order.status.toLowerCase())
  );
  const deliveredOrders = orders.filter(order => order.status.toLowerCase() === 'completed');
  const returnedOrders = orders.filter(order => 
    ['cancelled'].includes(order.status.toLowerCase())
  );

  const getOrderIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'processing': return <FaBoxOpen className="text-blue-500" />;
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaUndo className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return 'در انتظار پردازش';
      case 'processing': return 'در حال پردازش';
      case 'completed': return 'تحویل داده شده';
      case 'cancelled': return 'لغو شده';
      default: return 'نامشخص';
    }
  };

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <Link
        href={'/order/' + order.slug}
        className="block"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getOrderIcon(order.status)}
            <div>
              <h3 className="font-semibold text-gray-900">سفارش #{order.slug}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
          <div className="text-left">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
              order.status.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
              order.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">محصولات:</p>
          <div className="flex flex-wrap gap-1 text-sm text-gray-700">
            {order.items.map((item, index) =>
              index < 2
                ? <span key={index} className="bg-gray-50 px-2 py-1 rounded text-xs">
                    {item.product?.name || item.userPack?.name || 'محصول'}
                  </span>
                : index === 2
                  ? <span key={index} className="text-gray-500 text-xs">و {order.items.length - 2} محصول دیگر...</span>
                  : null
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{order.items.length} قلم</span>
            <span className="text-blue-600 font-medium text-sm hover:text-blue-700">
              مشاهده جزئیات ←
            </span>
          </div>
        </div>
      </Link>
      
      {/* Comment Section for Completed Orders */}
      {order.status.toLowerCase() === 'completed' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {order.purchaseComment ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-sm font-medium text-green-800">
                    نظر شما ({order.purchaseComment.rating} از ۵)
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.purchaseComment.isApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.purchaseComment.isApproved ? 'تایید شده' : 'در انتظار بررسی'}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {order.purchaseComment.comment}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">نظر خود را درباره این سفارش بنویسید</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowCommentForm(order.id);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <FaComment className="h-4 w-4" />
                ثبت نظر
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Comment Form Modal */}
      {showCommentForm === order.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full">
            <PurchaseCommentForm
              orderId={order.id}
              orderSlug={order.slug}
              onSuccess={() => {
                setShowCommentForm(null);
                // Refresh orders to show the new comment
                window.location.reload();
              }}
              onCancel={() => setShowCommentForm(null)}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FaUndo className="mx-auto text-4xl text-red-400 mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">سفارشات من</h1>
        <p className="text-gray-600">مدیریت و پیگیری سفارشات خود</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaTruck />
                جاری ({currentOrders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'delivered'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCheckCircle />
                تحویل شده ({deliveredOrders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('returned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'returned'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaUndo />
                مرجوعی ({returnedOrders.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Order Lists */}
      <div className="space-y-6">
        {activeTab === 'current' && (
          <>
            {currentOrders.length === 0 ? (
              <div className="text-center py-12">
                <FaTruck className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش جاری‌ای ندارید</h3>
                <p className="text-gray-500 mb-6">هنوز سفارشی ثبت نکرده‌اید یا تمام سفارشاتتان تحویل داده شده</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaBoxOpen />
                  شروع خرید
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {currentOrders.map(renderOrderCard)}
              </div>
            )}
          </>
        )}

        {activeTab === 'delivered' && (
          <>
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FaCheckCircle className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش تحویل شده‌ای ندارید</h3>
                <p className="text-gray-500">هنوز سفارشی تحویل نگرفته‌اید</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {deliveredOrders.map(renderOrderCard)}
              </div>
            )}
          </>
        )}

        {activeTab === 'returned' && (
          <>
            {returnedOrders.length === 0 ? (
              <div className="text-center py-12">
                <FaUndo className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">سفارش مرجوعی ندارید</h3>
                <p className="text-gray-500">هیچ سفارشی لغو یا مرجوع نشده</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {returnedOrders.map(renderOrderCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
