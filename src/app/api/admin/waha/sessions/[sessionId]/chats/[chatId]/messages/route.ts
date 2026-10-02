import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, isOwnedSession } from "@/lib/waha";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);
const WAHA_API_URL = process.env.WAHA_API_URL || "http://localhost:3000";

// GET - Listar mensagens do chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; chatId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { sessionId, chatId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    // Teto: um pedido não pode puxar o histórico inteiro de uma vez
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50") || 50, 1), 100);
    const downloadMedia = searchParams.get("downloadMedia") === "true";

    // Decodificar chatId se necessário (pode vir encoded da URL)
    const decodedChatId = decodeURIComponent(chatId);
    
    const messages = await wahaClient.getMessages(sessionId, decodedChatId, limit, downloadMedia);
    
    // Debug: Log primeira mensagem com mídia para ver estrutura
    const msgWithMedia = messages.find((m: any) => m.hasMedia);
    if (msgWithMedia) {
      console.log("[WAHA DEBUG] Mensagem com mídia:", JSON.stringify({
        id: msgWithMedia.id,
        type: msgWithMedia.type,
        hasMedia: msgWithMedia.hasMedia,
        mediaUrl: msgWithMedia.mediaUrl,
        mimetype: msgWithMedia.mimetype,
        media: msgWithMedia.media ? Object.keys(msgWithMedia.media) : null,
        _data: msgWithMedia._data ? Object.keys(msgWithMedia._data) : null,
      }, null, 2));
    }
    
    // Normalizar resposta com todos os campos de mídia
    // A WAHA pode retornar dados em diferentes formatos dependendo da versão
    const normalizedMessages = messages.map((msg: any) => {
      // Detectar tipo de mensagem
      let type = msg.type || "text";
      
      // WAHA pode usar _data ou media para dados de mídia
      const mediaData = msg.media || msg._data || {};
      
      // Verificar hasMedia e tentar detectar tipo
      if (msg.hasMedia) {
        const mimetype = msg.mimetype || mediaData.mimetype || "";
        if (mimetype.startsWith("image/") || msg.type === "image") type = "image";
        else if (mimetype.startsWith("video/") || msg.type === "video") type = "video";
        else if (mimetype.startsWith("audio/") || mimetype.includes("ogg") || msg.type === "audio" || msg.type === "ptt") type = msg.type === "ptt" ? "ptt" : "audio";
        else if (mimetype.includes("pdf") || mimetype.includes("document") || msg.type === "document") type = "document";
        else if (msg.type === "sticker") type = "sticker";
      }
      
      // Verificar outros tipos
      if (msg.location) type = "location";
      if (msg.vcard) type = "contact";
      
      // Construir URL de mídia
      let mediaUrl = msg.mediaUrl || mediaData.url || null;
      
      // Se a URL é relativa ou aponta para o WAHA, converter para proxy local
      if (mediaUrl) {
        // Se é URL relativa (começa com /api/files)
        if (mediaUrl.startsWith("/api/files")) {
          // Já está no formato correto para o proxy
        }
        // Se é URL absoluta do WAHA, converter para proxy
        else if (mediaUrl.includes("/api/files/")) {
          const filesPath = mediaUrl.split("/api/files/")[1];
          mediaUrl = `/api/files/${filesPath}`;
        }
        // Se é URL completa do WAHA sem /api/files, tentar extrair
        else if (mediaUrl.startsWith("http")) {
          try {
            const url = new URL(mediaUrl);
            if (url.pathname.startsWith("/api/files/")) {
              mediaUrl = url.pathname;
            }
          } catch {
            // Manter URL original se não conseguir parsear
          }
        }
      }
      
      // Se tem mídia mas não tem URL, pode ser base64
      if (msg.hasMedia && !mediaUrl && mediaData.data) {
        const mimetype = msg.mimetype || mediaData.mimetype || "application/octet-stream";
        mediaUrl = `data:${mimetype};base64,${mediaData.data}`;
      }
      
      return {
        id: msg.id,
        body: msg.body || "",
        from: msg.from,
        to: msg.to,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia || false,
        mediaUrl,
        // Tipo de mensagem
        type,
        // Dados de mídia
        mimetype: msg.mimetype || mediaData.mimetype || null,
        filename: msg.filename || mediaData.filename || null,
        caption: msg.caption || null,
        media: mediaData.url ? mediaData : null,
        // Localização
        location: msg.location || null,
        // Contato
        vcard: msg.vcard || null,
        // Status
        ack: msg.ack,
        ackName: msg.ackName,
      };
    });
    
    return NextResponse.json(normalizedMessages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar mensagens" },
      { status: 500 }
    );
  }
}

// POST - Enviar mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; chatId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { sessionId, chatId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Texto da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    // Decodificar chatId
    const decodedChatId = decodeURIComponent(chatId);
    
    const message = await wahaClient.sendMessage(sessionId, decodedChatId, text);
    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}
