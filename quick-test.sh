#!/bin/bash

# 🧪 اسکریپت تست سریع برای پروژه بریس

echo "🧪 شروع تست‌های سریع پروژه بریس..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# متغیرها
BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# تابع تست
test_url() {
    local url=$1
    local name=$2
    echo -n "🔍 تست $name... "
    
    if curl -s -I "$url" | grep -q "200\|302"; then
        echo "✅ موفق"
        ((PASSED++))
    else
        echo "❌ ناموفق"
        ((FAILED++))
    fi
}

# تست صفحه اصلی
test_url "$BASE_URL" "صفحه اصلی"

# تست صفحات ادمین
test_url "$BASE_URL/admin" "پنل ادمین اصلی"
test_url "$BASE_URL/admin/login" "صفحه ورود ادمین"

# تست صفحات جدید
test_url "$BASE_URL/admin/inbound" "صفحه ورودی کالا"
test_url "$BASE_URL/admin/outbound" "صفحه خروجی کالا"

# تست پنل‌های مختلف
test_url "$BASE_URL/admin-sales" "پنل فروش"
test_url "$BASE_URL/admin-finance" "پنل مالی"
test_url "$BASE_URL/admin-warehouse" "پنل انبار"
test_url "$BASE_URL/admin-supply" "پنل تامین"

# تست API endpoints
test_url "$BASE_URL/api/auth/session" "API احراز هویت"
test_url "$BASE_URL/api/admin/navigation" "API منوها"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 نتایج تست:"
echo "   ✅ موفق: $PASSED"
echo "   ❌ ناموفق: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo "🎉 همه تست‌ها موفق بودند!"
    exit 0
else
    echo "⚠️  $FAILED تست ناموفق. لطفاً سرور را راه‌اندازی کنید."
    echo ""
    echo "📋 راهنمای راه‌اندازی:"
    echo "   1. ./start-network.sh"
    echo "   2. منتظر شروع سرور باشید"
    echo "   3. مجدداً این تست را اجرا کنید"
    exit 1
fi 