import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  eslint: {
    ignoreDuringBuilds: true, // ⛔ disable eslint saat build
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
