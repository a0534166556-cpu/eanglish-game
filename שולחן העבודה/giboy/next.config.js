/** @type {import('next').NextConfig} */
const nextConfig = {
  // הגדרות בסיסיות
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  
  // Skip static generation errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // הגדרות תמונות
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // הגדרות Webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
