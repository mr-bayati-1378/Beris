const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function cleanDuplicateProducts() {
  try {
    console.log('🧹 Starting to clean duplicate products...');
    
    // Find all products grouped by slug
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    const slugGroups = {};
    const duplicates = [];
    
    // Group products by slug
    for (const product of products) {
      if (!slugGroups[product.slug]) {
        slugGroups[product.slug] = [];
      }
      slugGroups[product.slug].push(product);
    }
    
    // Find duplicates
    for (const [slug, productList] of Object.entries(slugGroups)) {
      if (productList.length > 1) {
        console.log(`📦 Found ${productList.length} products with slug: ${slug}`);
        duplicates.push({
          slug,
          products: productList
        });
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate products found!');
      return;
    }
    
    console.log(`\n🗑️ Found ${duplicates.length} duplicate slug groups`);
    
    let deletedCount = 0;
    
    // Delete duplicates, keeping the first one
    for (const duplicate of duplicates) {
      const [keepProduct, ...deleteProducts] = duplicate.products;
      
      console.log(`\n📦 Slug: ${duplicate.slug}`);
      console.log(`   ✅ Keeping: ${keepProduct.name} (ID: ${keepProduct.id})`);
      
      for (const deleteProduct of deleteProducts) {
        console.log(`   🗑️ Deleting: ${deleteProduct.name} (ID: ${deleteProduct.id})`);
        
        try {
          // Delete related records first
          await prisma.productImage.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.cartItem.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.wishlistItem.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.productRating.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.productReview.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.stockAlert.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.favorite.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          await prisma.productTag.deleteMany({
            where: { productId: deleteProduct.id }
          });
          
          // Delete the product
          await prisma.product.delete({
            where: { id: deleteProduct.id }
          });
          
          deletedCount++;
        } catch (error) {
          console.error(`   ❌ Error deleting product ${deleteProduct.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Cleanup completed!`);
    console.log(`   📊 Total duplicate groups: ${duplicates.length}`);
    console.log(`   🗑️ Total products deleted: ${deletedCount}`);
    
  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDuplicateProducts(); 