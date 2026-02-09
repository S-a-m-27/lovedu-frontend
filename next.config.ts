import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize images
  images: {
    unoptimized: false, // Vercel will optimize images automatically
    domains: [], // Add any external image domains if needed
  },
  // Production optimizations
  compress: true,
  // Note: SWC minification is enabled by default in Next.js 16+
};

export default nextConfig;
