import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar permissões de uma pasta ou arquivo
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "file" | "folder"
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "type e id são obrigatórios" }, { status: 400 });
    }

    if (type === "folder") {
      const permissions = await prisma.storageFolderPermission.findMany({
        where: { folderId: id },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          grantedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      const folder = await prisma.storageFolder.findUnique({
        where: { id },
        select: {
          id: true, name: true, isPublic: true,
          shareToken: true, shareExpiresAt: true,
          sharePassword: true,
          createdById: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      });

      return NextResponse.json({
        permissions,
        target: folder,
        hasShareLink: !!folder?.shareToken,
        hasPassword: !!folder?.sharePassword,
      });
    } else if (type === "file") {
      const permissions = await prisma.storageFilePermission.findMany({
        where: { fileId: id },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          grantedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      const file = await prisma.storageFile.findUnique({
        where: { id },
        select: {
          id: true, name: true, isPublic: true,
          shareToken: true, shareExpiresAt: true,
          sharePassword: true,
          createdById: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      });

      return NextResponse.json({
        permissions,
        target: file,
        hasShareLink: !!file?.shareToken,
        hasPassword: !!file?.sharePassword,
      });
    }

    return NextResponse.json({ error: "type inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao listar permissões:", error);
    return NextResponse.json({ error: "Erro ao listar permissões" }, { status: 500 });
  }
}

// POST - Adicionar permissão para um usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, userId, role, canUpload, canDelete, canShare, canDownload, expiresInDays } = body;

    if (!type || !id || !userId) {
      return NextResponse.json({ error: "type, id e userId são obrigatórios" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Definir permissões padrão baseadas no role
    const roleDefaults: Record<string, any> = {
      VIEWER: { canUpload: false, canDelete: false, canShare: false, canDownload: true },
      EDITOR: { canUpload: true, canDelete: false, canShare: false, canDownload: true },
      ADMIN: { canUpload: true, canDelete: true, canShare: true, canDownload: true },
    };
    const defaults = roleDefaults[role || "VIEWER"] || roleDefaults.VIEWER;

    let permission;

    if (type === "folder") {
      permission = await prisma.storageFolderPermission.upsert({
        where: { folderId_userId: { folderId: id, userId } },
        create: {
          folderId: id,
          userId,
          role: role || "VIEWER",
          canUpload: canUpload ?? defaults.canUpload,
          canDelete: canDelete ?? defaults.canDelete,
          canShare: canShare ?? defaults.canShare,
          canDownload: canDownload ?? defaults.canDownload,
          expiresAt,
          grantedById: session.id,
        },
        update: {
          role: role || "VIEWER",
          canUpload: canUpload ?? defaults.canUpload,
          canDelete: canDelete ?? defaults.canDelete,
          canShare: canShare ?? defaults.canShare,
          canDownload: canDownload ?? defaults.canDownload,
          expiresAt,
          grantedById: session.id,
        },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          grantedBy: { select: { id: true, name: true } },
        },
      });
    } else if (type === "file") {
      permission = await prisma.storageFilePermission.upsert({
        where: { fileId_userId: { fileId: id, userId } },
        create: {
          fileId: id,
          userId,
          role: role || "VIEWER",
          canDelete: canDelete ?? defaults.canDelete,
          canShare: canShare ?? defaults.canShare,
          canDownload: canDownload ?? defaults.canDownload,
          expiresAt,
          grantedById: session.id,
        },
        update: {
          role: role || "VIEWER",
          canDelete: canDelete ?? defaults.canDelete,
          canShare: canShare ?? defaults.canShare,
          canDownload: canDownload ?? defaults.canDownload,
          expiresAt,
          grantedById: session.id,
        },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          grantedBy: { select: { id: true, name: true } },
        },
      });
    } else {
      return NextResponse.json({ error: "type inválido" }, { status: 400 });
    }

    // Log
    await prisma.storageActivityLog.create({
      data: {
        action: "SHARE",
        fileId: type === "file" ? id : null,
        folderId: type === "folder" ? id : null,
        userId: session.id,
        userName: session.name || session.email,
        details: {
          targetUserId: userId,
          targetUserName: targetUser.name,
          role: role || "VIEWER",
        },
      },
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar permissão:", error);
    return NextResponse.json({ error: "Erro ao adicionar permissão" }, { status: 500 });
  }
}

// DELETE - Remover permissão de um usuário
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!type || !id || !userId) {
      return NextResponse.json({ error: "type, id e userId são obrigatórios" }, { status: 400 });
    }

    if (type === "folder") {
      await prisma.storageFolderPermission.deleteMany({
        where: { folderId: id, userId },
      });
    } else if (type === "file") {
      await prisma.storageFilePermission.deleteMany({
        where: { fileId: id, userId },
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
        details: { removedUserId: userId },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover permissão:", error);
    return NextResponse.json({ error: "Erro ao remover permissão" }, { status: 500 });
  }
}
