import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET - Acessar recurso compartilhado por token (rota pública)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const subfolderId = searchParams.get("folderId"); // Para navegar subpastas

    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // Tentar encontrar como pasta
    const folder = await prisma.storageFolder.findUnique({
      where: { shareToken: token },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (folder) {
      // Verificar expiração
      if (folder.shareExpiresAt && new Date() > folder.shareExpiresAt) {
        return NextResponse.json({ error: "Link expirado" }, { status: 410 });
      }

      // Verificar senha
      if (folder.sharePassword) {
        if (!password) {
          return NextResponse.json({ requiresPassword: true, type: "folder", name: folder.name }, { status: 401 });
        }
        const hashedInput = crypto.createHash("sha256").update(password).digest("hex");
        if (hashedInput !== folder.sharePassword) {
          return NextResponse.json({ error: "Senha incorreta", requiresPassword: true }, { status: 401 });
        }
      }

      // Determinar qual pasta listar (raiz compartilhada ou subpasta)
      const targetFolderId = subfolderId || folder.id;

      // Verificar se subfolder é descendente da pasta compartilhada
      if (subfolderId) {
        const isDescendant = await checkDescendant(subfolderId, folder.id);
        if (!isDescendant) {
          return NextResponse.json({ error: "Pasta não pertence ao compartilhamento" }, { status: 403 });
        }
      }

      // Listar conteúdo
      const [subfolders, files] = await Promise.all([
        prisma.storageFolder.findMany({
          where: { parentId: targetFolderId, isDeleted: false },
          orderBy: { name: "asc" },
          select: { id: true, name: true, color: true, icon: true, createdAt: true },
        }),
        prisma.storageFile.findMany({
          where: { folderId: targetFolderId, isDeleted: false },
          orderBy: { createdAt: "desc" },
          select: {
            id: true, name: true, key: true, size: true, mimeType: true,
            thumbnailKey: true, createdAt: true,
          },
        }),
      ]);

      // Gerar URLs via proxy (acessíveis pelo browser)
      const filesWithUrls = files.map((f) => ({
        ...f,
        url: `/api/storage/${f.key.split("/").map(encodeURIComponent).join("/")}`,
        thumbnailUrl: f.thumbnailKey ? `/api/storage/${f.thumbnailKey.split("/").map(encodeURIComponent).join("/")}` : null,
      }));

      // Breadcrumb dentro do compartilhamento
      const breadcrumb: any[] = [];
      if (subfolderId) {
        let current = await prisma.storageFolder.findUnique({
          where: { id: subfolderId },
          select: { id: true, name: true, parentId: true },
        });
        while (current && current.id !== folder.id) {
          breadcrumb.unshift({ id: current.id, name: current.name });
          if (current.parentId) {
            current = await prisma.storageFolder.findUnique({
              where: { id: current.parentId },
              select: { id: true, name: true, parentId: true },
            });
          } else {
            current = null;
          }
        }
        breadcrumb.unshift({ id: folder.id, name: folder.name });
      }

      // Log de acesso
      await prisma.storageActivityLog.create({
        data: {
          action: "VIEW",
          folderId: targetFolderId,
          details: { viaShareLink: true, token },
        },
      });

      return NextResponse.json({
        type: "folder",
        name: folder.name,
        sharedBy: folder.createdBy,
        expiresAt: folder.shareExpiresAt,
        rootFolderId: folder.id,
        currentFolderId: targetFolderId,
        breadcrumb,
        folders: subfolders,
        files: filesWithUrls,
      });
    }

    // Tentar encontrar como arquivo
    const file = await prisma.storageFile.findUnique({
      where: { shareToken: token },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (file) {
      // Verificar expiração
      if (file.shareExpiresAt && new Date() > file.shareExpiresAt) {
        return NextResponse.json({ error: "Link expirado" }, { status: 410 });
      }

      // Verificar senha
      if (file.sharePassword) {
        if (!password) {
          return NextResponse.json({ requiresPassword: true, type: "file", name: file.name }, { status: 401 });
        }
        const hashedInput = crypto.createHash("sha256").update(password).digest("hex");
        if (hashedInput !== file.sharePassword) {
          return NextResponse.json({ error: "Senha incorreta", requiresPassword: true }, { status: 401 });
        }
      }

      const url = `/api/storage/${file.key.split("/").map(encodeURIComponent).join("/")}`;
      const thumbnailUrl = file.thumbnailKey ? `/api/storage/${file.thumbnailKey.split("/").map(encodeURIComponent).join("/")}` : null;

      // Log
      await prisma.storageActivityLog.create({
        data: {
          action: "VIEW",
          fileId: file.id,
          details: { viaShareLink: true, token },
        },
      });

      return NextResponse.json({
        type: "file",
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        url,
        thumbnailUrl,
        sharedBy: file.createdBy,
        expiresAt: file.shareExpiresAt,
        createdAt: file.createdAt,
      });
    }

    return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
  } catch (error) {
    console.error("Erro ao acessar compartilhamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Verificar se folderId é descendente de ancestorId
async function checkDescendant(folderId: string, ancestorId: string): Promise<boolean> {
  let currentId: string | null = folderId;
  let depth = 0;
  while (currentId && depth < 20) {
    if (currentId === ancestorId) return true;
    const f: { parentId: string | null } | null = await prisma.storageFolder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    currentId = f?.parentId ?? null;
    depth++;
  }
  return false;
}
