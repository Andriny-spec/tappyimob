import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/minio";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

export const dynamic = "force-dynamic";

// PATCH /api/fotografo/galeria/[id] — toggle publish, edit caption/sortOrder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyFotografoAccess(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const data: {
      caption?: string | null;
      isPublished?: boolean;
      sortOrder?: number;
    } = {};
    if (typeof body.caption === "string" || body.caption === null) data.caption = body.caption;
    if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

    const photo = await prisma.tappyGalleryPhoto.update({
      where: { id },
      data,
    });
    return NextResponse.json({ photo });
  } catch (err) {
    console.error("[fotografo/galeria/:id] patch error:", err);
    return NextResponse.json({ error: "Erro ao atualizar foto" }, { status: 500 });
  }
}

// DELETE /api/fotografo/galeria/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyFotografoAccess(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const photo = await prisma.tappyGalleryPhoto.findUnique({ where: { id } });
    if (!photo) return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });

    // Try to remove from MinIO (best-effort)
    try {
      await deleteFile(photo.storageKey);
    } catch (e) {
      console.warn("[fotografo/galeria/:id] minio delete failed:", e);
    }

    await prisma.tappyGalleryPhoto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[fotografo/galeria/:id] delete error:", err);
    return NextResponse.json({ error: "Erro ao remover foto" }, { status: 500 });
  }
}
