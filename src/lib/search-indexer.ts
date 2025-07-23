import client, { productSchema } from './typesense';
import prisma from './prisma';

export async function initializeSearchIndex() {
  try {
    console.log('🔍 Checking if products collection exists...');
    
    // بررسی وجود collection
    try {
      const collection = await client.collections('products').retrieve();
      console.log('✅ Products collection already exists:', collection.name);
      return true;
    } catch (error: any) {
      console.log('❌ Collection does not exist, creating new one...');
      console.log('Collection error:', error.message);
      
      // اگر collection وجود نداره، ایجادش کن
      try {
        const result = await client.collections().create(productSchema);
        console.log('✅ Products collection created successfully:', result.name);
        return true;
      } catch (createError: any) {
        console.error('❌ Failed to create collection:', createError.message);
        throw createError;
      }
    }

  } catch (error: any) {
    console.error('❌ Error initializing search index:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

export async function indexAllProducts() {
  try {
    console.log('Starting to index products...');
    
    // دریافت تمام محصولات فعال از دیتابیس (فقط محصولات عمومی)
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isVipOnly: false // فقط محصولات عمومی در index قرار می‌گیرند
      },
      include: {
        categoryL3: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: { url: true },
          take: 1,
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    console.log(`Found ${products.length} products to index`);

    // تبدیل محصولات به فرمت Typesense
    const documents = products.map(product => {
      const avgRating = product.ratings.length > 0 
        ? product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        price: product.price,
        stock: product.stock,
        slug: product.slug,
        image: product.image || (product.images[0]?.url || ''),
        categoryName: product.categoryL3?.name || '',
        categorySlug: product.categoryL3?.slug || '',
        tags: (product as any).tags || [],
        searchKeywords: (product as any).searchKeywords || '',
        rating: avgRating,
        isActive: product.isActive,
        isVipOnly: product.isVipOnly,
      };
    });

    // بچ import به Typesense
    if (documents.length > 0) {
      const result = await client.collections('products').documents().import(documents);
      console.log(`Indexed ${documents.length} products`, result);
    }

    return { success: true, count: documents.length };
  } catch (error) {
    console.error('Error indexing products:', error);
    return { success: false, error };
  }
}

export async function indexSingleProduct(productId: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categoryL3: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: { url: true },
          take: 1,
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const avgRating = product.ratings.length > 0 
      ? product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length 
      : 0;

    const document = {
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      price: product.price,
      stock: product.stock,
      slug: product.slug,
      image: product.image || (product.images[0]?.url || ''),
      categoryName: product.categoryL3?.name || '',
      categorySlug: product.categoryL3?.slug || '',
      tags: (product as any).tags || [],
      searchKeywords: (product as any).searchKeywords || '',
      rating: avgRating,
      isActive: product.isActive,
      isVipOnly: product.isVipOnly,
    };

    if (product.isActive && !product.isVipOnly) {
      // اگر محصول فعاله و VIP نیست، اضافه یا بروزرسانی کن
      await client.collections('products').documents().upsert(document);
    } else {
      // اگر غیرفعاله یا VIP است، حذفش کن
      try {
        await client.collections('products').documents(productId.toString()).delete();
      } catch (error) {
        // اگر قبلاً وجود نداشت، مشکلی نیست
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error indexing single product:', error);
    return { success: false, error };
  }
}

export async function deleteFromIndex(productId: number) {
  try {
    await client.collections('products').documents(productId.toString()).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting from index:', error);
    return { success: false, error };
  }
}

export async function searchProducts(query: string, options: {
  page?: number;
  limit?: number;
  filters?: string;
  sortBy?: string;
} = {}) {
  try {
    const { page = 1, limit = 12, filters = '', sortBy = 'rating:desc' } = options;
    
    const searchParameters = {
      q: query || '*',
      query_by: 'name,description,brand,categoryName,searchKeywords',
      filter_by: `isActive:true${filters ? ` && ${filters}` : ''}`,
      sort_by: sortBy,
      page: page,
      per_page: limit,
      highlight_full_fields: 'name,description',
      highlight_affix_num_tokens: 4,
    };

    const results = await client.collections('products').documents().search(searchParameters);
    
    return {
      success: true,
      products: results.hits?.map(hit => hit.document) || [],
      totalCount: results.found || 0,
      totalPages: Math.ceil((results.found || 0) / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error,
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getSearchSuggestions(query: string, limit: number = 5) {
  try {
    const searchParameters = {
      q: query,
      query_by: 'name,brand',
      filter_by: 'isActive:true',
      per_page: limit,
      sort_by: 'rating:desc',
    };

    const results = await client.collections('products').documents().search(searchParameters);
    
    return {
      success: true,
      suggestions: results.hits?.map(hit => ({
        id: (hit.document as any).id,
        name: (hit.document as any).name,
        brand: (hit.document as any).brand,
        slug: (hit.document as any).slug,
        image: (hit.document as any).image,
      })) || [],
    };
  } catch (error) {
    console.error('Suggestions error:', error);
    return {
      success: false,
      suggestions: [],
    };
  }
} 