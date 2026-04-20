/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['logo.clearbit.com', 'avatars.githubusercontent.com'],
  },
  // Required for mapbox-gl worker
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    };
    return config;
  },
};

module.exports = nextConfig;
