import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "FOTOGRAFO" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  if (folderId) {
    // Verificar se tem permissão para esta pasta
    const permission = await prisma.storageFolderPermission.findFirst({
      where: { folderId, userId: session.id },
      select: { canDownload: true, canUpload: true },
    });

    // Admin sempre tem acesso
    const hasAccess = session.role === "ADMIN" || !!permission;
    if (!hasAccess) {
      return NextResponse.json({ error: "Sem permissão para esta pasta" }, { status: 403 });
    }

    const files = await prisma.storageFile.findMany({
      where: { folderId, isDeleted: false },
      select: {
        id: true,
        name: true,
        key: true,
        size: true,
        mimeType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        url: `/api/storage/${f.key}`,
        mimeType: f.mimeType,
        sizeBytes: f.size,
        storageKey: f.key,
      })),
    });
  }

  // Listar pastas com permissão
  if (session.role === "ADMIN") {
    const folders = await prisma.storageFolder.findMany({
      where: { isDeleted: false, parentId: null },
      select: {
        id: true,
        name: true,
        color: true,
        _count: { select: { files: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        color: f.color,
        canUpload: true,
        filesCount: f._count.files,
      })),
    });
  }

  const permissions = await prisma.storageFolderPermission.findMany({
    where: { userId: session.id },
    select: {
      canUpload: true,
      folder: {
        select: {
          id: true,
          name: true,
          color: true,
          isDeleted: true,
          _count: { select: { files: true } },
        },
      },
    },
  });

  const folders = permissions
    .filter((p) => !p.folder.isDeleted)
    .map((p) => ({
      id: p.folder.id,
      name: p.folder.name,
      color: p.folder.color,
      canUpload: p.canUpload,
      filesCount: p.folder._count.files,
    }));

  return NextResponse.json({ folders });
}
