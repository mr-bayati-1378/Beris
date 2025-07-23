'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaTags,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaChartLine,
  FaStar,
  FaFileContract,
  FaHandshake
} from 'react-icons/fa';

interface MarketSource {
  id: number;
  name: string;
  type: 'manufacturer' | 'distributor' | 'wholesaler' | 'retailer' | 'agent';
  location: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
    address: string;
  };
  specialties: string[];
  rating: number;
  status: 'active' | 'potential' | 'blacklisted';
  lastContact?: string;
  notes?: string;
}

const MOCK_SOURCES: MarketSource[] = [
  {
    id: 1,
    name: 'شرکت تجهیزات پزشکی پارس',
    type: 'manufacturer',
    location: 'تهران',
    contact: {
      phone: '021-88776655',
      email: 'info@parsmedical.com',
      website: 'www.parsmedical.com',
      address: 'تهران، خیابان ولیعصر، پلاک 123'
    },
    specialties: ['دستکش جراحی', 'ماسک N95', 'سرم'],
    rating: 4.5,
    status: 'active',
    lastContact: '1403/09/15',
    notes: 'کیفیت بالا، قیمت مناسب'
  },
  {
    id: 2,
    name: 'توزیع کننده آسیا مد',
    type: 'distributor',
    location: 'اصفهان',
    contact: {
      phone: '031-44556677',
      email: 'sales@asiamed.ir',
      address: 'اصفهان، خیابان چهارباغ، مجتمع تجاری آریا'
    },
    specialties: ['لوازم آزمایشگاهی', 'دستگاه‌های تشخیصی', 'مواد مصرفی'],
    rating: 4.2,
    status: 'active',
    lastContact: '1403/09/10'
  },
  {
    id: 3,
    name: 'واردات مدیکال گلدن',
    type: 'distributor',
    location: 'مشهد',
    contact: {
      phone: '051-33445566',
      email: 'import@goldenmedical.com',
      website: 'www.goldenmedical.ir',
      address: 'مشهد، بلوار وکیل‌آباد، ساختمان پزشکی'
    },
    specialties: ['تجهیزات وارداتی', 'دستگاه‌های پیشرفته', 'لوازم یکبار مصرف'],
    rating: 4.8,
    status: 'potential',
    notes: 'منبع جدید با پتانسیل بالا'
  }
];

const TYPE_LABELS = {
  'manufacturer': 'تولیدکننده',
  'distributor': 'توزیع‌کننده',
  'wholesaler': 'عمده‌فروش',
  'retailer': 'خرده‌فروش',
  'agent': 'نماینده'
};

const STATUS_LABELS = {
  'active': 'فعال',
  'potential': 'بالقوه',
  'blacklisted': 'لیست سیاه'
};

export default function MarketSourcingPage() {
  const [sources, setSources] = useState<MarketSource[]>(MOCK_SOURCES);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || source.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'potential': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blacklisted': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturer': return 'bg-purple-100 text-purple-800';
      case 'distributor': return 'bg-blue-100 text-blue-800';
      case 'wholesaler': return 'bg-orange-100 text-orange-800';
      case 'retailer': return 'bg-green-100 text-green-800';
      case 'agent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} 
        size={12}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تامین از بازار</h1>
            <p className="mt-2 text-gray-600">مدیریت منابع تامین و ارتباط با بازار</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
              <FaPlus className="w-4 h-4" />
              افزودن منبع جدید
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaHandshake className="h-8 w-8 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">منابع فعال</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sources.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaFileContract className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">منابع بالقوه</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sources.filter(s => s.status === 'potential').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTags className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">تولیدکنندگان</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sources.filter(s => s.type === 'manufacturer').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartLine className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">میانگین امتیاز</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(sources.reduce((sum, s) => sum + s.rating, 0) / sources.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در منابع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">همه انواع</option>
              <option value="manufacturer">تولیدکننده</option>
              <option value="distributor">توزیع‌کننده</option>
              <option value="wholesaler">عمده‌فروش</option>
              <option value="retailer">خرده‌فروش</option>
              <option value="agent">نماینده</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="potential">بالقوه</option>
              <option value="blacklisted">لیست سیاه</option>
            </select>

            <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors">
              <FaFilter className="w-4 h-4" />
              فیلترهای بیشتر
            </button>
          </div>
        </div>

        {/* Sources List */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              منابع تامین ({filteredSources.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredSources.map((source) => (
              <div key={source.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{source.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(source.type)}`}>
                        {TYPE_LABELS[source.type]}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(source.status)}`}>
                        {STATUS_LABELS[source.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4" />
                        {source.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhoneAlt className="w-4 h-4" />
                        {source.contact.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="w-4 h-4" />
                        {source.contact.email}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">تخصص‌ها:</p>
                      <div className="flex flex-wrap gap-2">
                        {source.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">امتیاز:</span>
                      <div className="flex items-center gap-1">
                        {renderStars(source.rating)}
                        <span className="text-sm text-gray-600 mr-1">({source.rating})</span>
                      </div>
                    </div>

                    {source.lastContact && (
                      <p className="text-xs text-gray-500">آخرین تماس: {source.lastContact}</p>
                    )}

                    {source.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{source.notes}&rdquo;</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                      <FaEye className="w-3 h-3" />
                      مشاهده
                    </button>
                    <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                      <FaEdit className="w-3 h-3" />
                      ویرایش
                    </button>
                    {source.contact.website && (
                      <a 
                        href={`http://${source.contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaGlobe className="w-3 h-3" />
                        وب‌سایت
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSources.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">هیچ منبع تامینی یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 