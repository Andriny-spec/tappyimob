import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/minio";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const FOLDER = "tappy-galeria";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "https://tappyimob.com.br/storage";

// GET /api/fotografo/galeria — lista fotos (filtra por ?galeriaId= se informado)
export async function GET(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const galeriaId = request.nextUrl.searchParams.get("galeriaId");
    const photos = await prisma.tappyGalleryPhoto.findMany({
      where: galeriaId ? { galeriaId } : { galeriaId: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("[fotografo/galeria] list error:", err);
    return NextResponse.json({ error: "Erro ao listar fotos" }, { status: 500 });
  }
}

// POST /api/fotografo/galeria — upload a photo (multipart)
export async function POST(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string | null) || null;
    const galeriaId = (formData.get("galeriaId") as string | null) || null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Se há galeria, usa a pasta dela; senão a pasta legado
    let targetFolder = FOLDER;
    if (galeriaId) {
      const galeria = await prisma.galeriaEvento.findUnique({ where: { id: galeriaId }, select: { folderKey: true } });
      if (galeria?.folderKey) targetFolder = galeria.folderKey;
    }
    // Aceita por mime image/* OU por extensão (HEIC/HEIF do iPhone às vezes vem com mime vazio)
    const ext = file.name.toLowerCase().split(".").pop() || "";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "avif"];
    const isImage = (file.type && file.type.startsWith("image/")) || allowedExts.includes(ext);
    if (!isImage) {
      return NextResponse.json(
        { error: `Formato não suportado (${file.type || ext || "desconhecido"})` },
        { status: 400 }
      );
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Imagem muito grande. Máximo 50MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;

    const contentType = file.type || (ext === "heic" ? "image/heic" : ext === "heif" ? "image/heif" : "application/octet-stream");
    const objectKey = await uploadFile(buffer, fileName, contentType, targetFolder);
    const publicUrl = `${MINIO_PUBLIC_URL}/${objectKey}`;

    const photo = await prisma.tappyGalleryPhoto.create({
      data: {
        url: publicUrl,
        storageKey: objectKey,
        caption,
        mimeType: contentType,
        sizeBytes: file.size,
        uploadedById: user.userId,
        galeriaId: galeriaId || null,
        isPublished: true,
      },
    });

    // Define a capa da galeria se ainda não tiver
    if (galeriaId) {
      await prisma.galeriaEvento.updateMany({
        where: { id: galeriaId, coverUrl: null },
        data: { coverUrl: publicUrl },
      });
    }

    return NextResponse.json({ photo });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fotografo/galeria] upload error:", message, err);
    return NextResponse.json({ error: `Erro ao enviar foto: ${message || "desconhecido"}` }, { status: 500 });
  }
}

// DELETE /api/fotografo/galeria — apaga TODAS as fotos
export async function DELETE(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const galeriaId = request.nextUrl.searchParams.get("galeriaId");
    const where = galeriaId ? { galeriaId } : { galeriaId: null };
    const photos = await prisma.tappyGalleryPhoto.findMany({
      where,
      select: { id: true, storageKey: true },
    });

    // Best-effort: remove arquivos do MinIO em paralelo
    await Promise.allSettled(
      photos.map((p) =>
        deleteFile(p.storageKey).catch((e) => {
          console.warn(`[fotografo/galeria] minio delete failed (${p.storageKey}):`, e);
        })
      )
    );

    const result = await prisma.tappyGalleryPhoto.deleteMany({ where });
    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (err) {
    console.error("[fotografo/galeria] delete-all error:", err);
    return NextResponse.json({ error: "Erro ao remover fotos" }, { status: 500 });
  }
}
