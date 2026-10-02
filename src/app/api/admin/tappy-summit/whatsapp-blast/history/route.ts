import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET — Lista os últimos disparos (histórico resumido)
// Query params:
//   ?channel=whatsapp|email   (default: whatsapp)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const channelParam = req.nextUrl.searchParams.get("channel") || "whatsapp";
  const channel = channelParam === "email" ? "email" : "whatsapp";

  const blasts = await prisma.eventBlast.findMany({
    where: { channel },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      channel: true,
      sessionName: true,
      subject: true,
      message: true,
      mediaType: true,
      voiceUrl: true,
      totalRecipients: true,
      sentCount: true,
      errorCount: true,
      status: true,
      createdByName: true,
      startedAt: true,
      finishedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ blasts });
}
