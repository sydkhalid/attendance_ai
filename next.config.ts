/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // ❌ Disable Turbopack
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), "canvas"];
    return config;
  },
};

export default nextConfig;
