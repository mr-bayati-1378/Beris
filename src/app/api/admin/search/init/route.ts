import { NextRequest, NextResponse } from 'next/server';
import { initializeSearchIndex, indexAllProducts } from '@/lib/search-indexer';

export async function POST(request: NextRequest) {
  // Admin authentication check
  const adminCookie = request.cookies.get('admin-session');
  if (!adminCookie || adminCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // ابتدا collection رو initialize کن
    console.log('Initializing search index...');
    const initResult = await initializeSearchIndex();
    
    if (!initResult) {
      throw new Error('Failed to initialize search index');
    }

    // سپس تمام محصولات رو index کن
    console.log('Indexing all products...');
    const indexResult = await indexAllProducts();

    if (indexResult.success) {
      return NextResponse.json({
        success: true,
        message: `Search index initialized successfully. Indexed ${indexResult.count} products.`,
        count: indexResult.count,
      });
    } else {
      throw new Error(indexResult.error?.toString() || 'Failed to index products');
    }

  } catch (error) {
    console.error('Search init error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 