# راهنمای تنظیم درگاه‌های پرداخت

این راهنما نحوه پیکربندی و استفاده از درگاه‌های پرداخت مختلف در پروژه را توضیح می‌دهد.

## فهرست مطالب

1. [پیکربندی پایه](#پیکربندی-پایه)
2. [درگاه زرین‌پال](#درگاه-زرین‌پال)
3. [بانک سامان](#بانک-سامان)
4. [بانک ملت](#بانک-ملت)
5. [سایر درگاه‌ها](#سایر-درگاه‌ها)
6. [تست درگاه‌ها](#تست-درگاه‌ها)
7. [نحوه استفاده](#نحوه-استفاده)

## پیکربندی پایه

### 1. متغیرهای Environment

فایل `.env` خود را با متغیرهای زیر تنظیم کنید:

```env
# پایگاه داده
DATABASE_URL="mysql://user:password@localhost:3306/beris"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# تنظیمات سایت
SITE_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. مقداردهی اولیه درگاه‌ها

برای اضافه کردن درگاه‌ها به دیتابیس:

```bash
npx tsx prisma/seed-gateways.ts
```

## درگاه زرین‌پال

### تنظیمات Environment:

```env
ZARINPAL_MERCHANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### نحوه دریافت Merchant ID:

1. وارد [پنل زرین‌پال](https://www.zarinpal.com/pg/dashboard) شوید
2. به بخش "تنظیمات درگاه" بروید
3. Merchant ID را کپی کنید

### ویژگی‌ها:
- ✅ پشتیبانی از تمام کارت‌های بانکی
- ✅ محیط Sandbox برای تست
- ✅ API Version 4
- ✅ پشتیبانی از Metadata

## بانک سامان

### تنظیمات Environment:

```env
SAMAN_TERMINAL_ID="12345678"
```

### نحوه دریافت Terminal ID:

1. با بانک سامان تماس بگیرید
2. درخواست فعال‌سازی درگاه اینترنتی کنید
3. Terminal ID را دریافت کنید

### ویژگی‌ها:
- ✅ درگاه مستقیم بانک سامان
- ✅ امنیت بالا
- ✅ پشتیبانی از Callback

## بانک ملت

### تنظیمات Environment:

```env
MELLAT_TERMINAL_ID="12345"
MELLAT_USERNAME="username"
MELLAT_PASSWORD="password"
```

### نحوه دریافت اطلاعات:

1. با بانک ملت تماس بگیرید
2. درخواست فعال‌سازی درگاه کنید
3. اطلاعات Terminal, Username, Password را دریافت کنید

### ویژگی‌ها:
- ✅ درگاه SOAP-based
- ✅ پروسه دو مرحله‌ای (Verify + Settle)
- ✅ امنیت بالا

## سایر درگاه‌ها

### بانک پارسیان

```env
PARSIAN_LOGIN_ACCOUNT="LoginAccount"
```

### بانک پاسارگاد

```env
PASARGAD_MERCHANT_ID="12345"
PASARGAD_TERMINAL_CODE="12345"
```

**نکته:** این درگاه‌ها فعلاً غیرفعال هستند و نیاز به پیاده‌سازی کامل دارند.

## تست درگاه‌ها

### محیط Sandbox

در محیط توسعه (development)، تمام درگاه‌ها در حالت Sandbox قرار دارند:

- **زرین‌پال:** شماره کارت تست `5022291900000000`
- **سامان:** از شماره کارت‌های تستی بانک استفاده کنید
- **ملت:** از محیط تست بانک استفاده کنید

### تست پرداخت:

```bash
# تست API درگاه‌ها
curl http://localhost:3000/api/payment/gateways

# تست ایجاد پرداخت
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1, "gatewayName": "zarinpal"}'
```

## نحوه استفاده

### 1. انتخاب درگاه:

```tsx
import { PaymentGatewaySelector } from '@/components';

function PaymentPage() {
  const [selectedGateway, setSelectedGateway] = useState('');

  return (
    <PaymentGatewaySelector
      selectedGateway={selectedGateway}
      onGatewayChange={setSelectedGateway}
    />
  );
}
```

### 2. ایجاد پرداخت:

```tsx
const createPayment = async (orderId: number, gatewayName: string) => {
  const response = await fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, gatewayName }),
  });

  const result = await response.json();
  
  if (result.success) {
    // انتقال به درگاه
    window.location.href = result.paymentUrl;
  }
};
```

### 3. تایید پرداخت:

پس از بازگشت از درگاه، کاربر به `/payment/callback` هدایت می‌شود که خودکار پرداخت را تایید می‌کند.

## مدیریت درگاه‌ها

### فعال/غیرفعال کردن:

```sql
-- غیرفعال کردن درگاه
UPDATE PaymentGateway SET isActive = false WHERE name = 'mellat';

-- فعال کردن درگاه
UPDATE PaymentGateway SET isActive = true WHERE name = 'zarinpal';
```

### به‌روزرسانی تنظیمات:

```sql
-- به‌روزرسانی تنظیمات زرین‌پال
UPDATE PaymentGateway 
SET config = JSON_SET(config, '$.merchantId', 'new-merchant-id')
WHERE name = 'zarinpal';
```

## عیب‌یابی

### مشکلات رایج:

1. **خطای 401 Unauthorized:**
   - بررسی کنید که endpoint در `publicPaths` اضافه شده باشد

2. **خطای "Gateway not found":**
   - مطمئن شوید که درگاه در دیتابیس فعال است
   - `npx tsx prisma/seed-gateways.ts` را اجرا کنید

3. **خطای "Invalid configuration":**
   - متغیرهای environment را بررسی کنید
   - فرمت JSON تنظیمات را چک کنید

### لاگ‌ها:

برای مشاهده جزئیات خطاها:

```bash
# مشاهده لاگ‌های سرور
npm run dev

# چک کردن دیتابیس
npx prisma studio
```

## امنیت

### نکات امنیتی:

1. **محرمانه نگه‌داری اطلاعات:**
   - هرگز اطلاعات درگاه را در کد commit نکنید
   - از فایل `.env` استفاده کنید

2. **تایید پرداخت:**
   - همیشه پرداخت را از سمت سرور تایید کنید
   - به پارامترهای GET اعتماد نکنید

3. **SSL:**
   - در production حتماً از HTTPS استفاده کنید
   - گواهی SSL معتبر داشته باشید

## پشتیبانی

در صورت بروز مشکل:

1. ابتدا [مستندات](#) را مطالعه کنید
2. لاگ‌های خطا را بررسی کنید
3. با تیم پشتیبانی درگاه تماس بگیرید

---

**نکته:** این راهنما برای استفاده در محیط توسعه نوشته شده است. برای Production، تنظیمات اضافی مورد نیاز است. 