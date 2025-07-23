'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaTelegram, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaClock, FaCreditCard } from 'react-icons/fa';

export default function Footer() {

  return (
    <>
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Company Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src="/beris-logo.png"
                    alt="بریس"
                    width={56}
                    height={56}
                    className="rounded-lg shadow-lg"
                  />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">بریس</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                فروشگاه تخصصی تجهیزات پزشکی و بیمارستانی با بیش از ۱۰ سال تجربه در ارائه محصولات با کیفیت و خدمات تخصصی
              </p>
              
              {/* Enhanced Social Media Icons */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-400">شبکه‌های اجتماعی</h4>
                <div className="flex items-center gap-4">
                  <motion.a
                    href="https://t.me/beris_medical"
                    className="group relative bg-gray-800 hover:bg-blue-500 p-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                    aria-label="تلگرام"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTelegram className="text-2xl" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">تلگرام</span>
                  </motion.a>
                  <motion.a
                    href="https://instagram.com/beris_medical"
                    className="group relative bg-gray-800 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 p-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                    aria-label="اینستاگرام"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaInstagram className="text-2xl" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">اینستاگرام</span>
                  </motion.a>
                  <motion.a
                    href="https://wa.me/989029161829"
                    className="group relative bg-gray-800 hover:bg-green-500 p-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                    aria-label="واتساپ"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaWhatsapp className="text-2xl" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">واتساپ</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-blue-400">دسترسی سریع</h4>
              <ul className="space-y-3 text-sm">
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/products" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    محصولات
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/categories" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    دسته‌بندی‌ها
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/consultation" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    مشاوره تخصصی
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/blog" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    مقالات
                  </Link>
                </motion.li>
              </ul>
            </motion.div>

            {/* Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-blue-400">خدمات مشتریان</h4>
              <ul className="space-y-3 text-sm">
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    تماس با ما
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/faq" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    سوالات متداول
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/shipping" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    راهنمای ارسال
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/return-policy" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    ضمانت و مرجوعی
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    حریم خصوصی
                  </Link>
                </motion.li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-blue-400">اطلاعات تماس</h4>
              <div className="space-y-4 text-sm">
                <motion.div 
                  className="flex items-center gap-3 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-blue-600/20 p-3 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                    <FaPhone className="text-blue-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">تلفن تماس:</p>
                    <a href="tel:+982188907813" className="text-white hover:text-blue-400 transition-colors font-medium">
                      ۰۲۱-۸۸۹۰۷۸۱۳
                    </a>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-blue-600/20 p-3 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                    <FaPhone className="text-blue-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">موبایل:</p>
                    <a href="tel:+989105031261" className="text-white hover:text-blue-400 transition-colors font-medium">
                      ۰۹۱۰-۵۰۳-۱۲۶۱
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-3 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-green-600/20 p-3 rounded-lg group-hover:bg-green-600/30 transition-colors">
                    <FaWhatsapp className="text-green-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">واتساپ:</p>
                    <a href="https://wa.me/989029161829" className="text-white hover:text-green-400 transition-colors font-medium">
                      ۰۹۰۲-۹۱۶-۱۸۲۹
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-3 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-purple-600/20 p-3 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                    <FaEnvelope className="text-purple-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">ایمیل:</p>
                    <a href="mailto:beris.medical@gmail.com" className="text-white hover:text-purple-400 transition-colors font-medium">
                      beris.medical@gmail.com
                    </a>
                  </div>
                </motion.div>
              </div>
              
              {/* Enhanced Working Hours */}
              <motion.div 
                className="mt-6 p-5 bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl border border-gray-700/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h5 className="font-semibold mb-3 text-blue-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  ساعات کاری
                </h5>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">شنبه تا چهارشنبه:</span>
                    <span className="text-blue-300 font-medium">۸:۰۰ - ۱۷:۰۰</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">پنج‌شنبه:</span>
                    <span className="text-blue-300 font-medium">۸:۰۰ - ۱۳:۰۰</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">جمعه:</span>
                    <span className="text-red-400 font-medium">تعطیل</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>



          {/* Trust Badges */}
          <motion.div 
            className="border-t border-gray-700/50 pt-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="text-center text-lg font-semibold mb-6 text-blue-400">نمادهای اعتماد</h4>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/trust-badges/enamad.png"
                  alt="نماد اعتماد الکترونیکی"
                  width={80}
                  height={80}
                  className="grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/trust-badges/samandehi.png"
                  alt="ساماندهی"
                  width={80}
                  height={80}
                  className="grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/trust-badges/ssl.png"
                  alt="گواهی SSL"
                  width={80}
                  height={80}
                  className="grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Footer */}
          <motion.div 
            className="border-t border-gray-700/50 pt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400 text-center md:text-right">
                <p className="font-medium">© ۱۴۰۳ فروشگاه بریس. تمامی حقوق محفوظ است.</p>
                <p className="mt-1 text-xs">طراحی و توسعه با <span className="text-red-400 animate-pulse">❤️</span> توسط تیم فنی بریس</p>
              </div>
              
              {/* Payment Methods */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">پرداخت امن:</span>
                <div className="flex gap-2">
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src="/payment/visa.png"
                      alt="ویزا"
                      width={32}
                      height={20}
                    />
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src="/payment/mastercard.png"
                      alt="مسترکارت"
                      width={32}
                      height={20}
                    />
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src="/payment/iran-payment.png"
                      alt="پرداخت الکترونیک"
                      width={32}
                      height={20}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
}
