import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desabilitar a verificação de ESLint durante o build
    ignoreDuringBuilds: true
  },
  typescript: {
    // Desabilitar a verificação de TypeScript durante o build
    ignoreBuildErrors: true
  }
};

export default nextConfig;
