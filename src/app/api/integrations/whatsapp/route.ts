import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Configuração da Evolution API ou similar
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "http://localhost:8080";
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || "tappyimob";

interface SendMessageRequest {
  phone: string;
  message: string;
  type?: "text" | "image" | "document";
  mediaUrl?: string;
  fileName?: string;
}

// Formatar número de telefone para WhatsApp
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  
  // Adicionar código do país se não tiver
  if (cleaned.length === 11) {
    cleaned = "55" + cleaned;
  } else if (cleaned.length === 10) {
    cleaned = "55" + cleaned;
  }
  
  return cleaned;
}

// Enviar mensagem via Evolution API
async function sendViaEvolutionAPI(data: SendMessageRequest) {
  const phone = formatPhone(data.phone);
  
  const endpoint = data.type === "image" 
    ? `/message/sendMedia/${WHATSAPP_INSTANCE}`
    : `/message/sendText/${WHATSAPP_INSTANCE}`;

  const body = data.type === "image" 
    ? {
        number: phone,
        mediatype: "image",
        media: data.mediaUrl,
        caption: data.message,
      }
    : {
        number: phone,
        text: data.message,
      };

  const response = await fetch(`${WHATSAPP_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATSAPP_API_KEY || "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Erro ao enviar mensagem");
  }

  return response.json();
}

// Enviar mensagem via API genérica (fallback)
async function sendViaGenericAPI(data: SendMessageRequest) {
  // Implementar conforme o provedor escolhido
  console.log("Enviando mensagem:", data);
  return { success: true, message: "Mensagem enviada (modo simulação)" };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, message, type = "text", mediaUrl, fileName } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Telefone e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    let result;

    if (WHATSAPP_API_KEY) {
      // Usar Evolution API
      result = await sendViaEvolutionAPI({ phone, message, type, mediaUrl, fileName });
    } else {
      // Fallback: apenas simular
      result = await sendViaGenericAPI({ phone, message, type, mediaUrl, fileName });
    }

    return NextResponse.json({
      success: true,
      message: "Mensagem enviada com sucesso",
      data: result,
    });
  } catch (error: any) {
    console.error("Error sending WhatsApp:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}

// Verificar status da conexão
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!WHATSAPP_API_KEY) {
      return NextResponse.json({
        connected: false,
        message: "WhatsApp não configurado. Adicione WHATSAPP_API_KEY no .env",
      });
    }

    // Verificar status da instância
    const response = await fetch(
      `${WHATSAPP_API_URL}/instance/connectionState/${WHATSAPP_INSTANCE}`,
      {
        headers: {
          "apikey": WHATSAPP_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        message: "Não foi possível verificar status",
      });
    }

    const data = await response.json();

    return NextResponse.json({
      connected: data.state === "open",
      state: data.state,
      instance: WHATSAPP_INSTANCE,
    });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json({
      connected: false,
      message: "Erro ao verificar conexão",
    });
  }
}
