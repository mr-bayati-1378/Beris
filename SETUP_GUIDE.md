# 🚀 راهنمای نصب و راه‌اندازی پروژه بریس

این راهنما برای راه‌اندازی پروژه بریس روی چند سیستم مختلف طراحی شده است.

## 📋 **پیش‌نیازها**

### نرم‌افزارهای مورد نیاز:
- **Node.js** (نسخه 18 یا بالاتر)
- **npm** یا **yarn**
- **MySQL** (نسخه 8.0 یا بالاتر)
- **Git**

## 🛠️ **راه‌اندازی دیتابیس**

### 1. نصب MySQL:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Windows: دانلود از https://dev.mysql.com/downloads/installer/
# macOS: brew install mysql
```

### 2. ایجاد دیتابیس و کاربر:
```sql
-- ورود به MySQL
mysql -u root -p

-- ایجاد دیتابیس
CREATE DATABASE beris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر
CREATE USER 'beris_user'@'localhost' IDENTIFIED BY 'beris_password';
GRANT ALL PRIVILEGES ON beris.* TO 'beris_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 📦 **نصب پروژه**

### 1. کلون کردن پروژه:
```bash
git clone [YOUR_REPO_URL]
cd beris
```

### 2. نصب وابستگی‌ها:
```bash
npm install
```

### 3. تنظیم Environment Variables:
```bash
# کپی کردن فایل env نمونه
cp .env.example .env

# ویرایش فایل .env
nano .env
```

**محتوای فایل `.env`:**
```env
# Database
DATABASE_URL="mysql://beris_user:beris_password@localhost:3306/beris"

# Authentication
AUTH_SECRET="your-super-secret-auth-key-here-change-it-in-production"
NEXTAUTH_SECRET=your-secret-key-beris-2024
NEXTAUTH_URL=http://localhost:3000

# برای production
# NEXTAUTH_URL=https://yourdomain.com
```

### 4. ایجاد جداول دیتابیس:
```bash
# تولید Prisma Client
npx prisma generate --schema=./prisma/schema.prisma

# اجرای migration (اختیاری - برای development)
npx prisma db push --schema=./prisma/schema.prisma
```

### 5. Seed کردن دیتا:
```bash
# ایجاد نقش‌های ادمین
node prisma/seed-admin-roles.js

# ایجاد دسته‌بندی‌ها
node prisma/seed-categories.js

# ایجاد محصولات نمونه
node prisma/seed-medical-data.js
```

## 🏃‍♂️ **اجرای پروژه**

### حالت Development:
```bash
npm run dev
```
📍 **آدرس:** http://localhost:3000

### حالت Production:
```bash
npm run build
npm start
```

## 👥 **حساب‌های ادمین پیش‌فرض**

پس از seed کردن دیتا، حساب‌های زیر ایجاد می‌شوند:

### مدیرکل:
- **نام کاربری:** `admin`
- **رمز عبور:** `admin123`
- **دسترسی:** همه بخش‌ها

### مدیر فروش:
- **نام کاربری:** `sales_manager`
- **رمز عبور:** `sales123`
- **آدرس پنل:** `/admin-sales`

### مدیر مالی:
- **نام کاربری:** `finance_manager`
- **رمز عبور:** `finance123`
- **آدرس پنل:** `/admin-finance`

### مدیر انبار:
- **نام کاربری:** `warehouse_manager`
- **رمز عبور:** `warehouse123`
- **آدرس پنل:** `/admin-warehouse`

### مدیر تامین:
- **نام کاربری:** `supply_manager`
- **رمز عبور:** `supply123`
- **آدرس پنل:** `/admin-supply`

## 🌐 **راه‌اندازی برای چند سیستم**

### روش 1: IP مشترک در شبکه محلی

#### سرور اصلی:
```bash
# تغییر آدرس در package.json
"dev": "next dev -H 0.0.0.0"

# یا استفاده از پورت مشخص
"dev": "next dev -H 0.0.0.0 -p 3000"

# اجرا
npm run dev
```

#### سایر سیستم‌ها:
```bash
# دسترسی از طریق IP سرور اصلی
http://[SERVER_IP]:3000
```

### روش 2: Docker (پیشنهادی برای production)

#### ایجاد Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### ایجاد docker-compose.yml:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://beris_user:beris_password@db:3306/beris
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass
      - MYSQL_DATABASE=beris
      - MYSQL_USER=beris_user
      - MYSQL_PASSWORD=beris_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### اجرا با Docker:
```bash
docker-compose up -d
```

### روش 3: Nginx Reverse Proxy

#### نصب Nginx:
```bash
sudo apt install nginx
```

#### تنظیم Nginx:
```nginx
# /etc/nginx/sites-available/beris
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 **تنظیمات برای تست**

### ایجاد دیتای نمونه:
```bash
# اجرای script تست
node scripts/create-test-data.js
```

### تست عملکرد سیستم:
```bash
# تست API endpoints
curl -I http://localhost:3000/api/auth/session
curl -I http://localhost:3000/api/admin/inbound
curl -I http://localhost:3000/admin/inbound
```

## 📱 **دسترسی از دستگاه‌های مختلف**

### موبایل و تبلت:
- 📱 **iOS/Android:** مرورگر → آدرس سرور
- 💻 **Desktop:** کروم، فایرفاکس، سافاری

### شبکه محلی:
```bash
# پیدا کردن IP سرور
ip addr show
# یا
ifconfig

# دسترسی از سایر دستگاه‌ها
http://192.168.1.100:3000
```

## 🚨 **عیب‌یابی رایج**

### خطای اتصال دیتابیس:
```bash
# بررسی وضعیت MySQL
sudo systemctl status mysql

# راه‌اندازی مجدد
sudo systemctl restart mysql

# تست اتصال
mysql -u beris_user -p beris
```

### خطای پورت اشغال:
```bash
# پیدا کردن پروسه‌ای که از پورت استفاده می‌کند
sudo lsof -i :3000

# متوقف کردن پروسه
kill -9 [PID]
```

### خطای Prisma:
```bash
# تولید مجدد Client
rm -rf node_modules/.prisma
npx prisma generate

# بازنشانی دیتابیس
npx prisma db push --force-reset
```

## 📋 **چک‌لیست تست**

- [ ] دیتابیس متصل است
- [ ] تمام جداول ایجاد شده‌اند
- [ ] حساب‌های ادمین فعال هستند
- [ ] صفحات inbound/outbound کار می‌کنند
- [ ] تاریخ‌ها به درستی شمسی نمایش داده می‌شوند
- [ ] منوهای جدید در همه پنل‌ها نمایش داده می‌شوند
- [ ] از شبکه محلی قابل دسترسی است

## 🔐 **نکات امنیتی**

### برای Production:
1. **تغییر رمزهای پیش‌فرض**
2. **استفاده از HTTPS**
3. **تنظیم Firewall**
4. **backup منظم دیتابیس**
5. **بروزرسانی منظم**

### نمونه script backup:
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u beris_user -p beris > backups/beris_backup_$DATE.sql
```

## 📞 **پشتیبانی**

در صورت بروز مشکل:
1. بررسی لاگ‌های console
2. بررسی فایل `.env`
3. تست اتصال دیتابیس
4. بررسی پورت‌های باز

---

**توسعه‌یافته توسط تیم بریس** 🚀 