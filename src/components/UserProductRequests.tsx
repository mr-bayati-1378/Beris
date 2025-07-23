'use client';

import { useState, useEffect } from 'react';
import { FaClipboardList, FaClock, FaCheck, FaTimes, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface ProductRequest {
  id: number;
  productName: string;
  description: string | null;
  quantity: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserProductRequests() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/product-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <FaClock className="text-yellow-500" />;
      case 'IN_REVIEW': return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'APPROVED': return <FaCheck className="text-green-500" />;
      case 'REJECTED': return <FaTimes className="text-red-500" />;
      case 'COMPLETED': return <FaCheck className="text-purple-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در انتظار بررسی';
      case 'IN_REVIEW': return 'در حال بررسی';
      case 'APPROVED': return 'تایید شده';
      case 'REJECTED': return 'رد شده';
      case 'COMPLETED': return 'تکمیل شده';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'کم';
      case 'NORMAL': return 'عادی';
      case 'HIGH': return 'زیاد';
      case 'URGENT': return 'فوری';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaClipboardList className="text-purple-600" />
          درخواست‌های محصول
        </h3>
        <div className="text-center py-8">
          <FaClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">هنوز درخواست محصولی ثبت نکرده‌اید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaClipboardList className="text-purple-600" />
        درخواست‌های محصول ({requests.length})
      </h3>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{request.productName}</h4>
                {request.description && (
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>تعداد: {request.quantity} عدد</span>
                  <span>تاریخ: {new Date(request.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                  {getPriorityText(request.priority)}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  {getStatusIcon(request.status)}
                  <span className="text-gray-600">{getStatusText(request.status)}</span>
                </div>
              </div>
            </div>
            
            {request.adminNotes && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">یادداشت ادمین:</span> {request.adminNotes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 