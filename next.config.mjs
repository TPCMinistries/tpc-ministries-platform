/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Increase timeout for static generation
  staticPageGenerationTimeout: 180,
  // Skip trailing slash redirect during build
  skipTrailingSlashRedirect: true,
  // Enable compression
  compress: true,
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // HTTP Headers for caching and security
  async headers() {
    return [
      // Cache static assets
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache Next.js static files
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Specific redirects for member routes (middleware handles these, but this is a fallback)
      {
        source: '/member/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/member/messages',
        destination: '/messages',
        permanent: true,
      },
      {
        source: '/member/prayer-wall',
        destination: '/prayer',
        permanent: true,
      },
      {
        source: '/member/my-prayers',
        destination: '/my-prayers',
        permanent: true,
      },
      {
        source: '/member/library',
        destination: '/library',
        permanent: true,
      },
      {
        source: '/member/seasons',
        destination: '/seasons',
        permanent: true,
      },
      {
        source: '/member/my-assessments',
        destination: '/my-assessments',
        permanent: true,
      },
      {
        source: '/member/profile',
        destination: '/profile',
        permanent: true,
      },
      {
        source: '/member/events',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/member/my-giving',
        destination: '/my-giving',
        permanent: true,
      },
      {
        source: '/member/giving',
        destination: '/my-giving',
        permanent: true,
      },
      {
        source: '/member/resources',
        destination: '/resources',
        permanent: true,
      },
      {
        source: '/member/member-settings',
        destination: '/member-settings',
        permanent: true,
      },
      {
        source: '/member/settings',
        destination: '/member-settings',
        permanent: true,
      },
      {
        source: '/member/account',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/member/assessments',
        destination: '/my-assessments',
        permanent: true,
      },
      {
        source: '/member/content',
        destination: '/library',
        permanent: true,
      },
      // Redirect old content pages to unified library
      {
        source: '/content',
        destination: '/library',
        permanent: false,
      },
      {
        source: '/member/give',
        destination: '/give',
        permanent: true,
      },
      // Catch-all for any other /member/* routes
      {
        source: '/member/:path*',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
