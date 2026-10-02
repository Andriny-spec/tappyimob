import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const cardId = formData.get("cardId") as string;

    if (!file || !cardId) {
      return NextResponse.json({ error: "File e cardId são obrigatórios" }, { status: 400 });
    }

    // Upload para Vercel Blob
    const blob = await put(`tarefas/${cardId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    const attachment = {
      name: file.name,
      url: blob.url,
      type: file.type,
      size: file.size,
    };

    // Atualizar card com novo anexo
    const card = await prisma.taskCard.findUnique({
      where: { id: cardId },
      select: { attachments: true },
    });

    const currentAttachments = (card?.attachments as any[]) || [];

    await prisma.taskCard.update({
      where: { id: cardId },
      data: {
        attachments: [...currentAttachments, attachment],
      },
    });

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
