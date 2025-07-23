import React from 'react';
import { FaAward, FaStar, FaShieldAlt, FaHandshake } from 'react-icons/fa';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string;
}

const TrustStats = () => {
  const stats: StatItem[] = [
    {
      icon: <FaAward className="text-xl" />,
      value: '8+',
      label: 'برند معتبر',
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      icon: <FaStar className="text-xl" />,
      value: '97%',
      label: 'میانگین اعتماد',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      icon: <FaShieldAlt className="text-xl" />,
      value: '100%',
      label: 'ضمانت اصالت',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: <FaHandshake className="text-xl" />,
      value: '10+',
      label: 'سال تجربه',
      gradient: 'from-orange-600 to-red-600'
    }
  ];

  return (
    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
        >
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-200`}>
            {stat.icon}
          </div>
          
          {/* Value */}
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stat.value}
          </div>
          
          {/* Label */}
          <div className="text-gray-600 text-sm font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustStats; 