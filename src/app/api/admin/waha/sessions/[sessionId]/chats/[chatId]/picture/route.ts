import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, isOwnedSession } from "@/lib/waha";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; chatId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ url: null }, { status: 200 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ url: null }, { status: 200 });
  }

  try {
    const { sessionId, chatId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ url: null }, { status: 200 });
    }

    // Decodificar chatId
    const decodedChatId = decodeURIComponent(chatId);

    // Usar o método getChatPicture da lib
    const result = await wahaClient.getChatPicture(sessionId, decodedChatId);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Erro ao buscar foto de perfil:", error);
    return NextResponse.json({ url: null }, { status: 200 });
  }
}
