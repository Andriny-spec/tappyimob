import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// POST - Gerar/atualizar link de compartilhamento para pasta ou arquivo
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, password, expiresInDays, readOnly } = body;
    // type: "file" | "folder"

    if (!type || !id) {
      return NextResponse.json({ error: "type e id são obrigatórios" }, { status: 400 });
    }

    // Token curto: 8 bytes = 16 chars hex (seguro e compacto para URLs)
    const shareToken = crypto.randomBytes(8).toString("hex");
    const shareExpiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    // Hashear senha se fornecida (simples hash para links compartilhados)
    const sharePassword = password
      ? crypto.createHash("sha256").update(password).digest("hex")
      : null;

    let result;

    if (type === "folder") {
      const folder = await prisma.storageFolder.findUnique({ where: { id } });
      if (!folder) {
        return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
      }

      result = await prisma.storageFolder.update({
        where: { id },
        data: { shareToken, sharePassword, shareExpiresAt },
        select: { id: true, name: true, shareToken: true, shareExpiresAt: true },
      });
    } else if (type === "file") {
      const file = await prisma.storageFile.findUnique({ where: { id } });
      if (!file) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }

      result = await prisma.storageFile.update({
        where: { id },
        data: { shareToken, sharePassword, shareExpiresAt },
        select: { id: true, name: true, shareToken: true, shareExpiresAt: true },
      });
    } else {
      return NextResponse.json({ error: "type deve ser 'file' ou 'folder'" }, { status: 400 });
    }

    // Log de atividade
    await prisma.storageActivityLog.create({
      data: {
        action: "SHARE",
        fileId: type === "file" ? id : null,
        folderId: type === "folder" ? id : null,
        userId: session.id,
        userName: session.name || session.email,
        details: {
          shareToken,
          hasPassword: !!password,
          expiresInDays: expiresInDays || null,
        },
      },
    });

    return NextResponse.json({
      ...result,
      shareUrl: `/compartilhado/${shareToken}`,
      hasPassword: !!password,
    });
  } catch (error) {
    console.error("Erro ao compartilhar:", error);
    return NextResponse.json({ error: "Erro ao gerar link" }, { status: 500 });
  }
}

// DELETE - Revogar compartilhamento por link
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "type e id são obrigatórios" }, { status: 400 });
    }

    if (type === "folder") {
      await prisma.storageFolder.update({
        where: { id },
        data: { shareToken: null, sharePassword: null, shareExpiresAt: null },
      });
    } else if (type === "file") {
      await prisma.storageFile.update({
        where: { id },
        data: { shareToken: null, sharePassword: null, shareExpiresAt: null },
      });
    }

    // Log
    await prisma.storageActivityLog.create({
      data: {
        action: "UNSHARE",
        fileId: type === "file" ? id : null,
        folderId: type === "folder" ? id : null,
        userId: session.id,
        userName: session.name || session.email,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao revogar compartilhamento:", error);
    return NextResponse.json({ error: "Erro ao revogar" }, { status: 500 });
  }
}
