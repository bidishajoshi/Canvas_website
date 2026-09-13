/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;

