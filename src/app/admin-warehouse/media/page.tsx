'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaImages, 
  FaUpload, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaFileImage,
  FaFolder,
  FaPlus
} from 'react-icons/fa';

interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  usageCount: number;
  isUsed: boolean;
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  usedFiles: number;
  unusedFiles: number;
  imageFiles: number;
  documentFiles: number;
}

export default function WarehouseMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<MediaStats>({
    totalFiles: 0,
    totalSize: 0,
    usedFiles: 0,
    unusedFiles: 0,
    imageFiles: 0,
    documentFiles: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 24;

  const fetchMediaData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        type: typeFilter,
        usage: usageFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/products/images?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setTotalPages(data.totalPages || 1);
        
        // محاسبه آمار فایل‌ها
        const allFiles = data.files || [];
        const totalSize = allFiles.reduce((sum: number, file: MediaFile) => sum + file.size, 0);
        const usedFiles = allFiles.filter((f: MediaFile) => f.isUsed).length;
        const imageFiles = allFiles.filter((f: MediaFile) => f.mimetype.startsWith('image/')).length;
        const documentFiles = allFiles.filter((f: MediaFile) => !f.mimetype.startsWith('image/')).length;

        setStats({
          totalFiles: data.total || 0,
          totalSize,
          usedFiles,
          unusedFiles: (data.total || 0) - usedFiles,
          imageFiles,
          documentFiles
        });
      }
    } catch (error) {
      console.error('خطا در دریافت فایل‌ها:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, typeFilter, usageFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchMediaData();
  }, [fetchMediaData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setUploading(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', uploadedFiles[i]);

        const response = await fetch('/api/admin/products/images', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`خطا در آپلود ${uploadedFiles[i].name}`);
        }
      }
      
      // بروزرسانی لیست فایل‌ها
      await fetchMediaData();
    } catch (error) {
      console.error('خطا در آپلود:', error);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('آیا از حذف این فایل اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/admin/products/images/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchMediaData();
      }
    } catch (error) {
      console.error('خطا در حذف فایل:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return FaFileImage;
    }
    return FaFolder;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <p className="text-gray-600">در حال بارگذاری رسانه‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaImages className="text-amber-600" />
                مدیریت رسانه - انبار
              </h1>
              <p className="mt-1 text-gray-600">
                مدیریت تصاویر و فایل‌های محصولات، آپلود و سازماندهی رسانه‌ها
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaUpload className="h-4 w-4" />
                {uploading ? 'در حال آپلود...' : 'آپلود فایل‌ها'}
              </label>
              <a
                href="/admin/media"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <FaEye className="h-4 w-4" />
                مشاهده کامل
              </a>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaImages className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalFiles.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">کل فایل‌ها</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaFileImage className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.imageFiles.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">تصاویر</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaFolder className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(stats.totalSize)}
                </p>
                <p className="text-sm text-gray-600">حجم کل</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaEye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.usedFiles.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">در حال استفاده</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <FaTrash className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.unusedFiles.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">غیر استفاده</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-xl">
                <FaFolder className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.documentFiles.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">سایر فایل‌ها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در فایل‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">همه انواع</option>
              <option value="image">تصاویر</option>
              <option value="document">اسناد</option>
            </select>

            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">همه فایل‌ها</option>
              <option value="used">در حال استفاده</option>
              <option value="unused">بدون استفاده</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="uploadedAt">تاریخ آپلود</option>
              <option value="filename">نام فایل</option>
              <option value="size">حجم فایل</option>
              <option value="usageCount">تعداد استفاده</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="desc">جدیدترین</option>
              <option value="asc">قدیمی‌ترین</option>
            </select>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                کتابخانه رسانه ({stats.totalFiles.toLocaleString()})
              </h2>
            </div>
          </div>

          {files.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.mimetype);
                  return (
                    <div key={file.id} className="group relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-amber-300 transition-all">
                      <div className="aspect-square relative">
                        {file.mimetype.startsWith('image/') ? (
                          <Image
                            src={file.url}
                            alt={file.originalName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <FileIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <a
                              href={file.url}
                              target="_blank"
                              className="p-2 bg-white rounded-lg text-gray-700 hover:text-blue-600"
                              title="مشاهده"
                            >
                              <FaEye className="h-4 w-4" />
                            </a>
                            <a
                              href={file.url}
                              download={file.originalName}
                              className="p-2 bg-white rounded-lg text-gray-700 hover:text-green-600"
                              title="دانلود"
                            >
                              <FaDownload className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 bg-white rounded-lg text-gray-700 hover:text-red-600"
                              title="حذف"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Usage Badge */}
                        {file.isUsed && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            استفاده شده
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                          {file.originalName}
                        </h3>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.usageCount} استفاده</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {new Date(file.uploadedAt).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <FaImages className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>فایلی یافت نشد</p>
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FaUpload className="h-4 w-4" />
                آپلود اولین فایل
              </label>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  صفحه {currentPage} از {totalPages} ({stats.totalFiles.toLocaleString()} فایل)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">راهنما:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• فایل‌های تصویری را برای محصولات آپلود کنید</li>
            <li>• فایل‌های غیر استفاده شده را حذف کنید تا فضا آزاد شود</li>
            <li>• از فیلترها برای یافتن سریع فایل‌ها استفاده کنید</li>
            <li>• برای حذف ایمن، ابتدا اطمینان حاصل کنید که فایل در جای دیگری استفاده نشده</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 