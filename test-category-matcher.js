// Test script for category matching logic
const { findCategoryForProduct, getCategoryInfo } = require('./src/lib/category-matcher');

async function testCategoryMatcher() {
  console.log('🧪 Testing Category Matching Logic...\n');
  
  const testProducts = [
    'هیرفیلر مزوتراپی',
    'بوتاکس 100 واحد',
    'نخ ویکریل 5.0',
    'نخ نایلون 3.0 SUTURES',
    'مارکر جراحی خط کش دار',
    'لیدوکائین شیشه ای',
    'گان جراح',
    'گاز طبی 400 گرمی 8 لایه',
    'کارپول بسته 50 عددی',
    'سرنگ انسولین حلما',
    'سرسوزن مزوتراپی آوا 30 4',
    'دستکش جراحی آنتی باکتریال سایز 8',
    'دستکش لاتکس بدون پودر',
    'سرجی فیکس سر CITO',
    'ست سرم HD',
    'شان استریل 1*1',
    'بتادین 10%',
    'الکل طبی',
    'کاغذ صافی ورقه ای',
    'سیفتی باکس 3 لیتری',
    'محصول نامشخص جدید'
  ];
  
  for (const productName of testProducts) {
    try {
      console.log(`\n🔍 Testing: "${productName}"`);
      
      const categoryMatch = await findCategoryForProduct(productName);
      
      if (categoryMatch) {
        const categoryInfo = await getCategoryInfo(categoryMatch.categoryL3Id);
        
        console.log(`   ✅ Category Found:`);
        console.log(`      L1: ${categoryInfo?.l1 || 'نامعلوم'}`);
        console.log(`      L2: ${categoryInfo?.l2 || 'نامعلوم'}`);
        console.log(`      L3: ${categoryInfo?.l3 || 'نامعلوم'}`);
        console.log(`      Confidence: ${(categoryMatch.confidence * 100).toFixed(1)}%`);
        console.log(`      Matched Category: ${categoryMatch.matchedCategory}`);
      } else {
        console.log(`   ❌ No category found`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Category matching test completed!');
}

// Run the test
testCategoryMatcher().catch(console.error); 