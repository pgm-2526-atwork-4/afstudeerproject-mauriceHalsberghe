import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

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

export default withPWA(nextConfig);