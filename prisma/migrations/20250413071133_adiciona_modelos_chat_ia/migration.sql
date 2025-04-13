-- CreateEnum
CREATE TYPE "StatusLead" AS ENUM ('NOVO', 'CONTATO', 'INTERESSADO', 'VISITA', 'PROPOSTA', 'CONTRATO', 'FECHADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "TipoLead" AS ENUM ('COMPRADOR', 'VENDEDOR', 'LOCATARIO', 'LOCADOR', 'INVESTIDOR');

-- CreateEnum
CREATE TYPE "OrigemLead" AS ENUM ('SITE', 'SOCIAL_MEDIA', 'INDICACAO', 'PORTAL_IMOVEIS', 'LIGACAO', 'ANUNCIO', 'VISITA_ESCRITORIO', 'OUTROS');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "agendamentosRealizados" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "corretorResponsavelId" TEXT,
ADD COLUMN     "interesse" TEXT,
ADD COLUMN     "mensagensRecebidas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "orcamento" DOUBLE PRECISION,
ADD COLUMN     "origemLead" "OrigemLead",
ADD COLUMN     "prazo" TIMESTAMP(3),
ADD COLUMN     "proximoContato" TIMESTAMP(3),
ADD COLUMN     "statusLead" "StatusLead",
ADD COLUMN     "temperatura" INTEGER,
ADD COLUMN     "tipoLead" "TipoLead",
ADD COLUMN     "ultimoContato" TIMESTAMP(3),
ADD COLUMN     "visualizacoes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visualizacoesImoveis" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Lembrete" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAlerta" TIMESTAMP(3) NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" TEXT,
    "corretorId" TEXT,

    CONSTRAINT "Lembrete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interacao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" TEXT,
    "clienteId" TEXT NOT NULL,
    "corretorId" TEXT,

    CONSTRAINT "Interacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatIA" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ultimaPergunta" TEXT,
    "imobiliariaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensagemChatIA" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "remetente" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensagemChatIA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lembrete" ADD CONSTRAINT "Lembrete_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lembrete" ADD CONSTRAINT "Lembrete_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatIA" ADD CONSTRAINT "ChatIA_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "Imobiliaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensagemChatIA" ADD CONSTRAINT "MensagemChatIA_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ChatIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;
