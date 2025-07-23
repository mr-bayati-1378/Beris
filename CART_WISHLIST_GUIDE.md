# راهنمای استفاده از سبد خرید و لیست علاقه‌مندی‌ها

این راهنما نحوه استفاده از کامپوننت‌های سبد خرید و لیست علاقه‌مندی‌ها را توضیح می‌دهد.

## کامپوننت‌های اصلی

### 1. AddToCartButton
کامپوننت دکمه افزودن به سبد خرید با قابلیت‌های زیر:

```tsx
import { AddToCartButton } from '@/components';

<AddToCartButton 
  productId={123}
  className="custom-class"
  showIcon={true}
>
  افزودن به سبد
</AddToCartButton>
```

**Props:**
- `productId`: شناسه محصول (الزامی)
- `className`: کلاس CSS اضافی
- `children`: متن دکمه
- `showIcon`: نمایش آیکن سبد خرید

### 2. AddToWishlistButton
کامپوننت دکمه افزودن/حذف از لیست علاقه‌مندی‌ها:

```tsx
import { AddToWishlistButton } from '@/components';

<AddToWishlistButton 
  productId={123}
  isInWishlist={false}
  className="custom-class"
/>
```

**Props:**
- `productId`: شناسه محصول (الزامی)
- `isInWishlist`: وضعیت اولیه محصول در لیست علاقه‌مندی‌ها
- `className`: کلاس CSS اضافی

### 3. CartItemCard
کامپوننت نمایش آیتم در سبد خرید:

```tsx
import { CartItemCard } from '@/components';

<CartItemCard
  item={cartItem}
  onUpdate={(updatedItem) => handleUpdate(updatedItem)}
  onRemove={(itemId) => handleRemove(itemId)}
/>
```

### 4. ProductCard
کامپوننت کارت محصول کامل:

```tsx
import { ProductCard } from '@/components';

<ProductCard 
  product={product}
  isInWishlist={false}
  className="custom-class"
/>
```

### 5. ProductGrid
کامپوننت گرید محصولات:

```tsx
import { ProductGrid } from '@/components';

<ProductGrid
  title="محصولات پیشنهادی"
  categoryId={123}
  limit={12}
/>
```

## API Endpoints

### Cart API (`/api/cart`)

**GET** - دریافت سبد خرید:
```javascript
const response = await fetch('/api/cart');
const data = await response.json();
// { items: [...] }
```

**POST** - افزودن به سبد خرید:
```javascript
const response = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 123,
    quantity: 1
  })
});
```

**PUT** - بروزرسانی تعداد:
```javascript
const response = await fetch('/api/cart', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemId: 456,
    quantity: 2
  })
});
```

**DELETE** - حذف از سبد خرید:
```javascript
const response = await fetch('/api/cart', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemId: 456
  })
});
```

### Wishlist API (`/api/wishlist`)

**GET** - دریافت لیست علاقه‌مندی‌ها:
```javascript
const response = await fetch('/api/wishlist');
const data = await response.json();
// { items: [...] }
```

**POST** - افزودن به لیست علاقه‌مندی‌ها:
```javascript
const response = await fetch('/api/wishlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 123
  })
});
```

**DELETE** - حذف از لیست علاقه‌مندی‌ها:
```javascript
const response = await fetch('/api/wishlist', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 123
  })
});
```

## احراز هویت

تمام API هایی که نیاز به احراز هویت دارند، از JWT token ذخیره شده در کوکی `token` استفاده می‌کنند.

## Toast Notifications

تمام عملیات موفق یا ناموفق با استفاده از `react-hot-toast` نمایش داده می‌شوند:

```tsx
import { toast } from 'react-hot-toast';

// Success
toast.success('محصول با موفقیت اضافه شد');

// Error
toast.error('خطا در افزودن محصول');
```

## مثال کامل

```tsx
'use client';

import { ProductGrid, AddToCartButton, AddToWishlistButton } from '@/components';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">محصولات</h1>
      
      <ProductGrid 
        title="محصولات جدید"
        limit={8}
      />
      
      {/* یا استفاده مستقل از کامپوننت‌ها */}
      <div className="flex gap-2 mt-4">
        <AddToCartButton productId={123}>
          افزودن به سبد
        </AddToCartButton>
        
        <AddToWishlistButton productId={123} />
      </div>
    </div>
  );
}
```

## مدل‌های پایگاه داده

### Cart & CartItem
```prisma
model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique
  items     CartItem[]
  user      User       @relation(fields: [userId], references: [id])
}

model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int
  productId Int
  quantity  Int
  cart      Cart     @relation(fields: [cartId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
}
```

### Wishlist & WishlistItem
```prisma
model Wishlist {
  id        Int           @id @default(autoincrement())
  userId    Int          @unique
  items     WishlistItem[]
  user      User         @relation(fields: [userId], references: [id])
}

model WishlistItem {
  id        Int      @id @default(autoincrement())
  wishlistId Int
  productId  Int
  wishlist   Wishlist @relation(fields: [wishlistId], references: [id])
  product    Product  @relation(fields: [productId], references: [id])
}
```

## استایل‌ها

کامپوننت‌ها از Tailwind CSS و کلاس‌های کاستوم تعریف شده در `globals.css` استفاده می‌کنند:

- `.btn`, `.btn-primary`, `.btn-outline`
- `.line-clamp-1`, `.line-clamp-2`, `.line-clamp-3`
- انیمیشن‌های کاستوم مانند `.animate-fadeIn`

همه کامپوننت‌ها responsive و RTL هستند. 