import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, images: true, thumbnail: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
  }

  const logs = await prisma.propertyActivityLog.findMany({
    where: {
      propertyId: id,
      metadata: { path: ["changes"], array_contains: [{ field: "images" }] },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const photoLogs = logs.filter((log) => {
    const changes = (log.metadata as any)?.changes;
    return Array.isArray(changes) && changes.some((c: any) => c.field === "images");
  });

  return NextResponse.json({
    currentImages: property.images,
    currentThumbnail: property.thumbnail,
    history: photoLogs.map((log) => {
      const change = (log.metadata as any)?.changes?.find((c: any) => c.field === "images");
      return {
        id: log.id,
        date: log.createdAt,
        userName: log.userName,
        userRole: log.userRole,
        oldCount: change?.oldCount ?? 0,
        newCount: change?.newCount ?? 0,
        added: change?.added ?? [],
        removed: change?.removed ?? [],
      };
    }),
  });
}
