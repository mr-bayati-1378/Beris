'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaBox, FaCubes } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Pack {
  id: string;
  name: string;
  totalPrice: number;
  description?: string;
  customerName?: string;
}

interface ProductPackSearchProps {
  products: Product[];
  packs: Pack[];
  onProductSelect: (product: Product) => void;
  onPackSelect: (pack: Pack) => void;
  placeholder?: string;
  className?: string;
}

export default function ProductPackSearch({
  products,
  packs,
  onProductSelect,
  onPackSelect,
  placeholder = "جستجو محصول یا پک...",
  className = ""
}: ProductPackSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<Pack[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const productResults = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toString().includes(searchTerm)
      );
      
      const packResults = packs.filter(pack =>
        pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pack.customerName && pack.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setFilteredProducts(productResults.slice(0, 5)); // حداکثر 5 محصول
      setFilteredPacks(packResults.slice(0, 5)); // حداکثر 5 پک
      setIsOpen(true);
    } else {
      setFilteredProducts([]);
      setFilteredPacks([]);
      setIsOpen(false);
    }
  }, [searchTerm, products, packs]);

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchTerm(product.name);
    setIsOpen(false);
  };

  const handlePackSelect = (pack: Pack) => {
    onPackSelect(pack);
    setSearchTerm(pack.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // تاخیر برای اجازه دادن به کلیک روی آیتم‌ها
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>

      {isOpen && (filteredProducts.length > 0 || filteredPacks.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* محصولات */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-700 border-b">
                محصولات ({filteredProducts.length})
              </div>
              {filteredProducts.map(product => (
                <div
                  key={`product-${product.id}`}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FaBox className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        قیمت: {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                      </div>
                      <div className="text-xs text-gray-500">
                        موجودی: {product.stock} عدد
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* پک‌ها */}
          {filteredPacks.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-700 border-b">
                پک‌ها ({filteredPacks.length})
              </div>
              {filteredPacks.map(pack => (
                <div
                  key={`pack-${pack.id}`}
                  onClick={() => handlePackSelect(pack)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FaCubes className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <div className="font-medium">{pack.name}</div>
                      <div className="text-sm text-gray-600">
                        قیمت: {new Intl.NumberFormat('fa-IR').format(pack.totalPrice)} تومان
                      </div>
                      {pack.customerName && (
                        <div className="text-xs text-gray-500">
                          مشتری: {pack.customerName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 