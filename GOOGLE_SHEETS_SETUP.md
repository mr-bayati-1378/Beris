# راهنمای تنظیم Google Sheets API برای همگام‌سازی موجودی

## مراحل تنظیم

### 1. ایجاد Google Cloud Project
1. به [Google Cloud Console](https://console.cloud.google.com/) بروید
2. یک پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید
3. Google Sheets API را فعال کنید

### 2. ایجاد API Key
1. در Google Cloud Console، به بخش "APIs & Services" > "Credentials" بروید
2. روی "Create Credentials" کلیک کنید
3. "API Key" را انتخاب کنید
4. API Key را کپی کنید

### 3. تنظیم متغیرهای محیطی
در فایل `.env.local` این متغیرها را اضافه کنید:

```env
GOOGLE_SHEETS_API_KEY=your_api_key_here
CRON_SECRET=your_cron_secret_here
```

### 4. تنظیم Google Sheets
1. Google Sheets شما باید عمومی باشد یا دسترسی مناسب داشته باشد
2. نام sheet باید "Inventory Control" باشد
3. ستون‌ها باید به این ترتیب باشند:
   - A: کد فاکتور
   - B: شرح کالا
   - C: تاریخ
   - D: تامین کننده
   - E: خرید تعدادی
   - F: خرید به تومان
   - G: قیمت واحد

## API Endpoints

### 1. همگام‌سازی دستی
```
GET /api/inventory/sync
POST /api/inventory/sync (force sync)
```

### 2. همگام‌سازی خودکار (Cron Job)
```
GET /api/cron/inventory-sync?secret=your_cron_secret
```

### 3. وضعیت همگام‌سازی
```
GET /api/inventory/status
```

## تنظیم Cron Job

برای اجرای خودکار، می‌توانید از سرویس‌های زیر استفاده کنید:

### Vercel Cron Jobs
در فایل `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/inventory-sync?secret=your_cron_secret",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### GitHub Actions
در فایل `.github/workflows/inventory-sync.yml`:

```yaml
name: Inventory Sync
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Inventory
        run: |
          curl -X GET "https://your-domain.com/api/cron/inventory-sync?secret=${{ secrets.CRON_SECRET }}"
```

## نکات مهم

1. **امنیت**: حتماً CRON_SECRET را تنظیم کنید
2. **محدودیت‌ها**: Google Sheets API محدودیت‌هایی دارد
3. **خطاها**: خطاها در console ثبت می‌شوند
4. **تست**: ابتدا با API دستی تست کنید

## عیب‌یابی

### خطای API Key
- مطمئن شوید API Key صحیح است
- Google Sheets API فعال باشد

### خطای دسترسی
- Google Sheets باید عمومی باشد
- یا دسترسی مناسب تنظیم شده باشد

### خطای تطبیق محصولات
- نام محصولات در دیتابیس باید با Google Sheets مطابقت داشته باشد
- سیستم matching انعطاف‌پذیر است 