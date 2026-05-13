import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['192.168.2.35'],
  },
};

export default nextConfig;
