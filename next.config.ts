import type { NextConfig } from "next";

// Host das fotos (MinIO): vem do .env, não do código. Assim o mesmo código
// serve qualquer instalação — cada cliente aponta MINIO_PUBLIC_URL para o seu.
function hostDoStorage(): string | null {
  try {
    return process.env.MINIO_PUBLIC_URL ? new URL(process.env.MINIO_PUBLIC_URL).hostname : null;
  } catch {
    return null;
  }
}
const HOST_STORAGE = hostDoStorage();

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  async redirects() {
    return [
      // Campanha Summit fora do ar — tudo cai na home.
      // permanent: false (307) de propósito: 308 fica em cache agressivo no
      // browser e, se a campanha voltar, quem já acessou continuaria caindo na
      // home mesmo depois de remover o redirect.
      {
        source: "/campanha-summit",
        destination: "/",
        permanent: false,
      },
      {
        source: "/campanha-summit/:path*",
        destination: "/",
        permanent: false,
      },
      // Alias antigo: aponta direto pra home pra não criar cadeia de redirect
      {
        source: "/tappysummit",
        destination: "/",
        permanent: false,
      },
      {
        source: "/tappysummit/:path*",
        destination: "/",
        permanent: false,
      },
      // Variante B da campanha (carrega o segundo Meta Pixel)
      {
        source: "/tappysummit-b",
        destination: "/",
        permanent: false,
      },
      {
        source: "/tappysummit-b/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['minio', 'puppeteer-core', '@sparticuz/chromium'],
  // Aumenta o limite do body parser para uploads de imagens (default 10MB).
  // Necessário para a galeria do fotógrafo aceitar imagens grandes.
  // @ts-expect-error - campo existe no runtime do Next 16 mas ainda não no NextConfig tipado
  middlewareClientMaxBodySize: "50mb",
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
    optimizeCss: true,
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'lucide-react',
      'date-fns',
      'recharts',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "objectstorage.sa-saopaulo-1.oraclecloud.com",
      },
      {
        protocol: "https",
        hostname: "*.oraclecloud.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "instagram.*.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "tappyimob.com.br",
      },
      ...(HOST_STORAGE && HOST_STORAGE !== "tappyimob.com.br"
        ? [{ protocol: "https" as const, hostname: HOST_STORAGE }]
        : []),
    ],
  },
};

export default nextConfig;
