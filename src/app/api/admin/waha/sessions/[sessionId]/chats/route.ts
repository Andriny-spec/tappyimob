import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, isOwnedSession } from "@/lib/waha";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);
const WAHA_API_URL = process.env.WAHA_API_URL || "http://localhost:3000";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

// Buscar foto de perfil de um chat
async function fetchChatPicture(sessionId: string, chatId: string): Promise<string | null> {
  try {
    const url = `${WAHA_API_URL}/api/${sessionId}/chats/${encodeURIComponent(chatId)}/picture`;
    
    const res = await fetch(url, {
      headers: {
        ...(WAHA_API_KEY && { "X-Api-Key": WAHA_API_KEY }),
      },
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        // Converter para proxy local
        if (data.url.includes("/api/files/")) {
          const filesPath = data.url.split("/api/files/")[1];
          return `/api/files/${filesPath}`;
        }
        return data.url;
      }
    }
  } catch (error) {
    // Silenciar erros de foto
  }
  return null;
}

// GET - Listar chats da sessão com overview (inclui picture e lastMessage)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { sessionId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    // Teto: um pedido não pode puxar o histórico inteiro de uma vez
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50") || 50, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0") || 0, 0);
    const useOverview = searchParams.get("overview") !== "false";

    // Usar overview para ter picture e lastMessage juntos
    let chats;
    try {
      if (useOverview) {
        chats = await wahaClient.getChatsOverview(sessionId, limit, offset);
      } else {
        chats = await wahaClient.getChats(sessionId, limit, offset);
      }
    } catch (overviewError) {
      // Fallback para getChats se overview falhar. Loga o motivo: sem ele, o
      // erro que chega na tela é o do fallback e esconde a causa real.
      console.log("Overview failed, falling back to getChats:", (overviewError as Error)?.message?.slice(0, 300));
      chats = await wahaClient.getChats(sessionId, limit, offset);
    }
    
    // Debug: verificar se picture está vindo
    const chatWithPicture = chats.find((c: any) => c.picture);
    console.log("[CHATS DEBUG] Total:", chats.length, "Com picture:", chats.filter((c: any) => c.picture).length);
    if (chatWithPicture) {
      console.log("[CHATS DEBUG] Exemplo picture:", chatWithPicture.picture);
    }
    
    // Filtrar status@broadcast e grupos de sistema
    const filteredChats = chats
      .filter((chat) => {
        const chatId = typeof chat.id === "string" ? chat.id : (chat.id as any)?._serialized || "";
        return !chatId.includes("status@broadcast") && !chatId.includes("lid@");
      })
      .map((chat) => {
        const chatId = typeof chat.id === "string" ? chat.id : (chat.id as any)?._serialized || "";
        
        // Converter URL da foto para proxy local se necessário
        let picture = chat.picture || null;
        if (picture) {
          // Se é URL absoluta do WAHA, converter para proxy
          if (picture.includes("/api/files/")) {
            const filesPath = picture.split("/api/files/")[1];
            picture = `/api/files/${filesPath}`;
          } else if (picture.startsWith("http")) {
            try {
              const url = new URL(picture);
              if (url.pathname.startsWith("/api/files/")) {
                picture = url.pathname;
              }
            } catch {
              // Manter URL original
            }
          }
        }
        
        return {
          id: chatId,
          name: chat.name || chatId.split("@")[0],
          picture,
          timestamp: chat.lastMessage?.timestamp || chat.timestamp || 0,
          unreadCount: chat.unreadCount || 0,
          lastMessage: chat.lastMessage ? {
            id: chat.lastMessage.id,
            body: chat.lastMessage.body || "",
            timestamp: chat.lastMessage.timestamp,
            from: chat.lastMessage.from,
            fromMe: chat.lastMessage.fromMe,
          } : null,
        };
      })
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // NOTA: A WAHA está retornando url:null para fotos de perfil
    // Isso pode ser uma limitação da versão ou configuração
    // Por enquanto, retornamos os chats sem buscar fotos individualmente
    // As fotos aparecerão quando a WAHA começar a retorná-las no overview
    
    return NextResponse.json(filteredChats);
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar chats" },
      { status: 500 }
    );
  }
}
