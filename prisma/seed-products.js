const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('شروع seed کردن محصولات...');

  // ابتدا دسته‌بندی‌ها را ایجاد می‌کنیم
  const categories = await createCategories();
  
  // سپس محصولات را ایجاد می‌کنیم
  await createProducts(categories);

  console.log('محصولات با موفقیت seed شدند!');
}

async function createCategories() {
  // دسته‌بندی سطح ۱
  const medicalEquipment = await prisma.categoryL1.upsert({
    where: { slug: 'medical-equipment' },
    update: {},
    create: {
      name: 'تجهیزات پزشکی',
      slug: 'medical-equipment',
    },
  });

  // دسته‌بندی سطح ۲
  const syringes = await prisma.categoryL2.upsert({
    where: { slug: 'syringes' },
    update: {},
    create: {
      name: 'سرنگ و تزریقات',
      slug: 'syringes',
      categoryL1Id: medicalEquipment.id,
    },
  });

  const gloves = await prisma.categoryL2.upsert({
    where: { slug: 'gloves' },
    update: {},
    create: {
      name: 'دستکش پزشکی',
      slug: 'gloves',
      categoryL1Id: medicalEquipment.id,
    },
  });

  const gauze = await prisma.categoryL2.upsert({
    where: { slug: 'gauze-bandages' },
    update: {},
    create: {
      name: 'گاز و پانسمان',
      slug: 'gauze-bandages',
      categoryL1Id: medicalEquipment.id,
    },
  });

  const surgical = await prisma.categoryL2.upsert({
    where: { slug: 'surgical-tools' },
    update: {},
    create: {
      name: 'ابزار جراحی',
      slug: 'surgical-tools',
      categoryL1Id: medicalEquipment.id,
    },
  });

  const masks = await prisma.categoryL2.upsert({
    where: { slug: 'masks-protection' },
    update: {},
    create: {
      name: 'ماسک و حفاظت',
      slug: 'masks-protection',
      categoryL1Id: medicalEquipment.id,
    },
  });

  const consumables = await prisma.categoryL2.upsert({
    where: { slug: 'medical-consumables' },
    update: {},
    create: {
      name: 'مصرفی پزشکی',
      slug: 'medical-consumables',
      categoryL1Id: medicalEquipment.id,
    },
  });

  // دسته‌بندی سطح ۳
  const syringeInsulin = await prisma.categoryL3.upsert({
    where: { slug: 'insulin-syringes' },
    update: {},
    create: {
      name: 'سرنگ انسولین',
      slug: 'insulin-syringes',
      categoryL2Id: syringes.id,
    },
  });

  const syringe10ml = await prisma.categoryL3.upsert({
    where: { slug: 'syringes-10ml' },
    update: {},
    create: {
      name: 'سرنگ ۱۰ میلی‌لیتر',
      slug: 'syringes-10ml',
      categoryL2Id: syringes.id,
    },
  });

  const surgicalGloves = await prisma.categoryL3.upsert({
    where: { slug: 'surgical-gloves' },
    update: {},
    create: {
      name: 'دستکش جراحی',
      slug: 'surgical-gloves',
      categoryL2Id: gloves.id,
    },
  });

  const sterileGauze = await prisma.categoryL3.upsert({
    where: { slug: 'sterile-gauze' },
    update: {},
    create: {
      name: 'گاز استریل',
      slug: 'sterile-gauze',
      categoryL2Id: gauze.id,
    },
  });

  const surgicalBlades = await prisma.categoryL3.upsert({
    where: { slug: 'surgical-blades' },
    update: {},
    create: {
      name: 'تیغ جراحی',
      slug: 'surgical-blades',
      categoryL2Id: surgical.id,
    },
  });

  const medicalMasks = await prisma.categoryL3.upsert({
    where: { slug: 'medical-masks' },
    update: {},
    create: {
      name: 'ماسک پزشکی',
      slug: 'medical-masks',
      categoryL2Id: masks.id,
    },
  });

  const angiocath = await prisma.categoryL3.upsert({
    where: { slug: 'angiocath' },
    update: {},
    create: {
      name: 'آنژیوکت',
      slug: 'angiocath',
      categoryL2Id: consumables.id,
    },
  });

  return {
    syringeInsulin,
    syringe10ml,
    surgicalGloves,
    sterileGauze,
    surgicalBlades,
    medicalMasks,
    angiocath,
  };
}

