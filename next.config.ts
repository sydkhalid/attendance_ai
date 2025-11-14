/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), "canvas"];
    return config;
  },
};

module.exports = nextConfig;
