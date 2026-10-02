import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { minioClient, BUCKET_NAME } from "@/lib/minio";
import { PassThrough } from "stream";

export const maxDuration = 600;
export const dynamic = "force-dynamic";

// Constrói o caminho no MinIO a partir de um folderId
async function buildFolderPath(folderId: string): Promise<string> {
  const parts: string[] = [];
  let current = await prisma.storageFolder.findUnique({
    where: { id: folderId },
    select: { name: true, parentId: true },
  });
  while (current) {
    parts.unshift(current.name);
    if (!current.parentId) break;
    current = await prisma.storageFolder.findUnique({
      where: { id: current.parentId },
      select: { name: true, parentId: true },
    });
  }
  return parts.join("/");
}

// POST — Upload de arquivo grande via streaming direto para o MinIO (sem buffer em memória)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!request.body) {
      return NextResponse.json({ error: "Corpo da requisição vazio" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "arquivo";
    const folderId = searchParams.get("folderId") || null;
    const size = parseInt(searchParams.get("size") || "0") || undefined;
    const contentType = request.headers.get("content-type") || "application/octet-stream";

    const folderPath = folderId ? await buildFolderPath(folderId) : "";
    const timestamp = Date.now();
    const cleanName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;
    const objectKey = folderPath ? `${folderPath}/${fileName}` : fileName;

    // Alimentar o PassThrough com chunks do Web ReadableStream e enviá-los pro MinIO em paralelo
    const passThrough = new PassThrough();
    const putPromise = minioClient.putObject(BUCKET_NAME, objectKey, passThrough, size, {
      "Content-Type": contentType,
    });

    const reader = request.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { passThrough.end(); break; }
        passThrough.write(value);
      }
    } catch (streamErr) {
      passThrough.destroy(streamErr as Error);
      throw streamErr;
    }

    await putPromise;

    // Registrar no banco após upload concluído
    const storageFile = await prisma.storageFile.create({
      data: {
        name,
        key: objectKey,
        size: size || 0,
        mimeType: contentType,
        folderId: folderId || null,
        createdById: session.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        folder: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(storageFile, { status: 201 });
  } catch (error) {
    console.error("Erro no streaming upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
