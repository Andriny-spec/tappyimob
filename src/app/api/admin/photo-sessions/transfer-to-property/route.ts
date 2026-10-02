import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Transferir mídias aprovadas para a galeria do imóvel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, mediaIds } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "ID da sessão é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar sessão com mídias
    const session = await prisma.photoSession.findUnique({
      where: { id: sessionId },
      include: {
        property: true,
        media: {
          where: mediaIds?.length > 0 
            ? { id: { in: mediaIds } }
            : { status: "APROVADO" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    if (session.media.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma mídia aprovada para transferir" },
        { status: 400 }
      );
    }

    // Separar mídias por tipo
    const fotos = session.media
      .filter((m: any) => m.mediaType === "FOTO" || m.mediaType === "DRONE")
      .map((m: any) => m.fileUrl);
    
    const videos = session.media
      .filter((m: any) => m.mediaType === "VIDEO")
      .map((m: any) => m.fileUrl);

    // Buscar imóvel atual
    const property = await prisma.property.findUnique({
      where: { id: session.propertyId },
      select: { images: true, videos: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar imóvel com novas mídias (sem duplicar)
    const currentImages = property.images || [];
    const currentVideos = property.videos || [];
    
    const newImages = [...currentImages, ...fotos.filter((f: string) => !currentImages.includes(f))];
    const newVideos = [...currentVideos, ...videos.filter((v: string) => !currentVideos.includes(v))];

    // Definir thumbnail se não tiver
    const thumbnail = newImages.length > 0 && !property.images?.length 
      ? newImages[0] 
      : undefined;

    const propBeforePhoto = await prisma.property.findUnique({ where: { id: session.propertyId }, select: { updatedAt: true } });
    await prisma.property.update({
      where: { id: session.propertyId },
      data: {
        images: newImages,
        videos: newVideos,
        ...(thumbnail && { thumbnail }),
      },
    });
    // Preservar updatedAt original — transferência de fotos não altera essa data
    if (propBeforePhoto) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforePhoto.updatedAt} WHERE "id" = ${session.propertyId}`;

    // Registrar no histórico da sessão
    await prisma.photoSessionHistory.create({
      data: {
        sessionId,
        action: "MIDIA_TRANSFERIDA",
        description: `${fotos.length} foto(s) e ${videos.length} vídeo(s) transferidos para o imóvel`,
        metadata: {
          fotosCount: fotos.length,
          videosCount: videos.length,
          propertyId: session.propertyId,
        },
      },
    });

    // Atualizar status das mídias transferidas
    await prisma.photoSessionMedia.updateMany({
      where: { 
        sessionId,
        id: { in: session.media.map((m: any) => m.id) },
      },
      data: { 
        status: "APROVADO",
      },
    });

    return NextResponse.json({
      success: true,
      transferred: {
        fotos: fotos.length,
        videos: videos.length,
      },
      propertyId: session.propertyId,
    });
  } catch (error) {
    console.error("Erro ao transferir mídias:", error);
    return NextResponse.json(
      { error: "Erro ao transferir mídias" },
      { status: 500 }
    );
  }
}
