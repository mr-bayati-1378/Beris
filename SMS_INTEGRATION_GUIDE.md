# راهنمای ادغام سرویس SMS کاوه نگار

## نصب و راه‌اندازی

### 1. نصب پکیج
```bash
npm install kavenegar
```

### 2. تنظیم متغیرهای محیطی
در فایل `.env` خود متغیرهای زیر را اضافه کنید:

```env
KAVENEGAR_API_KEY="your-api-key-here"
KAVENEGAR_SENDER="2000660110"
```

## استفاده از سرویس SMS

### ایمپورت سرویس
```typescript
import { smsService } from '@/lib/sms';
```

### متدهای موجود

#### 1. ارسال پیامک ساده
```typescript
const result = await smsService.sendSMS('09354977798', 'پیام تست');
console.log(result ? 'ارسال شد' : 'خطا در ارسال');
```

#### 2. ارسال کد تایید
```typescript
const code = smsService.generateVerificationCode();
const result = await smsService.sendVerificationCode('09354977798', code);
```

#### 3. ارسال کد بازیابی رمز عبور
```typescript
const code = smsService.generateVerificationCode();
const result = await smsService.sendPasswordResetCode('09354977798', code);
```

#### 4. پیامک خوش‌آمدگویی
```typescript
const result = await smsService.sendWelcomeMessage('09354977798', 'علی');
```

#### 5. تایید سفارش
```typescript
const result = await smsService.sendOrderConfirmation('09354977798', 'ORD-1234');
```

#### 6. بروزرسانی وضعیت سفارش
```typescript
const result = await smsService.sendOrderStatusUpdate('09354977798', 'ORD-1234', 'ارسال شده');
```

#### 7. پیامک تبلیغاتی
```typescript
const result = await smsService.sendPromotionalMessage('09354977798', 'پیام تبلیغاتی شما');
```

#### 8. تست ارسال SMS
```typescript
const result = await smsService.testSMS('09354977798');
```

### متدهای کمکی

#### اعتبارسنجی شماره تلفن
```typescript
const isValid = smsService.isValidIranianPhoneNumber('09354977798');
```

#### فرمت کردن شماره تلفن
```typescript
const formatted = smsService.formatPhoneNumber('+989354977798');
// نتیجه: 09354977798
```

#### تولید کد تایید
```typescript
const code = smsService.generateVerificationCode();
// نتیجه: کد 5 رقمی مثل "12345"
```

### متدهای پیشرفته

#### بررسی وضعیت پیامک
```typescript
try {
  const status = await smsService.checkMessageStatus(messageId);
  console.log('وضعیت پیامک:', status);
} catch (error) {
  console.error('خطا در دریافت وضعیت:', error);
}
```

#### دریافت موجودی حساب
```typescript
try {
  const balance = await smsService.getAccountBalance();
  console.log('موجودی حساب:', balance);
} catch (error) {
  console.error('خطا در دریافت موجودی:', error);
}
```

## ویژگی‌ها

### 1. Fallback Mechanism
سرویس ابتدا سعی می‌کند از SDK کاوه نگار استفاده کند و در صورت خطا، به REST API بازمی‌گردد.

### 2. Timeout Management
همه درخواست‌ها دارای timeout 10 ثانیه‌ای هستند.

### 3. Phone Number Formatting
شماره‌های تلفن به طور خودکار برای استفاده در API کاوه نگار فرمت می‌شوند.

### 4. Error Handling
همه خطاها به درستی مدیریت می‌شوند و در console ثبت می‌شوند.

## استفاده در API Routes

### مثال: API Route برای ارسال کد تایید
```typescript
// app/api/auth/send-verification/route.ts
import { smsService } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    if (!smsService.isValidIranianPhoneNumber(phoneNumber)) {
      return Response.json({ error: 'شماره تلفن نامعتبر' }, { status: 400 });
    }
    
    const code = smsService.generateVerificationCode();
    const result = await smsService.sendVerificationCode(phoneNumber, code);
    
    if (result) {
      // ذخیره کد در دیتابیس یا cache
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'خطا در ارسال پیامک' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
```

## رفع مشکلات رایج

### 1. خطای Network Timeout
- بررسی کنید اتصال اینترنت فعال باشد
- ممکن است فایروال یا فیلتر شکن مانع از دسترسی به API شود

### 2. API Key نامعتبر
- API Key را از پنل کاوه نگار دوباره کپی کنید
- مطمئن شوید که API Key در متغیرهای محیطی صحیح تنظیم شده

### 3. شماره فرستنده نامعتبر
- از شماره‌های مجاز کاوه نگار استفاده کنید
- شماره پیش‌فرض: `2000660110`

### 4. خطای 403 Forbidden
- بررسی کنید که IP سرور در پنل کاوه نگار مجاز باشد
- اعتبار حساب کاوه نگار را بررسی کنید

### 5. خطای 429 Too Many Requests
- سرعت ارسال پیامک‌ها را کاهش دهید
- از صف (queue) برای مدیریت تعداد درخواست‌ها استفاده کنید

## نکات امنیتی

1. **هرگز API Key را در کد commit نکنید**
2. **از متغیرهای محیطی استفاده کنید**
3. **دسترسی به API را محدود کنید**
4. **لاگ‌های حساس را ذخیره نکنید**
5. **Rate limiting اعمال کنید**

## نمونه تنظیمات Production

```env
# Production environment variables
KAVENEGAR_API_KEY="your-production-api-key"
KAVENEGAR_SENDER="your-registered-sender-number"
NODE_ENV="production"
```

## مثال کامل: فرم ثبت نام با تایید SMS

```typescript
// components/RegisterForm.tsx
import { useState } from 'react';

export default function RegisterForm() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);

  const sendVerificationCode = async () => {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });

    if (response.ok) {
      setStep(2);
    }
  };

  return (
    <div>
      {step === 1 ? (
        <div>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="شماره تلفن" 
          />
          <button onClick={sendVerificationCode}>ارسال کد تایید</button>
        </div>
      ) : (
        <div>
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد تایید" 
          />
          <button>تایید</button>
        </div>
      )}
    </div>
  );
}
```

این راهنما تمام جنبه‌های استفاده از سرویس SMS کاوه نگار در پروژه بریس را پوشش می‌دهد. 