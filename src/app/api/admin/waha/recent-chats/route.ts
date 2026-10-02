import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, filterOwnedSessions } from "@/lib/waha";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ chats: [], connected: false }, { status: 401 });

    // Buscar sessões ativas — SÓ as deste site (instância WAHA é compartilhada)
    const allSessions = await wahaClient.getSessions();
    const sessions = filterOwnedSessions(allSessions);
    const workingSession = sessions.find((s) => s.status === "WORKING");

    if (!workingSession) {
      return NextResponse.json({ chats: [], connected: false });
    }

    // Buscar últimos chats com overview (inclui lastMessage)
    const chats = await wahaClient.getChatsOverview(workingSession.name, 10, 0);

    // Filtrar apenas chats individuais (não grupos) e com mensagem recente
    const recentChats = chats
      .filter((chat) => !chat.id.includes("@g.us") && chat.lastMessage?.body)
      .slice(0, 8)
      .map((chat) => ({
        id: chat.id,
        name: chat.name || chat.id.replace("@c.us", ""),
        message: chat.lastMessage?.body || "",
        fromMe: chat.lastMessage?.fromMe || false,
        timestamp: chat.lastMessage?.timestamp || chat.timestamp || 0,
        unread: (chat.unreadCount || 0) > 0,
        unreadCount: chat.unreadCount || 0,
      }));

    const totalUnread = recentChats.reduce((sum, c) => sum + c.unreadCount, 0);

    return NextResponse.json({
      chats: recentChats,
      connected: true,
      totalUnread,
      sessionId: workingSession.name,
    });
  } catch (error) {
    console.error("Erro ao buscar chats recentes:", error);
    return NextResponse.json({ chats: [], connected: false, error: "Falha ao conectar com WAHA" });
  }
}
