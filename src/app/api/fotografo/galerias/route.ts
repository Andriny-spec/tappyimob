import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createFolder } from "@/lib/minio";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// GET — lista todas as galerias (com contagem de fotos)
export async function GET(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const galerias = await prisma.galeriaEvento.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { fotos: true } } },
  });

  return NextResponse.json({
    galerias: galerias.map((g) => ({
      id: g.id, nome: g.nome, slug: g.slug, descricao: g.descricao,
      coverUrl: g.coverUrl, isPublished: g.isPublished,
      folderKey: g.folderKey, totalFotos: g._count.fotos, createdAt: g.createdAt,
    })),
  });
}

// POST — cria uma nova galeria/evento + pasta no storage
export async function POST(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const nome = String(body.nome || "").trim();
  if (!nome) return NextResponse.json({ error: "Nome da galeria é obrigatório" }, { status: 400 });

  let slug = slugify(nome);
  if (!slug) slug = `galeria-${Date.now()}`;

  // Garantir slug único
  const existing = await prisma.galeriaEvento.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const folderKey = `galerias/${slug}`;

  // Cria a pasta no MinIO (best-effort — não bloqueia se falhar)
  await createFolder(folderKey).catch((e) => console.warn("[galerias] createFolder falhou:", e));

  const galeria = await prisma.galeriaEvento.create({
    data: {
      nome, slug, descricao: body.descricao || null,
      folderKey, uploadedById: user.userId, isPublished: true,
    },
  });

  return NextResponse.json({ galeria }, { status: 201 });
}
