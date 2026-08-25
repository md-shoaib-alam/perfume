import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.116',
    'localhost',
    '127.0.0.1',
    '*.local',
  ],
  images: {
    // Ultra-fast next-gen image compression
    formats: ['image/avif', 'image/webp'],
    // 1 Year Image Cache for instant repeated visits
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Cache images and static media assets aggressively in browser
        source: '/(.*).(jpg|jpeg|png|webp|avif|svg|ico|mp4|mov)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
