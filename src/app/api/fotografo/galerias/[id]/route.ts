import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/minio";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

// PATCH — renomear / publicar / ocultar galeria
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await verifyFotografoAccess(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data: any = {};
  if (typeof body.nome === "string" && body.nome.trim()) data.nome = body.nome.trim();
  if (typeof body.descricao === "string") data.descricao = body.descricao;
  if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;

  const galeria = await prisma.galeriaEvento.update({ where: { id }, data });
  return NextResponse.json({ galeria });
}

// DELETE — remove a galeria e todas as suas fotos (banco + storage)
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await verifyFotografoAccess(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const fotos = await prisma.tappyGalleryPhoto.findMany({
    where: { galeriaId: id },
    select: { storageKey: true },
  });

  await Promise.allSettled(fotos.map((f) => deleteFile(f.storageKey).catch(() => {})));

  // onDelete: Cascade remove as fotos do banco automaticamente
  await prisma.galeriaEvento.delete({ where: { id } });

  return NextResponse.json({ ok: true, fotosRemovidas: fotos.length });
}
