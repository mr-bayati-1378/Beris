import prisma from './prisma';

// Category mapping based on product name keywords
const categoryKeywords = {
  // تزریقی زیبایی
  'تزریقی زیبایی': {
    keywords: ['هیرفیلر', 'بوتاکس', 'کوکتل مزوتراپی', 'mesolike', 'hariplus', 'فیوژن'],
    categoryL1: 'تزریقی زیبایی',
    categoryL2: 'تزریقی زیبایی',
    categoryL3: 'هیرفیلر'
  },
  
  // نخ بخیه
  'نخ ویکریل': {
    keywords: ['ویکریل', 'vicryl', 'نخ ویکریل', 'smi'],
    categoryL1: 'نخ بخیه',
    categoryL2: 'نخ ویکریل',
    categoryL3: 'نخ ویکریل کات'
  },
  
  'نخ نایلون': {
    keywords: ['نایلون', 'nylon', 'نخ نایلون', 'sutures'],
    categoryL1: 'نخ بخیه',
    categoryL2: 'نخ نایلون',
    categoryL3: 'نخ نایلون کات'
  },
  
  // ملزومات جراحی
  'ملزومات جراحی': {
    keywords: ['مارکر', 'marker', 'جراحی خط کش دار'],
    categoryL1: 'ملزومات جراحی',
    categoryL2: 'ملزومات جراحی',
    categoryL3: 'مارکر'
  },
  
  'تیغ جراحی': {
    keywords: ['تیغ', 'blade', 'ساده', 'بیستوری', 'sp91', 'sp90'],
    categoryL1: 'ملزومات جراحی',
    categoryL2: 'ملزومات جراحی',
    categoryL3: 'تیغ ساده'
  },
  
  // بی حسی
  'بی حسی': {
    keywords: ['لیدوکائین', 'lidocaine', 'شیشه ای', 'پلاستیکی'],
    categoryL1: 'بی حسی',
    categoryL2: 'بی حسی',
    categoryL3: 'لیدوکائین'
  },
  
  // منسوجات پزشکی
  'البسه': {
    keywords: ['گان', 'gown', 'جراح', 'تک بیمار'],
    categoryL1: 'منسوجات پزشکی و سلولوزی',
    categoryL2: 'البسه',
    categoryL3: 'گان'
  },
  
  'منسوجات یکبار مصرف': {
    keywords: ['شان', 'shane', 'روتختی', 'پوشک', 'استریل', 'پرفوره'],
    categoryL1: 'منسوجات پزشکی و سلولوزی',
    categoryL2: 'منسوجات یکبار مصرف',
    categoryL3: 'شان یکبار مصرف'
  },
  
  'دستکش نایلونی': {
    keywords: ['دستکش یکبار مصرف', 'لایت', 'جمیل'],
    categoryL1: 'منسوجات پزشکی و سلولوزی',
    categoryL2: 'دستکش نایلونی',
    categoryL3: 'دستکش یکبار مصرف'
  },
  
  'دستکش لاتکس': {
    keywords: ['دستکش لاتکس', 'op-perfect', 'بدون پودر'],
    categoryL1: 'منسوجات پزشکی و سلولوزی',
    categoryL2: 'دستکش لاتکس',
    categoryL3: 'دستکش لاتکس'
  },
  
  'دستکش جراحی': {
    keywords: ['دستکش جراحی', 'آنتی باکتریال', 'medi', 'surgicare', 'harir', 'novasoft'],
    categoryL1: 'منسوجات پزشکی و سلولوزی',
    categoryL2: 'دستکش جراحی',
    categoryL3: 'دستکش جراحی سایز 8'
  },
  
  // گاز طبی
  'گاز طبی': {
    keywords: ['گاز طبی', '8 لایه', '16 لایه', 'دندانپزشکی', 'اسپادانا'],
    categoryL1: 'گاز طبی غیر استریل',
    categoryL2: 'گاز طبی غیر استریل',
    categoryL3: 'گاز طبی غیر استریل 8 لایه'
  },
  
  // تزریقات
  'داروی تزریقی': {
    keywords: ['کارپول', 'کارپول', 'بسته'],
    categoryL1: 'تزریقات',
    categoryL2: 'داروی تزریقی',
    categoryL3: 'کارپول'
  },
  
  'سرنگ تزریق': {
    keywords: ['سرنگ', 'syringe', 'انسولین', 'آوا', 'بیک', 'لوئر لاک'],
    categoryL1: 'تزریقات',
    categoryL2: 'سرنگ تزریق',
    categoryL3: 'سرنگ انسولین'
  },
  
  'سرسوزن تزریق': {
    keywords: ['سرسوزن', 'نیدل', 'needle', 'مزوتراپی', 'طوسی', 'نارنجی', 'آبی', 'صورتی'],
    categoryL1: 'تزریقات',
    categoryL2: 'سرسوزن تزریق',
    categoryL3: 'سرسوزن گیج 30'
  },
  
  'ست تزریق': {
    keywords: ['ست سرم', 'hd'],
    categoryL1: 'تزریقات',
    categoryL2: 'ست تزریق',
    categoryL3: 'ست سرم'
  },
  
  // باند و پانسمان
  'باند و پانسمان': {
    keywords: ['سرجی فیکس', 'چسب پزشکی', 'cito'],
    categoryL1: 'منسوجات پزشکی و سلولوزی',
    categoryL2: 'باند و پانسمان',
    categoryL3: 'سرجی فیکس'
  },
  
  // آنتی باکتریال
  'محلول ضد عفونی': {
    keywords: ['بتادین', 'الکل', 'آب مقطر', 'septocidine', 'پوست و مو و لیزر'],
    categoryL1: 'آنتی باکتریال و ضد عفونی',
    categoryL2: 'محلول ضد عفونی کننده',
    categoryL3: 'بتادین'
  },
  
  // تجهیزات آزمایشگاهی
  'لوازم جانبی آزمایشگاهی': {
    keywords: ['کاغذ صافی', 'سیفتی باکس', 'ورقه ای'],
    categoryL1: 'تجهیزات آزمایشگاهی',
    categoryL2: 'لوازم جانبی آزمایشگاهی',
    categoryL3: 'کاغذ صافی'
  },
  
  // سوزن پانچ
  'سوزن پانچ': {
    keywords: ['سوزن', 'fit', 'پانچ'],
    categoryL1: 'نامعلوم',
    categoryL2: 'نامعلوم',
    categoryL3: 'سوزن پانچ'
  }
};

