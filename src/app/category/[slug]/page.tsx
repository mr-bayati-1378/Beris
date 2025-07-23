import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import CategoryPageClient from './CategoryPageClient';

async function getCategory(slug: string) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/category/${slug}`, {
      cache: 'no-store',
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Category API Response for slug "${slug}":`, res.status);
    
    if (!res.ok) {
      console.error(`Category API Error for slug "${slug}":`, res.status, res.statusText);
      if (res.status === 404) {
        notFound();
      }
      throw new Error(`خطا در دریافت دسته‌بندی: ${res.status}`);
    }
    
    const data = await res.json();
    console.log(`Category data for slug "${slug}":`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    notFound();
  }
}

export default async function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: { slug: string };
  searchParams?: { [key: string]: string | undefined };
}) {
  const data = await getCategory(params.slug);
  
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <CategoryPageClient 
        initialData={data} 
        slug={params.slug} 
        searchParams={searchParams}
      />
    </Suspense>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/category/${params.slug}`, {
      cache: 'no-store',
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      return {
        title: 'دسته‌بندی یافت نشد | فروشگاه بریس',
      };
    }
    
    const data = await res.json();
    return {
      title: `${data.category.name} | فروشگاه بریس`,
      description: `خرید انواع ${data.category.name} با بهترین قیمت و کیفیت از فروشگاه بریس`,
    };
  } catch {
    return {
      title: 'دسته‌بندی یافت نشد | فروشگاه بریس',
    };
  }
}
