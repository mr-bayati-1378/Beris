# 🏥 فروشگاه تجهیزات پزشکی بریس

<div align="center">
  <img src="public/beris-logo.png" alt="Beris Logo" width="120" height="120" />
  
  ### فروشگاه آنلاین تجهیزات پزشکی و مصرفی
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.1.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## 📋 درباره پروژه

**بریس** یک فروشگاه آنلاین مدرن و کامل برای تجهیزات پزشکی است که با استفاده از جدیدترین تکنولوژی‌های وب ساخته شده است. این پلتفرم شامل سیستم مدیریت محصولات، کاربران، سفارشات و پنل ادمین کاملی می‌باشد.

### ✨ ویژگی‌های کلیدی

- 🛍️ **فروشگاه کامل**: سیستم خرید، سبد خرید و مدیریت سفارشات
- 👥 **مدیریت کاربران**: ثبت‌نام، ورود، پنل کاربری و پروفایل
- 🏷️ **دسته‌بندی سه‌سطحه**: مدیریت دسته‌بندی‌های پیچیده محصولات
- 📊 **پنل ادمین**: مدیریت کامل محصولات، کاربران و سفارشات
- 🔐 **احراز هویت امن**: سیستم لاگین و احراز هویت پیشرفته
- 📱 **طراحی ریسپانسیو**: سازگار با تمام دستگاه‌ها
- 🎨 **UI/UX مدرن**: طراحی زیبا و کاربرپسند
- ⚡ **عملکرد بالا**: بهینه‌سازی شده برای سرعت و SEO

## 🛠️ تکنولوژی‌های استفاده شده

### Frontend
- **Next.js 14** - React Framework با App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS Framework
- **Framer Motion** - انیمیشن‌های پیشرفته
- **React Icons** - آیکون‌های زیبا
- **React Hook Form** - مدیریت فرم‌ها

### Backend
- **Next.js API Routes** - API endpoints
- **Prisma** - ORM برای پایگاه داده
- **SQLite** - پایگاه داده (قابل تغییر به PostgreSQL/MySQL)
- **NextAuth.js** - احراز هویت
- **bcryptjs** - رمزنگاری پسوردها
- **JWT** - JSON Web Tokens

### DevOps & Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Git** - Version control

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ 
- npm 8+
- Git

### مراحل نصب

1. **کلون کردن پروژه**
```bash
git clone https://github.com/mr-bayati-1378/beris.git
cd beris
```

2. **نصب وابستگی‌ها**
```bash
npm install
```

3. **راه‌اندازی پایگاه داده**
```bash
# Generate Prisma client
npm run prisma:generate

# Push database schema
npm run prisma:push

# Seed database with sample data
npm run prisma:seed
```

4. **اجرای پروژه**
```bash
npm run dev
```

