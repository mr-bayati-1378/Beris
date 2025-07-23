import Image from 'next/image';
import { FaUsers, FaAward, FaHandshake, FaHeartbeat } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      <div className="mb-8 flex justify-center">
        <Image
          src="/beris-logo.png"
          alt="لوگوی بریس"
          width={120}
          height={120}
          priority
        />
      </div>
      {/* Hero Section */}
      <div className="relative mb-16 h-[300px] overflow-hidden rounded-3xl md:h-[400px]">
        <Image
          src="/images/about-hero.jpg"
          alt="درباره بریس"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-primary/90 to-primary/70">
          <div className="max-w-2xl p-8 text-white">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">درباره بریس</h1>
            <p className="text-lg text-white/90 md:text-xl">
              فروشگاه آنلاین تجهیزات پزشکی و مصرفی با بهترین کیفیت و قیمت
            </p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">داستان ما</h2>
          <p className="leading-relaxed text-gray-600">
            بریس با هدف ارائه خدمات بهتر به جامعه پزشکی و بیماران، فعالیت خود را
            از سال ۱۴۰۰ آغاز کرد. ما با تکیه بر تجربه و تخصص تیم خود، همواره در
            تلاش هستیم تا بهترین محصولات پزشکی را با قیمت مناسب و کیفیت تضمین
            شده به مشتریان خود ارائه دهیم.
          </p>
          <p className="leading-relaxed text-gray-600">
            امروز بریس به عنوان یکی از معتبرترین فروشگاه‌های آنلاین تجهیزات
            پزشکی شناخته می‌شود و با همکاری با برندهای معتبر جهانی، گامی بلند در
            جهت ارتقای سطح سلامت جامعه برداشته است.
          </p>
        </div>
        <div className="relative h-[400px] overflow-hidden rounded-2xl">
          <Image
            src="/images/about-company.jpg"
            alt="داستان بریس"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Values */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaUsers className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">تیم متخصص</h3>
          <p className="text-gray-600">
            تیم ما متشکل از متخصصان مجرب در حوزه پزشکی و تجهیزات پزشکی است
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaAward className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">کیفیت برتر</h3>
          <p className="text-gray-600">
            ارائه محصولات با کیفیت و تضمین اصالت کالا از اصول ماست
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaHandshake className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            پشتیبانی ۲۴/۷
          </h3>
          <p className="text-gray-600">
            پشتیبانی شبانه‌روزی و پاسخگویی سریع به نیازهای مشتریان
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FaHeartbeat className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-800">سلامت جامعه</h3>
          <p className="text-gray-600">
            ارتقای سطح سلامت جامعه با ارائه محصولات با کیفیت و مشاوره تخصصی
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/5 to-primary/10 p-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-800">
              ماموریت ما
            </h2>
            <p className="leading-relaxed text-gray-600">
              ما در بریس متعهد به ارائه بهترین خدمات و محصولات پزشکی هستیم.
              ماموریت ما ارتقای سطح سلامت جامعه از طریق دسترسی آسان به تجهیزات
              پزشکی با کیفیت و قیمت مناسب است.
            </p>
          </div>
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-800">
              چشم‌انداز ما
            </h2>
            <p className="leading-relaxed text-gray-600">
              چشم‌انداز ما تبدیل شدن به برترین فروشگاه آنلاین تجهیزات پزشکی در
              ایران است. ما می‌خواهیم با ارائه خدمات برتر و محصولات با کیفیت، به
              مرجع اصلی خرید تجهیزات پزشکی تبدیل شویم.
            </p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16 text-center">
        <h2 className="mb-12 text-3xl font-bold text-gray-800">تیم ما</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="relative h-64">
              <Image
                src="/images/team-1.jpg"
                alt="عضو تیم"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-800">
                دکتر علی ندایی
              </h3>
              <p className="mb-2 text-primary">مدیرعامل</p>
              <p className="text-gray-600">
                متخصص پزشکی با بیش از ۱۵ سال تجربه در حوزه تجهیزات پزشکی
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="relative h-64">
              <Image
                src="/images/team-2.jpg"
                alt="عضو تیم"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-800">
                دکتر مسعود حسینی
              </h3>
              <p className="mb-2 text-primary">مدیر فنی</p>
              <p className="text-gray-600">
                کارشناس ارشد تجهیزات پزشکی با تخصص در حوزه کنترل کیفیت
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="relative h-64">
              <Image
                src="/images/team-3.jpg"
                alt="عضو تیم"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-800">
                امیرحسین گیوی
              </h3>
              <p className="mb-2 text-primary">مدیر خدمات مشتریان</p>
              <p className="text-gray-600">
                متخصص مدیریت خدمات با تمرکز بر رضایت مشتری
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-12 text-center text-white">
        <h2 className="mb-6 text-3xl font-bold">با ما در ارتباط باشید</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
          برای هرگونه سوال، پیشنهاد یا همکاری با ما در تماس باشید. تیم پشتیبانی
          بریس آماده پاسخگویی به شماست.
        </p>
        <a
          href="/contact"
          className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-gray-100"
        >
          تماس با ما
        </a>
      </div>
    </div>
  );
}
