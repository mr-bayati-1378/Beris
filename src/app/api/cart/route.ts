import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Get cart items
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const userId = session.user.id;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
            userPack: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    return NextResponse.json({
      items: cart.items.map(item => {
        // اگر آیتم یک پک است
        if (item.userPack) {
          const totalPrice = item.userPack.items.reduce((sum, packItem) => {
            return sum + (Number(packItem.product.price) * packItem.quantity);
          }, 0);

          return {
            id: item.id,
            userPackId: item.userPackId,
            quantity: item.quantity,
            name: item.userPack.name,
            price: totalPrice,
            image: '/pack-icon.png', // آیکون پیش‌فرض برای پک
            type: 'pack',
            description: item.userPack.description,
            itemCount: item.userPack.items.length,
            packItems: item.userPack.items.map(packItem => ({
              name: packItem.product.name,
              quantity: packItem.quantity,
              price: Number(packItem.product.price),
            })),
          };
        }

        // اگر آیتم یک محصول عادی است
        if (item.product) {
          let imageUrl = '';
          if (item.product.image) {
            imageUrl = item.product.image;
          } else if (item.product.images && item.product.images.length > 0) {
            const firstImage = item.product.images[0];
            if (firstImage && firstImage.url) imageUrl = firstImage.url;
          }

          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            name: item.product.name,
            price: Number(item.product.price),
            image: imageUrl || '/default-product.png',
            slug: item.product.slug,
            type: 'product',
          };
        }

        return null;
      }).filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سبد خرید' },
      { status: 500 }
    );
  }
}

// Add to cart
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    console.log('Cart POST request body:', body);
    
    const { productId, userPackId, quantity = 1 } = body;
    
    // Convert string IDs to numbers if needed
    const parsedProductId = productId ? Number(productId) : null;
    const parsedUserPackId = userPackId ? Number(userPackId) : null;
    const parsedQuantity = Number(quantity);
    
    // Validate quantity
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      console.log('Cart POST error: Invalid quantity:', quantity);
      return NextResponse.json(
        { error: 'تعداد نامعتبر است' },
        { status: 400 }
      );
    }
    
    console.log('Cart POST parsed data:', { 
      productId: parsedProductId, 
      userPackId: parsedUserPackId, 
      quantity: parsedQuantity, 
      userId 
    });

    // یا محصول یا پک باید مشخص باشد، نه هر دو
    if (!parsedProductId && !parsedUserPackId) {
      console.log('Cart POST error: No productId or userPackId provided');
      return NextResponse.json(
        { error: 'لطفا محصول یا پک را مشخص کنید' },
        { status: 400 }
      );
    }

    if (parsedProductId && parsedUserPackId) {
      console.log('Cart POST error: Both productId and userPackId provided');
      return NextResponse.json(
        { error: 'نمی‌توانید هم محصول و هم پک را همزمان انتخاب کنید' },
        { status: 400 }
      );
    }
    
    // Validate userPackId if provided
    if (parsedUserPackId && (isNaN(parsedUserPackId) || parsedUserPackId <= 0)) {
      console.log('Cart POST error: Invalid userPackId:', userPackId);
      return NextResponse.json(
        { error: 'شناسه پک نامعتبر است' },
        { status: 400 }
      );
    }
    
    // Validate productId if provided
    if (parsedProductId && (isNaN(parsedProductId) || parsedProductId <= 0)) {
      console.log('Cart POST error: Invalid productId:', productId);
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    if (parsedProductId) {
      // اضافه کردن محصول
      const product = await prisma.product.findUnique({
        where: { id: parsedProductId },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'محصول مورد نظر یافت نشد' },
          { status: 404 }
        );
      }

      // حذف بررسی موجودی - مشتری می‌تواند حتی بدون موجودی سفارش دهد
      // if (product.stock < parsedQuantity) {
      //   return NextResponse.json(
      //     { error: 'موجودی محصول کافی نیست' },
      //     { status: 400 }
      //   );
      // }

      // بررسی وجود محصول در سبد خرید
      const existingItem = cart.items.find(item => item.productId === parsedProductId);

      if (existingItem) {
        // بروزرسانی تعداد
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + parsedQuantity },
        });
      } else {
        // اضافه کردن آیتم جدید
        try {
          const newCartItem = await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: parsedProductId,
              quantity: parsedQuantity,
            },
          });
          console.log('Created product cart item in POST:', newCartItem);
        } catch (error) {
          console.error('Error creating product cart item in POST:', error);
          return NextResponse.json(
            { error: 'خطا در افزودن محصول به سبد خرید' },
            { status: 500 }
          );
        }
      }
    } else if (parsedUserPackId) {
      console.log('Processing userPack with ID:', parsedUserPackId);
      // اضافه کردن پک
      const userPack = await prisma.userPack.findUnique({
        where: { id: parsedUserPackId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log('Found userPack:', userPack ? { id: userPack.id, name: userPack.name, isActive: userPack.isActive } : null);

      if (!userPack) {
        console.log('UserPack not found for ID:', parsedUserPackId);
        return NextResponse.json(
          { error: 'پک مورد نظر یافت نشد' },
          { status: 404 }
        );
      }

      if (!userPack.isActive) {
        console.log('UserPack is not active:', userPack.id);
        return NextResponse.json(
          { error: 'این پک غیرفعال است' },
          { status: 400 }
        );
      }

      console.log('UserPack items:', userPack.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productStock: item.product.stock,
        packQuantity: item.quantity,
        requiredQuantity: item.quantity * parsedQuantity
      })));

      // بررسی موجودی محصولات پک
      for (const packItem of userPack.items) {
        const requiredQuantity = packItem.quantity * parsedQuantity;
        console.log(`Checking stock for ${packItem.product.name}: available=${packItem.product.stock}, required=${requiredQuantity}`);
        if (packItem.product.stock < requiredQuantity) {
          console.log(`Insufficient stock for ${packItem.product.name}`);
          return NextResponse.json(
            { error: `موجودی محصول ${packItem.product.name} کافی نیست` },
            { status: 400 }
          );
        }
      }

      // بررسی وجود پک در سبد خرید
      const existingItem = cart.items.find(item => item.userPackId === parsedUserPackId);
      console.log('Existing cart items:', cart.items.map(item => ({ id: item.id, productId: item.productId, userPackId: item.userPackId })));
      console.log('Looking for userPackId:', parsedUserPackId);
      console.log('Existing item found:', existingItem);

      if (existingItem) {
        console.log('Updating existing cart item:', existingItem.id);
        // بروزرسانی تعداد
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + parsedQuantity },
        });
        console.log('Updated cart item successfully');
      } else {
        console.log('Creating new cart item for userPack:', parsedUserPackId);
        // اضافه کردن پک جدید
        try {
          const newCartItem = await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              userPackId: parsedUserPackId,
              quantity: parsedQuantity,
            },
          });
          console.log('Created pack cart item in POST:', newCartItem);
        } catch (error) {
          console.error('Error creating pack cart item in POST:', error);
          return NextResponse.json(
            { error: 'خطا در افزودن پک به سبد خرید' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'خطا در افزودن به سبد خرید' },
      { status: 500 }
    );
  }
}

