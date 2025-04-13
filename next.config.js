/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Configurações experimentais
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
