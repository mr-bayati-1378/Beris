import './globals.css';
import './persian-styles.css';
import type { Metadata, Viewport } from 'next';
import RootLayoutClient from '@/app/RootLayoutClient';

// Yekan font configuration
const yekan = {
  variable: '--font-yekan',
  className: 'font-yekan'
};

export const metadata: Metadata = {
  title: {
    default: 'فروشگاه تجهیزات پزشکی بریس',
    template: '%s | فروشگاه بریس',
  },
  description: 'فروشگاه آنلاین تجهیزات پزشکی، مصرفی و درمانی با بهترین کیفیت و قیمت. ارسال رایگان، ضمانت اصالت کالا و پشتیبانی ۲۴ ساعته.',
  keywords: ['تجهیزات پزشکی', 'مصرفی پزشکی', 'درمان', 'سلامت', 'بریس', 'فروشگاه آنلاین'],
  authors: [{ name: 'تیم بریس' }],
  creator: 'فروشگاه بریس',
  publisher: 'فروشگاه بریس',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'فروشگاه تجهیزات پزشکی بریس',
    description: 'فروشگاه آنلاین تجهیزات پزشکی، مصرفی و درمانی با بهترین کیفیت و قیمت',
    url: 'http://localhost:3000',
    siteName: 'فروشگاه بریس',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: '/beris-logo.png',
        width: 1200,
        height: 630,
        alt: 'فروشگاه بریس',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فروشگاه تجهیزات پزشکی بریس',
    description: 'فروشگاه آنلاین تجهیزات پزشکی، مصرفی و درمانی',
    images: ['/beris-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={yekan.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/beris-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/beris-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="فروشگاه بریس" />
        <meta name="apple-mobile-web-app-title" content="بریس" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`${yekan.className} flex min-h-screen flex-col bg-gray-50 antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
