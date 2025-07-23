"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShippingMethod {
  id: number;
  name: string;
  cost: number;
  description: string;
  isActive: boolean;
}

export default function ShippingPage() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      // For now, showing mock data since API doesn't exist yet
      setShippingMethods([
        { id: 1, name: 'ارسال عادی', cost: 50000, description: 'ارسال در 3-5 روز کاری', isActive: true },
        { id: 2, name: 'ارسال سریع', cost: 100000, description: 'ارسال در 1-2 روز کاری', isActive: true },
        { id: 3, name: 'ارسال فوری', cost: 150000, description: 'ارسال در همان روز', isActive: false },
      ]);
    } catch (error) {
      console.error('خطا در دریافت روش‌های ارسال:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send to API
    console.log('New shipping method:', formData);
    setShowForm(false);
    setFormData({ name: '', cost: '', description: '', isActive: true });
    alert('روش ارسال جدید اضافه شد');
  };

  const toggleStatus = async (id: number) => {
    // Here you would normally update via API
    setShippingMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, isActive: !method.isActive } : method
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">روش‌های ارسال</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'انصراف' : 'افزودن روش ارسال'}
        </Button>
      </div>

      {/* فرم افزودن روش ارسال */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">افزودن روش ارسال جدید</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">نام روش ارسال *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="مثال: ارسال عادی"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">هزینه (تومان) *</label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  required
                  placeholder="50000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">توضیحات</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="توضیحات روش ارسال"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <label className="text-sm">فعال</label>
            </div>
            <div className="flex gap-4">
              <Button type="submit">
                ذخیره
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                انصراف
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">لیست روش‌های ارسال</h2>
          </div>
          <div className="p-6">
            {shippingMethods.length === 0 ? (
              <p className="text-center text-gray-500 py-8">روش ارسالی یافت نشد</p>
            ) : (
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{method.name}</h3>
                          <span className={`px-2 py-1 rounded text-sm ${
                            method.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {method.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{method.description}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {method.cost.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(method.id)}
                        >
                          {method.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('ویرایش روش ارسال')}
                        >
                          ویرایش
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* آمار ارسال */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">سفارشات در انتظار ارسال</h3>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">سفارشات در حال ارسال</h3>
          <p className="text-2xl font-bold text-yellow-600">8</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">سفارشات تحویل شده</h3>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
      </div>
    </div>
  );
} 