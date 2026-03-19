import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    
    remotePatterns: [
      {
        // protocol: "https",
        // hostname: "recipebackend-api.azurewebsites.net",
        port: '5041',
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
    ],
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
