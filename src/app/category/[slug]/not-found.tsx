import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
      <FaExclamationTriangle className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">دسته‌بندی یافت نشد</h2>
      <p className="text-gray-600 mb-6">
        دسته‌بندی مورد نظر شما در سیستم موجود نیست.
      </p>
      <div className="flex gap-4">
        <Link
          href="/categories"
          className="btn btn-primary"
        >
          مشاهده همه دسته‌بندی‌ها
        </Link>
        <Link
          href="/"
          className="btn btn-outline"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
} 