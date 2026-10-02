import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Espaços → hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .replace(/^-|-$/g, ""); // Remove hífens no início/fim
}

// POST - Gerar slugs para imóveis que não têm
export async function POST(request: NextRequest) {
  try {
    // Auth: aceita session admin OU token secreto via header
    const authToken = request.headers.get("x-admin-token");
    if (authToken !== process.env.ADMIN_SECRET_TOKEN) {
      const session = await getSession();
      if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    // Buscar imóveis sem slug
    const properties = await prisma.property.findMany({
      where: { slug: null },
      select: {
        id: true,
        code: true,
        title: true,
        condominium: { select: { name: true } },
        neighborhood: true,
      },
    });

    let updated = 0;
    let errors = 0;

    for (const prop of properties) {
      try {
        // Gerar slug: condomínio-código ou bairro-código
        const baseName = prop.condominium?.name || prop.neighborhood || "imovel";
        const slug = `${slugify(baseName)}-${prop.code.toLowerCase()}`;

        const propBeforeSlug = await prisma.property.findUnique({ where: { id: prop.id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id: prop.id },
          data: { slug },
        });
        if (propBeforeSlug) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeSlug.updatedAt} WHERE "id" = ${prop.id}`;
        updated++;
      } catch (err: any) {
        // Se slug duplicado, tentar com id parcial
        try {
          const baseName = prop.condominium?.name || prop.neighborhood || "imovel";
          const slug = `${slugify(baseName)}-${prop.code.toLowerCase()}-${prop.id.slice(-6)}`;
          const propBeforeSlug2 = await prisma.property.findUnique({ where: { id: prop.id }, select: { updatedAt: true } });
          await prisma.property.update({
            where: { id: prop.id },
            data: { slug },
          });
          if (propBeforeSlug2) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeSlug2.updatedAt} WHERE "id" = ${prop.id}`;
          updated++;
        } catch {
          errors++;
        }
      }
    }

    return NextResponse.json({
      total: properties.length,
      updated,
      errors,
      message: `${updated} slugs gerados com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao gerar slugs:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
