/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**'
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**'
      }
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  }
};

module.exports = nextConfig;
