import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/minio";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;
    const description = formData.get("description") as string | null;
    const tags = formData.get("tags") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Validar tamanho (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 500MB" },
        { status: 400 }
      );
    }

    // Preparar buffer e nome único
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;

    // Determinar pasta no MinIO
    let folderPath = "";
    if (folderId) {
      const folder = await prisma.storageFolder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, parentId: true },
      });
      if (folder) {
        // Construir caminho completo
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
          } else {
            break;
          }
        }
        folderPath = pathParts.join("/");
      }
    }

    // Upload para MinIO
    const objectKey = await uploadFile(buffer, fileName, file.type, folderPath);

    // Salvar no banco
    const storageFile = await prisma.storageFile.create({
      data: {
        name: file.name,
        key: objectKey,
        size: file.size,
        mimeType: file.type,
        folderId: folderId || null,
        description: description || null,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        createdById: session.id,
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

    return NextResponse.json(storageFile, { status: 201 });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
