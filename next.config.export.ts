import type { NextConfig } from "next";

/**
 * Static export configuration — for shared hosting (cPanel) with no Node.js.
 *
 * Produces a plain folder of HTML/CSS/JS in ./out that can be uploaded to
 * public_html. Everything in Stage 1 is client-side, so nothing is lost.
 *
 * Usage:  npm run build:cpanel
 */
const nextConfig: NextConfig = {
  output: "export",
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
  // cPanel serves /menu as /menu/index.html
  trailingSlash: true,
  images: {
    // No Node image optimizer on shared hosting.
    unoptimized: true,
  },
};

export default nextConfig;
