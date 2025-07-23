const { initializeSearchIndex, indexAllProducts } = require('./src/lib/search-indexer.ts');

async function main() {
  try {
    console.log('🚀 Initializing Typesense search...');
    
    // Initialize collection
    const initResult = await initializeSearchIndex();
    if (!initResult) {
      throw new Error('Failed to initialize search index');
    }
    console.log('✅ Search index initialized');

    // Index all products
    const indexResult = await indexAllProducts();
    if (indexResult.success) {
      console.log(`✅ Successfully indexed ${indexResult.count} products`);
    } else {
      throw new Error('Failed to index products');
    }

    console.log('🎉 Search setup completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 