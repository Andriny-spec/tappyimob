import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/minio";

// GET - Listar arquivos na lixeira
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [files, folders] = await Promise.all([
      prisma.storageFile.findMany({
        where: { isDeleted: true },
        orderBy: { deletedAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.storageFolder.findMany({
        where: { isDeleted: true },
        orderBy: { deletedAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ files, folders });
  } catch (error) {
    console.error("Erro ao listar lixeira:", error);
    return NextResponse.json({ error: "Erro ao listar lixeira" }, { status: 500 });
  }
}

// POST - Restaurar ou esvaziar lixeira
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { action, fileIds, folderIds } = body;

    if (action === "restore") {
      // Restaurar arquivos e pastas
      if (fileIds?.length) {
        await prisma.storageFile.updateMany({
          where: { id: { in: fileIds } },
          data: { isDeleted: false, deletedAt: null },
        });
      }
      if (folderIds?.length) {
        await prisma.storageFolder.updateMany({
          where: { id: { in: folderIds } },
          data: { isDeleted: false, deletedAt: null },
        });
      }
      return NextResponse.json({ success: true, action: "restored" });
    }

    if (action === "empty") {
      // Esvaziar lixeira permanentemente
      const deletedFiles = await prisma.storageFile.findMany({
        where: { isDeleted: true },
        select: { id: true, key: true },
      });

      // Deletar do MinIO
      for (const file of deletedFiles) {
        try {
          await deleteFile(file.key);
        } catch (e) {
          console.error(`Erro ao deletar ${file.key} do MinIO:`, e);
        }
      }

      // Deletar do banco
      await prisma.$transaction([
        prisma.storageFile.deleteMany({ where: { isDeleted: true } }),
        prisma.storageFolder.deleteMany({ where: { isDeleted: true } }),
      ]);

      return NextResponse.json({ 
        success: true, 
        action: "emptied",
        deletedCount: deletedFiles.length,
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na lixeira:", error);
    return NextResponse.json({ error: "Erro ao processar lixeira" }, { status: 500 });
  }
}
