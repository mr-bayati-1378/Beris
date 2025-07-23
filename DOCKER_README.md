# 🐳 Beris Docker Deployment Guide

این راهنما برای راه‌اندازی کامل پروژه Beris با Docker است.

## 📋 پیش‌نیازها

- Docker (نسخه 20.10 یا بالاتر)
- Docker Compose (نسخه 2.0 یا بالاتر)
- حداقل 4GB RAM
- حداقل 10GB فضای دیسک

## 🚀 راه‌اندازی سریع

### 1. کلون کردن پروژه
```bash
git clone <repository-url>
cd beris
```

### 2. تنظیم متغیرهای محیطی
فایل `.env` را ایجاد کنید:
```bash
cp .env.example .env
```

متغیرهای مهم:
```env
# Database
DATABASE_URL="postgresql://beris_user:beris_password@postgres:5432/beris"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# SMS Service
KAVENEGAR_API_KEY="your-kavenegar-api-key"

# Search Engine
TYPESENSE_API_KEY="your-typesense-api-key"
TYPESENSE_HOST="typesense"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"

# Redis
REDIS_URL="redis://redis:6379"
```

### 3. راه‌اندازی با Docker Compose
```bash
# راه‌اندازی کامل
./scripts/docker-deploy.sh

# یا به صورت دستی
docker-compose up --build -d
```

### 4. اجرای مایگریشن‌های دیتابیس
```bash
# وارد شدن به کانتینر اپلیکیشن
docker-compose exec app sh

# اجرای مایگریشن‌ها
npx prisma migrate deploy

# خروج از کانتینر
exit
```

## 🏗️ ساختار سرویس‌ها

### 📦 سرویس‌های اصلی

| سرویس | پورت | توضیحات |
|-------|------|---------|
| **app** | 3000 | اپلیکیشن Next.js |
| **nginx** | 80 | Reverse Proxy |
| **postgres** | 5432 | دیتابیس PostgreSQL |
| **redis** | 6379 | کش و session |
| **typesense** | 8108 | موتور جستجو |

### 🔧 تنظیمات پیشرفته

#### تغییر پورت‌ها
در `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "8080:3000"  # تغییر پورت خارجی
```

#### تنظیم منابع
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

## 📊 مانیتورینگ

### مشاهده لاگ‌ها
```bash
# تمام لاگ‌ها
docker-compose logs -f

# لاگ سرویس خاص
docker-compose logs -f app
docker-compose logs -f postgres
```

### وضعیت سرویس‌ها
```bash
docker-compose ps
```

### آمار استفاده منابع
```bash
docker stats
```

## 🔄 مدیریت سرویس‌ها

### راه‌اندازی مجدد
```bash
# راه‌اندازی مجدد تمام سرویس‌ها
docker-compose restart

# راه‌اندازی مجدد سرویس خاص
docker-compose restart app
```

### توقف سرویس‌ها
```bash
# توقف کامل
docker-compose down

# توقف و حذف volume ها
docker-compose down -v
```

### به‌روزرسانی
```bash
# دریافت آخرین تغییرات
git pull

# rebuild و restart
docker-compose up --build -d
```

## 🛠️ عیب‌یابی

### مشکلات رایج

#### 1. خطای اتصال به دیتابیس
```bash
# بررسی وضعیت PostgreSQL
docker-compose logs postgres

# تست اتصال
docker-compose exec postgres psql -U beris_user -d beris
```

#### 2. خطای Redis
```bash
# بررسی وضعیت Redis
docker-compose logs redis

# تست اتصال
docker-compose exec redis redis-cli ping
```

#### 3. خطای Typesense
```bash
# بررسی وضعیت Typesense
docker-compose logs typesense

# تست API
curl http://localhost:8108/health
```

### پاکسازی کامل
```bash
# حذف تمام کانتینرها، image ها و volume ها
docker-compose down -v --rmi all
docker system prune -a --volumes
```

## 📁 ساختار فایل‌ها

```
beris/
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Multi-service setup
├── .dockerignore          # Files to exclude from build
├── nginx.conf             # Nginx configuration
├── scripts/
│   ├── docker-build.sh    # Build script
│   └── docker-deploy.sh   # Deploy script
└── DOCKER_README.md       # This file
```

## 🔒 امنیت

### تنظیمات امنیتی Nginx
- Rate limiting برای API و login
- Security headers
- Gzip compression
- SSL/TLS (در صورت نیاز)

### تنظیمات امنیتی Docker
- استفاده از user غیر root
- محدودیت منابع
- Network isolation

## 📈 بهینه‌سازی

### Performance Tips
1. **Caching**: استفاده از Redis برای کش
2. **CDN**: استفاده از CDN برای فایل‌های استاتیک
3. **Database**: تنظیم connection pool
4. **Images**: بهینه‌سازی تصاویر

### Monitoring
```bash
# نصب Prometheus و Grafana (اختیاری)
docker-compose -f docker-compose.monitoring.yml up -d
```

## 🆘 پشتیبانی

در صورت بروز مشکل:
1. بررسی لاگ‌ها: `docker-compose logs`
2. بررسی وضعیت سرویس‌ها: `docker-compose ps`
3. بررسی منابع: `docker stats`
4. ایجاد issue در repository

## 📝 نکات مهم

- همیشه قبل از deploy، backup از دیتابیس بگیرید
- متغیرهای محیطی حساس را در production تغییر دهید
- SSL certificate برای production نصب کنید
- Monitoring و alerting راه‌اندازی کنید 