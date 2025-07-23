'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  FaImage, 
  FaVideo, 
  FaFile, 
  FaFolder, 
  FaTrash, 
  FaDownload, 
  FaCopy, 
  FaSearch, 
  FaTh, 
  FaList,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUpload
} from 'react-icons/fa';

interface MediaFile {
  id: number;
  name: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  uploadedAt: string;
  usedIn: string[];
}

export default function MediaManagement() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  useEffect(() => {
    const mockMediaFiles: MediaFile[] = [
      {
        id: 1,
        name: 'product-mask-n95.jpg',
        originalName: 'ماسک N95.jpg',
        url: '/default-product.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 245678,
        dimensions: { width: 800, height: 600 },
        uploadedAt: '1403/01/15',
        usedIn: ['محصول ماسک N95']
      },
      {
        id: 2,
        name: 'category-medical-equipment.jpg',
        originalName: 'تجهیزات پزشکی.jpg',
        url: '/default-category.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 187923,
        dimensions: { width: 600, height: 400 },
        uploadedAt: '1403/01/14',
        usedIn: ['دسته‌بندی تجهیزات پزشکی']
      }
    ];
    
    setTimeout(() => {
      setMediaFiles(mockMediaFiles);
      setLoading(false);
    }, 1000);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">در حال بارگذاری...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">مدیریت فایل‌ها</h1>
          <p className="mt-2 text-gray-600">آپلود و مدیریت تصاویر، ویدیوها و فایل‌ها</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {mediaFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="mb-3 aspect-square bg-gray-100 rounded">
                  {file.type === 'image' ? (
                    <Image
                      src={file.url}
                      alt={file.originalName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaFile className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{file.originalName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 