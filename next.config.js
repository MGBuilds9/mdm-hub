/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Optimize webpack cache performance
    webpackBuildWorker: true,
  },
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Handle missing env vars gracefully
  env: {
    NEXT_PUBLIC_AZURE_CONFIGURED: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
      ? 'true'
      : 'false',
  },
  // Optimize webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize cache performance
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // Reduce cache size for large strings
        maxMemoryGenerations: 1,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      };
    }

    // Optimize bundle size and reduce serialization issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate vendor chunks to reduce serialization size
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000, // 244KB
          },
        },
      },
    };

    return config;
  },
};

module.exports = nextConfig;
