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
        source: '/ebooks',
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
