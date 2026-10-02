import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, prompt } = body;

    if (!cardId || !prompt) {
      return NextResponse.json({ error: "cardId e prompt são obrigatórios" }, { status: 400 });
    }

    // Gerar checklist com IA
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em criar checklists de tarefas.
Dado uma descrição de tarefa, gere uma lista de itens específicos e acionáveis para completar a tarefa.
Responda APENAS com um JSON no formato:
{
  "title": "Título do checklist",
  "items": ["Item 1", "Item 2", "Item 3", ...]
}
Gere entre 3 e 10 itens relevantes. Seja específico e prático.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Erro ao gerar checklist" }, { status: 500 });
    }

    const generated = JSON.parse(content);

    // Criar checklist no banco
    const lastChecklist = await prisma.taskCardChecklist.findFirst({
      where: { cardId },
      orderBy: { position: "desc" },
    });

    const checklist = await prisma.taskCardChecklist.create({
      data: {
        cardId,
        title: generated.title || "Checklist",
        position: (lastChecklist?.position ?? -1) + 1,
        items: {
          create: (generated.items || []).map((text: string, index: number) => ({
            text,
            position: index,
            isCompleted: false,
          })),
        },
      },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error("Erro ao gerar checklist com IA:", error);
    return NextResponse.json({ error: "Erro ao gerar checklist" }, { status: 500 });
  }
}
