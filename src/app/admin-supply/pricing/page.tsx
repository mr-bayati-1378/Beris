'use client';

import { useState, useEffect } from 'react';
import { 
  FaDollarSign, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaPercent,
  FaHistory,
  FaFileImport,
  FaFileExport
} from 'react-icons/fa';

interface PriceItem {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  costPrice: number;
  margin: number;
  lastUpdated: string;
  supplier: string;
  status: 'active' | 'inactive';
}

export default function PricingPage() {
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PriceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const samplePriceItems: PriceItem[] = [
    {
      id: '1',
      productName: 'قرص استامینوفن 500 میلی‌گرم',
      productCode: 'MED-001',
      category: 'دارو',
      currentPrice: 15000,
      previousPrice: 14000,
      costPrice: 12000,
      margin: 25,
      lastUpdated: '1403/01/15',
      supplier: 'شرکت دارو پخش',
      status: 'active'
    },
    {
      id: '2',
      productName: 'سرم فیزیولوژی 500cc',
      productCode: 'MED-002',
      category: 'تجهیزات پزشکی',
      currentPrice: 8500,
      previousPrice: 8000,
      costPrice: 7000,
      margin: 21.4,
      lastUpdated: '1403/01/20',
      supplier: 'تامین کنندگان طب',
      status: 'active'
    }
  ];

  useEffect(() => {
    setPriceItems(samplePriceItems);
    setFilteredItems(samplePriceItems);
  }, [samplePriceItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
              <FaDollarSign className="h-6 w-6 text-white" />
            </div>
            مدیریت قیمت‌گذاری
          </h1>
          <p className="mt-2 text-gray-600">تنظیم و مدیریت قیمت محصولات</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="جستجو محصولات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
              <FaPlus className="h-4 w-4" />
              اضافه کردن قیمت
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">محصول</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">قیمت فعلی</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">قیمت خرید</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">حاشیه سود</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">تغییرات</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.productCode}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(item.currentPrice)}</td>
                    <td className="px-6 py-4">{formatCurrency(item.costPrice)}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-medium">{item.margin.toFixed(1)}%</span>
                    </td>
                                         <td className="px-6 py-4">
                       {item.currentPrice > item.previousPrice ? (
                         <span className="flex items-center gap-1 text-green-600">
                           <FaArrowUp className="h-4 w-4" />
                           {((item.currentPrice - item.previousPrice) / item.previousPrice * 100).toFixed(1)}%
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-red-600">
                           <FaArrowDown className="h-4 w-4" />
                           {((item.previousPrice - item.currentPrice) / item.previousPrice * 100).toFixed(1)}%
                         </span>
                       )}
                     </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 