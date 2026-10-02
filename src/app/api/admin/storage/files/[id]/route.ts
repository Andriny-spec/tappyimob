import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, getFileUrl, moveFile } from "@/lib/minio";

// GET - Obter URL do arquivo ou detalhes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    const file = await prisma.storageFile.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        folder: {
          select: { id: true, name: true },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    if (download) {
      // Gerar URL de download temporária (1 hora)
      const url = await getFileUrl(file.key, 3600);
      return NextResponse.json({ url, file });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error);
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }
}

// PATCH - Atualizar metadados do arquivo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, tags, folderId, isPublic } = body;

    const existingFile = await prisma.storageFile.findUnique({
      where: { id },
    });

    if (!existingFile) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    // Se mudou de pasta, mover no MinIO também
    if (folderId !== undefined && folderId !== existingFile.folderId) {
      // Construir novo caminho
      let newPath = "";
      if (folderId) {
        const folder = await prisma.storageFolder.findUnique({
          where: { id: folderId },
          select: { name: true, parentId: true },
        });
        if (folder) {
          const pathParts = [folder.name];
          let parentId = folder.parentId;
          while (parentId) {
            const parent = await prisma.storageFolder.findUnique({
              where: { id: parentId },
              select: { name: true, parentId: true },
            });
            if (parent) {
              pathParts.unshift(parent.name);
              parentId = parent.parentId;
            } else break;
          }
          newPath = pathParts.join("/");
        }
      }

      const fileName = existingFile.key.split("/").pop();
      const newKey = newPath ? `${newPath}/${fileName}` : fileName!;

      if (newKey !== existingFile.key) {
        await moveFile(existingFile.key, newKey);
      }
    }

    const file = await prisma.storageFile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(tags && { tags }),
        ...(folderId !== undefined && { folderId }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        folder: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("Erro ao atualizar arquivo:", error);
    return NextResponse.json({ error: "Erro ao atualizar arquivo" }, { status: 500 });
  }
}

// DELETE - Excluir arquivo (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const file = await prisma.storageFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    if (permanent) {
      // Excluir permanentemente do MinIO e banco
      await deleteFile(file.key);
      await prisma.storageFile.delete({ where: { id } });
    } else {
      // Soft delete
      await prisma.storageFile.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error);
    return NextResponse.json({ error: "Erro ao excluir arquivo" }, { status: 500 });
  }
}
