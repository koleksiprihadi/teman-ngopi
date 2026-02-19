/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // PWA headers for service worker scope
  async headers() {
    return [
      {
        source: '/sw-custom.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
