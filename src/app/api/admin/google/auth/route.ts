import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-calendar";

// GET - Obter URL de autenticação do Google
export async function GET(request: NextRequest) {
  try {
    // Verificar se as credenciais estão configuradas
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { 
          error: "Google Calendar não configurado",
          message: "Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env",
          configured: false,
        },
        { status: 400 }
      );
    }

    const authUrl = getAuthUrl();
    
    return NextResponse.json({ 
      authUrl,
      configured: true,
    });
  } catch (error) {
    console.error("Erro ao gerar URL de autenticação:", error);
    return NextResponse.json(
      { error: "Erro ao gerar URL de autenticação" },
      { status: 500 }
    );
  }
}
