import { NextRequest, NextResponse } from 'next/server';
import { initializeSearchIndex, indexAllProducts } from '@/lib/search-indexer';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing Typesense search...');
    
    // ابتدا collection رو initialize کن
    const initResult = await initializeSearchIndex();
    
    if (!initResult) {
      throw new Error('Failed to initialize search index');
    }
    console.log('✅ Search index initialized');

    // سپس تمام محصولات رو index کن
    const indexResult = await indexAllProducts();

    if (indexResult.success) {
      console.log(`✅ Successfully indexed ${indexResult.count} products`);
      return NextResponse.json({
        success: true,
        message: `Search index initialized successfully. Indexed ${indexResult.count} products.`,
        count: indexResult.count,
      });
    } else {
      throw new Error(indexResult.error?.toString() || 'Failed to index products');
    }

  } catch (error) {
    console.error('❌ Search init error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 