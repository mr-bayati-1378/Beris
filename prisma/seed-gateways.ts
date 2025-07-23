import prisma from '../src/lib/prisma';

async function seedPaymentGateways() {
  console.log('🚀 Seeding payment gateways...');

  // زرین‌پال
  await prisma.paymentGateway.upsert({
    where: { name: 'zarinpal' },
    update: {},
    create: {
      name: 'zarinpal',
      displayName: 'زرین‌پال',
      isActive: true,
      config: {
        merchantId: process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        sandbox: process.env.NODE_ENV !== 'production'
      }
    }
  });

  // بانک سامان
  await prisma.paymentGateway.upsert({
    where: { name: 'saman' },
    update: {},
    create: {
      name: 'saman',
      displayName: 'بانک سامان',
      isActive: true,
      config: {
        terminalId: process.env.SAMAN_TERMINAL_ID || '12345678',
        sandbox: process.env.NODE_ENV !== 'production'
      }
    }
  });

  // بانک ملت
  await prisma.paymentGateway.upsert({
    where: { name: 'mellat' },
    update: {},
    create: {
      name: 'mellat',
      displayName: 'بانک ملت',
      isActive: true,
      config: {
        terminalId: process.env.MELLAT_TERMINAL_ID || '12345',
        username: process.env.MELLAT_USERNAME || 'username',
        password: process.env.MELLAT_PASSWORD || 'password',
        sandbox: process.env.NODE_ENV !== 'production'
      }
    }
  });

  // پارسیان
  await prisma.paymentGateway.upsert({
    where: { name: 'parsian' },
    update: {},
    create: {
      name: 'parsian',
      displayName: 'بانک پارسیان',
      isActive: false, // غیرفعال به‌صورت پیش‌فرض
      config: {
        loginAccount: process.env.PARSIAN_LOGIN_ACCOUNT || 'LoginAccount',
        sandbox: process.env.NODE_ENV !== 'production'
      }
    }
  });

  // پاسارگاد
  await prisma.paymentGateway.upsert({
    where: { name: 'pasargad' },
    update: {},
    create: {
      name: 'pasargad',
      displayName: 'بانک پاسارگاد',
      isActive: false, // غیرفعال به‌صورت پیش‌فرض
      config: {
        merchantId: process.env.PASARGAD_MERCHANT_ID || '12345',
        terminalCode: process.env.PASARGAD_TERMINAL_CODE || '12345',
        sandbox: process.env.NODE_ENV !== 'production'
      }
    }
  });

  console.log('✅ Payment gateways seeded successfully!');
}

async function main() {
  try {
    await seedPaymentGateways();
  } catch (error) {
    console.error('❌ Error seeding payment gateways:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 