import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import InactivityGuard from "@/components/layout/InactivityGuard";
import AffonsoSignupTracker from "@/components/layout/AffonsoSignupTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "14DaysAccel Dev - Acquire Software for Your Business Under 14 Days",
    template: "%s | 14DaysAccel Dev",
  },
  description:
    "Get production-ready software systems built and delivered for your business in under 14 days. Browse our project catalogue, try before you buy, and deploy with confidence.",
  keywords: [
    "custom software development",
    "production-ready software",
    "software catalogue",
    "business software",
    "rapid software delivery",
    "software architecture",
    "AI software planning",
  ],
  metadataBase: new URL("https://14daysaccel.com"),
  openGraph: {
    title: "14DaysAccel Dev - Acquire Software for Your Business Under 14 Days",
    description:
      "Production-ready software systems built and delivered for your business in under 14 days. Browse, test, and deploy with confidence.",
    url: "https://14daysaccel.com",
    siteName: "14DaysAccel Dev",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "14DaysAccel Dev",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "14DaysAccel Dev - Acquire Software for Your Business Under 14 Days",
    description:
      "Production-ready software systems built and delivered for your business in under 14 days.",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
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
        <script
          async
          defer
          src="https://affonso.io/js/pixel.min.js"
          data-affonso="cmnhrlrmv007t12yp8mr2hqls"
          data-cookie_duration="90"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <InactivityGuard />
        <Suspense fallback={null}>
          <AffonsoSignupTracker />
        </Suspense>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Footer />
      </body>
    </html>
  );
}
