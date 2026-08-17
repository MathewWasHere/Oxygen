import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastHost } from "@/components/shell/ToastHost";
import { PWARegister } from "@/components/shell/PWARegister";
import { InstallPrompt } from "@/components/shell/InstallPrompt";
import { RESTAURANT } from "@/lib/data/catalog";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://oxygen.ir"),
  title: {
    default: "فست فود اکسیژن | سفارش آنلاین در فسا",
    template: "%s | فست فود اکسیژن",
  },
  description:
    "سفارش آنلاین مستقیم از فست فود اکسیژن در فسا. برگر، پیتزا، ساندویچ و سوخاری تازه با ارسال سریع. هر لقمه، یک نفس تازه.",
  keywords: ["فست فود اکسیژن", "اکسیژن فسا", "سفارش آنلاین غذا فسا", "پیتزا فسا", "برگر فسا"],
  applicationName: "اکسیژن",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "اکسیژن", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "فست فود اکسیژن",
    title: "فست فود اکسیژن | سفارش آنلاین",
    description: "برگر، پیتزا و سوخاری تازه اکسیژن — سفارش مستقیم، ارسال سریع در فسا.",
    images: [{ url: "/brand/oxygen-social-dark.png", width: 1080, height: 1080, alt: "فست فود اکسیژن" }],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/icon-192.png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  // Light is the default theme; ThemeProvider rewrites this meta on switch.
  themeColor: "#ffffff",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: RESTAURANT.name,
  alternateName: "OXYGEN Fast Food",
  image: "https://oxygen.ir/brand/oxygen-social-dark.png",
  servesCuisine: ["Fast Food", "Pizza", "Burger"],
  telephone: RESTAURANT.phone,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: RESTAURANT.address,
    addressLocality: RESTAURANT.city,
    addressRegion: RESTAURANT.province,
    addressCountry: "IR",
  },
  geo: { "@type": "GeoCoordinates", latitude: RESTAURANT.lat, longitude: RESTAURANT.lng },
  openingHours: "Mo-Su 11:00-01:00",
  hasMap: RESTAURANT.mapUrl,
  url: "https://oxygen.ir",
  acceptsReservations: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Applies the persisted theme before first paint — no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Fetch the two Snapp Web cuts used above the fold in parallel with
            the CSS, instead of waiting for the stylesheet to discover them.
            Regular carries body copy; Bold carries every heading/price. */}
        <link
          rel="preload"
          href="/fonts/SnappWeb2.0-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SnappWeb2.0-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-ink-950 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <StoreProvider>
            {children}
            <ToastHost />
            <PWARegister />
            <InstallPrompt />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
