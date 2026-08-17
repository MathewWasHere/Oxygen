import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strip console.* from production bundles (keeps warn/error for diagnostics).
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Smaller client bundles: import only the icons/helpers actually used.
  experimental: {
    optimizePackageImports: ["@/components/ui"],
  },
  /**
   * The dev preview is proxied from a different origin (e2b.app), and the app is
   * also opened from a phone on the same network — allow those dev requests.
   */
  allowedDevOrigins: [
    "3000-i6e4e2mh3ngtdx0endaeu.e2b.app",
    "*.e2b.app",
    "*.e2b.dev",
    "localhost",
    "127.0.0.1",
  ],

  async headers() {
    return [
      {
        // The service worker must be allowed to control the whole origin and
        // must never be served stale.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        // Fonts are content-hashed by filename and never change in place.
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/hero/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/food/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
