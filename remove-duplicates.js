const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDuplicateProducts() {
  try {
    console.log('🔍 Finding duplicate products...');
    
    // Get all duplicate products
    const duplicates = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id DESC) as ids
      FROM Product 
      GROUP BY name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    
    console.log(`📊 Found ${duplicates.length} products with duplicates`);
    
    let totalRemoved = 0;
    
    for (const duplicate of duplicates) {
      const ids = duplicate.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = ids[0]; // Keep the highest ID (newest)
      const removeIds = ids.slice(1); // Remove the rest
      
      console.log(`🗑️  Removing duplicates for "${duplicate.name}":`);
      console.log(`   Keeping ID: ${keepId}`);
      console.log(`   Removing IDs: ${removeIds.join(', ')}`);
      
      // Delete duplicate products
      const deleteResult = await prisma.product.deleteMany({
        where: {
          id: {
            in: removeIds
          }
        }
      });
      
      totalRemoved += deleteResult.count;
      console.log(`   ✅ Removed ${deleteResult.count} duplicates`);
    }
    
    console.log(`\n🎉 Successfully removed ${totalRemoved} duplicate products`);
    
    // Get final count
    const finalCount = await prisma.product.count();
    console.log(`📦 Final product count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicateProducts(); 