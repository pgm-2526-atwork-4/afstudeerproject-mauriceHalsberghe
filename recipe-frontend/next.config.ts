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
        port: process.env.NEXT_PUBLIC_API_PORT ?? "5041",
        protocol: (process.env.NEXT_PUBLIC_API_PROTOCOL as "http" | "https") ?? "http",
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME ?? "localhost",
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