async function createProducts(categories) {
  const products = [
    // سرنگ انسولین
    {
      name: 'سرنگ انسولین BD یک میلی‌لیتر',
      slug: 'syringe-insulin-bd-1ml',
      description: 'سرنگ انسولین BD با کیفیت بالا، مناسب برای تزریق انسولین',
      price: 89000,
      comparePrice: 125000,
      brand: 'BD',
      categoryL3Id: categories.syringeInsulin.id,
      stock: 150,
      isActive: true,
      hasDiscount: true,
      discountPercent: 29,
      images: ['/products/سرنگ انسولین BD یک میل-01.jpg'],
    },
    {
      name: 'سرنگ انسولین BD نیم میلی‌لیتر',
      slug: 'syringe-insulin-bd-05ml',
      description: 'سرنگ انسولین BD نیم میلی‌لیتر برای دوزهای کم انسولین',
      price: 75000,
      comparePrice: 95000,
      brand: 'BD',
      categoryL3Id: categories.syringeInsulin.id,
      stock: 200,
      isActive: true,
      hasDiscount: true,
      discountPercent: 21,
      images: ['/products/سرنگ انسولین BD نیم میل-01.jpg'],
    },
    
    // سرنگ ۱۰ میلی
    {
      name: 'سرنگ ۱۰ میلی‌لیتر آوا',
      slug: 'syringe-10ml-ava',
      description: 'سرنگ ۱۰ میلی‌لیتر آوا با کیفیت بالا و قیمت مناسب',
      price: 45000,
      comparePrice: 55000,
      brand: 'آوا',
      categoryL3Id: categories.syringe10ml.id,
      stock: 300,
      isActive: true,
      hasDiscount: true,
      discountPercent: 18,
      images: ['/products/سرنگ 10 آوا-01.jpg'],
    },
    {
      name: 'سرنگ ۱۰ میلی‌لیتر بیک',
      slug: 'syringe-10ml-bic',
      description: 'سرنگ ۱۰ میلی‌لیتر بیک با طراحی ارگونومیک',
      price: 42000,
      comparePrice: 52000,
      brand: 'بیک',
      categoryL3Id: categories.syringe10ml.id,
      stock: 250,
      isActive: true,
      hasDiscount: true,
      discountPercent: 19,
      images: ['/products/سرنگ 10 بیک-01.jpg'],
    },
    {
      name: 'سرنگ ۵ میلی‌لیتر آوا لوئر لاک',
      slug: 'syringe-5ml-ava-luer',
      description: 'سرنگ ۵ میلی‌لیتر آوا با اتصال لوئر لاک',
      price: 35000,
      comparePrice: 45000,
      brand: 'آوا',
      categoryL3Id: categories.syringe10ml.id,
      stock: 180,
      isActive: true,
      hasDiscount: true,
      discountPercent: 22,
      images: ['/products/سرنگ 5 آوا لوئر لاک-01.jpg'],
    },
    
    // دستکش جراحی
    {
      name: 'دستکش جراحی MediSpo بدون پودر سایز ۷.۵',
      slug: 'surgical-gloves-medispo-75',
      description: 'دستکش جراحی MediSpo بدون پودر، کیفیت فوق‌العاده',
      price: 320000,
      comparePrice: 450000,
      brand: 'MediSpo',
      categoryL3Id: categories.surgicalGloves.id,
      stock: 100,
      isActive: true,
      hasDiscount: true,
      discountPercent: 29,
      images: ['/products/دستکش جراحی MediSpo بدون پودر 7.5-01.jpg'],
    },
    {
      name: 'دستکش جراحی MediSpo بدون پودر سایز ۷',
      slug: 'surgical-gloves-medispo-7',
      description: 'دستکش جراحی MediSpo بدون پودر سایز ۷',
      price: 315000,
      comparePrice: 420000,
      brand: 'MediSpo',
      categoryL3Id: categories.surgicalGloves.id,
      stock: 120,
      isActive: true,
      hasDiscount: true,
      discountPercent: 25,
      images: ['/products/دستکش جراحی MediSpo بدون پودر 7-01-01.jpg'],
    },
    {
      name: 'دستکش جراحی HD بدون پودر سایز ۷',
      slug: 'surgical-gloves-hd-7',
      description: 'دستکش جراحی HD بدون پودر با کیفیت بالا',
      price: 285000,
      comparePrice: 380000,
      brand: 'HD',
      categoryL3Id: categories.surgicalGloves.id,
      stock: 90,
      isActive: true,
      hasDiscount: true,
      discountPercent: 25,
      images: ['/products/دستکش جراحی HD بدون پودر 7-01-01.jpg'],
    },
    
    // گاز و پانسمان
    {
      name: 'شان استریل ساده ۱×۱',
      slug: 'sterile-gauze-1x1',
      description: 'شان استریل ساده ۱×۱ سانتی‌متر، کیفیت بالا',
      price: 45000,
      comparePrice: 65000,
      brand: 'ایرانی',
      categoryL3Id: categories.sterileGauze.id,
      stock: 200,
      isActive: true,
      hasDiscount: true,
      discountPercent: 31,
      images: ['/products/شان استریل ساده 1x1-01-01.jpg'],
    },
    {
      name: 'شان استریل پرفوره ۱×۱',
      slug: 'sterile-gauze-perforated-1x1',
      description: 'شان استریل پرفوره ۱×۱ سانتی‌متر',
      price: 48000,
      comparePrice: 68000,
      brand: 'ایرانی',
      categoryL3Id: categories.sterileGauze.id,
      stock: 180,
      isActive: true,
      hasDiscount: true,
      discountPercent: 29,
      images: ['/products/شان استریل پرفوره 1x1-01.jpg'],
    },
    {
      name: 'شان استریل ساده ۵۰×۵۰',
      slug: 'sterile-gauze-50x50',
      description: 'شان استریل ساده ۵۰×۵۰ سانتی‌متر برای پانسمان‌های بزرگ',
      price: 85000,
      comparePrice: 110000,
      brand: 'ایرانی',
      categoryL3Id: categories.sterileGauze.id,
      stock: 150,
      isActive: true,
      hasDiscount: true,
      discountPercent: 23,
      images: ['/products/شان استریل ساده 50x50-01.jpg'],
    },
    {
      name: 'گاز طبی دندانپزشکی',
      slug: 'dental-gauze',
      description: 'گاز طبی مخصوص دندانپزشکی با جذب بالا',
      price: 65000,
      comparePrice: 85000,
      brand: 'ایرانی',
      categoryL3Id: categories.sterileGauze.id,
      stock: 120,
      isActive: true,
      hasDiscount: true,
      discountPercent: 24,
      images: ['/products/گاز طبی دندانپزشکی-01.jpg'],
    },
    
    // تیغ جراحی
    {
      name: 'تیغ جراحی SP90 HMD',
      slug: 'surgical-blade-sp90',
      description: 'تیغ جراحی SP90 HMD با کیفیت فوق‌العاده',
      price: 75000,
      comparePrice: 95000,
      brand: 'HMD',
      categoryL3Id: categories.surgicalBlades.id,
      stock: 80,
      isActive: true,
      hasDiscount: true,
      discountPercent: 21,
      images: ['/products/تیغ sp90 HMD-01.jpg'],
    },
    
    // ماسک
    {
      name: 'ماسک سه‌لایه پزشکی',
      slug: 'medical-mask-3layer',
      description: 'ماسک سه‌لایه پزشکی با فیلتراسیون بالا',
      price: 180000,
      comparePrice: 240000,
      brand: 'ایرانی',
      categoryL3Id: categories.medicalMasks.id,
      stock: 500,
      isActive: true,
      hasDiscount: true,
      discountPercent: 25,
      images: ['/products/ماسک 3 لایه-01.jpg'],
    },
    
    // آنژیوکت
    {
      name: 'آنژیوکت آبی',
      slug: 'angiocath-blue',
      description: 'آنژیوکت آبی برای دسترسی وریدی',
      price: 35000,
      comparePrice: 45000,
      brand: 'ایرانی',
      categoryL3Id: categories.angiocath.id,
      stock: 200,
      isActive: true,
      hasDiscount: true,
      discountPercent: 22,
      images: ['/products/آنژیوکت آبی-01.jpg'],
    },
    
    // محصولات اضافی بر اساس عکس‌های موجود
    {
      name: 'آب مقطر ۰.۵ میلی‌لیتر',
      slug: 'distilled-water-05ml',
      description: 'آب مقطر ۰.۵ میلی‌لیتر برای تزریقات',
      price: 25000,
      comparePrice: 35000,
      brand: 'ایرانی',
      categoryL3Id: categories.angiocath.id,
      stock: 300,
      isActive: true,
      hasDiscount: true,
      discountPercent: 29,
      images: ['/products/آب مقطر 0.5 ml-01.jpg'],
    },
    {
      name: 'آب مقطر ۵ لیتری',
      slug: 'distilled-water-5l',
      description: 'آب مقطر ۵ لیتری برای مصارف پزشکی',
      price: 85000,
      comparePrice: 110000,
      brand: 'ایرانی',
      categoryL3Id: categories.angiocath.id,
      stock: 50,
      isActive: true,
      hasDiscount: true,
      discountPercent: 23,
      images: ['/products/آب  مقطر 5 لیتری-01.jpg'],
    },
    {
      name: 'چسب بخیه ۳M',
      slug: 'suture-tape-3m',
      description: 'چسب بخیه ۳M با کیفیت بین‌المللی',
      price: 125000,
      comparePrice: 165000,
      brand: '3M',
      categoryL3Id: categories.surgicalBlades.id,
      stock: 60,
      isActive: true,
      hasDiscount: true,
      discountPercent: 24,
      images: ['/products/چسب بخیه 3M-01.jpg'],
    },
    {
      name: 'نخ ویکریل ۵.۰',
      slug: 'vicryl-suture-5',
      description: 'نخ ویکریل ۵.۰ برای بخیه‌های ظریف',
      price: 145000,
      comparePrice: 185000,
      brand: 'Ethicon',
      categoryL3Id: categories.surgicalBlades.id,
      stock: 40,
      isActive: true,
      hasDiscount: true,
      discountPercent: 22,
      images: ['/products/نخ ویکریل 5.0-01.jpg'],
    },
  ];

  for (const productData of products) {
    const { images, ...productInfo } = productData;
    
    // ایجاد محصول
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productInfo,
      create: productInfo,
    });

    // پاک کردن تصاویر قبلی
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    // اضافه کردن تصاویر جدید
    for (const imageUrl of images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: product.name,
        },
      });
    }

    console.log(`محصول ایجاد شد: ${product.name}`);
  }
}

main()
  .catch((e) => {
    console.error('خطا در seed کردن محصولات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 