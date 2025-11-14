import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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

export const metadata: Metadata = {
  title: {
    default: "TPC Ministries - Transforming Lives Through Christ",
    template: "%s | TPC Ministries"
  },
  description: "Join TPC Ministries in a journey of faith, growth, and purpose. Serving communities across Kenya, South Africa, and Grenada.",
  keywords: ["ministry", "faith", "discipleship", "missions", "church", "Christianity", "spiritual growth", "Bible teaching", "prayer", "assessments"],
  authors: [{ name: "TPC Ministries" }],
  creator: "TPC Ministries",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
