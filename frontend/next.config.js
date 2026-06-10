/** @type {import('next').NextConfig} */

// Production validation: ensure required env vars are set
if (process.env.NODE_ENV === 'production') {
    const required = ['NEXT_PUBLIC_SITE_URL'];
    const missing = required.filter(v => !process.env[v]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required production env vars: ${missing.join(', ')}\n` +
            'Use deployment.py to generate configs.'
        );
    }
}

// Detect deployment environment
const isVercel = process.env.VERCEL === '1';
const isDocker = process.env.DOCKER === '1' || process.env.DOCKER_BUILD === 'true';

// Use standalone only for Docker, not for Vercel
const outputMode = isDocker && !isVercel ? 'standalone' : undefined;

const nextConfig = {
  reactStrictMode: true,
  ...(outputMode && { output: outputMode }),
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.R2_PUBLIC_HOSTNAME || 'uploads.heistats.com',
      },
      {
        protocol: 'https',
        hostname: '*.com',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Only proxy to external API if NEXT_PUBLIC_API_URL is set
    // Otherwise, API runs on same domain (Vercel unified deployment)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
