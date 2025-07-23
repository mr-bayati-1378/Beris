'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaTelegram, FaClock, FaUser, FaTag, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim() || !formData.subject) {
      toast.error('لطفا تمام فیلدهای الزامی را پر کنید');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('پیام شما با موفقیت ارسال شد. کارشناسان ما در اسرع وقت پاسخ شما را خواهند داد');
        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        const error = await res.json();
        throw new Error(error.error || 'خطا در ارسال پیام');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطا در ارسال پیام. لطفا مجددا تلاش کنید');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto max-w-screen-2xl px-8 md:px-16">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">تماس با ما</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              برای هرگونه سوال، پیشنهاد یا مشاوره رایگان با تیم متخصص بریس در تماس باشید
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-screen-2xl px-8 md:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ارسال پیام</h2>
              <p className="text-gray-600">پیام خود را برای ما بفرستید و در کمترین زمان پاسخ شما را خواهیم داد</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline ml-1" />
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline ml-1" />
                    شماره تماس *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline ml-1" />
                  ایمیل
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaTag className="inline ml-1" />
                  موضوع *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">انتخاب موضوع</option>
                  <option value="مشاوره تخصصی">مشاوره تخصصی</option>
                  <option value="سوال درباره محصولات">سوال درباره محصولات</option>
                  <option value="پیگیری سفارش">پیگیری سفارش</option>
                  <option value="پشتیبانی فنی">پشتیبانی فنی</option>
                  <option value="همکاری">همکاری</option>
                  <option value="شکایت">شکایت</option>
                  <option value="سایر موارد">سایر موارد</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  پیام شما *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="پیام خود را با جزئیات کامل بنویسید..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    ارسال پیام
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">اطلاعات تماس</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                    <FaPhone className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">تلفن تماس</h4>
                    <p className="text-gray-600 mb-2">۰۲۱-۸۸۹۰۷۸۱۳</p>
                    <p className="text-gray-600">۰۹۱۰-۵۰۳-۱۲۶۱</p>
                    <p className="text-sm text-gray-500 mt-1">پاسخگویی در ساعات اداری</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                    <FaWhatsapp className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">واتساپ</h4>
                    <a href="https://wa.me/989029161829" className="text-blue-600 hover:text-blue-800 transition-colors">
                      ۰۹۰۲-۹۱۶-۱۸۲۹
                    </a>
                    <p className="text-sm text-gray-500 mt-1">پشتیبانی 24 ساعته</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
                    <FaEnvelope className="text-purple-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">ایمیل</h4>
                    <a href="mailto:beris.medical@gmail.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                      beris.medical@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                    <FaMapMarkerAlt className="text-red-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">آدرس</h4>
                    <p className="text-gray-600">
                      تهران، بالا تر از میدان ولیعصر - خیابان دانش کیان پلاک 11
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                ساعات کاری
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">شنبه تا چهارشنبه</span>
                  <span className="font-medium text-gray-800">8:00 - 17:00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">پنج‌شنبه</span>
                  <span className="font-medium text-gray-800">8:00 - 13:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">جمعه</span>
                  <span className="font-medium text-red-600">تعطیل</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>پشتیبانی اضطراری:</strong> در مواقع ضروری و خارج از ساعات اداری، 
                  از طریق واتساپ با ما در تماس باشید.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">دسترسی سریع</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/faq"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-800">سوالات متداول</div>
                  <div className="text-sm text-gray-600 mt-1">پاسخ سوالات رایج</div>
                </Link>
                
                <Link 
                  href="/return-policy"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-800">قوانین بازگشت</div>
                  <div className="text-sm text-gray-600 mt-1">شرایط مرجوعی</div>
                </Link>
                
                <Link 
                  href="/shipping"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-800">حمل و نقل</div>
                  <div className="text-sm text-gray-600 mt-1">اطلاعات ارسال</div>
                </Link>
                
                <Link 
                  href="/about"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-800">درباره ما</div>
                  <div className="text-sm text-gray-600 mt-1">آشنایی با بریس</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <section className="bg-white py-16">
        <div className="container mx-auto max-w-screen-2xl px-8 md:px-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">موقعیت جغرافیایی</h2>
            <p className="text-gray-600">برای بازدید حضوری از آدرس زیر استفاده کنید</p>
          </div>

          <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">نقشه در حال بارگذاری...</p>
              <p className="text-sm text-gray-500 mt-2">
                تهران، بالا تر از میدان ولیعصر - خیابان دانش کیان پلاک 11
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 