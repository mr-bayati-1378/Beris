'use client';

import { useState } from 'react';
import {
  FaShieldAlt,
  FaDatabase,
  FaUserLock,
  FaCookie,
  FaEye,
  FaTrash,
  FaDownload,
  FaEdit,
} from 'react-icons/fa';

interface PrivacySection {
  id: string;
  title: string;
  icon: any;
  content: {
    title: string;
    description: string;
  }[];
}

const privacySections: PrivacySection[] = [
  {
    id: 'collection',
    title: 'جمع‌آوری اطلاعات',
    icon: FaDatabase,
    content: [
      {
        title: 'اطلاعات شخصی',
        description:
          'ما اطلاعات شخصی شما مانند نام، شماره تماس، آدرس و ایمیل را برای ارائه خدمات بهتر جمع‌آوری می‌کنیم. این اطلاعات فقط با رضایت شما و برای اهداف مشخص شده استفاده می‌شوند.',
      },
      {
        title: 'اطلاعات دستگاه',
        description:
          'اطلاعات مربوط به دستگاه شما مانند نوع مرورگر، سیستم عامل و آدرس IP برای بهبود امنیت و تجربه کاربری جمع‌آوری می‌شود.',
      },
      {
        title: 'اطلاعات خرید',
        description:
          'تاریخچه خرید، سبد خرید و ترجیحات شما برای شخصی‌سازی خدمات و بهبود تجربه خرید جمع‌آوری می‌شود.',
      },
    ],
  },
  {
    id: 'usage',
    title: 'استفاده از اطلاعات',
    icon: FaEye,
    content: [
      {
        title: 'ارائه خدمات',
        description:
          'اطلاعات شما برای پردازش سفارشات، ارسال محصولات و ارائه پشتیبانی استفاده می‌شود.',
      },
      {
        title: 'بهبود خدمات',
        description:
          'از اطلاعات جمع‌آوری شده برای تحلیل رفتار کاربران و بهبود خدمات و محصولات استفاده می‌شود.',
      },
      {
        title: 'ارتباطات',
        description:
          'برای ارسال اطلاعیه‌های مهم، به‌روزرسانی‌ها و پیشنهادات شخصی‌سازی شده از اطلاعات تماس شما استفاده می‌شود.',
      },
    ],
  },
  {
    id: 'cookies',
    title: 'کوکی‌ها و ردیابی',
    icon: FaCookie,
    content: [
      {
        title: 'کوکی‌های ضروری',
        description:
          'این کوکی‌ها برای عملکرد صحیح سایت ضروری هستند و نمی‌توان آنها را غیرفعال کرد.',
      },
      {
        title: 'کوکی‌های عملکردی',
        description:
          'برای به خاطر سپردن تنظیمات و ترجیحات شما استفاده می‌شوند.',
      },
      {
        title: 'کوکی‌های تحلیلی',
        description:
          'برای درک بهتر نحوه استفاده از سایت و بهبود خدمات استفاده می‌شوند.',
      },
    ],
  },
  {
    id: 'security',
    title: 'امنیت اطلاعات',
    icon: FaShieldAlt,
    content: [
      {
        title: 'محافظت از داده‌ها',
        description:
          'ما از روش‌های امنیتی پیشرفته برای محافظت از اطلاعات شما استفاده می‌کنیم.',
      },
      {
        title: 'دسترسی محدود',
        description:
          'فقط کارکنان مجاز به اطلاعات شخصی شما دسترسی دارند و این دسترسی محدود و کنترل شده است.',
      },
      {
        title: 'رمزنگاری',
        description:
          'اطلاعات حساس شما با استفاده از پروتکل‌های امنیتی و رمزنگاری محافظت می‌شوند.',
      },
    ],
  },
  {
    id: 'rights',
    title: 'حقوق کاربران',
    icon: FaUserLock,
    content: [
      {
        title: 'دسترسی به اطلاعات',
        description:
          'شما می‌توانید به اطلاعات شخصی خود دسترسی داشته و آنها را مشاهده کنید.',
      },
      {
        title: 'اصلاح اطلاعات',
        description: 'حق دارید اطلاعات نادرست را اصلاح کنید.',
      },
      {
        title: 'حذف اطلاعات',
        description: 'می‌توانید درخواست حذف اطلاعات شخصی خود را داشته باشید.',
      },
      {
        title: 'مخالفت با پردازش',
        description:
          'می‌توانید با پردازش اطلاعات خود برای اهداف خاص مخالفت کنید.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'تماس با ما',
    icon: FaEdit,
    content: [
      {
        title: 'سوالات و نگرانی‌ها',
        description:
          'اگر سوال یا نگرانی در مورد حریم خصوصی خود دارید، می‌توانید با تیم پشتیبانی ما تماس بگیرید.',
      },
      {
        title: 'به‌روزرسانی‌ها',
        description:
          'این سیاست حریم خصوصی ممکن است به‌روزرسانی شود. تغییرات مهم از طریق ایمیل یا اعلان در سایت به شما اطلاع داده می‌شود.',
      },
      {
        title: 'راه‌های تماس',
        description:
          'برای ارتباط با ما می‌توانید از فرم تماس با ما، ایمیل یا شماره‌های پشتیبانی استفاده کنید.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>('collection');

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/90 to-primary/70 p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">حریم خصوصی</h1>
          <p className="text-lg text-white/90">
            ما متعهد به حفظ حریم خصوصی شما هستیم. این صفحه توضیح می‌دهد که چگونه
            اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم.
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
              {privacySections.map(section => (
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
          {privacySections.map(section => (
            <div
              key={section.id}
              id={section.id}
              className={`mb-8 rounded-2xl bg-white p-8 shadow-sm ${
                activeSection === section.id ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-8">
                {section.content.map((item, index) => (
                  <div key={index} className="rounded-xl bg-gray-50 p-6">
                    <h3 className="mb-3 text-lg font-bold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      {item.description}
                    </p>
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
          سوالی در مورد حریم خصوصی دارید؟
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
          تیم پشتیبانی بریس آماده پاسخگویی به سوالات شما در مورد حریم خصوصی و
          امنیت اطلاعات شماست.
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
