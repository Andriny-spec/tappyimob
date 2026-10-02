import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("E-mail inválido"),
  source: z.string().optional(),
});

// POST - Inscrever e-mail na newsletter (público, usado pelo footer e pelo blog)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, source: parsed.data.source || null },
    });

    return NextResponse.json({ success: true, id: subscriber.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao inscrever na newsletter:", error);
    return NextResponse.json({ error: "Erro ao processar inscrição" }, { status: 500 });
  }
}
