# راهنمای تنظیم همگام‌سازی موجودی با Google Sheets

## 🔧 تنظیمات اولیه

### 1. دریافت API Key از Google Cloud Console

1. به [Google Cloud Console](https://console.cloud.google.com/) بروید
2. یک پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید
3. Google Sheets API را فعال کنید:
   - به "APIs & Services" > "Library" بروید
   - "Google Sheets API" را جستجو و فعال کنید
4. Credentials ایجاد کنید:
   - به "APIs & Services" > "Credentials" بروید
   - "Create Credentials" > "API Key" را انتخاب کنید
5. API Key را کپی کنید

### 2. تنظیم فایل .env

فایل `.env` را باز کرده و این خط را اضافه کنید:

```env
GOOGLE_SHEETS_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

### 3. تنظیم دسترسی Google Sheets

1. Google Sheets document را باز کنید
2. روی "Share" کلیک کنید
3. دسترسی "Anyone with the link can view" را تنظیم کنید

## 🚀 تست API

### تست وضعیت موجودی
```bash
curl -X GET "http://localhost:3000/api/inventory/status" | jq
```

### تست همگام‌سازی دستی
```bash
curl -X GET "http://localhost:3000/api/inventory/sync?force=true" | jq
```

### تست همگام‌سازی خودکار
```bash
curl -X GET "http://localhost:3000/api/inventory/sync" | jq
```

## 📊 ساختار داده‌ها

API از این ستون‌های Google Sheets استفاده می‌کند:

- **ستون A**: نام محصول (شرح کالا)
- **ستون F**: موجودی فیزیکی
- **ستون G**: کل موجودی تعدادی
- **ستون H**: موجودی ریالی (تومان)
- **ستون I**: قیمت واحد

## 🔄 منطق همگام‌سازی

### تطبیق محصولات
API محصولات را با این روش‌ها تطبیق می‌دهد:
1. تطبیق کامل نام محصول
2. تطبیق با اولین کلمه نام محصول
3. تطبیق با دو کلمه اول نام محصول

### به‌روزرسانی داده‌ها
- **قیمت**: از ستون I (قیمت واحد) استفاده می‌شود
- **موجودی**: از ستون F (موجودی فیزیکی) یا ستون G (کل موجودی) استفاده می‌شود
- **زمان به‌روزرسانی**: هر 6 ساعت به صورت خودکار

## ⚙️ تنظیمات پیشرفته

### تغییر فاصله زمانی همگام‌سازی
در فایل `src/app/api/inventory/sync/route.ts` خط زیر را تغییر دهید:
```typescript
const hoursSinceLastSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
// تغییر 6 به تعداد ساعت مورد نظر
if (!forceSync && hoursSinceLastSync < 6) {
```

### تغییر نام Sheet
در فایل `src/app/api/inventory/sync/route.ts`:
```typescript
const SHEET_NAME = 'نام_شیت_شما';
```

## 🐛 عیب‌یابی

### خطای "Bad Request"
- API Key را بررسی کنید
- دسترسی Google Sheets را بررسی کنید
- نام Sheet را بررسی کنید

### خطای "Product not found"
- نام محصولات در دیتابیس را بررسی کنید
- تطبیق نام‌ها را بررسی کنید

### خطای "Cannot read properties of undefined"
- سرور را restart کنید
- Prisma client را regenerate کنید:
```bash
npx prisma generate
```

## 📈 مانیتورینگ

### بررسی لاگ‌ها
```bash
tail -f server.log
```

### بررسی وضعیت همگام‌سازی
```bash
curl -X GET "http://localhost:3000/api/inventory/status" | jq
```

## 🔄 Cron Job (اختیاری)

برای همگام‌سازی خودکار، می‌توانید از cron استفاده کنید:

```bash
# هر 6 ساعت همگام‌سازی
0 */6 * * * curl -X GET "http://localhost:3000/api/inventory/sync"
```

## 📝 نکات مهم

1. **امنیت**: API Key را در production محافظت کنید
2. **Backup**: قبل از تغییرات، از دیتابیس backup بگیرید
3. **تست**: همیشه ابتدا در محیط test تست کنید
4. **مانیتورینگ**: وضعیت همگام‌سازی را مرتب بررسی کنید

## 🆘 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های سرور را بررسی کنید
2. وضعیت API را تست کنید
3. تنظیمات محیط را بررسی کنید
4. از تیم پشتیبانی کمک بگیرید 