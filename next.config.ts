import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Permitir todas las imágenes externas
    ],
  },
};

export default nextConfig;