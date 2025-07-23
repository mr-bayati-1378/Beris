const { PrismaClient } = require('./src/generated/prisma');
const axios = require('axios');

const prisma = new PrismaClient();

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyBb1PrVsKj61cPcb9IFeudbh3bplZJifNI';
const SPREADSHEET_ID = '1jlHNQuK4LYynNh3TfT8EsOuTXuItMP0qacdQQPRiRtc';
const PRICING_SHEET_ID = '295744917'; // gid from URL

// Category mapping for better matching
const categoryMappings = {
  // زیبایی و تخصصی
  'مزوتراپی': ['مزوتراپی', 'هیرفیلر', 'کوکتل', 'جوانساز'],
  'بوتاکس و فیلر': ['بوتاکس', 'فیلر', 'رووفیل', 'نورافیل', 'نورامیس'],
  'آنزیم درمانی': ['آنزیم'],
  
  // دارویی و درمانی
  'داروهای تزریقی': ['آمپول', 'تریامسینولون', 'سفالازولین', 'کترولاک', 'دگزامتازون', 'دی‌کلوفناک', 'پيروکسیکام', 'نیتروگلیسیرین', 'متوکل‌پرامید', 'ترانکزامیک اسید', 'فوروزماید', 'ویتامین'],
  'داروهای خوراکی': ['استامینوفن', 'سیتریزین', 'سفیکسیم', 'آلپرازولام', 'کاپتوپریل', 'کلونازپام', 'پروپرانولول'],
  
  // مواد مصرفی و پانسمان
  'پانسمان و گاز': ['گاز', 'پانسمان', 'سرجی فیکس'],
  'چسب‌ها': ['چسب'],
  'رول پک و استریل': ['رول پک', 'اتوکلاو'],
  
  // تزریق و سرسوزن
  'سرنگ و تجهیزات تزریق': ['سرنگ', 'ست سرم', 'ست تزریق'],
  'سرسوزن و نیدل': ['سرسوزن', 'سوزن', 'نیدل'],
  
  // ملزومات پزشکی و جراحی
  'دستکش': ['دستکش'],
  'شان و ملحفه': ['شان', 'روتختی', 'زیرانداز'],
  'ابزار جراحی': ['تیغ', 'ژیلت', 'کانکتور'],
  'مواد ضدعفونی': ['الکل', 'ضدعفونی', 'پد الکلی', 'سوآپ', 'آب مقطر'],
  'ماسک و محافظ': ['ماسک', 'پیش‌بند'],
  
  // لوازم مصرفی عمومی
  'پوشش‌ها و حوله': ['حوله', 'پوشک'],
  'بسته‌بندی و حمل': ['ساک'],
  'سردکننده‌ها': ['آیس پک'],
  'آرایشی/بهداشتی': ['رنگ مو'],
  
  // مکمل و تغذیه
  'مکمل‌های ویتامینی': ['HAIR-VIT', 'DAANA ZINC', 'BIOTINIX', 'BEPANOX'],
  'محصولات مراقبت شخصی': ['ALMOND OIL', 'FIROZ']
};

// Helper function to find best category match
function findBestCategoryMatch(productName) {
  const normalizedName = productName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMappings)) {
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return null;
}

// Helper function to parse price
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  // Remove non-numeric characters except decimal point
  const cleanPrice = priceStr.toString().replace(/[^\d.]/g, '');
  const price = parseFloat(cleanPrice);
  
  return isNaN(price) ? null : price;
}

// Helper function to parse date
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try different date formats
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Helper function to create slug from Persian text
function createSlug(text) {
  if (!text) return '';
  return text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
}

async function fetchPricingData() {
  try {
    console.log('📊 Fetching pricing data from Google Sheets...');
    
    // First, get the sheet metadata to find the correct sheet name
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${GOOGLE_SHEETS_API_KEY}`;
    const metadataResponse = await axios.get(metadataUrl);
    
    console.log('📋 Available sheets:');
    metadataResponse.data.sheets.forEach(sheet => {
      console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
    });
    
    // Find the pricing sheet by ID
    const pricingSheet = metadataResponse.data.sheets.find(sheet => 
      sheet.properties.sheetId.toString() === PRICING_SHEET_ID
    );
    
    if (!pricingSheet) {
      throw new Error(`Sheet with ID ${PRICING_SHEET_ID} not found`);
    }
    
    const sheetName = pricingSheet.properties.title;
    console.log(`📊 Using sheet: ${sheetName}`);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A:Z?key=${GOOGLE_SHEETS_API_KEY}`;
    const response = await axios.get(url);
    
    if (!response.data.values) {
      throw new Error('No data found in spreadsheet');
    }
    
    const rows = response.data.values;
    const headers = rows[0];
    
    console.log(`✅ Found ${rows.length - 1} rows of pricing data`);
    
    // Find column indices
    const productNameIndex = headers.findIndex(h => h.includes('نام') || h.includes('محصول') || h.includes('کالا'));
    const priceIndex = headers.findIndex(h => h.includes('قیمت') || h.includes('price'));
    const dateIndex = headers.findIndex(h => h.includes('تاریخ') || h.includes('date'));
    const categoryIndex = headers.findIndex(h => h.includes('دسته') || h.includes('category') || h.includes('گروه'));
    
    // If product name not found, try to find it in other columns
    let actualProductNameIndex = productNameIndex;
    if (productNameIndex === -1) {
      // Try to find a column that might contain product names
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header && !header.includes('قیمت') && !header.includes('تاریخ') && !header.includes('گروه') && 
            !header.includes('کد') && !header.includes('موجودی') && !header.includes('واحد')) {
          actualProductNameIndex = i;
          break;
        }
      }
    }
    
    console.log('📋 Column mapping:');
    console.log(`- Product Name: ${actualProductNameIndex} (${headers[actualProductNameIndex]})`);
    console.log(`- Price: ${priceIndex} (${headers[priceIndex]})`);
    console.log(`- Date: ${dateIndex} (${headers[dateIndex]})`);
    console.log(`- Category: ${categoryIndex} (${headers[categoryIndex]})`);
    
    // Show first few rows for debugging
    console.log('\n📄 First 3 rows of data:');
    rows.slice(1, 4).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row.slice(0, 5).map(cell => cell || '').join(' | '));
    });
    
    return rows.slice(1).map(row => ({
      productName: row[actualProductNameIndex] || '',
      price: row[priceIndex] || '',
      date: row[dateIndex] || '',
      category: row[categoryIndex] || ''
    }));
    
  } catch (error) {
    console.error('❌ Error fetching pricing data:', error.message);
    throw error;
  }
}

