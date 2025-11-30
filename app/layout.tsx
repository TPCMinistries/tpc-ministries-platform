import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PWAProvider from "@/components/pwa/pwa-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: '#1E3A5F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: "TPC Ministries - Transforming Lives Through Christ",
    template: "%s | TPC Ministries"
  },
  description: "Join TPC Ministries in a journey of faith, growth, and purpose. Serving communities across Kenya, South Africa, and Grenada.",
  keywords: ["ministry", "faith", "discipleship", "missions", "church", "Christianity", "spiritual growth", "Bible teaching", "prayer", "assessments"],
  authors: [{ name: "TPC Ministries" }],
  creator: "TPC Ministries",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TPC Ministries',
    startupImage: [
      {
        url: '/splash/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/splash/apple-splash-1668-2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/splash/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/splash/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/splash/apple-splash-1242-2688.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/splash/apple-splash-750-1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/splash/apple-splash-1242-2208.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)'
      },
    ],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    title: "TPC Ministries - Transforming Lives Through Christ",
    description: "Join TPC Ministries in a journey of faith, growth, and purpose.",
    type: "website",
    locale: "en_US",
    siteName: "TPC Ministries",
  },
  twitter: {
    card: "summary_large_image",
    title: "TPC Ministries",
    description: "Transforming Lives Through Christ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'TPC Ministries',
    'apple-mobile-web-app-title': 'TPC Ministries',
    'msapplication-TileColor': '#1E3A5F',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#1E3A5F" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}
