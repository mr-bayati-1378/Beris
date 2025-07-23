import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Order creation API called');
    console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('🍪 Request cookies:', req.cookies.getAll());
    
    const session = await auth();
    console.log('👤 Session:', session);
    
    if (!session?.user?.id) {
      console.log('❌ No valid session found');
      return NextResponse.json({ error: 'Unauthorized - No valid session' }, { status: 401 });
    }
    
    const { addressId, useSameAddressForBilling, billingAddress } = await req.json();
    console.log('Order creation request:', { 
      userId: session.user.id, 
      addressId, 
      type: typeof addressId,
      useSameAddressForBilling,
      billingAddress
    });
  
  if (!addressId) {
    return NextResponse.json(
      { error: 'AddressId is required' },
      { status: 400 }
    );
  }

  // Convert addressId to number if it's a string
  const addressIdNumber = typeof addressId === 'string' ? parseInt(addressId) : addressId;
  
  if (isNaN(addressIdNumber)) {
    return NextResponse.json(
      { error: 'Invalid addressId format' },
      { status: 400 }
    );
  }

  console.log('Looking for address with ID:', addressIdNumber, 'for user:', session.user.id);

  // Get the selected address
  const selectedAddress = await prisma.address.findFirst({
    where: {
      id: addressIdNumber,
      userId: session.user.id
    }
  });

  if (!selectedAddress) {
    return NextResponse.json(
      { error: `آدرس انتخاب شده یافت نشد. AddressId: ${addressIdNumber}, UserId: ${session.user.id}` },
      { status: 400 }
    );
  }

  // Get or create cart for user
  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
          userPack: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            userPack: {
              include: {
                items: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  const cartItems = cart.items;

  console.log('Cart items found:', cartItems.length, cartItems.map(item => ({
    id: item.id,
    productId: item.productId,
    userPackId: item.userPackId,
    quantity: item.quantity,
    hasProduct: !!item.product,
    hasUserPack: !!item.userPack,
    productPrice: item.product?.price,
    userPackPrice: item.userPack?.totalPrice
  })));

  console.log('Cart ID:', cart.id, 'User ID:', session.user.id);

  if (cartItems.length === 0) {
    return NextResponse.json({ 
      error: 'سبد خرید خالی است. لطفاً ابتدا محصولی به سبد خرید اضافه کنید.',
      cartId: cart.id,
      userId: session.user.id
    }, { status: 400 });
  }

  // Calculate total and create order items
  let total = 0;
  const orderItems: any[] = [];

  for (const item of cartItems) {
    let price = 0;
    let productId = null;
    let userPackId = null;

    console.log('Processing cart item:', {
      id: item.id,
      productId: item.productId,
      userPackId: item.userPackId,
      quantity: item.quantity,
      hasProduct: !!item.product,
      hasUserPack: !!item.userPack
    });

    if (item.product && item.product.price) {
      price = Number(item.product.price);
      productId = item.product.id;
      console.log('Product price:', price);
    } else if (item.userPack) {
      // محاسبه قیمت کل پک از مجموع محصولات موجود در include
      if (item.userPack.totalPrice) {
        price = Number(item.userPack.totalPrice);
      } else if (item.userPack.items && item.userPack.items.length > 0) {
        price = item.userPack.items.reduce((sum, packItem) => {
          return sum + (Number(packItem.product.price) * packItem.quantity);
        }, 0);
      } else {
        console.log('UserPack has no items or totalPrice');
        continue;
      }
      userPackId = item.userPack.id;
      console.log('UserPack price:', price, 'totalPrice:', item.userPack.totalPrice);
    } else {
      console.log('Skipping item - no valid product or pack');
      continue; // Skip items without valid product or pack
    }

    // Skip if price is NaN or invalid
    if (isNaN(price) || price <= 0) {
      console.log('Skipping item - invalid price:', price);
      continue;
    }

    total += price * item.quantity;
    console.log('Running total:', total);
    
    // Create order item with proper structure
    const orderItem: any = {
      quantity: item.quantity,
      price: new Prisma.Decimal(price),
    };

    // Add productId or userPackId based on what exists
    if (productId) {
      orderItem.productId = productId;
      console.log('Adding product to order item:', productId);
    }
    if (userPackId) {
      orderItem.userPackId = userPackId;
      console.log('Adding userPack to order item:', userPackId);
    }

    orderItems.push(orderItem);
  }

  console.log('Order items to create:', orderItems);

  if (orderItems.length === 0) {
    return NextResponse.json({ 
      error: 'هیچ محصول معتبری در سبد خرید یافت نشد',
      cartItemsCount: cartItems.length,
      validItemsCount: orderItems.length,
      cartId: cart.id
    }, { status: 400 });
  }

  // Ensure total is valid
  if (isNaN(total) || total <= 0) {
    return NextResponse.json({ 
      error: 'مبلغ سفارش نامعتبر است',
      total,
      orderItemsCount: orderItems.length,
      cartItemsCount: cartItems.length
    }, { status: 400 });
  }

  // آماده‌سازی داده‌های آدرس
  const orderData: any = {
    userId: session.user.id,
    slug: nanoid(10),
    status: 'PENDING',
    total: new Prisma.Decimal(total),
    // آدرس تحویل
    deliveryAddress: selectedAddress.address,
    deliveryCity: selectedAddress.city,
    deliveryState: selectedAddress.state || selectedAddress.city,
    deliveryZipCode: selectedAddress.zipCode || '0000000000',
    // آدرس فاکتور
    useSameAddressForBilling: useSameAddressForBilling !== false, // default true
    items: {
      create: orderItems.map(item => ({
        ...item,
        price: new Prisma.Decimal(item.price)
      })),
    },
  };

  // اگر آدرس فاکتور متفاوت است
  if (!useSameAddressForBilling && billingAddress) {
    orderData.billingAddress = billingAddress.address;
    orderData.billingCity = billingAddress.city;
    orderData.billingState = billingAddress.state || billingAddress.city;
    orderData.billingZipCode = billingAddress.postCode || '0000000000';
  }

  const order = await prisma.order.create({
    data: orderData,
  });

  // Fetch order with items separately
  const orderWithItems = await prisma.order.findUnique({
    where: { id: order.id },
    include: { 
      items: { 
        include: { 
          product: true,
          userPack: true
        } 
      } 
    },
  });

  // Clear cart after successful order creation
  await prisma.cartItem.deleteMany({ 
    where: { 
      cartId: cart.id
    } 
  });

  return NextResponse.json({
    success: true,
    order: {
      id: orderWithItems.id,
      slug: orderWithItems.slug,
      status: orderWithItems.status.toLowerCase(),
      total: orderWithItems.total,
      createdAt: orderWithItems.createdAt,
      deliveryAddress: {
        address: orderWithItems.deliveryAddress,
        city: orderWithItems.deliveryCity,
        state: orderWithItems.deliveryState,
        zipCode: orderWithItems.deliveryZipCode,
      },
      billingAddress: orderWithItems.useSameAddressForBilling ? null : {
        address: orderWithItems.billingAddress,
        city: orderWithItems.billingCity,
        state: orderWithItems.billingState,
        zipCode: orderWithItems.billingZipCode,
      },
      useSameAddressForBilling: orderWithItems.useSameAddressForBilling,
      items: orderWithItems.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          image: item.product.image,
        } : null,
        userPack: item.userPack ? {
          id: item.userPack.id,
          name: item.userPack.name,
          totalPrice: Number(item.userPack.totalPrice),
        } : null,
      })),
    },
  });
  } catch (error) {
    console.error('Error in order creation API:', error);
    return NextResponse.json(
      { error: `خطا در ایجاد سفارش: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(orders);
}
