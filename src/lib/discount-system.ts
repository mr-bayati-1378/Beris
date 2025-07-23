/**
 * سیستم کد تخفیف لگاریتمی بر اساس تاریخچه خرید مشتری
 * Log20 Formula: discount = log20(total_purchase_amount)
 */

interface CustomerPurchaseHistory {
  totalPurchases: number;
  orderCount: number;
  lastOrderDate: Date;
  loyaltyLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface DiscountCode {
  code: string;
  percentage: number;
  isValid: boolean;
  expiresAt: Date;
  minPurchase: number;
  maxDiscount: number;
}

/**
 * محاسبه درصد تخفیف بر اساس فرمول لگاریتمی log20
 * @param totalPurchases مجموع خریدهای قبلی به تومان
 * @returns درصد تخفیف (0-25)
 */
export function calculateLogarithmicDiscount(totalPurchases: number): number {
  if (totalPurchases <= 0) return 0;
  
  // فرمول log20: discount = log(totalPurchases) / log(20)
  // محدود کردن به حداکثر 25 درصد
  const discount = Math.log(totalPurchases / 1000000) / Math.log(20); // تقسیم بر میلیون برای نرمال‌سازی
  
  // محدود کردن به بازه 0-25 درصد
  return Math.max(0, Math.min(25, Math.round(discount)));
}

/**
 * تعیین سطح وفاداری مشتری
 * @param totalPurchases مجموع خریدها
 * @param orderCount تعداد سفارشات
 * @returns سطح وفاداری
 */
export function getLoyaltyLevel(totalPurchases: number, orderCount: number): CustomerPurchaseHistory['loyaltyLevel'] {
  if (totalPurchases >= 100000000 && orderCount >= 20) { // 100 میلیون تومان + 20 سفارش
    return 'Platinum';
  } else if (totalPurchases >= 50000000 && orderCount >= 15) { // 50 میلیون تومان + 15 سفارش
    return 'Gold';
  } else if (totalPurchases >= 20000000 && orderCount >= 10) { // 20 میلیون تومان + 10 سفارش
    return 'Silver';
  } else if (totalPurchases >= 5000000 && orderCount >= 5) { // 5 میلیون تومان + 5 سفارش
    return 'Bronze';
  }
  return 'Bronze';
}

/**
 * تولید کد تخفیف منحصر به فرد
 * @param userId شناسه کاربر
 * @param discountPercentage درصد تخفیف
 * @returns کد تخفیف
 */
export function generateDiscountCode(userId: number, discountPercentage: number): string {
  const timestamp = Date.now().toString(36);
  const userStr = userId.toString(36).padStart(3, '0');
  const discountStr = discountPercentage.toString().padStart(2, '0');
  
  return `LOG${discountStr}${userStr}${timestamp}`.toUpperCase();
}

/**
 * محاسبه حداقل خرید برای استفاده از کد تخفیف
 * @param discountPercentage درصد تخفیف
 * @returns حداقل مبلغ خرید به تومان
 */
export function getMinPurchaseAmount(discountPercentage: number): number {
  // حداقل خرید بر اساس درصد تخفیف
  if (discountPercentage >= 20) return 5000000; // 5 میلیون تومان
  if (discountPercentage >= 15) return 3000000; // 3 میلیون تومان
  if (discountPercentage >= 10) return 2000000; // 2 میلیون تومان
  if (discountPercentage >= 5) return 1000000; // 1 میلیون تومان
  return 500000; // 500 هزار تومان
}

/**
 * محاسبه حداکثر مبلغ تخفیف
 * @param discountPercentage درصد تخفیف
 * @returns حداکثر مبلغ تخفیف به تومان
 */
export function getMaxDiscountAmount(discountPercentage: number): number {
  // حداکثر تخفیف بر اساس درصد
  if (discountPercentage >= 20) return 10000000; // 10 میلیون تومان
  if (discountPercentage >= 15) return 7500000; // 7.5 میلیون تومان
  if (discountPercentage >= 10) return 5000000; // 5 میلیون تومان
  if (discountPercentage >= 5) return 2500000; // 2.5 میلیون تومان
  return 1000000; // 1 میلیون تومان
}

/**
 * ایجاد کد تخفیف کامل بر اساس تاریخچه خرید
 * @param userId شناسه کاربر
 * @param purchaseHistory تاریخچه خرید
 * @returns اطلاعات کد تخفیف
 */
export function createDiscountCode(userId: number, purchaseHistory: CustomerPurchaseHistory): DiscountCode {
  const discountPercentage = calculateLogarithmicDiscount(purchaseHistory.totalPurchases);
  
  // در صورتی که مشتری واجد تخفیف نباشد
  if (discountPercentage <= 0) {
    return {
      code: '',
      percentage: 0,
      isValid: false,
      expiresAt: new Date(),
      minPurchase: 0,
      maxDiscount: 0
    };
  }

  const code = generateDiscountCode(userId, discountPercentage);
  const minPurchase = getMinPurchaseAmount(discountPercentage);
  const maxDiscount = getMaxDiscountAmount(discountPercentage);
  
  // کد تخفیف برای 30 روز معتبر است
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  return {
    code,
    percentage: discountPercentage,
    isValid: true,
    expiresAt,
    minPurchase,
    maxDiscount
  };
}

/**
 * اعتبارسنجی کد تخفیف
 * @param code کد تخفیف
 * @param cartTotal مجموع سبد خرید
 * @param discountData اطلاعات کد تخفیف
 * @returns نتیجه اعتبارسنجی
 */
export function validateDiscountCode(
  code: string, 
  cartTotal: number, 
  discountData: DiscountCode
): { isValid: boolean; message: string; discountAmount: number } {
  
  if (!discountData.isValid) {
    return {
      isValid: false,
      message: 'کد تخفیف نامعتبر است',
      discountAmount: 0
    };
  }

  if (new Date() > discountData.expiresAt) {
    return {
      isValid: false,
      message: 'کد تخفیف منقضی شده است',
      discountAmount: 0
    };
  }

  if (cartTotal < discountData.minPurchase) {
    return {
      isValid: false,
      message: `حداقل مبلغ خرید ${(discountData.minPurchase / 1000000).toFixed(1)} میلیون تومان است`,
      discountAmount: 0
    };
  }

  // محاسبه مبلغ تخفیف
  const discountAmount = Math.min(
    cartTotal * (discountData.percentage / 100),
    discountData.maxDiscount
  );

  return {
    isValid: true,
    message: `تخفیف ${discountData.percentage}% اعمال شد`,
    discountAmount
  };
}

/**
 * دریافت پیشنهادات تخفیف برای مشتری
 * @param purchaseHistory تاریخچه خرید
 * @returns پیشنهادات برای دریافت تخفیف بیشتر
 */
export function getDiscountSuggestions(purchaseHistory: CustomerPurchaseHistory): {
  nextLevelPurchase: number;
  nextLevelDiscount: number;
  suggestion: string;
} {
  const currentDiscount = calculateLogarithmicDiscount(purchaseHistory.totalPurchases);
  
  // محاسبه مبلغ مورد نیاز برای رسیدن به تخفیف بالاتر
  const nextTargets = [5000000, 10000000, 25000000, 50000000, 100000000]; // اهداف خرید
  
  for (const target of nextTargets) {
    if (purchaseHistory.totalPurchases < target) {
      const nextDiscount = calculateLogarithmicDiscount(target);
      const remainingAmount = target - purchaseHistory.totalPurchases;
      
      return {
        nextLevelPurchase: remainingAmount,
        nextLevelDiscount: nextDiscount,
        suggestion: `با خرید ${(remainingAmount / 1000000).toFixed(1)} میلیون تومان دیگر، تخفیف ${nextDiscount}% دریافت کنید!`
      };
    }
  }

  return {
    nextLevelPurchase: 0,
    nextLevelDiscount: currentDiscount,
    suggestion: 'شما در بالاترین سطح تخفیف قرار دارید!'
  };
} 