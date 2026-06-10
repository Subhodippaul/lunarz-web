import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Google Drive direct-download images
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      // Google's image proxy / resizing CDN (used by Drive thumbnails)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.lunarz.in',
          },
        ],
        destination: 'https://lunarz.in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
