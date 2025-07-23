import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function clearAllData() {
  console.log('🗑️ Clearing all products and categories...');

  try {
    // Delete all products first (due to foreign key constraints)
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

if (require.main === module) {
  clearAllData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default clearAllData; 