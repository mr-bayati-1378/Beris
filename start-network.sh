#!/bin/bash

# 🚀 اسکریپت راه‌اندازی سرور بریس برای شبکه محلی

echo "🌟 راه‌اندازی سرور بریس برای دسترسی شبکه محلی..."

# پیدا کردن IP سیستم
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
fi

echo "📍 IP سیستم: $LOCAL_IP"
echo "🔗 آدرس دسترسی: http://$LOCAL_IP:3000"
echo ""
echo "📋 لینک‌های مفید:"
echo "   • داشبورد اصلی: http://$LOCAL_IP:3000/admin"
echo "   • ورودی کالا: http://$LOCAL_IP:3000/admin/inbound"
echo "   • خروجی کالا: http://$LOCAL_IP:3000/admin/outbound"
echo "   • پنل فروش: http://$LOCAL_IP:3000/admin-sales"
echo "   • پنل مالی: http://$LOCAL_IP:3000/admin-finance"
echo "   • پنل انبار: http://$LOCAL_IP:3000/admin-warehouse"
echo "   • پنل تامین: http://$LOCAL_IP:3000/admin-supply"
echo ""
echo "👥 حساب‌های تست:"
echo "   • مدیرکل: admin / admin123"
echo "   • مدیر فروش: sales_manager / sales123"
echo "   • مدیر مالی: finance_manager / finance123"
echo "   • مدیر انبار: warehouse_manager / warehouse123"
echo "   • مدیر تامین: supply_manager / supply123"
echo ""
echo "⚡ برای متوقف کردن سرور: Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 نصب وابستگی‌ها..."
    npm install
fi

# بررسی وجود فایل .env
if [ ! -f ".env" ]; then
    echo "⚠️  فایل .env یافت نشد. لطفاً طبق راهنمای SETUP_GUIDE.md تنظیم کنید."
    exit 1
fi

# تولید Prisma Client
echo "🔧 تولید Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

# بررسی اتصال دیتابیس
echo "🔍 بررسی اتصال دیتابیس..."
if npx prisma db push --schema=./prisma/schema.prisma > /dev/null 2>&1; then
    echo "✅ دیتابیس متصل است"
else
    echo "❌ خطا در اتصال دیتابیس. لطفاً تنظیمات DATABASE_URL را بررسی کنید."
    exit 1
fi

# راه‌اندازی سرور
echo "🚀 راه‌اندازی سرور..."
echo ""

# تنظیم HOST برای دسترسی از شبکه
HOST=0.0.0.0 npm run dev 