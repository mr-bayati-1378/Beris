'use client';

import { useState } from 'react';
import {
  FaGavel,
  FaUserShield,
  FaShoppingCart,
  FaLock,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';

interface TermSection {
  id: string;
  title: string;
  icon: any;
  content: string[];
}

const termSections: TermSection[] = [
  {
    id: 'general',
    title: 'شرایط کلی',
    icon: FaGavel,
    content: [
      'با استفاده از خدمات بریس، شما موافقت می‌کنید که به این شرایط و مقررات پایبند باشید.',
      'بریس این حق را برای خود محفوظ می‌دارد که در هر زمان این شرایط را تغییر دهد.',
      'استفاده از خدمات بریس برای افراد بالای ۱۸ سال مجاز است.',
      'مسئولیت حفظ امنیت حساب کاربری بر عهده کاربر است.',
    ],
  },
  {
    id: 'account',
    title: 'حساب کاربری',
    icon: FaUserShield,
    content: [
      'هر کاربر می‌تواند فقط یک حساب کاربری داشته باشد.',
      'اطلاعات ثبت‌نام باید دقیق و معتبر باشند.',
      'بریس حق دارد حساب‌های کاربری مشکوک را مسدود کند.',
      'کاربر موظف است اطلاعات تماس خود را به‌روز نگه دارد.',
    ],
  },
  {
    id: 'orders',
    title: 'سفارشات',
    icon: FaShoppingCart,
    content: [
      'قیمت‌های نمایش داده شده در سایت به تومان است.',
      'بریس حق دارد در صورت عدم موجودی، سفارش را لغو کند.',
      'تخفیف‌ها و پیشنهادات ویژه قابل ترکیب نیستند.',
      'سفارش‌ها پس از تایید پرداخت قابل لغو نیستند.',
    ],
  },
  {
    id: 'privacy',
    title: 'حریم خصوصی',
    icon: FaLock,
    content: [
      'بریس متعهد به حفظ حریم خصوصی کاربران است.',
      'اطلاعات شخصی کاربران فقط برای ارائه خدمات استفاده می‌شود.',
      'کاربران می‌توانند درخواست حذف اطلاعات خود را داشته باشند.',
      'بریس از کوکی‌ها برای بهبود تجربه کاربری استفاده می‌کند.',
    ],
  },
  {
    id: 'prohibited',
    title: 'اقدامات ممنوع',
    icon: FaExclamationTriangle,
    content: [
      'استفاده از حساب کاربری دیگران ممنوع است.',
      'خرید با کارت بانکی غیرمجاز ممنوع است.',
      'سوء استفاده از کدهای تخفیف ممنوع است.',
      'انتشار محتوای نامناسب در نظرات ممنوع است.',
    ],
  },
  {
    id: 'warranty',
    title: 'ضمانت و گارانتی',
    icon: FaCheckCircle,
    content: [
      'تمام محصولات بریس دارای گارانتی اصالت کالا هستند.',
      'ضمانت تعویض و بازگشت کالا طبق قوانین بریس است.',
      'گارانتی محصولات بر اساس ضمانت‌نامه شرکت‌های سازنده است.',
      'بریس متعهد به ارائه خدمات پس از فروش معتبر است.',
    ],
  },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>('general');

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/90 to-primary/70 p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">شرایط استفاده</h1>
          <p className="text-lg text-white/90">
            لطفاً قبل از استفاده از خدمات بریس، این شرایط و مقررات را به دقت
            مطالعه کنید
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Navigation */}
        <div className="lg:w-1/4">
          <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              فهرست مطالب
            </h2>
            <nav className="space-y-2">
              {termSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          {termSections.map(section => (
            <div
              key={section.id}
              id={section.id}
              className={`mb-8 rounded-2xl bg-white p-8 shadow-sm ${
                activeSection === section.id ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.content.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <p className="leading-relaxed text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-16 rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-12 text-center text-white">
        <h2 className="mb-6 text-3xl font-bold">
          سوالی در مورد شرایط استفاده دارید؟
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
          تیم پشتیبانی بریس آماده پاسخگویی به سوالات شما در مورد شرایط استفاده
          از خدمات ماست.
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
