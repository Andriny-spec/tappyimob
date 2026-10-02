// WAHA API Client
const WAHA_API_URL = process.env.WAHA_API_URL || "http://localhost:9000";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

// ─────────────────────────────────────────────────────────────────────────
// Isolamento por tenant (multi-tenant): esta instância WAHA é COMPARTILHADA
// entre vários sites/clientes diferentes. Sem isolamento, listar/gerenciar
// sessões aqui vazaria (e permitiria apagar/enviar mensagens em) sessões de
// OUTROS clientes. Toda sessão criada por este site é automaticamente
// prefixada, e qualquer leitura/escrita valida a posse antes de tocar no WAHA.
// ─────────────────────────────────────────────────────────────────────────
const WAHA_SESSION_PREFIX = (process.env.WAHA_SESSION_PREFIX || "tappy")
  .trim()
  .replace(/[^a-zA-Z0-9_-]/g, "");
// Nomes legados (criados antes do isolamento existir) que também pertencem
// a este site — configurável via env, separado por vírgula.
const WAHA_ALLOWED_SESSIONS = new Set(
  (process.env.WAHA_ALLOWED_SESSIONS || "tappy,Funil,Jake,WhatsApp")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

/** Verifica se um nome de sessão pertence a este site (tenant). */
export function isOwnedSession(name: string | null | undefined): boolean {
  if (!name) return false;
  if (WAHA_ALLOWED_SESSIONS.has(name)) return true;
  const lower = name.toLowerCase();
  const prefix = WAHA_SESSION_PREFIX.toLowerCase();
  return lower === prefix || lower.startsWith(`${prefix}_`);
}

/** Filtra uma lista de sessões (ou qualquer objeto com `.name`) só para as deste site. */
export function filterOwnedSessions<T extends { name: string }>(sessions: T[]): T[] {
  return (sessions || []).filter((s) => isOwnedSession(s.name));
}

/** Garante que um nome de sessão NOVA fique namespaced a este site. */
export function namespacedSessionName(requested: string): string {
  const clean = (requested || "").trim().replace(/\s+/g, "_");
  if (isOwnedSession(clean)) return clean;
  return `${WAHA_SESSION_PREFIX}_${clean}`;
}

interface WAHASession {
  name: string;
  status: "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED" | "STOPPED";
  me?: {
    id: string;
    pushName: string;
  };
}

interface WAHAChat {
  id: string;
  name?: string;
  timestamp?: number;
  unreadCount?: number;
  picture?: string | null;
  lastMessage?: {
    id?: string;
    body?: string;
    timestamp?: number;
    from?: string;
    fromMe?: boolean;
  };
  _chat?: any;
}

interface WAHAMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  fromMe: boolean;
  hasMedia?: boolean;
  mediaUrl?: string;
  mimetype?: string;
  filename?: string;
  caption?: string;
  // Tipos de mídia
  type?: "text" | "image" | "video" | "audio" | "ptt" | "document" | "sticker" | "location" | "contact" | "poll";
  // Dados de mídia
  media?: {
    url?: string;
    mimetype?: string;
    filename?: string;
    data?: string; // base64
  };
  // Localização
  location?: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  // Contato
  vcard?: string;
}

class WAHAClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = WAHA_API_URL;
    this.apiKey = WAHA_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.apiKey && { "X-Api-Key": this.apiKey }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WAHA API Error: ${response.status} - ${error}`);
    }

    const text = await response.text();
    if (!text || text.trim() === "") return {} as T;
    try { return JSON.parse(text); } catch { return {} as T; }
  }

  // Sessions
  async getSessions(): Promise<WAHASession[]> {
    return this.request<WAHASession[]>("/api/sessions");
  }

  async getSession(sessionId: string): Promise<WAHASession> {
    return this.request<WAHASession>(`/api/sessions/${sessionId}`);
  }

  async createSession(name: string): Promise<WAHASession> {
    return this.request<WAHASession>("/api/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        name,
        config: {
          webhooks: [],
        },
      }),
    });
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.request(`/api/sessions/${sessionId}/stop`, {
      method: "POST",
    });
  }

  async logoutSession(sessionId: string): Promise<void> {
    await this.request(`/api/${sessionId}/auth/logout`, {
      method: "POST",
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  async getQRCode(sessionId: string): Promise<{ value: string; mimetype: string }> {
    return this.request(`/api/${sessionId}/auth/qr`);
  }

  async getQRCodeImage(sessionId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/${sessionId}/auth/qr`, {
      headers: {
        ...(this.apiKey && { "X-Api-Key": this.apiKey }),
        Accept: "image/png",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get QR code image");
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  }

  // Chats
  async getChats(sessionId: string, limit = 50, offset = 0): Promise<WAHAChat[]> {
    return this.request<WAHAChat[]>(
      // WAHA 2025+ só aceita conversationTimestamp, id ou name
      `/api/${sessionId}/chats?limit=${limit}&offset=${offset}&sortBy=conversationTimestamp&sortOrder=desc`
    );
  }

  // Chats Overview - inclui picture e lastMessage
  async getChatsOverview(sessionId: string, limit = 50, offset = 0): Promise<WAHAChat[]> {
    return this.request<WAHAChat[]>(
      `/api/${sessionId}/chats/overview?limit=${limit}&offset=${offset}`
    );
  }

  async getChat(sessionId: string, chatId: string): Promise<WAHAChat> {
    return this.request<WAHAChat>(`/api/${sessionId}/chats/${chatId}`);
  }

  // Get chat picture
  async getChatPicture(sessionId: string, chatId: string): Promise<{ url: string | null }> {
    try {
      return await this.request<{ url: string | null }>(
        `/api/${sessionId}/chats/${encodeURIComponent(chatId)}/picture`
      );
    } catch {
      return { url: null };
    }
  }

  // Messages
  async getMessages(
    sessionId: string,
    chatId: string,
    limit = 50,
    downloadMedia = false
  ): Promise<WAHAMessage[]> {
    return this.request<WAHAMessage[]>(
      `/api/${sessionId}/chats/${encodeURIComponent(chatId)}/messages?limit=${limit}&downloadMedia=${downloadMedia}`
    );
  }

  // Mark messages as read
  async markAsRead(sessionId: string, chatId: string): Promise<void> {
    await this.request(`/api/${sessionId}/chats/${encodeURIComponent(chatId)}/messages/read`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  // Anti-ban: Send seen
  async sendSeen(sessionId: string, chatId: string): Promise<void> {
    try {
      await this.request(`/api/sendSeen`, {
        method: "POST",
        body: JSON.stringify({ session: sessionId, chatId }),
      });
    } catch {
      // Non-critical, ignore errors
    }
  }

  // Anti-ban: Start typing indicator
  async startTyping(sessionId: string, chatId: string): Promise<void> {
    try {
      await this.request(`/api/startTyping`, {
        method: "POST",
        body: JSON.stringify({ session: sessionId, chatId }),
      });
    } catch {
      // Non-critical, ignore errors
    }
  }

  // Anti-ban: Stop typing indicator
  async stopTyping(sessionId: string, chatId: string): Promise<void> {
    try {
      await this.request(`/api/stopTyping`, {
        method: "POST",
        body: JSON.stringify({ session: sessionId, chatId }),
      });
    } catch {
      // Non-critical, ignore errors
    }
  }

  // Helper: random delay between min and max ms
  private delay(minMs: number, maxMs: number): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Safe send: follows WAHA anti-ban best practices
  // 1. sendSeen -> 2. startTyping -> 3. random delay -> 4. stopTyping -> 5. sendText
  async sendMessageSafe(
    sessionId: string,
    chatId: string,
    text: string
  ): Promise<WAHAMessage> {
    // Step 1: Mark as seen
    await this.sendSeen(sessionId, chatId);
    await this.delay(500, 1500);

    // Step 2: Start typing
    await this.startTyping(sessionId, chatId);

    // Step 3: Wait based on message length (simulate human typing ~30-60 chars/sec)
    const typingDelay = Math.max(2000, Math.min(text.length * 50, 8000));
    await this.delay(typingDelay, typingDelay + 2000);

    // Step 4: Stop typing
    await this.stopTyping(sessionId, chatId);
    await this.delay(200, 500);

    // Step 5: Send the actual message
    return this.request<WAHAMessage>(`/api/sendText`, {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        chatId,
        text,
      }),
    });
  }

  // Safe media send: anti-ban + media (image, audio, video, document)
  async sendMediaSafe(
    sessionId: string,
    chatId: string,
    mediaUrl: string,
    mediaType: "image" | "audio" | "video" | "document",
    caption?: string
  ): Promise<WAHAMessage> {
    await this.sendSeen(sessionId, chatId);
    await this.delay(500, 1500);
    await this.startTyping(sessionId, chatId);
    await this.delay(1500, 3000);
    await this.stopTyping(sessionId, chatId);
    await this.delay(200, 500);

    switch (mediaType) {
      case "image":
        return this.sendImage(sessionId, chatId, mediaUrl, caption);
      case "audio":
        return this.sendVoice(sessionId, chatId, mediaUrl);
      case "video":
        return this.sendVideo(sessionId, chatId, mediaUrl, caption);
      case "document":
        return this.sendDocument(sessionId, chatId, mediaUrl, "documento", caption);
      default:
        return this.sendImage(sessionId, chatId, mediaUrl, caption);
    }
  }

  async sendMessage(
    sessionId: string,
    chatId: string,
    text: string
  ): Promise<WAHAMessage> {
    return this.request<WAHAMessage>(`/api/sendText`, {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        chatId,
        text,
      }),
    });
  }

  async sendImage(
    sessionId: string,
    chatId: string,
    imageUrl: string,
    caption?: string
  ): Promise<WAHAMessage> {
    return this.request<WAHAMessage>(`/api/sendImage`, {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        chatId,
        file: { url: imageUrl },
        caption,
      }),
    });
  }

  async sendVideo(
    sessionId: string,
    chatId: string,
    videoUrl: string,
    caption?: string
  ): Promise<WAHAMessage> {
    return this.request<WAHAMessage>(`/api/sendVideo`, {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        chatId,
        file: { url: videoUrl },
        caption,
      }),
    });
  }

  async sendDocument(
    sessionId: string,
    chatId: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<WAHAMessage> {
    return this.request<WAHAMessage>(`/api/sendFile`, {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        chatId,
        file: { url: documentUrl, filename },
        caption,
      }),
    });
  }

  async sendVoice(
    sessionId: string,
    chatId: string,
    audioUrl: string
  ): Promise<WAHAMessage> {
    return this.request<WAHAMessage>(`/api/sendVoice`, {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        chatId,
        file: { url: audioUrl },
      }),
    });
  }

  // Download media from message
  async downloadMedia(
    sessionId: string,
    messageId: string
  ): Promise<{ mimetype: string; data: string; filename?: string }> {
    return this.request(`/api/${sessionId}/messages/${messageId}/download`);
  }

  // Contacts
  async getContacts(sessionId: string): Promise<any[]> {
    return this.request<any[]>(`/api/${sessionId}/contacts`);
  }

  async getContactProfilePicture(
    sessionId: string,
    contactId: string
  ): Promise<string | null> {
    try {
      const response = await this.request<{ profilePictureUrl?: string }>(
        `/api/${sessionId}/contacts/${contactId}/profile-picture`
      );
      return response.profilePictureUrl || null;
    } catch {
      return null;
    }
  }

  // Check connection status
  async checkConnection(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return session.status === "WORKING";
    } catch {
      return false;
    }
  }
}

export const wahaClient = new WAHAClient();
export type { WAHASession, WAHAChat, WAHAMessage };
