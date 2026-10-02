import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "FOTOGRAFO" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      title: true,
      type: true,
      address: true,
      number: true,
      neighborhood: true,
      city: true,
      state: true,
      area: true,
      bedrooms: true,
      suites: true,
      bathrooms: true,
      parkingSpaces: true,
      status: true,
      thumbnail: true,
      images: true,
      hasProfessionalPhotos: true,
    },
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
    take: 30,
  });

  const photoHistory = logs
    .filter((log) => {
      const changes = (log.metadata as any)?.changes;
      return Array.isArray(changes) && changes.some((c: any) => c.field === "images");
    })
    .map((log) => {
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
    });

  return NextResponse.json({ property, photoHistory });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "FOTOGRAFO" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { images, thumbnail } = await request.json();

  const current = await prisma.property.findUnique({
    where: { id },
    select: { images: true, thumbnail: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
  }

  const added = (images as string[]).filter((u) => !current.images.includes(u));
  const removed = current.images.filter((u) => !(images as string[]).includes(u));

  const updated = await prisma.property.update({
    where: { id },
    data: {
      images: images as string[],
      ...(thumbnail !== undefined ? { thumbnail } : {}),
      hasProfessionalPhotos: (images as string[]).length > 0,
    },
    select: { images: true, thumbnail: true },
  });

  // Log da alteração
  if (added.length > 0 || removed.length > 0) {
    await prisma.propertyActivityLog.create({
      data: {
        propertyId: id,
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: "UPDATE",
        description: `Fotos atualizadas pelo fotógrafo: +${added.length} / -${removed.length}`,
        metadata: {
          changes: [{
            field: "images",
            oldCount: current.images.length,
            newCount: (images as string[]).length,
            added,
            removed,
          }],
        },
      },
    });
  }

  return NextResponse.json(updated);
}
