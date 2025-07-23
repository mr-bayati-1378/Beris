const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function clearAllData() {
  console.log('🗑️ Clearing all products and categories...');

  try {
    // Delete all related tables first (due to foreign key constraints)
    await prisma.productImage.deleteMany({});
    console.log('✓ All product images deleted');

    await prisma.productTag.deleteMany({});
    console.log('✓ All product tags deleted');

    await prisma.productRating.deleteMany({});
    console.log('✓ All product ratings deleted');

    await prisma.productReview.deleteMany({});
    console.log('✓ All product reviews deleted');

    await prisma.cartItem.deleteMany({});
    console.log('✓ All cart items deleted');

    await prisma.wishlistItem.deleteMany({});
    console.log('✓ All wishlist items deleted');

    await prisma.orderItem.deleteMany({});
    console.log('✓ All order items deleted');

    await prisma.stockAlert.deleteMany({});
    console.log('✓ All stock alerts deleted');

    await prisma.favorite.deleteMany({});
    console.log('✓ All favorites deleted');

    await prisma.invoiceItem.deleteMany({});
    console.log('✓ All invoice items deleted');

    await prisma.productPackItem.deleteMany({});
    console.log('✓ All product pack items deleted');

    await prisma.purchaseOrderItem.deleteMany({});
    console.log('✓ All purchase order items deleted');

    await prisma.purchaseInvoiceItem.deleteMany({});
    console.log('✓ All purchase invoice items deleted');

    await prisma.outboundItem.deleteMany({});
    console.log('✓ All outbound items deleted');

    await prisma.reviewVote.deleteMany({});
    console.log('✓ All review votes deleted');

    await prisma.reviewReply.deleteMany({});
    console.log('✓ All review replies deleted');

    // Now delete products
    await prisma.product.deleteMany({});
    console.log('✓ All products deleted');

    // Delete all category levels
    await prisma.categoryL3.deleteMany({});
    console.log('✓ All L3 categories deleted');

    await prisma.categoryL2.deleteMany({});
    console.log('✓ All L2 categories deleted');

    await prisma.categoryL1.deleteMany({});
    console.log('✓ All L1 categories deleted');

    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 