import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: 'xyz123',
  connectionTimeoutSeconds: 10,
});

// Schema برای محصولات
export const productSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'name', type: 'string' as const },
    { name: 'description', type: 'string' as const },
    { name: 'brand', type: 'string' as const },
    { name: 'price', type: 'float' as const },
    { name: 'stock', type: 'int32' as const },
    { name: 'slug', type: 'string' as const },
    { name: 'image', type: 'string' as const },
    { name: 'categoryName', type: 'string' as const },
    { name: 'categorySlug', type: 'string' as const },
    { name: 'tags', type: 'string[]' as const, optional: true },
    { name: 'searchKeywords', type: 'string' as const, optional: true },
    { name: 'rating', type: 'float' as const },
    { name: 'isActive', type: 'bool' as const },
    { name: 'isVipOnly', type: 'bool' as const },
  ],
  default_sorting_field: 'rating',
};

export default client; 