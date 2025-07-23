import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  try {
    // L1 Categories
    const beautyInjection = await prisma.categoryL1.upsert({
      where: { slug: 'beauty-injection' },
      update: {},
      create: {
        name: 'تزریقی زیبایی',
        slug: 'beauty-injection',
      },
    });

    const suture = await prisma.categoryL1.upsert({
      where: { slug: 'suture' },
      update: {},
      create: {
        name: 'نخ بخیه',
        slug: 'suture',
      },
    });

    const surgicalSupplies = await prisma.categoryL1.upsert({
      where: { slug: 'surgical-supplies' },
      update: {},
      create: {
        name: 'ملزومات جراحی',
        slug: 'surgical-supplies',
      },
    });

    const anesthesia = await prisma.categoryL1.upsert({
      where: { slug: 'anesthesia' },
      update: {},
      create: {
        name: 'بی حسی',
        slug: 'anesthesia',
      },
    });

    const medicalTextiles = await prisma.categoryL1.upsert({
      where: { slug: 'medical-textiles' },
      update: {},
      create: {
        name: 'منسوجات پزشکی و سلولوزی',
        slug: 'medical-textiles',
      },
    });

    const nonSterileMedicalGas = await prisma.categoryL1.upsert({
      where: { slug: 'non-sterile-medical-gas' },
      update: {},
      create: {
        name: 'گاز طبی غیر استریل',
        slug: 'non-sterile-medical-gas',
      },
    });

    const injections = await prisma.categoryL1.upsert({
      where: { slug: 'injections' },
      update: {},
      create: {
        name: 'تزریقات',
        slug: 'injections',
      },
    });

    const antibacterial = await prisma.categoryL1.upsert({
      where: { slug: 'antibacterial' },
      update: {},
      create: {
        name: 'آنتی باکتریال و ضد عفونی',
        slug: 'antibacterial',
      },
    });

    const laboratoryEquipment = await prisma.categoryL1.upsert({
      where: { slug: 'laboratory-equipment' },
      update: {},
      create: {
        name: 'تجهیزات آزمایشگاهی',
        slug: 'laboratory-equipment',
      },
    });

    // L2 Categories
    const botox = await prisma.categoryL2.upsert({
      where: { slug: 'botox' },
      update: {},
      create: {
        name: 'بوتاکس',
        slug: 'botox',
        categoryL1Id: beautyInjection.id,
      },
    });

    const microSuture = await prisma.categoryL2.upsert({
      where: { slug: 'micro-suture' },
      update: {},
      create: {
        name: 'نخ میکرو',
        slug: 'micro-suture',
        categoryL1Id: suture.id,
      },
    });

    const nylonSuture = await prisma.categoryL2.upsert({
      where: { slug: 'nylon-suture' },
      update: {},
      create: {
        name: 'نخ نایلون',
        slug: 'nylon-suture',
        categoryL1Id: suture.id,
      },
    });

    const surgicalBlades = await prisma.categoryL2.upsert({
      where: { slug: 'surgical-blades' },
      update: {},
      create: {
        name: 'تیغه‌های جراحی',
        slug: 'surgical-blades',
        categoryL1Id: surgicalSupplies.id,
      },
    });

    const localAnesthetics = await prisma.categoryL2.upsert({
      where: { slug: 'local-anesthetics' },
      update: {},
      create: {
        name: 'بی‌حس کننده‌های موضعی',
        slug: 'local-anesthetics',
        categoryL1Id: anesthesia.id,
      },
    });

    const gauze = await prisma.categoryL2.upsert({
      where: { slug: 'gauze' },
      update: {},
      create: {
        name: 'گاز',
        slug: 'gauze',
        categoryL1Id: medicalTextiles.id,
      },
    });

    const syringes = await prisma.categoryL2.upsert({
      where: { slug: 'syringes' },
      update: {},
      create: {
        name: 'سرنگ',
        slug: 'syringes',
        categoryL1Id: injections.id,
      },
    });

    const needles = await prisma.categoryL2.upsert({
      where: { slug: 'needles' },
      update: {},
      create: {
        name: 'سوزن',
        slug: 'needles',
        categoryL1Id: injections.id,
      },
    });

    const disinfectants = await prisma.categoryL2.upsert({
      where: { slug: 'disinfectants' },
      update: {},
      create: {
        name: 'ضدعفونی کننده‌ها',
        slug: 'disinfectants',
        categoryL1Id: antibacterial.id,
      },
    });

    // L3 Categories
    await prisma.categoryL3.upsert({
      where: { slug: 'botulinum-toxin' },
      update: {},
      create: {
        name: 'بوتولینوم توکسین',
        slug: 'botulinum-toxin',
        categoryL2Id: botox.id,
      },
    });

    await prisma.categoryL3.upsert({
      where: { slug: 'micro-6-0' },
      update: {},
      create: {
        name: 'میکرو 6.0',
        slug: 'micro-6-0',
        categoryL2Id: microSuture.id,
      },
    });

    await prisma.categoryL3.upsert({
      where: { slug: 'nylon-5-0' },
      update: {},
      create: {
        name: 'نایلون 5.0',
        slug: 'nylon-5-0',
        categoryL2Id: nylonSuture.id,
      },
    });

    await prisma.categoryL3.upsert({
      where: { slug: 'blade-10' },
      update: {},
      create: {
        name: 'تیغه شماره 10',
        slug: 'blade-10',
        categoryL2Id: surgicalBlades.id,
      },
    });

    console.log('✅ Categories seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 