import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No external image configuration needed for local images only
  webpack: (config, { isServer }) => {
    // Prevent client-side bundling of server-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
