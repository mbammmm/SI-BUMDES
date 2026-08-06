/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    config.cache = false;
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("exceljs");
    }
    return config;
  },
};

module.exports = nextConfig;
