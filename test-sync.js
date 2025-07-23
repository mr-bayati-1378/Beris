// Test script for Google Sheets sync functionality
const fetch = require('node-fetch');

async function testSync() {
  console.log('🧪 Testing Google Sheets sync functionality...\n');
  
  try {
    // Test the cron sync endpoint
    const cronResponse = await fetch('http://localhost:3000/api/cron/inventory-sync?secret=test123');
    const cronData = await cronResponse.json();
    
    console.log('📊 Cron Sync Results:');
    console.log('Status:', cronResponse.status);
    console.log('Message:', cronData.message);
    console.log('Total Items:', cronData.totalItems);
    console.log('Successful Updates:', cronData.successfulUpdates);
    console.log('Failed Updates:', cronData.failedUpdates);
    console.log('Successful New Products:', cronData.successfulNewProducts);
    console.log('Failed New Products:', cronData.failedNewProducts);
    
    if (cronData.updates) {
      console.log('\n📝 Update Details:');
      cronData.updates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.productName} - ${update.action} - ${update.success ? '✅' : '❌'}`);
        if (!update.success) {
          console.log(`   Reason: ${update.reason}`);
        }
      });
    }
    
    if (cronData.newProducts) {
      console.log('\n🆕 New Products Created:');
      cronData.newProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.productName} - ${product.action} - ${product.success ? '✅' : '❌'}`);
        if (product.success) {
          console.log(`   Price: ${product.price} تومان, Stock: ${product.stock}`);
          console.log(`   Category: ${product.category || 'نامعلوم'}`);
          console.log(`   Confidence: ${(product.confidence * 100).toFixed(1)}%`);
          console.log(`   Matched Category: ${product.matchedCategory}`);
        } else {
          console.log(`   Reason: ${product.reason}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Test the manual sync endpoint
    const manualResponse = await fetch('http://localhost:3000/api/inventory/sync?force=true');
    const manualData = await manualResponse.json();
    
    console.log('📊 Manual Sync Results:');
    console.log('Status:', manualResponse.status);
    console.log('Message:', manualData.message);
    console.log('Total Products in Sheet:', manualData.totalProductsInSheet);
    console.log('Successful Updates:', manualData.successfulUpdates);
    console.log('Failed Updates:', manualData.failedUpdates);
    console.log('Successful Creations:', manualData.successfulCreations);
    console.log('Failed Creations:', manualData.failedCreations);
    
    if (manualData.updates) {
      console.log('\n📝 Update Details:');
      manualData.updates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.productName} - ${update.action} - ${update.success ? '✅' : '❌'}`);
        if (!update.success) {
          console.log(`   Reason: ${update.reason}`);
        }
      });
    }
    
    if (manualData.newProducts) {
      console.log('\n🆕 New Products Created:');
      manualData.newProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.productName} - ${product.action} - ${product.success ? '✅' : '❌'}`);
        if (product.success) {
          console.log(`   Price: ${product.price} تومان, Stock: ${product.stock}`);
          console.log(`   Category: ${product.category || 'نامعلوم'}`);
          console.log(`   Confidence: ${(product.confidence * 100).toFixed(1)}%`);
          console.log(`   Matched Category: ${product.matchedCategory}`);
        } else {
          console.log(`   Reason: ${product.reason}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing sync:', error);
  }
}

// Run the test
testSync(); 