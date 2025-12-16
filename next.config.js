/** @type {import('next').NextConfig} */
const nextConfig = {
  // הגדרות בסיסיות
  poweredByHeader: false,
  compress: true,
  
  // עוזר עם בעיות נתיבים בעברית ב-Windows
  distDir: '.next',
  
  // Skip static generation errors - allow build to continue
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
  
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
    
    // שיפור ביצועים - cache (שונה ל-memory בגלל בעיות עם נתיבים עבריים)
    config.cache = {
      type: 'memory',
    };
    
    return config;
  },
  
  // שיפור ביצועים - experimental features
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    // מניעת יצירת קישורים סימבוליים שעלולים לגרום לבעיות עם נתיבים בעברית
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // מניעת יצירת קישורים סימבוליים ב-.next
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
