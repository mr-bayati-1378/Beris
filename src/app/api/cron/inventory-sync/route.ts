import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findCategoryForProduct, getCategoryInfo } from '@/lib/category-matcher';

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = '1jlHNQuK4LYynNh3TfT8EsOuTXuItMP0qacdQQPRiRtc';
const SHEET_NAME = 'Inventory Control';

interface InventoryItem {
  code: string;
  description: string;
  date: string;
  supplier: string;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
}

// Function to generate unique slug
async function generateUniqueSlug(productName: string): Promise<string> {
  // Convert Persian/Arabic numbers to English
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let baseSlug = productName;
  
  // Convert numbers
  for (let i = 0; i < 10; i++) {
    baseSlug = baseSlug.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i])
              .replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }
  
  // Convert Persian/Arabic characters to English equivalents
  const persianToEnglish: { [key: string]: string } = {
    'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j',
    'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
    'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y'
  };
  
  // Convert each character
  baseSlug = baseSlug.split('').map(char => persianToEnglish[char] || char).join('');
  
  // Convert to lowercase and replace non-alphanumeric characters with dash
  baseSlug = baseSlug.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  
  // If baseSlug is empty, use a fallback
  if (!baseSlug) {
    baseSlug = 'product';
  }
  
  // Check if slug exists and generate unique one
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existingProduct = await prisma.product.findFirst({
      where: { slug: slug }
    });
    
    if (!existingProduct) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}

async function fetchGoogleSheetsData() {
  try {
    if (!GOOGLE_SHEETS_API_KEY) {
      throw new Error('Google Sheets API key not configured');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheets data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

function parseInventoryData(rawData: any[][]): InventoryItem[] {
  const items: InventoryItem[] = [];
  
  // Skip header row and process data rows
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row.length >= 7) {
      try {
        const item: InventoryItem = {
          code: row[0] || '', // کد فاکتور
          description: row[1] || '', // شرح کالا
          date: row[2] || '', // تاریخ
          supplier: row[3] || '', // تامین کننده
          quantity: parseInt(row[4]) || 0, // خرید تعدادی
          totalPrice: parseInt(row[5].replace(/,/g, '')) || 0, // خرید به تومان
          unitPrice: parseInt(row[6].replace(/,/g, '')) || 0, // قیمت واحد
        };
        
        if (item.description && item.quantity > 0) {
          items.push(item);
        }
      } catch (error) {
        console.error('Error parsing row:', row, error);
      }
    }
  }
  
  return items;
}

async function updateProductInventory(items: InventoryItem[]) {
  const updates = [];
  const newProducts = [];
  
  for (const item of items) {
    try {
      // Find product by name (description) - more flexible matching
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            {
              name: {
                contains: item.description
              }
            },
            {
              name: {
                contains: item.description.split(' ')[0] // Match first word
              }
            },
            {
              name: {
                contains: item.description.split(' ').slice(0, 2).join(' ') // Match first two words
              }
            }
          ]
        }
      });

      if (product) {
        // Update existing product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: item.unitPrice,
            stock: item.quantity,
            updatedAt: new Date()
          }
        });
        
        updates.push({
          productId: product.id,
          productName: product.name,
          newPrice: item.unitPrice,
          newStock: item.quantity,
          success: true,
          action: 'updated'
        });
      } else {
        // Create new product if it doesn't exist
        try {
          // Generate slug from description
          const slug = await generateUniqueSlug(item.description);
          
          // Find intelligent category match
          const categoryMatch = await findCategoryForProduct(item.description);
          
          if (!categoryMatch) {
            throw new Error('No category found for product');
          }
          
          const newProduct = await prisma.product.create({
            data: {
              name: item.description,
              slug: slug,
              description: `محصول جدید از Google Sheets - ${item.supplier}`,
              price: item.unitPrice,
              stock: item.quantity,
              brand: item.supplier,
              categoryL3Id: categoryMatch.categoryL3Id,
              isActive: true
            }
          });
          
          // Get category info for logging
          const categoryInfo = await getCategoryInfo(categoryMatch.categoryL3Id);
          
          newProducts.push({
            productId: newProduct.id,
            productName: newProduct.name,
            price: item.unitPrice,
            stock: item.quantity,
            supplier: item.supplier,
            category: categoryInfo ? `${categoryInfo.l1} > ${categoryInfo.l2} > ${categoryInfo.l3}` : 'نامعلوم',
            confidence: categoryMatch.confidence,
            matchedCategory: categoryMatch.matchedCategory,
            success: true,
            action: 'created'
          });
          
          console.log(`✓ Created new product: ${item.description}`);
          
        } catch (createError) {
          console.error('Error creating new product:', item.description, createError);
          newProducts.push({
            productName: item.description,
            success: false,
            reason: createError instanceof Error ? createError.message : 'Unknown error',
            action: 'create_failed'
          });
        }
      }
    } catch (error) {
      console.error('Error processing item:', item.description, error);
      updates.push({
        productName: item.description,
        success: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        action: 'process_failed'
      });
    }
  }
  
  return { updates, newProducts };
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if we should sync (every 6 hours by default)
    const lastSync = await prisma.systemSetting.findUnique({
      where: { key: 'last_inventory_sync' }
    });
    
    const now = new Date();
    const lastSyncTime = lastSync ? new Date(lastSync.value) : new Date(0);
    const hoursSinceLastSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastSync < 6) {
      return NextResponse.json({
        message: 'Inventory sync skipped - last sync was less than 6 hours ago',
        lastSync: lastSyncTime,
        nextSync: new Date(lastSyncTime.getTime() + 6 * 60 * 60 * 1000)
      });
    }

    // Fetch data from Google Sheets
    const rawData = await fetchGoogleSheetsData();
    const inventoryItems = parseInventoryData(rawData);
    
    // Update product inventory in database
    const { updates, newProducts } = await updateProductInventory(inventoryItems);
    
    // Update last sync time
    await prisma.systemSetting.upsert({
      where: { key: 'last_inventory_sync' },
      update: { value: now.toISOString() },
      create: { key: 'last_inventory_sync', value: now.toISOString() }
    });
    
    const successfulUpdates = updates.filter(r => r.success).length;
    const failedUpdates = updates.filter(r => !r.success).length;
    const successfulNewProducts = newProducts.filter(r => r.success).length;
    const failedNewProducts = newProducts.filter(r => !r.success).length;
    
    console.log(`Cron job completed: ${successfulUpdates} products updated, ${successfulNewProducts} new products created, ${failedUpdates + failedNewProducts} failed`);
    
    return NextResponse.json({
      message: 'Cron job: Database inventory updated successfully',
      totalItems: inventoryItems.length,
      successfulUpdates,
      failedUpdates,
      successfulNewProducts,
      failedNewProducts,
      updates,
      newProducts,
      lastSync: now.toISOString()
    });
    
  } catch (error) {
    console.error('Error in cron inventory sync:', error);
    return NextResponse.json(
      { 
        error: 'خطا در به‌روزرسانی موجودی دیتابیس',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 