/**
 * Find the best matching category for a product name
 */
export async function findCategoryForProduct(productName: string): Promise<{
  categoryL1Id: number;
  categoryL2Id: number;
  categoryL3Id: number;
  confidence: number;
  matchedCategory: string;
} | null> {
  const normalizedName = productName.toLowerCase().trim();
  let bestMatch = null;
  let highestConfidence = 0;
  
  // Check each category for keyword matches
  for (const [categoryName, categoryInfo] of Object.entries(categoryKeywords)) {
    for (const keyword of categoryInfo.keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      
      // Check for exact match
      if (normalizedName.includes(normalizedKeyword)) {
        const confidence = normalizedKeyword.length / normalizedName.length;
        
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = {
            categoryName,
            categoryInfo,
            confidence
          };
        }
      }
    }
  }
  
  if (!bestMatch || highestConfidence < 0.3) {
    // No good match found, return default category
    return await getDefaultCategory();
  }
  
  // Find the actual category IDs from database
  try {
    const categoryL1 = await prisma.categoryL1.findFirst({
      where: { name: bestMatch.categoryInfo.categoryL1 }
    });
    
    if (!categoryL1) {
      return await getDefaultCategory();
    }
    
    const categoryL2 = await prisma.categoryL2.findFirst({
      where: { 
        name: bestMatch.categoryInfo.categoryL2,
        categoryL1Id: categoryL1.id
      }
    });
    
    if (!categoryL2) {
      return await getDefaultCategory();
    }
    
    const categoryL3 = await prisma.categoryL3.findFirst({
      where: { 
        name: bestMatch.categoryInfo.categoryL3,
        categoryL2Id: categoryL2.id
      }
    });
    
    if (!categoryL3) {
      return await getDefaultCategory();
    }
    
    return {
      categoryL1Id: categoryL1.id,
      categoryL2Id: categoryL2.id,
      categoryL3Id: categoryL3.id,
      confidence: bestMatch.confidence,
      matchedCategory: bestMatch.categoryName
    };
    
  } catch (error) {
    console.error('Error finding category for product:', productName, error);
    return await getDefaultCategory();
  }
}

/**
 * Get default category (first non-unknown category)
 */
async function getDefaultCategory() {
  try {
    const defaultCategoryL3 = await prisma.categoryL3.findFirst({
      where: { name: { not: 'نامعلوم' } },
      include: {
        categoryL2: {
          include: {
            categoryL1: true
          }
        }
      }
    });
    
    if (!defaultCategoryL3) {
      throw new Error('No default category found');
    }
    
    return {
      categoryL1Id: defaultCategoryL3.categoryL2.categoryL1.id,
      categoryL2Id: defaultCategoryL3.categoryL2.id,
      categoryL3Id: defaultCategoryL3.id,
      confidence: 0,
      matchedCategory: 'default'
    };
  } catch (error) {
    console.error('Error getting default category:', error);
    return null;
  }
}

/**
 * Get category information for debugging
 */
export async function getCategoryInfo(categoryL3Id: number) {
  try {
    const category = await prisma.categoryL3.findUnique({
      where: { id: categoryL3Id },
      include: {
        categoryL2: {
          include: {
            categoryL1: true
          }
        }
      }
    });
    
    return category ? {
      l1: category.categoryL2.categoryL1.name,
      l2: category.categoryL2.name,
      l3: category.name
    } : null;
  } catch (error) {
    console.error('Error getting category info:', error);
    return null;
  }
} 