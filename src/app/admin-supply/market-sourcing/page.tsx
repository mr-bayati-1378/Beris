'use client';

import { useState } from 'react';
import { 
  FaStore, 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaShoppingCart,
  FaDollarSign,
  FaStar,
  FaMapMarkerAlt,
  FaPhone
} from 'react-icons/fa';

interface MarketSource {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  priceRange: string;
  contact: string;
  products: string[];
  lastOrder: string;
  status: 'active' | 'inactive';
}

export default function MarketSourcingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const marketSources: MarketSource[] = [
    {
      id: '1',
      name: 'بازار دارو تهران',
      category: 'دارو',
      location: 'تهران، خیابان ولیعصر',
      rating: 4.5,
      priceRange: 'متوسط',
      contact: '021-88776655',
      products: ['قرص‌ها', 'شربت‌ها', 'آمپول‌ها'],
      lastOrder: '1403/01/15',
      status: 'active'
    },
    {
      id: '2',
      name: 'مرکز تجهیزات پزشکی',
      category: 'تجهیزات',
      location: 'اصفهان، خیابان چهارباغ',
      rating: 4.2,
      priceRange: 'بالا',
      contact: '031-33445566',
      products: ['سرنگ', 'سرم', 'گاز'],
      lastOrder: '1403/01/10',
      status: 'active'
    }
  ];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
              <FaStore className="h-6 w-6 text-white" />
            </div>
            تامین از بازار
          </h1>
          <p className="mt-2 text-gray-600">جستجو و تامین محصولات از بازارهای محلی</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="جستجو در بازارها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
              <FaPlus className="h-4 w-4" />
              اضافه کردن منبع
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketSources.map((source) => (
            <div key={source.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{source.name}</h3>
                  <p className="text-sm text-gray-600">{source.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  source.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {source.status === 'active' ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="h-4 w-4" />
                  {source.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="h-4 w-4" />
                  {source.contact}
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{source.rating}</span>
                  <span className="text-sm text-gray-600">({source.priceRange})</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">محصولات:</p>
                <div className="flex flex-wrap gap-1">
                  {source.products.map((product, index) => (
                    <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
                  <FaShoppingCart className="h-4 w-4" />
                  سفارش
                </button>
                <button className="px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 text-sm">
                  <FaEye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 