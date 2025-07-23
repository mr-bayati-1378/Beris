import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-roles';
import prisma from '@/lib/prisma';

// دریافت اعلانات بر اساس نقش ادمین
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || admin.adminRole?.name || 'admin';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // نوتیفیکیشن‌های مربوط به نقش
    let notifications: any[] = [];

    // نوتیفیکیشن‌های نمونه بر اساس نقش
    if (role === 'finance') {
      notifications = [
        {
          id: 1,
          type: 'message',
          title: 'اطلاعیه مهم از مدیر کل',
          message: 'لطفا گزارش‌های مالی ماهانه را تا پایان هفته آماده کنید و ارسال نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30',
          targetRole: 'finance'
        },
        {
          id: 2,
          type: 'payment',
          title: 'هشدار پرداخت معوقه',
          message: 'پرداخت فاکتور شماره INV-2024-001 از تاریخ سررسید گذشته است. مبلغ: 5,000,000 تومان',
          isRead: false,
          priority: 'urgent',
          createdAt: '1403/01/15 12:15',
          actionUrl: '/admin-finance/invoices/001',
          targetRole: 'finance'
        },
        {
          id: 3,
          type: 'invoice',
          title: 'فاکتور جدید ثبت شد',
          message: 'فاکتور جدید به مبلغ 2,500,000 تومان برای مشتری آقای احمدی ثبت گردید.',
          isRead: true,
          priority: 'medium',
          createdAt: '1403/01/15 10:45',
          actionUrl: '/admin-finance/invoices/002',
          targetRole: 'finance'
        },
        {
          id: 4,
          type: 'financial',
          title: 'گزارش درآمد هفتگی',
          message: 'درآمد این هفته نسبت به هفته گذشته 15% افزایش یافته است. کل درآمد: 45,000,000 تومان',
          isRead: false,
          priority: 'low',
          createdAt: '1403/01/14 18:00',
          actionUrl: '/admin-finance/reports',
          targetRole: 'finance'
        },
        {
          id: 5,
          type: 'alert',
          title: 'هشدار بودجه',
          message: 'هزینه‌های این ماه به 80% بودجه تخصیص یافته رسیده است. لطفا کنترل کنید.',
          isRead: false,
          priority: 'medium',
          createdAt: '1403/01/14 16:30',
          targetRole: 'finance'
        }
      ];
    } else if (role === 'supply') {
      notifications = [
        {
          id: 1,
          type: 'message',
          title: 'اطلاعیه مهم از مدیر کل',
          message: 'لطفا فهرست محصولات کم‌موجود را تهیه کرده و سفارش خرید جدید ثبت نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30',
          targetRole: 'supply'
        },
        {
          id: 2,
          type: 'inventory',
          title: 'هشدار کمبود موجودی',
          message: 'موجودی محصول "ماسک سه‌لایه" به کمتر از 50 عدد رسیده است. نیاز به سفارش فوری.',
          isRead: false,
          priority: 'urgent',
          createdAt: '1403/01/15 12:15',
          actionUrl: '/admin-supply/inventory',
          targetRole: 'supply'
        },
        {
          id: 3,
          type: 'supplier',
          title: 'تامین‌کننده جدید تایید شد',
          message: 'شرکت پخش دارویی سپهر به عنوان تامین‌کننده جدید تایید و فعال گردید.',
          isRead: true,
          priority: 'medium',
          createdAt: '1403/01/15 10:45',
          actionUrl: '/admin-supply/suppliers',
          targetRole: 'supply'
        },
        {
          id: 4,
          type: 'purchase',
          title: 'سفارش خرید تایید شد',
          message: 'سفارش خرید شماره PO-2024-001 به مبلغ 15,000,000 تومان تایید و ارسال شد.',
          isRead: false,
          priority: 'low',
          createdAt: '1403/01/14 18:00',
          actionUrl: '/admin-supply/purchase-orders',
          targetRole: 'supply'
        },
        {
          id: 5,
          type: 'alert',
          title: 'تاخیر در تحویل',
          message: 'سفارش خرید PO-2024-002 از تاریخ تحویل مقرر تاخیر داشته است. لطفا پیگیری کنید.',
          isRead: false,
          priority: 'medium',
          createdAt: '1403/01/14 16:30',
          targetRole: 'supply'
        }
      ];
    } else if (role === 'warehouse') {
      notifications = [
        {
          id: 1,
          type: 'message',
          title: 'اطلاعیه مهم از مدیر کل',
          message: 'لطفا گزارش موجودی انبار را به‌روزرسانی کرده و محصولات منقضی شده را شناسایی نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30',
          targetRole: 'warehouse'
        },
        {
          id: 2,
          type: 'inventory',
          title: 'هشدار موجودی پایین',
          message: 'موجودی محصول "دستکش یکبار مصرف" به کمتر از 100 جعبه رسیده است.',
          isRead: false,
          priority: 'urgent',
          createdAt: '1403/01/15 12:15',
          actionUrl: '/admin-warehouse/inventory',
          targetRole: 'warehouse'
        },
        {
          id: 3,
          type: 'shipping',
          title: 'سفارش آماده ارسال',
          message: 'سفارش شماره ORD-2024-150 بسته‌بندی شده و آماده ارسال می‌باشد.',
          isRead: true,
          priority: 'medium',
          createdAt: '1403/01/15 10:45',
          actionUrl: '/admin-warehouse/orders',
          targetRole: 'warehouse'
        },
        {
          id: 4,
          type: 'product',
          title: 'محصول جدید اضافه شد',
          message: 'محصول "ترمومتر دیجیتال" به فهرست محصولات انبار اضافه گردید.',
          isRead: false,
          priority: 'low',
          createdAt: '1403/01/14 18:00',
          actionUrl: '/admin-warehouse/products',
          targetRole: 'warehouse'
        },
        {
          id: 5,
          type: 'alert',
          title: 'هشدار انقضا',
          message: 'تاریخ انقضای 12 محصول در انبار به اتمام رسیده است. لطفا بررسی کنید.',
          isRead: false,
          priority: 'medium',
          createdAt: '1403/01/14 16:30',
          targetRole: 'warehouse'
        }
      ];
    } else if (role === 'sales') {
      // استفاده از نوتیفیکیشن‌های موجود فروش
      notifications = [
        {
          id: 1,
          type: 'message',
          title: 'اطلاعیه مهم از مدیر کل',
          message: 'لطفا گزارش فروش هفتگی را آماده کرده و ارسال نمایید.',
          sender: 'مدیر کل',
          isRead: false,
          priority: 'high',
          createdAt: '1403/01/15 14:30',
          targetRole: 'sales'
        },
        {
          id: 2,
          type: 'order',
          title: 'سفارش جدید ثبت شد',
          message: 'سفارش جدید از مشتری آقای رضایی به مبلغ 3,500,000 تومان ثبت گردید.',
          isRead: false,
          priority: 'medium',
          createdAt: '1403/01/15 12:15',
          actionUrl: '/admin-sales/orders',
          targetRole: 'sales'
        }
      ];
    }

    // فیلتر بر اساس صفحه‌بندی
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        total: notifications.length,
        pages: Math.ceil(notifications.length / limit),
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اعلانات' },
      { status: 500 }
    );
  }
}

// ارسال نوتیفیکیشن جدید (برای مدیر کل)
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    // فقط مدیر کل می‌تواند نوتیفیکیشن ارسال کند
    if (admin.adminRole?.name !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیر مجاز' }, { status: 403 });
    }

    const { 
      title, 
      message, 
      type = 'message', 
      priority = 'medium',
      targetRoles = [], // آرایه‌ای از نقش‌ها: ['finance', 'supply', 'warehouse', 'sales']
      actionUrl 
    } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'عنوان و متن پیام الزامی است' },
        { status: 400 }
      );
    }

    // در آینده می‌توان اینجا نوتیفیکیشن را در دیتابیس ذخیره کرد
    // await prisma.adminNotification.create({
    //   data: {
    //     title,
    //     message,
    //     type,
    //     priority,
    //     targetRoles,
    //     actionUrl,
    //     senderId: admin.id,
    //     createdAt: new Date()
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'نوتیفیکیشن با موفقیت ارسال شد'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال نوتیفیکیشن' },
      { status: 500 }
    );
  }
} 