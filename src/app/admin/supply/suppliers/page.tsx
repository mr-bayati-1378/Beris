'use client';

import { useState, useEffect } from 'react';
import { 
  FaTruck, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  rating?: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    // Simulated data - replace with actual API call
    setTimeout(() => {
      setSuppliers([
        {
          id: 1,
          name: 'شرکت پارس طب',
          contactPerson: 'آقای احمدی',
          phone: '02133445566',
          email: 'info@parsteb.com',
          address: 'تهران، خیابان ولیعصر، پلاک 123',
          website: 'https://parsteb.com',
          rating: 4.5,
          isActive: true,
          description: 'تامین‌کننده تجهیزات پزشکی',
          createdAt: '2024-01-15T10:30:00.000Z'
        },
        {
          id: 2,
          name: 'تجهیزات پزشکی آریا',
          contactPerson: 'خانم محمدی',
          phone: '02144556677',
          email: 'orders@ariamedical.ir',
          address: 'تهران، میدان آرژانتین، ساختمان آریا',
          rating: 4.2,
          isActive: true,
          description: 'واردکننده وسایل دندانپزشکی',
          createdAt: '2024-01-20T14:15:00.000Z'
        },
        {
          id: 3,
          name: 'شرکت مهر سلامت',
          contactPerson: 'دکتر رضایی',
          phone: '02155667788',
          email: 'contact@mehrsalamat.com',
          address: 'تهران، خیابان کریمخان، برج مهر',
          website: 'https://mehrsalamat.com',
          rating: 4.8,
          isActive: false,
          description: 'تولیدکننده تجهیزات فیزیوتراپی',
          createdAt: '2024-02-01T09:45:00.000Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && supplier.isActive) ||
                         (filterActive === 'inactive' && !supplier.isActive);

    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                مدیریت تامین‌کنندگان
              </h1>
              <p className="text-gray-600">
                مشاهده و مدیریت تامین‌کنندگان و شرکای تجاری
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center">
                <FaPlus className="mr-2 h-4 w-4" />
                تامین‌کننده جدید
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="جستجو در تامین‌کنندگان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <FaFilter className="text-gray-500 h-4 w-4" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {supplier.name}
                    </h3>
                    {supplier.contactPerson && (
                      <p className="text-sm text-gray-600">
                        نماینده: {supplier.contactPerson}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {supplier.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {/* Rating */}
                {supplier.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">{renderStars(supplier.rating)}</div>
                    <span className="text-sm text-gray-600">({supplier.rating})</span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {supplier.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaPhone className="h-4 w-4 mr-2 text-gray-400" />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaEnvelope className="h-4 w-4 mr-2 text-gray-400" />
                      {supplier.email}
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <FaMapMarkerAlt className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaGlobe className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        وب‌سایت
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                {supplier.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {supplier.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(supplier.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSuppliers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FaTruck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              تامین‌کننده‌ای یافت نشد
            </h3>
            <p className="text-gray-600 mb-6">
              هیچ تامین‌کننده‌ای با این فیلترها وجود ندارد.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              تامین‌کننده جدید اضافه کنید
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 