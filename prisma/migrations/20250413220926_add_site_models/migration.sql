-- CreateEnum
CREATE TYPE "StatusSite" AS ENUM ('RASCUNHO', 'CONSTRUCAO', 'PUBLICADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "TipoTemplate" AS ENUM ('MODERNO', 'TRADICIONAL', 'LUXO', 'MINIMALISTA', 'TECH');

-- CreateEnum
CREATE TYPE "TipoPagina" AS ENUM ('HOME', 'IMOVEIS', 'IMOVEL_SINGLE', 'SOBRE', 'CONTATO', 'FAQ', 'BLOG', 'PRIVACIDADE', 'TERMOS', 'CUSTOM');

-- CreateTable
CREATE TABLE "SiteTemplate" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoTemplate" NOT NULL DEFAULT 'MODERNO',
    "previewUrl" TEXT NOT NULL,
    "destaques" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImobiliariaSite" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "subdominio" TEXT NOT NULL,
    "dominioProprio" TEXT,
    "descricao" TEXT,
    "status" "StatusSite" NOT NULL DEFAULT 'RASCUNHO',
    "imobiliariaId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "corPrimaria" TEXT NOT NULL DEFAULT '#25D366',
    "corSecundaria" TEXT NOT NULL DEFAULT '#F8FAFC',
    "corAcentuacao" TEXT DEFAULT '#FFB800',
    "corTexto" TEXT DEFAULT '#1A202C',
    "fonteTitulos" TEXT NOT NULL DEFAULT 'Inter',
    "fonteCorpo" TEXT NOT NULL DEFAULT 'Inter',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "bannerPrincipal" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "linkedin" TEXT,
    "endereco" TEXT,
    "metaTitulo" TEXT,
    "metaDescricao" TEXT,
    "googleAnalytics" TEXT,
    "pixelFacebook" TEXT,
    "scriptExterno" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "publicadoEm" TIMESTAMP(3),

    CONSTRAINT "ImobiliariaSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImobiliariaSitePagina" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tipo" "TipoPagina" NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "exibirNoMenu" BOOLEAN NOT NULL DEFAULT true,
    "exibirNoRodape" BOOLEAN NOT NULL DEFAULT false,
    "conteudo" JSONB,
    "metaTitulo" TEXT,
    "metaDescricao" TEXT,
    "imagemShare" TEXT,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImobiliariaSitePagina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImobiliariaSiteConfig" (
    "id" TEXT NOT NULL,
    "limitePublicacoesFree" INTEGER NOT NULL DEFAULT 1,
    "maxWhitelabelPorPlano" JSONB NOT NULL,
    "dominioPadrao" TEXT NOT NULL DEFAULT 'imob.tappy.id',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImobiliariaSiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteTemplate_slug_key" ON "SiteTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ImobiliariaSite_subdominio_key" ON "ImobiliariaSite"("subdominio");

-- CreateIndex
CREATE UNIQUE INDEX "ImobiliariaSitePagina_siteId_slug_key" ON "ImobiliariaSitePagina"("siteId", "slug");

-- AddForeignKey
ALTER TABLE "ImobiliariaSite" ADD CONSTRAINT "ImobiliariaSite_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "Imobiliaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImobiliariaSite" ADD CONSTRAINT "ImobiliariaSite_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SiteTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImobiliariaSitePagina" ADD CONSTRAINT "ImobiliariaSitePagina_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "ImobiliariaSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