// Update cart item or add new item
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { itemId, productId, userPackId, quantity = 1 } = await req.json();

    // If itemId is provided, update existing item
    if (itemId) {
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cart: { userId },
        },
        include: {
          product: true,
          userPack: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!cartItem) {
        return NextResponse.json(
          { error: 'آیتم مورد نظر یافت نشد' },
          { status: 404 }
        );
      }

      // بررسی موجودی بر اساس نوع آیتم
      if (cartItem.product) {
        // آیتم محصول
        if (cartItem.product.stock < quantity) {
          return NextResponse.json(
            { error: 'موجودی محصول کافی نیست' },
            { status: 400 }
          );
        }
      } else if (cartItem.userPack) {
        // آیتم پک - بررسی موجودی تمام محصولات پک
        for (const packItem of cartItem.userPack.items) {
          const requiredQuantity = packItem.quantity * quantity;
          if (packItem.product.stock < requiredQuantity) {
            return NextResponse.json(
              { error: `موجودی محصول ${packItem.product.name} کافی نیست` },
              { status: 400 }
            );
          }
        }
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });

      return NextResponse.json({ success: true });
    }

    // If productId or userPackId is provided, add or update by product/pack
    if (productId || userPackId) {
      // Get or create cart
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: { items: true },
        });
      }

      if (productId) {
        // اضافه کردن یا بروزرسانی محصول
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return NextResponse.json(
            { error: 'محصول مورد نظر یافت نشد' },
            { status: 404 }
          );
        }

        // بررسی وجود محصول در سبد خرید
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          
          if (product.stock < newQuantity) {
            return NextResponse.json(
              { error: 'موجودی محصول کافی نیست' },
              { status: 400 }
            );
          }

          // بروزرسانی تعداد
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        } else {
          if (product.stock < quantity) {
            return NextResponse.json(
              { error: 'موجودی محصول کافی نیست' },
              { status: 400 }
            );
          }

          // اضافه کردن آیتم جدید
          try {
            const newCartItem = await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: productId,
                quantity: quantity,
              },
            });
            console.log('Created product cart item in PUT:', newCartItem);
          } catch (error) {
            console.error('Error creating product cart item in PUT:', error);
            return NextResponse.json(
              { error: 'خطا در افزودن محصول به سبد خرید' },
              { status: 500 }
            );
          }
        }
      } else if (userPackId) {
        // اضافه کردن یا بروزرسانی پک
        const userPack = await prisma.userPack.findUnique({
          where: { id: userPackId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!userPack) {
          return NextResponse.json(
            { error: 'پک مورد نظر یافت نشد' },
            { status: 404 }
          );
        }

        // بررسی وجود پک در سبد خرید
        const existingItem = cart.items.find(item => item.userPackId === userPackId);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          
          // بررسی موجودی محصولات پک
          for (const packItem of userPack.items) {
            const requiredQuantity = packItem.quantity * newQuantity;
            if (packItem.product.stock < requiredQuantity) {
              return NextResponse.json(
                { error: `موجودی محصول ${packItem.product.name} کافی نیست` },
                { status: 400 }
              );
            }
          }

          // بروزرسانی تعداد
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        } else {
          // بررسی موجودی محصولات پک
          for (const packItem of userPack.items) {
            const requiredQuantity = packItem.quantity * quantity;
            if (packItem.product.stock < requiredQuantity) {
              return NextResponse.json(
                { error: `موجودی محصول ${packItem.product.name} کافی نیست` },
                { status: 400 }
              );
            }
          }

          // اضافه کردن پک جدید
          try {
            const newCartItem = await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                userPackId: userPackId,
                quantity: quantity,
              },
            });
            console.log('Created pack cart item in PUT:', newCartItem);
          } catch (error) {
            console.error('Error creating pack cart item in PUT:', error);
            return NextResponse.json(
              { error: 'خطا در افزودن پک به سبد خرید' },
              { status: 500 }
            );
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'لطفا itemId، productId یا userPackId را ارسال کنید' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی سبد خرید' },
      { status: 500 }
    );
  }
}

// Delete cart item
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { itemId } = await req.json();

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'آیتم مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'خطا در حذف از سبد خرید' },
      { status: 500 }
    );
  }
}
