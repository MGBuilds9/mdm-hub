/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
