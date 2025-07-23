'use client';

import { useState } from 'react';
import { FaTimes, FaSpinner, FaPhone, FaEnvelope, FaWhatsapp, FaClipboardList, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ProductRequestModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductRequestModal({ onClose, onSuccess }: ProductRequestModalProps) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      toast.error('نام محصول الزامی است');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          description: description.trim() || null,
          quantity: Math.max(1, quantity),
          priority,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('درخواست شما با موفقیت ثبت شد');
        onSuccess?.();
        onClose();
      } else {
        console.error('API Error:', data);
        if (response.status === 401) {
          toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
        } else {
          toast.error(data.error || 'خطا در ثبت درخواست');
        }
      }
    } catch (error) {
      console.error('Error submitting product request:', error);
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    NORMAL: 'bg-blue-100 text-blue-800 border-blue-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    URGENT: 'bg-red-100 text-red-800 border-red-200'
  };

  const priorityIcons = {
    LOW: '🟢',
    NORMAL: '🔵',
    HIGH: '🟠',
    URGENT: '🔴'
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200"
        >
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaClipboardList className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">درخواست محصول</h2>
                  <p className="text-sm text-gray-600">محصول مورد نظر خود را درخواست کنید</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-3 rounded-xl hover:bg-gray-100"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* توضیحات */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                محصول مورد نظر شما موجود نیست؟
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                می‌توانید درخواست خود را ثبت کنید و ما در اسرع وقت با شما تماس خواهیم گرفت.
              </p>
              
              {/* اطلاعات تماس */}
              <div className="space-y-3 text-sm">
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-xl shadow-sm"
                >
                  <FaPhone className="text-blue-600 text-lg" />
                  <span className="font-medium">تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</span>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-xl shadow-sm"
                >
                  <FaWhatsapp className="text-green-600 text-lg" />
                  <span className="font-medium">واتساپ: ۰۹۱۲۳۴۵۶۷۸۹</span>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-xl shadow-sm"
                >
                  <FaEnvelope className="text-red-600 text-lg" />
                  <span className="font-medium">ایمیل: info@beris.com</span>
                </motion.div>
              </div>
            </motion.div>

            {/* فرم درخواست */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  نام محصول *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-lg"
                  placeholder="نام محصول مورد نظر خود را وارد کنید"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  توضیحات
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 resize-none"
                  placeholder="توضیحات بیشتر (برند، مدل، مشخصات و...)"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    تعداد
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    اولویت
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-lg"
                  >
                    <option value="LOW">کم</option>
                    <option value="NORMAL">عادی</option>
                    <option value="HIGH">زیاد</option>
                    <option value="URGENT">فوری</option>
                  </select>
                </div>
              </div>

              {/* نمایش اولویت انتخاب شده */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${priorityColors[priority]}`}
              >
                <span className="text-lg">{priorityIcons[priority]}</span>
                <span className="font-bold">
                  اولویت: {
                    priority === 'LOW' ? 'کم' :
                    priority === 'NORMAL' ? 'عادی' :
                    priority === 'HIGH' ? 'زیاد' : 'فوری'
                  }
                </span>
              </motion.div>
            </motion.div>

            {/* دکمه‌های عملیات */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 pt-8 border-t border-gray-200"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg font-bold text-lg"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FaSpinner />
                  </motion.div>
                ) : (
                  <FaClipboardList />
                )}
                {loading ? 'در حال ثبت...' : 'ثبت درخواست'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-bold text-lg"
              >
                انصراف
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 