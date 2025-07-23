# 🐳 راهنمای Docker Setup - فروشگاه بریس

## 📋 فهرست مطالب
- [پیش‌نیازها](#پیش‌نیازها)
- [راه‌اندازی سریع](#راه‌اندازی-سریع)
- [تنظیمات Environment](#تنظیمات-environment)
- [اجرای سرویس‌ها](#اجرای-سرویس‌ها)
- [مدیریت داده‌ها](#مدیریت-داده‌ها)
- [عیب‌یابی](#عیب‌یابی)
- [Production Setup](#production-setup)

## 🔧 پیش‌نیازها

### نصب Docker و Docker Compose
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# macOS
brew install docker docker-compose

# یا استفاده از Docker Desktop
```

### بررسی نصب
```bash
docker --version
docker-compose --version
```

## ⚡ راه‌اندازی سریع

### 1. کلون پروژه
```bash
git clone <repository-url>
cd beris
```

### 2. تنظیم Environment Variables
```bash
# کپی فایل نمونه
cp .env.example .env

# ویرایش فایل .env
nano .env
```

### 3. اجرای سرویس‌ها
```bash
# Build و اجرای تمام سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f
```

### 4. راه‌اندازی دیتابیس
```bash
# اجرای migrations
docker-compose exec app npx prisma migrate deploy

# Seed کردن داده‌ها
docker-compose exec app npx prisma db seed
```

## 🔐 تنظیمات Environment

### فایل .env
```env
# Database
DATABASE_URL=postgresql://beris_user:beris_password@postgres:5432/beris_db

# Redis
REDIS_URL=redis://redis:6379

# Typesense Search
TYPESENSE_API_KEY=beris_search_key
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production

# SMS Service
KAVENEGAR_API_KEY=your-kavenegar-api-key

# Payment Gateway
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id

# File Upload
UPLOAD_DIR=/app/uploads

# Environment
NODE_ENV=production
PORT=3000
```

## 🚀 اجرای سرویس‌ها

### سرویس‌های موجود
- **app**: Next.js Application (Port: 3000)
- **postgres**: PostgreSQL Database (Port: 5432)
- **redis**: Redis Cache (Port: 6379)
- **typesense**: Search Engine (Port: 8108)
- **nginx**: Reverse Proxy (Port: 80, 443)

### دستورات مفید
```bash
# اجرای تمام سرویس‌ها
docker-compose up -d

# اجرای سرویس خاص
docker-compose up -d postgres redis

# متوقف کردن سرویس‌ها
docker-compose down

# متوقف کردن + حذف volumes
docker-compose down -v

# مشاهده وضعیت سرویس‌ها
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f app

# اجرای دستور در container
docker-compose exec app bash
```

## 📊 مدیریت داده‌ها

### Prisma Commands
```bash
# اجرای migrations
docker-compose exec app npx prisma migrate deploy

# Reset database
docker-compose exec app npx prisma migrate reset

# Generate Prisma client
docker-compose exec app npx prisma generate

# Seed database
docker-compose exec app npx prisma db seed

# Prisma Studio
docker-compose exec app npx prisma studio
```

### Backup و Restore
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U beris_user beris_db > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U beris_user beris_db < backup.sql

# Backup Redis
docker-compose exec redis redis-cli SAVE
docker cp beris_redis:/data/dump.rdb redis_backup.rdb
```

## 🔍 عیب‌یابی

### بررسی Health Check
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready -U beris_user

# Redis health
docker-compose exec redis redis-cli ping

# Typesense health
curl http://localhost:8108/health
```

### مشکلات رایج

#### 1. خطای اتصال دیتابیس
```bash
# بررسی وضعیت PostgreSQL
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### 2. خطای Build
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 3. مشکل Permissions
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### مشاهده Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up
docker system prune
```

## 🌐 Production Setup

### 1. SSL Certificate
```bash
# Generate self-signed certificate
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# Or use Let's Encrypt
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

### 2. Environment Security
```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET
```

### 3. Nginx Configuration
```nginx
# Enable HTTPS in nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}
```

### 4. Production Deployment
```bash
# Set production environment
export NODE_ENV=production

# Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose logs -f --tail=100
```

## 📈 Monitoring

### Health Checks
```bash
# Application
curl -f http://localhost:3000/api/health

# Database
docker-compose exec postgres pg_isready

# All services
docker-compose ps
```

### Performance Monitoring
```bash
# Container resources
docker stats --no-stream

# Disk usage
du -sh /var/lib/docker/

# Network traffic
docker-compose exec app netstat -i
```

## 🔄 Updates

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build app
docker-compose up -d app

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Database Updates
```bash
# Backup before update
docker-compose exec postgres pg_dump -U beris_user beris_db > backup.sql

# Update database
docker-compose exec app npx prisma migrate deploy
```

## 🆘 پشتیبانی

### لاگ‌های مفید
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f postgres

# Nginx logs
docker-compose logs -f nginx

# All services
docker-compose logs -f
```

### اطلاعات سیستم
```bash
# Docker info
docker info

# System resources
free -h
df -h

# Network info
docker network ls
```

---

## 📞 تماس با پشتیبانی

در صورت بروز مشکل:
1. بررسی لاگ‌ها
2. بررسی health checks
3. مراجعه به مستندات
4. تماس با تیم پشتیبانی

**نسخه مستندات:** v1.0.0  
**آخرین بروزرسانی:** 2024  
**توسط:** تیم توسعه بریس 🚀 