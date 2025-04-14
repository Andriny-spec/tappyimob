/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Desativar ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desativar TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Configurações experimentais
  },
  images: {
    domains: ['placehold.co']
  },
  // Ignorar pasta da lixeira e outros diretórios problemáticos
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/.git/**',
        '**/.next/**',
        '**/node_modules/**',
        '**/yarn-error.log',
        '**/.DS_Store',
        '**/.Trash/**'
      ]
    };
    return config;
  },
};

module.exports = nextConfig;
