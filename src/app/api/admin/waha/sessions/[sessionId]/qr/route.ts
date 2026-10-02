import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, isOwnedSession } from "@/lib/waha";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

// GET - Buscar QR Code da sessão
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
    const qrCode = await wahaClient.getQRCodeImage(sessionId);
    return NextResponse.json({ qr_code: qrCode });
  } catch (error: any) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar QR Code" },
      { status: 500 }
    );
  }
}
