/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as static export for Cloudflare Pages / Vercel static hosting
  // Remove or change to 'standalone' if using Node.js server on Vercel
  output: 'export',

  // Disable image optimization for static export (use <img> or next/image with unoptimized)
  images: {
    unoptimized: true,
  },

  // Trailing slash for cleaner Cloudflare Pages URLs
  trailingSlash: true,
}

module.exports = nextConfig
