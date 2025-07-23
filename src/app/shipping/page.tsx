import {
  FaTruck,
  FaMapMarkerAlt,
  FaClock,
  FaBox,
  FaMoneyBillWave,
  FaQuestionCircle,
} from 'react-icons/fa';

export default function ShippingPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/90 to-primary/70 p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            نحوه ارسال و تحویل سفارشات
          </h1>
          <p className="text-lg text-white/90">
            ما در بریس با همکاری با معتبرترین شرکت‌های حمل و نقل، سفارشات شما را
            در سریع‌ترین زمان ممکن به دستتان می‌رسانیم.
          </p>
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaTruck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            ارسال با پست پیشتاز
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <FaClock className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>تحویل در ۲۴ تا ۴۸ ساعت کاری</span>
            </li>
            <li className="flex items-start gap-2">
              <FaMoneyBillWave className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>
                هزینه ارسال: رایگان برای سفارش‌های بالای ۵ میلیون تومان
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FaBox className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>امکان ارسال به سراسر کشور</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaMapMarkerAlt className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            ارسال با پیک موتوری
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <FaClock className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>تحویل در همان روز (برای تهران)</span>
            </li>
            <li className="flex items-start gap-2">
              <FaMoneyBillWave className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>هزینه ارسال: ۵۰ هزار تومان</span>
            </li>
            <li className="flex items-start gap-2">
              <FaBox className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>فقط برای شهر تهران</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaBox className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">تحویل حضوری</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <FaClock className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>تحویل فوری در فروشگاه</span>
            </li>
            <li className="flex items-start gap-2">
              <FaMoneyBillWave className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>بدون هزینه ارسال</span>
            </li>
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <span>آدرس: تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Shipping Process */}
      <div className="mb-16 rounded-3xl bg-gray-50 p-12">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
          فرآیند ارسال سفارش
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۱
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">ثبت سفارش</h3>
            <p className="text-gray-600">
              انتخاب محصولات و تکمیل اطلاعات ارسال
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۲
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              تایید سفارش
            </h3>
            <p className="text-gray-600">
              بررسی و تایید سفارش توسط کارشناسان ما
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۳
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">آماده‌سازی</h3>
            <p className="text-gray-600">
              بسته‌بندی و آماده‌سازی سفارش برای ارسال
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۴
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">تحویل</h3>
            <p className="text-gray-600">ارسال و تحویل سفارش به آدرس شما</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
          سوالات متداول ارسال
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  آیا امکان ارسال به شهرستان‌ها وجود دارد؟
                </h3>
                <p className="text-gray-600">
                  بله، ما با همکاری با پست پیشتاز، سفارشات را به سراسر کشور
                  ارسال می‌کنیم. زمان تحویل در شهرستان‌ها معمولاً ۲ تا ۴ روز
                  کاری است.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  هزینه ارسال چگونه محاسبه می‌شود؟
                </h3>
                <p className="text-gray-600">
                  برای سفارش‌های بالای ۵ میلیون تومان، ارسال رایگان است. برای
                  سفارش‌های کمتر، هزینه ارسال بر اساس وزن و مسافت محاسبه می‌شود.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  چگونه می‌توانم سفارش خود را پیگیری کنم؟
                </h3>
                <p className="text-gray-600">
                  پس از ارسال سفارش، کد رهگیری از طریق پیامک برای شما ارسال
                  می‌شود. همچنین می‌توانید از طریق پنل کاربری خود، وضعیت سفارش
                  را پیگیری کنید.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  آیا امکان ارسال در روزهای تعطیل وجود دارد؟
                </h3>
                <p className="text-gray-600">
                  خیر، ارسال سفارشات در روزهای تعطیل انجام نمی‌شود. سفارشات ثبت
                  شده در روزهای تعطیل، در اولین روز کاری ارسال خواهند شد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-12 text-center text-white">
        <h2 className="mb-6 text-3xl font-bold">
          نیاز به راهنمایی بیشتر دارید؟
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
          تیم پشتیبانی بریس آماده پاسخگویی به سوالات شما در مورد ارسال و تحویل
          سفارشات است.
        </p>
        <a
          href="/contact"
          className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-gray-100"
        >
          تماس با پشتیبانی
        </a>
      </div>
    </div>
  );
}
