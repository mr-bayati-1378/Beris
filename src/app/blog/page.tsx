import Image from 'next/image';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaClock, 
  FaHeart,
  FaShare,
  FaComment,
  FaEye,
  FaTags,
  FaSearch,
  FaFilter,
  FaBookmark
} from 'react-icons/fa';

export default function BlogPage() {
  const featuredArticle = {
    id: 1,
    title: "راهنمای کامل انتخاب تجهیزات پزشکی خانگی",
    excerpt: "در این مقاله به بررسی نکات مهم برای انتخاب بهترین تجهیزات پزشکی خانگی می‌پردازیم و معیارهای کیفیت و ایمنی را بررسی می‌کنیم.",
    content: "محتوای کامل مقاله...",
    image: "/blog/featured-article.jpg",
    author: "دکتر احمد محمدی",
    publishDate: "۱۴۰۳/۰۴/۱۵",
    readTime: "۸ دقیقه",
    views: 1250,
    likes: 45,
    comments: 12,
    category: "راهنمای خرید"
  };

  const articles = [
    {
      id: 2,
      title: "نحوه استفاده صحیح از فشارسنج دیجیتال",
      excerpt: "آموزش گام به گام استفاده از فشارسنج دیجیتال و نکات مهم برای اندازه‌گیری دقیق فشار خون",
      image: "/blog/blood-pressure.jpg",
      author: "دکتر سارا احمدی",
      publishDate: "۱۴۰۳/۰۴/۱۰",
      readTime: "۵ دقیقه",
      views: 980,
      likes: 32,
      comments: 8,
      category: "آموزشی"
    },
    {
      id: 3,
      title: "بهترین دستگاه‌های تنفسی برای درمان خانگی",
      excerpt: "معرفی انواع دستگاه‌های تنفسی و راهنمای انتخاب مناسب‌ترین آن‌ها برای استفاده خانگی",
      image: "/blog/respiratory-devices.jpg",
      author: "دکتر مهدی کریمی",
      publishDate: "۱۴۰۳/۰۴/۰۵",
      readTime: "۷ دقیقه",
      views: 756,
      likes: 28,
      comments: 15,
      category: "تجهیزات"
    },
    {
      id: 4,
      title: "اهمیت استریل بودن تجهیزات پزشکی",
      excerpt: "بررسی اهمیت استریل بودن تجهیزات پزشکی و روش‌های صحیح نگهداری و ضدعفونی",
      image: "/blog/sterilization.jpg",
      author: "دکتر فاطمه زارعی",
      publishDate: "۱۴۰۳/۰۳/۲۸",
      readTime: "۶ دقیقه",
      views: 654,
      likes: 22,
      comments: 9,
      category: "بهداشت"
    },
    {
      id: 5,
      title: "راهنمای انتخاب ترمومتر مناسب",
      excerpt: "مقایسه انواع ترمومتر و راهنمای انتخاب بهترین نوع برای استفاده خانگی و پزشکی",
      image: "/blog/thermometer.jpg",
      author: "دکتر رضا محمدی",
      publishDate: "۱۴۰۳/۰۳/۲۰",
      readTime: "۴ دقیقه",
      views: 432,
      likes: 18,
      comments: 6,
      category: "راهنمای خرید"
    },
    {
      id: 6,
      title: "تجهیزات ضروری کیت کمک‌های اولیه",
      excerpt: "فهرست کامل تجهیزات ضروری برای کیت کمک‌های اولیه خانگی و نحوه استفاده از آن‌ها",
      image: "/blog/first-aid.jpg",
      author: "دکتر نازنین علوی",
      publishDate: "۱۴۰۳/۰۳/۱۲",
      readTime: "۹ دقیقه",
      views: 823,
      likes: 35,
      comments: 11,
      category: "کمک‌های اولیه"
    }
  ];

  const categories = [
    "همه", "راهنمای خرید", "آموزشی", "تجهیزات", "بهداشت", "کمک‌های اولیه"
  ];

  const popularTags = [
    "فشارسنج", "ترمومتر", "تجهیزات تنفسی", "کمک‌های اولیه", 
    "استریل", "خانگی", "پزشکی", "درمان"
  ];

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-12 md:px-16">
      {/* Hero Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12 text-white">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-4 rounded-2xl">
              <FaBookmark className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl mb-2">
                مقالات تخصصی
              </h1>
              <p className="text-lg text-white/90">
                آخرین مطالب در زمینه تجهیزات پزشکی و سلامت
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <FaBookmark className="h-8 w-8 mb-2" />
              <h3 className="font-bold mb-1">مقالات تخصصی</h3>
              <p className="text-sm text-white/80">بیش از ۱۰۰ مقاله</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <FaUser className="h-8 w-8 mb-2" />
              <h3 className="font-bold mb-1">نویسندگان متخصص</h3>
              <p className="text-sm text-white/80">پزشکان و کارشناسان</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <FaClock className="h-8 w-8 mb-2" />
              <h3 className="font-bold mb-1">بروزرسانی مداوم</h3>
              <p className="text-sm text-white/80">محتوای جدید هفتگی</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در مقالات..."
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 items-center">
            <FaFilter className="text-gray-400" />
            <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          مقاله ویژه
        </h2>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="md:flex">
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <FaBookmark className="h-16 w-16 text-indigo-300" />
              </div>
              <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ویژه
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {featuredArticle.category}
                </span>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaEye />
                    {featuredArticle.views.toLocaleString('fa-IR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaHeart />
                    {featuredArticle.likes}
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4 hover:text-indigo-600 transition-colors">
                {featuredArticle.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaUser />
                    {featuredArticle.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt />
                    {featuredArticle.publishDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    {featuredArticle.readTime}
                  </div>
                </div>
                
                <Link
                  href={`/blog/${featuredArticle.id}`}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  مطالعه کامل
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Articles Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            آخرین مقالات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <FaBookmark className="h-12 w-12 text-indigo-300" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-indigo-600">
                    {article.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <FaEye />
                        {article.views.toLocaleString('fa-IR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaHeart />
                        {article.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaComment />
                        {article.comments}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaUser />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FaCalendarAlt />
                        {article.publishDate}
                      </div>
                    </div>
                    
                    <Link
                      href={`/blog/${article.id}`}
                      className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    >
                      مطالعه
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                ۱
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                ۲
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                ۳
              </button>
              <span className="px-4 py-2 text-gray-500">...</span>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                بعدی
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Popular Tags */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaTags className="text-indigo-600" />
              برچسب‌های محبوب
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, index) => (
                <button
                  key={index}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm hover:bg-indigo-100 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">عضویت در خبرنامه</h3>
            <p className="text-sm text-white/90 mb-4">
              از آخرین مقالات و اخبار دنیای پزشکی باخبر شوید
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="ایمیل شما"
                className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="w-full bg-white text-indigo-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                عضویت
              </button>
            </div>
          </div>

          {/* Recent Articles */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">مقالات اخیر</h3>
            <div className="space-y-4">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.id}`}
                  className="block group"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaBookmark className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCalendarAlt />
                        {article.publishDate}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 