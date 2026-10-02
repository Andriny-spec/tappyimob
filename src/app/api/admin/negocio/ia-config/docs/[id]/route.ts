import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deleteFile } from "@/lib/minio";

type Params = { params: Promise<{ id: string }> };

// DELETE — remove um documento de referência
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const doc = await prisma.juridicoIaReferencia.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await deleteFile(doc.fileKey).catch(() => { /* objeto pode já não existir */ });
  await prisma.juridicoIaReferencia.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
