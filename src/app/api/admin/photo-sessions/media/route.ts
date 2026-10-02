import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

// GET - Listar mídias de uma sessão
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const status = searchParams.get("status");

    const where: any = {};

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (status) {
      where.status = status;
    }

    const media = await prisma.photoSessionMedia.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            property: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Erro ao listar mídias:", error);
    return NextResponse.json(
      { error: "Erro ao listar mídias" },
      { status: 500 }
    );
  }
}

// POST - Upload de mídia
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;
    const mediaType = formData.get("mediaType") as string;
    const uploadedById = formData.get("uploadedById") as string;
    const files = formData.getAll("files") as File[];

    if (!sessionId || files.length === 0) {
      return NextResponse.json(
        { error: "Sessão e arquivos são obrigatórios" },
        { status: 400 }
      );
    }

    const uploadedMedia = [];

    for (const file of files) {
      // Upload para Vercel Blob
      const blob = await put(`photo-sessions/${sessionId}/${file.name}`, file, {
        access: "public",
      });

      // Determinar tipo de mídia
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      const type = mediaType || (isVideo ? "VIDEO" : isImage ? "FOTO" : "FOTO");

      // Criar registro no banco
      const media = await prisma.photoSessionMedia.create({
        data: {
          sessionId,
          mediaType: type,
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: file.size,
          mimeType: file.type,
          status: "BRUTO",
          uploadedById,
        },
      });

      uploadedMedia.push(media);
    }

    // Registrar no histórico
    await prisma.photoSessionHistory.create({
      data: {
        sessionId,
        action: "MIDIA_ADICIONADA",
        description: `${files.length} arquivo(s) adicionado(s)`,
        metadata: {
          count: files.length,
          types: uploadedMedia.map((m) => m.mediaType),
        },
      },
    });

    return NextResponse.json({ media: uploadedMedia });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status da mídia
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedById } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const media = await prisma.photoSessionMedia.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(status === "APROVADO" && approvedById && {
          approvedById,
          approvedAt: new Date(),
        }),
      },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Erro ao atualizar mídia:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar mídia" },
      { status: 500 }
    );
  }
}

// DELETE - Remover mídia
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar mídia para pegar URL
    const media = await prisma.photoSessionMedia.findUnique({
      where: { id },
    });

    if (media) {
      // Deletar do Blob
      try {
        await del(media.fileUrl);
      } catch (e) {
        console.error("Erro ao deletar do blob:", e);
      }

      // Deletar do banco
      await prisma.photoSessionMedia.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover mídia:", error);
    return NextResponse.json(
      { error: "Erro ao remover mídia" },
      { status: 500 }
    );
  }
}