async function updateProductPricing(pricingData) {
  console.log('🔄 Updating and creating product pricing...');
  
  let updatedCount = 0;
  let createdCount = 0;
  let errorCount = 0;
  
  // Group by product name and keep the latest price
  const latestPrices = new Map();
  
  for (const row of pricingData) {
    if (!row.productName || !row.price) continue;
    
    const price = parsePrice(row.price);
    if (!price) continue;
    
    const date = parseDate(row.date);
    const productName = row.productName.trim();
    
    if (!latestPrices.has(productName) || 
        (date && latestPrices.get(productName).date && date > latestPrices.get(productName).date)) {
      latestPrices.set(productName, { price, date, category: row.category });
    }
  }
  
  console.log(`📦 Found ${latestPrices.size} unique products with pricing`);
  
  for (const [productName, data] of latestPrices) {
    try {
      // Try to find exact match first
      let product = await prisma.product.findFirst({
        where: {
          name: {
            equals: productName
          }
        },
        include: {
          categoryL3: {
            include: {
              categoryL2: {
                include: {
                  categoryL1: true
                }
              }
            }
          }
        }
      });
      
      // If not found, try partial match
      if (!product) {
        product = await prisma.product.findFirst({
          where: {
            name: {
              contains: productName
            }
          },
          include: {
            categoryL3: {
              include: {
                categoryL2: {
                  include: {
                    categoryL1: true
                  }
                }
              }
            }
          }
        });
      }
      
      if (product) {
        // Update existing product price
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: data.price,
            comparePrice: data.price * 1.2 // 20% markup for compare price
          }
        });
        
        console.log(`✅ Updated: ${product.name} - ${data.price} تومان`);
        updatedCount++;
        
        // If category is provided and different from current, try to update
        if (data.category && product.categoryL3.categoryL2.categoryL1.name !== data.category) {
          const suggestedCategory = findBestCategoryMatch(product.name);
          if (suggestedCategory) {
            console.log(`  💡 Suggested category: ${suggestedCategory} (current: ${product.categoryL3.categoryL2.categoryL1.name})`);
          }
        }
      } else {
        // Create new product
        const suggestedCategory = findBestCategoryMatch(productName);
        let categoryL3Id = null;
        
        if (suggestedCategory) {
          // Find the appropriate category
          const categoryL1 = await prisma.categoryL1.findFirst({
            where: { name: suggestedCategory }
          });
          
          if (categoryL1) {
            // Use the first L2 category as default
            const categoryL2 = await prisma.categoryL2.findFirst({
              where: { categoryL1Id: categoryL1.id }
            });
            
            if (categoryL2) {
              // Create a new L3 category for this product
              const categoryL3 = await prisma.categoryL3.create({
                data: {
                  name: productName,
                  slug: createSlug(productName),
                  categoryL2Id: categoryL2.id
                }
              });
              categoryL3Id = categoryL3.id;
            }
          }
        }
        
        // If no category found, use a default category
        if (!categoryL3Id) {
          const defaultCategoryL3 = await prisma.categoryL3.findFirst({
            where: {
              categoryL2: {
                categoryL1: {
                  name: "لوازم مصرفی عمومی"
                }
              }
            }
          });
          categoryL3Id = defaultCategoryL3?.id;
        }
        
        if (categoryL3Id) {
          const newProduct = await prisma.product.create({
            data: {
              name: productName,
              slug: createSlug(productName),
              description: `محصول ${productName} - کیفیت بالا و قابل اعتماد`,
              price: data.price,
              comparePrice: data.price * 1.2,
              stock: Math.floor(Math.random() * 50) + 10, // 10 to 60
              isActive: true,
              isVipOnly: false,
              hasDiscount: Math.random() > 0.8, // 20% chance of having discount
              discountPercent: Math.floor(Math.random() * 20) + 10, // 10% to 30%
              discountEndDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
              categoryL3Id: categoryL3Id,
              brand: "برند معتبر"
            }
          });
          
          console.log(`🆕 Created: ${productName} - ${data.price} تومان (Category: ${suggestedCategory || 'عمومی'})`);
          createdCount++;
        } else {
          console.log(`❌ Could not create: ${productName} - No category found`);
          errorCount++;
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${productName}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Update Summary:');
  console.log(`- Updated: ${updatedCount} products`);
  console.log(`- Created: ${createdCount} products`);
  console.log(`- Errors: ${errorCount} products`);
  
  return { updatedCount, createdCount, errorCount };
}

async function main() {
  try {
    console.log('🚀 Starting pricing update from Google Sheets...');
    
    // Fetch pricing data
    const pricingData = await fetchPricingData();
    
    // Update product pricing
    const results = await updateProductPricing(pricingData);
    
    console.log('\n🎉 Pricing update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 