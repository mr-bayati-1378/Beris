'use client';

export default function FinanceFinancialAnalysis() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-purple-600">📊</span>
            تحلیل مالی - مالی
          </h1>
          <p className="mt-1 text-gray-600">
            تحلیل و بررسی عملکرد مالی از پنل مالی
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">دسترسی به تحلیل مالی</h2>
            <p className="text-gray-600 mb-6">
              برای مشاهده تحلیل‌های مالی کامل، از لینک زیر استفاده کنید:
            </p>
            <a
              href="/admin/financial-analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              باز کردن تحلیل مالی
              <span>↗</span>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              * صفحه در تب جدید باز می‌شود تا پنل مالی حفظ شود
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 