5. **مشاهده نتیجه**
پروژه در آدرس [http://localhost:3000](http://localhost:3000) در دسترس است.

## 📁 ساختار پروژه

```
beris/
├── src/
│   ├── app/                  # Pages (App Router)
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (user)/          # User dashboard
│   │   ├── admin/           # Admin panel
│   │   ├── api/             # API routes
│   │   └── ...
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities and configs
│   └── types/               # TypeScript types
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
└── ...
```

## 🔑 حساب‌های پیش‌فرض

### ادمین
- **کاربری**: `admin`
- **رمز عبور**: `admin123`
- **آدرس**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### کاربر نمونه
- **شماره**: `09123456789`
- **رمز عبور**: `123456`

## 📱 صفحات و قابلیت‌ها

### صفحات عمومی
- 🏠 **صفحه اصلی**: نمایش محصولات و دسته‌بندی‌ها
- 🛍️ **فروشگاه**: لیست محصولات با فیلتر و جستجو
- 📦 **جزئیات محصول**: اطلاعات کامل محصول
- 🛒 **سبد خرید**: مدیریت سبد خرید
- 📱 **تماس با ما**: اطلاعات تماس و فرم پیغام

### پنل کاربری
- 📊 **داشبورد**: آمار و اطلاعات کاربر
- 📦 **سفارشات**: تاریخچه و وضعیت سفارشات
- ❤️ **علاقه‌مندی‌ها**: محصولات مورد علاقه
- ⚙️ **تنظیمات**: مدیریت پروفایل و تنظیمات

### پنل ادمین
- 📊 **داشبورد**: آمار کلی فروشگاه
- 📦 **مدیریت محصولات**: افزودن، ویرایش و حذف محصولات
- 👥 **مدیریت کاربران**: مشاهده و مدیریت کاربران
- 🏷️ **دسته‌بندی‌ها**: مدیریت دسته‌بندی سه‌سطحه
- 📋 **سفارشات**: مدیریت سفارشات مشتریان

## 🔧 اسکریپت‌های NPM

```bash
# Development
npm run dev                 # اجرای پروژه در حالت توسعه
npm run build              # ساخت پروژه برای تولید
npm run start              # اجرای پروژه در حالت تولید

# Database
npm run prisma:generate    # تولید Prisma Client
npm run prisma:push       # اعمال تغییرات به پایگاه داده
npm run prisma:migrate    # اجرای migration ها
npm run prisma:studio     # باز کردن Prisma Studio
npm run prisma:seed       # پر کردن پایگاه داده با داده‌های نمونه
npm run db:reset          # ریست کامل پایگاه داده

# Code Quality
npm run lint              # بررسی کد با ESLint
npm run lint:fix          # اصلاح خودکار مشکلات ESLint
npm run type-check        # بررسی TypeScript
npm run format            # فرمت کردن کد با Prettier
npm run format:check      # بررسی فرمت کد

# Other
npm run clean             # پاک کردن فایل‌های build
```

## 🌟 ویژگی‌های پیشرفته

### طراحی و UX
- 🎨 **طراحی مدرن** با Tailwind CSS
- 📱 **موبایل فرست** - سازگار با تمام دستگاه‌ها
- ⚡ **انیمیشن‌های روان** با Framer Motion
- 🔍 **SEO بهینه** - Meta tags و Structured data
- 🌐 **PWA Ready** - قابلیت نصب بر روی موبایل

### عملکرد
- ⚡ **Server-Side Rendering** - سرعت بالا
- 🚀 **Static Generation** - بهینه‌سازی برای CDN
- 📦 **Code Splitting** - بارگذاری بهینه
- 🖼️ **Image Optimization** - بهینه‌سازی تصاویر
- 💾 **Caching Strategy** - کش هوشمند

### امنیت
- 🔐 **احراز هویت امن** - JWT و Session
- 🛡️ **CSRF Protection** - محافظت در برابر حملات
- 🚪 **Role-based Access** - کنترل دسترسی
- 🔑 **رمزنگاری پسورد** - bcryptjs
- 🛡️ **Input Validation** - اعتبارسنجی ورودی‌ها

## 🤝 مشارکت در پروژه

ما از هر گونه مشارکت استقبال می‌کنیم! لطفاً مراحل زیر را دنبال کنید:

1. Fork کردن پروژه
2. ایجاد branch جدید (`git checkout -b feature/AmazingFeature`)
3. Commit کردن تغییرات (`git commit -m 'Add some AmazingFeature'`)
4. Push کردن به branch (`git push origin feature/AmazingFeature`)
5. ایجاد Pull Request

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای اطلاعات بیشتر [LICENSE](LICENSE) را مشاهده کنید.

## 📞 تماس و پشتیبانی

- 📧 **ایمیل**: info@beris.com
- 🌐 **وبسایت**: [beris.com](https://beris.com)
- 📱 **تلگرام**: [@beris_support](https://t.me/beris_support)

## 🎯 نقشه راه

- [ ] افزودن پرداخت آنلاین
- [ ] سیستم تخفیف و کوپن
- [ ] نظرات و امتیازدهی محصولات
- [ ] سیستم اعلان‌ها
- [ ] پنل فروشندگان
- [ ] API موبایل اپلیکیشن
- [ ] چت آنلاین پشتیبانی
- [ ] گزارش‌گیری پیشرفته

---

<div align="center">
  <p>ساخته شده با ❤️ توسط تیم بریس</p>
  <p>© 2024 Beris Medical Equipment Store. All rights reserved.</p>
</div>
