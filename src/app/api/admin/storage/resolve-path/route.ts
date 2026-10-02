import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Resolve a folder path like "fotos/imoveis/CNCF00123" to a folderId
// Pass ?create=true to auto-create missing folders in the path
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get("path");
    if (!path) {
      return NextResponse.json({ error: "Path é obrigatório" }, { status: 400 });
    }

    const create = request.nextUrl.searchParams.get("create") === "true";
    const parts = path.split("/").filter(Boolean);
    let parentId: string | null = null;

    for (const part of parts) {
      const existing = await prisma.storageFolder.findFirst({
        where: { name: part, parentId, isDeleted: false },
        select: { id: true },
      });

      if (existing) {
        parentId = existing.id;
      } else if (create) {
        const created = await prisma.storageFolder.create({
          data: { name: part, parentId, createdById: session.id },
          select: { id: true },
        });
        parentId = created.id;
      } else {
        return NextResponse.json({ folderId: null, resolved: false });
      }
    }

    return NextResponse.json({ folderId: parentId, resolved: true });
  } catch (error) {
    console.error("Erro ao resolver path:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
