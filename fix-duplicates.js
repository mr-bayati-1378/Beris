const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuplicateProducts() {
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
    
    let totalFixed = 0;
    
    for (const duplicate of duplicates) {
      const ids = duplicate.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = ids[0]; // Keep the highest ID (newest)
      const removeIds = ids.slice(1); // Remove the rest
      
      console.log(`🔧 Fixing duplicates for "${duplicate.name}":`);
      console.log(`   Keeping ID: ${keepId}`);
      console.log(`   Removing IDs: ${removeIds.join(', ')}`);
      
      // Update related records to point to the kept product
      for (const removeId of removeIds) {
        try {
          // Update CartItem
          const cartItemsUpdated = await prisma.cartItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (cartItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${cartItemsUpdated.count} CartItem records`);
          }
          
          // Update WishlistItem
          const wishlistItemsUpdated = await prisma.wishlistItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (wishlistItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${wishlistItemsUpdated.count} WishlistItem records`);
          }
          
          // Update CustomPackItem
          const packItemsUpdated = await prisma.customPackItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (packItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${packItemsUpdated.count} CustomPackItem records`);
          }
          
          // Update ProductPackItem
          const productPackItemsUpdated = await prisma.productPackItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (productPackItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${productPackItemsUpdated.count} ProductPackItem records`);
          }
          
          // Update ProductRating
          const ratingsUpdated = await prisma.productRating.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (ratingsUpdated.count > 0) {
            console.log(`   ✅ Updated ${ratingsUpdated.count} ProductRating records`);
          }
          
          // Update ProductReview
          const reviewsUpdated = await prisma.productReview.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (reviewsUpdated.count > 0) {
            console.log(`   ✅ Updated ${reviewsUpdated.count} ProductReview records`);
          }
          
          // Update ProductImage
          const imagesUpdated = await prisma.productImage.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (imagesUpdated.count > 0) {
            console.log(`   ✅ Updated ${imagesUpdated.count} ProductImage records`);
          }
          
          // Update ProductTag
          const tagsUpdated = await prisma.productTag.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (tagsUpdated.count > 0) {
            console.log(`   ✅ Updated ${tagsUpdated.count} ProductTag records`);
          }
          
          // Update OrderItem
          const orderItemsUpdated = await prisma.orderItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (orderItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${orderItemsUpdated.count} OrderItem records`);
          }
          
          // Update InvoiceItem
          const invoiceItemsUpdated = await prisma.invoiceItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (invoiceItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${invoiceItemsUpdated.count} InvoiceItem records`);
          }
          
          // Update ClinicOrderItem
          const clinicOrderItemsUpdated = await prisma.clinicOrderItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (clinicOrderItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${clinicOrderItemsUpdated.count} ClinicOrderItem records`);
          }
          
          // Update PurchaseOrderItem
          const purchaseOrderItemsUpdated = await prisma.purchaseOrderItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (purchaseOrderItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${purchaseOrderItemsUpdated.count} PurchaseOrderItem records`);
          }
          
          // Update PurchaseInvoiceItem
          const purchaseInvoiceItemsUpdated = await prisma.purchaseInvoiceItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (purchaseInvoiceItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${purchaseInvoiceItemsUpdated.count} PurchaseInvoiceItem records`);
          }
          
          // Update OutboundItem
          const outboundItemsUpdated = await prisma.outboundItem.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (outboundItemsUpdated.count > 0) {
            console.log(`   ✅ Updated ${outboundItemsUpdated.count} OutboundItem records`);
          }
          
          // Update StockAlert
          const stockAlertsUpdated = await prisma.stockAlert.updateMany({
            where: { productId: removeId },
            data: { productId: keepId }
          });
          if (stockAlertsUpdated.count > 0) {
            console.log(`   ✅ Updated ${stockAlertsUpdated.count} StockAlert records`);
          }
          
          // Now delete the duplicate product
          const deleteResult = await prisma.product.delete({
            where: { id: removeId }
          });
          
          console.log(`   ✅ Deleted duplicate product ID: ${removeId}`);
          totalFixed++;
          
        } catch (error) {
          console.log(`   ❌ Error processing product ID ${removeId}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Successfully fixed ${totalFixed} duplicate products`);
    
    // Get final count
    const finalCount = await prisma.product.count();
    console.log(`📦 Final product count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateProducts(); 