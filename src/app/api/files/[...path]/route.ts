import { NextRequest, NextResponse } from "next/server";

const WAHA_API_URL = process.env.WAHA_API_URL || "http://localhost:3000";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

// Proxy para arquivos de mídia do WAHA
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join("/");
    
    // Construir URL do WAHA
    const wahaUrl = `${WAHA_API_URL}/api/files/${filePath}`;
    
    console.log("[WAHA FILES] Proxying:", wahaUrl);
    
    // Fazer request para o WAHA
    const response = await fetch(wahaUrl, {
      headers: {
        ...(WAHA_API_KEY && { "X-Api-Key": WAHA_API_KEY }),
      },
    });
    
    if (!response.ok) {
      console.error("[WAHA FILES] Error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: response.status }
      );
    }
    
    // Obter o conteúdo e headers
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();
    
    // Retornar o arquivo com os headers corretos
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[WAHA FILES] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar arquivo" },
      { status: 500 }
    );
  }
}
