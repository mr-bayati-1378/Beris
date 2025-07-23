import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/typesense';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required',
        products: [],
      });
    }

    // بررسی وضعیت VIP کاربر
    let isUserVip = false;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { isVip: true }
        });
        isUserVip = user?.isVip || false;
      }
    } catch (sessionError) {
      console.log('Session error:', sessionError);
    }

    // سرچ مستقیم در Typesense بدون وابستگی به collection
    try {
      const searchParameters = {
        q: query,
        query_by: 'name,description,brand',
        filter_by: isUserVip ? 'isActive:true' : 'isActive:true && isVipOnly:false',
        per_page: 12,
      };

      const results = await client.collections('products').documents().search(searchParameters);
      
      return NextResponse.json({
        success: true,
        products: results.hits?.map(hit => hit.document) || [],
        count: results.found || 0,
      });

    } catch (searchError: any) {
      console.log('Typesense search error:', searchError.message);
      
      // اگر collection وجود نداره، پیغام مناسب بده
      if (searchError.message.includes('Not found')) {
        return NextResponse.json({
          success: false,
          error: 'Search index not initialized. Please run initialization first.',
          products: [],
        });
      }

      throw searchError;
    }

  } catch (error: any) {
    console.error('Direct search error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Search error',
      products: [],
    });
  }
} 