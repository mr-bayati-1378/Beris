import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Helper function to generate realistic prices for medical supplies
function generatePrice(productName: string): number {
  const name = productName.toLowerCase();
  
  // High-value items
  if (name.includes('بوتاکس') || name.includes('botulism') || name.includes('masport')) {
    return Math.floor(Math.random() * (8000000 - 5000000) + 5000000); // 5-8 million
  }
  
  if (name.includes('هیرفیلر') || name.includes('کوکتل مزوتراپی')) {
    return Math.floor(Math.random() * (3000000 - 1000000) + 1000000); // 1-3 million
  }
  
  // Injectable medications
  if (name.includes('لیدوکائین') || name.includes('اپی نفرین') || name.includes('کارپول')) {
    return Math.floor(Math.random() * (500000 - 200000) + 200000); // 200-500k
  }
  
  // Syringes and needles
  if (name.includes('سرنگ') || name.includes('نیدل') || name.includes('سرسوزن')) {
    if (name.includes('انسولین')) {
      return Math.floor(Math.random() * (50000 - 25000) + 25000); // 25-50k
    }
    return Math.floor(Math.random() * (80000 - 30000) + 30000); // 30-80k
  }
  
  // Surgical items
  if (name.includes('نخ') || name.includes('تیغ')) {
    return Math.floor(Math.random() * (300000 - 100000) + 100000); // 100-300k
  }
  
  // Gloves
  if (name.includes('دستکش')) {
    if (name.includes('جراحی')) {
      return Math.floor(Math.random() * (400000 - 200000) + 200000); // 200-400k
    }
    return Math.floor(Math.random() * (150000 - 80000) + 80000); // 80-150k
  }
  
  // Gauze and textiles
  if (name.includes('گاز') || name.includes('شان') || name.includes('روتختی')) {
    return Math.floor(Math.random() * (200000 - 50000) + 50000); // 50-200k
  }
  
  // Disinfectants and solutions
  if (name.includes('بتادین') || name.includes('الکل') || name.includes('آب مقطر') || name.includes('septocidine')) {
    return Math.floor(Math.random() * (300000 - 100000) + 100000); // 100-300k
  }
  
  // Surgical gowns and clothing
  if (name.includes('گان') || name.includes('لباس') || name.includes('پوشک')) {
    return Math.floor(Math.random() * (250000 - 100000) + 100000); // 100-250k
  }
  
  // Laboratory equipment
  if (name.includes('سیفتی باکس') || name.includes('کاغذ صافی')) {
    return Math.floor(Math.random() * (180000 - 60000) + 60000); // 60-180k
  }
  
  // Tapes and bandages
  if (name.includes('چسب') || name.includes('سرجی فیکس')) {
    return Math.floor(Math.random() * (120000 - 40000) + 40000); // 40-120k
  }
  
  // Default for other items
  return Math.floor(Math.random() * (200000 - 50000) + 50000); // 50-200k
}

// Helper function to generate realistic stock
function generateStock(productName: string): number {
  const name = productName.toLowerCase();
  
  // High-value items - lower stock
  if (name.includes('بوتاکس') || name.includes('botulism') || name.includes('هیرفیلر') || name.includes('کوکتل مزوتراپی')) {
    return Math.floor(Math.random() * 20) + 5; // 5-25 units
  }
  
  // Injectable medications - medium stock
  if (name.includes('لیدوکائین') || name.includes('اپی نفرین') || name.includes('کارپول')) {
    return Math.floor(Math.random() * 50) + 10; // 10-60 units
  }
  
  // Disposable items - higher stock
  if (name.includes('سرنگ') || name.includes('نیدل') || name.includes('دستکش') || name.includes('گاز') || name.includes('شان')) {
    return Math.floor(Math.random() * 200) + 50; // 50-250 units
  }
  
  // Surgical items - medium stock
  if (name.includes('نخ') || name.includes('تیغ')) {
    return Math.floor(Math.random() * 100) + 25; // 25-125 units
  }
  
  // Solutions and liquids - medium stock
  if (name.includes('بتادین') || name.includes('الکل') || name.includes('آب مقطر')) {
    return Math.floor(Math.random() * 80) + 20; // 20-100 units
  }
  
  // Default stock
  return Math.floor(Math.random() * 100) + 30; // 30-130 units
}

async function updateProductsPricing() {
  console.log('🏥 Updating medical products pricing and inventory...\n');

  try {
    // Get all products
    const products = await prisma.product.findMany({
      where: {
        price: 0 // Only update products with zero price
      }
    });

    console.log(`Found ${products.length} products with zero pricing to update.\n`);

    let updatedCount = 0;
    
    for (const product of products) {
      const newPrice = generatePrice(product.name);
      const newStock = generateStock(product.name);
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: newPrice,
          stock: newStock,
          isActive: true, // Make sure products are active
        }
      });
      
      updatedCount++;
      console.log(`✓ Updated: ${product.name}`);
      console.log(`  Price: ${newPrice.toLocaleString()} ریال, Stock: ${newStock} واحد\n`);
    }

    console.log(`✅ Successfully updated pricing for ${updatedCount} products!`);
    
    // Show summary statistics
    const updatedProducts = await prisma.product.findMany({
      where: { price: { gt: 0 } }
    });
    
    const totalValue = updatedProducts.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);
    const avgPrice = updatedProducts.reduce((sum, p) => sum + Number(p.price), 0) / updatedProducts.length;
    const totalStock = updatedProducts.reduce((sum, p) => sum + p.stock, 0);
    
    console.log('\n📊 Inventory Summary:');
    console.log(`• Total Products: ${updatedProducts.length}`);
    console.log(`• Average Price: ${avgPrice.toLocaleString()} ریال`);
    console.log(`• Total Stock Units: ${totalStock.toLocaleString()}`);
    console.log(`• Total Inventory Value: ${totalValue.toLocaleString()} ریال`);

  } catch (error) {
    console.error('❌ Error updating products pricing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function if this file is executed directly
if (require.main === module) {
  updateProductsPricing()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default updateProductsPricing; 