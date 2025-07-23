'use client';

import { useState } from 'react';
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaTruck,
  FaMoneyBillWave,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

const faqItems: FAQItem[] = [
  // سوالات مربوط به خرید
  {
    id: 1,
    category: 'خرید',
    question: 'چگونه می‌توانم در بریس خرید کنم؟',
    answer:
      'برای خرید در بریس، ابتدا باید در سایت ثبت‌نام کنید. سپس می‌توانید محصولات مورد نظر خود را به سبد خرید اضافه کرده و پس از تکمیل اطلاعات ارسال و پرداخت، سفارش خود را نهایی کنید.',
    icon: FaShoppingCart,
  },
  {
    id: 2,
    category: 'خرید',
    question: 'آیا امکان خرید بدون ثبت‌نام وجود دارد؟',
    answer:
      'خیر، برای امنیت بیشتر و پیگیری بهتر سفارشات، خرید فقط برای کاربران ثبت‌نام شده امکان‌پذیر است.',
    icon: FaShoppingCart,
  },
  {
    id: 3,
    category: 'خرید',
    question: 'چه روش‌های پرداختی در بریس وجود دارد؟',
    answer:
      'در بریس می‌توانید از طریق درگاه‌های بانکی، کیف پول و پرداخت در محل (فقط برای تهران) خرید خود را انجام دهید.',
    icon: FaMoneyBillWave,
  },

  // سوالات مربوط به حساب کاربری
  {
    id: 4,
    category: 'حساب کاربری',
    question: 'چگونه می‌توانم در بریس ثبت‌نام کنم؟',
    answer:
      'برای ثبت‌نام در بریس، روی دکمه "ثبت‌نام" در بالای صفحه کلیک کنید و اطلاعات خواسته شده شامل نام، شماره موبایل و رمز عبور را وارد کنید.',
    icon: FaUser,
  },
  {
    id: 5,
    category: 'حساب کاربری',
    question: 'رمز عبور خود را فراموش کرده‌ام، چه کنم؟',
    answer:
      'روی دکمه "فراموشی رمز عبور" در صفحه ورود کلیک کنید و شماره موبایل خود را وارد کنید. کد تایید برای شما ارسال خواهد شد.',
    icon: FaUser,
  },
  {
    id: 6,
    category: 'حساب کاربری',
    question: 'چگونه می‌توانم اطلاعات حساب کاربری خود را ویرایش کنم؟',
    answer:
      'پس از ورود به حساب کاربری، در بخش "پروفایل" می‌توانید اطلاعات شخصی، آدرس‌ها و سایر تنظیمات حساب خود را ویرایش کنید.',
    icon: FaUser,
  },

  // سوالات مربوط به ارسال
  {
    id: 7,
    category: 'ارسال',
    question: 'هزینه ارسال چگونه محاسبه می‌شود؟',
    answer:
      'هزینه ارسال بر اساس وزن محصول، مسافت و روش ارسال محاسبه می‌شود. برای سفارش‌های بالای ۵ میلیون تومان، ارسال رایگان است.',
    icon: FaTruck,
  },
  {
    id: 8,
    category: 'ارسال',
    question: 'چقدر طول می‌کشد تا سفارش من ارسال شود؟',
    answer:
      'سفارش‌های ثبت شده در روزهای کاری، معمولاً در همان روز یا روز بعد ارسال می‌شوند. زمان تحویل بسته به روش ارسال و شهر مقصد متفاوت است.',
    icon: FaTruck,
  },
  {
    id: 9,
    category: 'ارسال',
    question: 'آیا امکان ارسال به شهرستان‌ها وجود دارد؟',
    answer:
      'بله، ما با همکاری با پست پیشتاز، سفارشات را به سراسر کشور ارسال می‌کنیم.',
    icon: FaTruck,
  },

  // سوالات عمومی
  {
    id: 10,
    category: 'عمومی',
    question: 'آیا محصولات بریس اصل هستند؟',
    answer:
      'بله، تمام محصولات بریس از برندهای معتبر و با گارانتی اصالت کالا عرضه می‌شوند.',
    icon: FaQuestionCircle,
  },
  {
    id: 11,
    category: 'عمومی',
    question: 'ساعات کاری بریس چه زمانی است؟',
    answer:
      'پشتیبانی بریس در تمام روزهای هفته از ساعت ۹ صبح تا ۹ شب آماده پاسخگویی به شماست.',
    icon: FaQuestionCircle,
  },
  {
    id: 12,
    category: 'عمومی',
    question: 'چگونه می‌توانم با پشتیبانی بریس در تماس باشم؟',
    answer:
      'شما می‌توانید از طریق شماره تلفن ۰۲۱-۱۲۳۴۵۶۷۸، واتساپ یا فرم تماس با ما در سایت با ما در ارتباط باشید.',
    icon: FaQuestionCircle,
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');

  const categories = ['همه', ...new Set(faqItems.map(item => item.category))];

  const filteredItems = faqItems.filter(item => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'همه' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/90 to-primary/70 p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">سوالات متداول</h1>
          <p className="text-lg text-white/90">
            پاسخ به سوالات پرتکرار شما در مورد خرید، ارسال، حساب کاربری و سایر
            خدمات بریس
          </p>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="mb-12">
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="جستجو در سوالات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-12 py-4 text-right focus:border-primary focus:outline-none"
            dir="rtl"
          />
          <FaSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-6 py-2 transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between gap-4 p-6 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <h3 className="mb-1 text-lg font-bold text-gray-800">
                    {item.question}
                  </h3>
                  <span className="text-sm text-primary">{item.category}</span>
                </div>
              </div>
              {expandedItems.includes(item.id) ? (
                <FaChevronUp className="h-5 w-5 flex-shrink-0 text-gray-400" />
              ) : (
                <FaChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
              )}
            </button>
            {expandedItems.includes(item.id) && (
              <div className="border-t border-gray-100 p-6 pt-0">
                <p className="leading-relaxed text-gray-600">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="py-12 text-center">
          <FaQuestionCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-xl font-bold text-gray-800">
            نتیجه‌ای یافت نشد
          </h3>
          <p className="text-gray-600">
            متاسفانه هیچ سوالی با جستجوی شما مطابقت ندارد. لطفاً عبارت دیگری را
            امتحان کنید.
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-16 rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-12 text-center text-white">
        <h2 className="mb-6 text-3xl font-bold">
          پاسخ سوال خود را پیدا نکردید؟
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
          تیم پشتیبانی بریس آماده پاسخگویی به سوالات شماست. می‌توانید از طریق
          فرم تماس با ما یا شماره‌های پشتیبانی با ما در ارتباط باشید.
        </p>
        <a
          href="/contact"
          className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-gray-100"
        >
          تماس با پشتیبانی
        </a>
      </div>
    </div>
  );
}
