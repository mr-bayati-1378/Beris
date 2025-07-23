import Image from 'next/image';
import { 
  FaPhone, 
  FaWhatsapp, 
  FaTelegram, 
  FaEnvelope,
  FaClock,
  FaUserMd,
  FaHeart,
  FaStethoscope,
  FaPrescription,
  FaCalendarAlt,
  FaComments,
  FaCheckCircle
} from 'react-icons/fa';

export default function ConsultationPage() {
  const consultationServices = [
    {
      title: "مشاوره تجهیزات پزشکی",
      description: "راهنمایی برای انتخاب بهترین تجهیزات پزشکی متناسب با نیاز شما",
      icon: FaStethoscope,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "مشاوره درمانی",
      description: "راهنمایی در مورد استفاده صحیح از تجهیزات و دستگاه‌های پزشکی",
      icon: FaPrescription,
      color: "from-green-500 to-green-600"
    },
    {
      title: "مشاوره خرید",
      description: "کمک به انتخاب محصولات با بهترین کیفیت و مناسب‌ترین قیمت",
      icon: FaCheckCircle,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const consultationMethods = [
    {
      title: "تماس تلفنی",
      description: "تماس مستقیم با کارشناسان ما",
      icon: FaPhone,
      link: "tel:+982188907813",
      color: "bg-blue-500"
    },
    {
      title: "واتساپ",
      description: "چت آنلاین و پشتیبانی سریع",
      icon: FaWhatsapp,
      link: "https://wa.me/989029161829",
      color: "bg-green-500"
    },
    {
      title: "تلگرام",
      description: "ارتباط از طریق تلگرام",
      icon: FaTelegram,
      link: "https://t.me/beris_medical",
      color: "bg-blue-400"
    },
    {
      title: "ایمیل",
      description: "ارسال سوالات تخصصی",
      icon: FaEnvelope,
      link: "mailto:beris.medical@gmail.com",
      color: "bg-purple-500"
    }
  ];

  const workingHours = [
    { day: "شنبه تا چهارشنبه", time: "۸:۰۰ - ۱۷:۰۰" },
    { day: "پنج‌شنبه", time: "۸:۰۰ - ۱۳:۰۰" },
    { day: "جمعه", time: "تعطیل" }
  ];

  const experts = [
    {
      name: "دکتر احمد محمدی",
      specialty: "متخصص تجهیزات پزشکی",
      experience: "بیش از ۱۵ سال تجربه",
      image: "/team/doctor1.jpg"
    },
    {
      name: "مهندس سارا کریمی",
      specialty: "کارشناس فنی تجهیزات",
      experience: "بیش از ۱۰ سال تجربه",
      image: "/team/engineer1.jpg"
    },
    {
      name: "دکتر مهدی زارعی",
      specialty: "مشاور تخصصی فروش",
      experience: "بیش از ۱۲ سال تجربه",
      image: "/team/doctor2.jpg"
    }
  ];

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-white">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-4 rounded-2xl">
              <FaUserMd className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl mb-2">
                مشاوره تخصصی
              </h1>
              <p className="text-lg text-white/90">
                راهنمایی حرفه‌ای برای انتخاب بهترین تجهیزات پزشکی
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <FaClock className="h-8 w-8 mb-2" />
              <h3 className="font-bold mb-1">پاسخگویی سریع</h3>
              <p className="text-sm text-white/80">کمتر از ۳۰ دقیقه</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <FaUserMd className="h-8 w-8 mb-2" />
              <h3 className="font-bold mb-1">کارشناسان مجرب</h3>
              <p className="text-sm text-white/80">بیش از ۱۰ سال تجربه</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <FaHeart className="h-8 w-8 mb-2" />
              <h3 className="font-bold mb-1">مشاوره رایگان</h3>
              <p className="text-sm text-white/80">بدون هیچ هزینه‌ای</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          خدمات مشاورهٔ ما
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {consultationServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Methods */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          راه‌های ارتباط با ما
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultationMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.link}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 text-center"
              >
                <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {method.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Working Hours */}
      <div className="mb-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12">
        <div className="text-center mb-8">
          <FaClock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ساعات پاسخگویی
          </h2>
          <p className="text-gray-600">
            ما آماده پاسخگویی به سوالات شما در ساعات زیر هستیم
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          {workingHours.map((schedule, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-4 px-6 bg-white rounded-lg mb-4 shadow-sm"
            >
              <span className="font-medium text-gray-800">{schedule.day}</span>
              <span className={`font-bold ${schedule.time === 'تعطیل' ? 'text-red-500' : 'text-blue-600'}`}>
                {schedule.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expert Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          تیم کارشناسان ما
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experts.map((expert, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUserMd className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {expert.name}
              </h3>
              <p className="text-blue-600 font-medium mb-2">
                {expert.specialty}
              </p>
              <p className="text-gray-600 text-sm">
                {expert.experience}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center">
        <FaComments className="h-16 w-16 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">
          آماده پاسخگویی به سوالات شما هستیم
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          با تیم مجرب ما تماس بگیرید و بهترین راهنمایی را برای انتخاب تجهیزات پزشکی دریافت کنید
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+982188907813"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <FaPhone />
            تماس تلفنی
          </a>
          <a
            href="https://wa.me/989029161829"
            className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <FaWhatsapp />
            واتساپ
          </a>
        </div>
      </div>
    </div>
  );
} 