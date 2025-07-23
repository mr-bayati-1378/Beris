import {
  FaUndo,
  FaClipboardList,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaBox,
  FaTruck,
  FaMoneyBillWave,
} from 'react-icons/fa';

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/90 to-primary/70 p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            شرایط بازگشت کالا
          </h1>
          <p className="text-lg text-white/90">
            ما در بریس به کیفیت محصولات خود اطمینان داریم و برای رضایت شما،
            شرایط بازگشت آسان را فراهم کرده‌ایم.
          </p>
        </div>
      </div>

      {/* Return Conditions */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FaUndo className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                شرایط بازگشت کالا
              </h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-2">
                  <FaBox className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>کالا باید در همان وضعیت اولیه و بدون استفاده باشد</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBox className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>
                    تمام قطعات و لوازم جانبی باید به صورت کامل موجود باشند
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBox className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>بسته‌بندی اصلی محصول باید سالم باشد</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBox className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>
                    درخواست بازگشت باید حداکثر تا ۷ روز پس از دریافت کالا ثبت
                    شود
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FaExclamationTriangle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                موارد غیرقابل بازگشت
              </h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-2">
                  <FaExclamationTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>محصولات مصرفی و یکبار مصرف</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaExclamationTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>محصولاتی که بسته‌بندی آن‌ها باز شده است</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaExclamationTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>
                    محصولاتی که تاریخ درخواست بازگشت آن‌ها بیش از ۷ روز است
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaExclamationTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>محصولاتی که به دلیل استفاده نادرست آسیب دیده‌اند</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Return Process */}
      <div className="mb-16 rounded-3xl bg-gray-50 p-12">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
          فرآیند بازگشت کالا
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۱
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              ثبت درخواست
            </h3>
            <p className="text-gray-600">
              ثبت درخواست بازگشت از طریق پنل کاربری
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۲
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              تایید درخواست
            </h3>
            <p className="text-gray-600">
              بررسی و تایید درخواست توسط کارشناسان ما
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۳
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">ارسال کالا</h3>
            <p className="text-gray-600">ارسال کالا به آدرس مرکز بازگشت</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              ۴
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">بازپرداخت</h3>
            <p className="text-gray-600">بازپرداخت هزینه پس از بررسی کالا</p>
          </div>
        </div>
      </div>

      {/* Return Details */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaTruck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">هزینه ارسال</h3>
          <p className="text-gray-600">
            هزینه ارسال کالا به مرکز بازگشت بر عهده مشتری است. در صورت تایید
            بازگشت، این هزینه به حساب شما بازگردانده می‌شود.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaMoneyBillWave className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            بازپرداخت هزینه
          </h3>
          <p className="text-gray-600">
            پس از بررسی و تایید کالا، مبلغ به همان روش پرداخت اولیه (کارت بانکی
            یا کیف پول) به حساب شما بازگردانده می‌شود.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaClipboardList className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            مدارک مورد نیاز
          </h3>
          <p className="text-gray-600">
            فاکتور خرید، کد رهگیری ارسال و توضیحات دلیل بازگشت کالا از مدارک
            مورد نیاز برای بازگشت کالا هستند.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
          سوالات متداول بازگشت کالا
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  چقدر طول می‌کشد تا مبلغ به حساب من برگردد؟
                </h3>
                <p className="text-gray-600">
                  پس از دریافت و بررسی کالا، مبلغ طی ۲۴ تا ۴۸ ساعت کاری به حساب
                  شما بازگردانده می‌شود.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  آیا می‌توانم کالا را به جای بازگشت تعویض کنم؟
                </h3>
                <p className="text-gray-600">
                  بله، در صورت تمایل می‌توانید کالا را با محصول دیگری با قیمت
                  مشابه یا متفاوت تعویض کنید.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  آیا می‌توانم کالای معیوب را بازگردانم؟
                </h3>
                <p className="text-gray-600">
                  بله، در صورت معیوب بودن کالا، می‌توانید آن را بازگردانید. در
                  این صورت هزینه ارسال نیز بر عهده ما خواهد بود.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <FaQuestionCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">
                  آدرس مرکز بازگشت کالا کجاست؟
                </h3>
                <p className="text-gray-600">
                  آدرس مرکز بازگشت: تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه ۲، واحد
                  ۴. تلفن: ۰۲۱-۱۲۳۴۵۶۷۸
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
          تیم پشتیبانی بریس آماده پاسخگویی به سوالات شما در مورد بازگشت کالا
          است.
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
