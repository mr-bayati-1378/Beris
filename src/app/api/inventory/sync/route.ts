import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findCategoryForProduct, getCategoryInfo } from '@/lib/category-matcher';

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyBb1PrVsKj61cPcb9IFeudbh3bplZJifNI';
const SPREADSHEET_ID = '1jlHNQuK4LYynNh3TfT8EsOuTXuItMP0qacdQQPRiRtc';
const SHEET_NAME = 'Stock Level'; // Using Stock Level sheet

interface InventoryItem {
  productName: string;
  physicalInventory: number;
  totalInventory: number;
  pricePerUnit: number;
  totalValue: number;
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
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${GOOGLE_SHEETS_API_KEY}`;
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
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row.length >= 9) {
      try {
        const productName = row[0] || '';
        const physicalInventory = parseFloat(row[5]?.toString().replace(/,/g, '')) || 0;
        const totalInventory = parseFloat(row[6]?.toString().replace(/,/g, '')) || 0;
        const totalValue = parseFloat(row[7]?.toString().replace(/,/g, '')) || 0;
        const unitPrice = parseFloat(row[8]?.toString().replace(/,/g, '')) || 0;
        if (productName && productName.trim() !== '') {
          items.push({
            productName: productName.trim(),
            physicalInventory,
            totalInventory,
            pricePerUnit: unitPrice,
            totalValue
          });
        }
      } catch (error) {
        console.error('Error parsing row:', row, error);
      }
    }
  }
  return items;
}

function findSheetMatch(productName: string, sheetItems: InventoryItem[]): InventoryItem | null {
  // Try full name, then first two words, then first word
  const name = productName.trim();
  const firstWord = name.split(' ')[0];
  const firstTwoWords = name.split(' ').slice(0, 2).join(' ');
  return (
    sheetItems.find(item => item.productName === name) ||
    sheetItems.find(item => item.productName === firstTwoWords) ||
    sheetItems.find(item => item.productName === firstWord) ||
    null
  );
}

async function syncProductInventory(sheetItems: InventoryItem[]) {
  const dbProducts = await prisma.product.findMany();
  const updates = [];
  const newProducts = [];
  
  // First, update existing products that match with sheet items
  for (const product of dbProducts) {
    const match = findSheetMatch(product.name, sheetItems);
    if (match) {
      try {
        const newPrice = match.pricePerUnit > 0 ? match.pricePerUnit : product.price;
        const newStock = match.physicalInventory > 0 ? match.physicalInventory : match.totalInventory;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: newPrice,
            stock: Math.max(0, newStock),
            updatedAt: new Date()
          }
        });
        updates.push({
          productId: product.id,
          productName: product.name,
          matchedWith: match.productName,
          newPrice,
          newStock: Math.max(0, newStock),
          success: true,
          action: 'updated'
        });
      } catch (error) {
        updates.push({
          productId: product.id,
          productName: product.name,
          matchedWith: match.productName,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
          action: 'update_failed'
        });
      }
    }
  }
  
  // Then, create new products for sheet items that don't exist in database
  for (const sheetItem of sheetItems) {
    const existingProduct = dbProducts.find(product => 
      findSheetMatch(product.name, [sheetItem]) !== null
    );
    
    if (!existingProduct) {
      try {
        // Generate slug from product name
        const slug = await generateUniqueSlug(sheetItem.productName);
        
        // Find intelligent category match
        const categoryMatch = await findCategoryForProduct(sheetItem.productName);
        
        if (!categoryMatch) {
          throw new Error('No category found for product');
        }
        
        const newProduct = await prisma.product.create({
          data: {
            name: sheetItem.productName,
            slug: slug,
            description: `محصول جدید از Google Sheets`,
            price: sheetItem.pricePerUnit,
            stock: Math.max(0, sheetItem.physicalInventory || sheetItem.totalInventory),
            brand: 'جدید',
            categoryL3Id: categoryMatch.categoryL3Id,
            isActive: true
          }
        });
        
        // Get category info for logging
        const categoryInfo = await getCategoryInfo(categoryMatch.categoryL3Id);
        
        newProducts.push({
          productId: newProduct.id,
          productName: newProduct.name,
          price: sheetItem.pricePerUnit,
          stock: Math.max(0, sheetItem.physicalInventory || sheetItem.totalInventory),
          category: categoryInfo ? `${categoryInfo.l1} > ${categoryInfo.l2} > ${categoryInfo.l3}` : 'نامعلوم',
          confidence: categoryMatch.confidence,
          matchedCategory: categoryMatch.matchedCategory,
          success: true,
          action: 'created'
        });
        
        console.log(`✓ Created new product: ${sheetItem.productName}`);
        
      } catch (error) {
        console.error('Error creating new product:', sheetItem.productName, error);
        newProducts.push({
          productName: sheetItem.productName,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
          action: 'create_failed'
        });
      }
    }
  }
  
  return { updates, newProducts };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('force') === 'true';
    const lastSync = await prisma.systemSetting.findUnique({ where: { key: 'last_inventory_sync' } });
    const now = new Date();
    const lastSyncTime = lastSync ? new Date(lastSync.value) : new Date(0);
    const hoursSinceLastSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    if (!forceSync && hoursSinceLastSync < 2) {
      return NextResponse.json({
        message: 'Inventory sync skipped - last sync was less than 2 hours ago',
        lastSync: lastSyncTime,
        nextSync: new Date(lastSyncTime.getTime() + 2 * 60 * 60 * 1000)
      });
    }
    const rawData = await fetchGoogleSheetsData();
    const sheetItems = parseInventoryData(rawData);
    const { updates, newProducts } = await syncProductInventory(sheetItems);
    await prisma.systemSetting.upsert({
      where: { key: 'last_inventory_sync' },
      update: { value: now.toISOString() },
      create: { key: 'last_inventory_sync', value: now.toISOString() }
    });
    const successfulUpdates = updates.filter(r => r.success).length;
    const failedUpdates = updates.filter(r => !r.success).length;
    const successfulCreations = newProducts.filter(r => r.success).length;
    const failedCreations = newProducts.filter(r => !r.success).length;
          return NextResponse.json({
        message: 'Database inventory synced with Google Sheet - new products created for items not in database',
        totalProductsInSheet: sheetItems.length,
        successfulUpdates,
        failedUpdates,
        successfulCreations,
        failedCreations,
        updates,
        newProducts,
        lastSync: now.toISOString()
      });
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در همگام‌سازی موجودی دیتابیس', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  url.searchParams.set('force', 'true');
  return GET(request);
} 