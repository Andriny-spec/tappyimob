-- CreateEnum
CREATE TYPE "StatusAgenteIA" AS ENUM ('ATIVO', 'EM_TREINAMENTO', 'DESATIVADO', 'EM_REVISAO');

-- CreateEnum
CREATE TYPE "TipoAgenteIA" AS ENUM ('VENDAS', 'ATENDIMENTO', 'CONSULTORIA', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "TomAgenteIA" AS ENUM ('FORMAL', 'INFORMAL', 'TECNICO', 'AMIGAVEL', 'DIRETO');

-- CreateEnum
CREATE TYPE "TipoIntegracao" AS ENUM ('WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'SITE', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "StatusIntegracao" AS ENUM ('ATIVA', 'CONFIGURANDO', 'PAUSADA', 'ERRO');

-- AlterTable
ALTER TABLE "ChatIA" ADD COLUMN     "agenteId" TEXT;

-- CreateTable
CREATE TABLE "AgenteIA" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipoAgente" "TipoAgenteIA" NOT NULL,
    "tom" "TomAgenteIA" NOT NULL,
    "status" "StatusAgenteIA" NOT NULL DEFAULT 'EM_TREINAMENTO',
    "promptPersonalizado" TEXT,
    "instrucoesGerais" TEXT,
    "emoji" TEXT,
    "cor" TEXT,
    "imobiliariaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgenteIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegracaoAgenteIA" (
    "id" TEXT NOT NULL,
    "tipo" "TipoIntegracao" NOT NULL,
    "nome" TEXT NOT NULL,
    "credenciais" TEXT,
    "urlWebhook" TEXT,
    "status" "StatusIntegracao" NOT NULL DEFAULT 'CONFIGURANDO',
    "configuracoes" TEXT,
    "agenteId" TEXT NOT NULL,
    "imobiliariaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegracaoAgenteIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialTreinamentoIA" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT,
    "urlArquivo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "agenteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialTreinamentoIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExemploTreinamentoIA" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "categoria" TEXT,
    "agenteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExemploTreinamentoIA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatIA" ADD CONSTRAINT "ChatIA_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "AgenteIA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgenteIA" ADD CONSTRAINT "AgenteIA_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "Imobiliaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegracaoAgenteIA" ADD CONSTRAINT "IntegracaoAgenteIA_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "AgenteIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegracaoAgenteIA" ADD CONSTRAINT "IntegracaoAgenteIA_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "Imobiliaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialTreinamentoIA" ADD CONSTRAINT "MaterialTreinamentoIA_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "AgenteIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExemploTreinamentoIA" ADD CONSTRAINT "ExemploTreinamentoIA_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "AgenteIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;
