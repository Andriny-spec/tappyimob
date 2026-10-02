import { NextRequest, NextResponse } from "next/server";

// Proxy para ViaCEP - evita problemas de CORS/CSP no client-side
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get("cep")?.replace(/\D/g, "");

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ erro: true, message: "CEP inválido" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 86400 }, // Cache por 24h
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return NextResponse.json({ erro: true, message: "Erro ao buscar CEP" }, { status: 500 });
  }
}
