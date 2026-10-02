import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try OpenAI first
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }
  }

  // Fallback DeepSeek
  const dsKey = process.env.DEEPSEEK_API_KEY;
  if (dsKey) {
    const baseUrl = process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com/v1";
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${dsKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }
  }

  throw new Error("Nenhuma chave de IA configurada");
}

// POST /api/admin/tappy-summit/ai-generate
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { type, context } = await req.json();

    const systemPrompt = `Você é um especialista em marketing de eventos imobiliários de alto padrão.
Escreve textos persuasivos, elegantes e com senso de urgência para o mercado de Sua Cidade e Tamboré.
O tom é profissional mas caloroso. Nunca use clichês baratos. Foque em exclusividade e pertencimento.`;

    let userPrompt = "";
    let result: Record<string, string> = {};

    if (type === "email") {
      userPrompt = `Gere um email marketing para o Tappy Summit Parceiros 2026, um evento exclusivo para corretores e imobiliárias que atuam em Sua Cidade/Tamboré.
${context ? `Contexto adicional: ${context}` : ""}

Retorne EXATAMENTE no formato JSON:
{
  "subject": "assunto do email (máx 80 chars, pode ter emoji)",
  "body": "corpo do email completo em texto simples com quebras de linha. Use {nome} para personalização. Inclua [LINK DE INSCRIÇÃO] onde quiser o botão de CTA. Máx 300 palavras."
}

Apenas o JSON, sem markdown ou explicações.`;

      const raw = await callAI(systemPrompt, userPrompt);
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } else if (type === "whatsapp") {
      userPrompt = `Gere uma mensagem de WhatsApp para o Tappy Summit Parceiros 2026, um evento exclusivo para corretores e imobiliárias em Sua Cidade/Tamboré.
${context ? `Contexto adicional: ${context}` : ""}

A mensagem deve ser informal, direta e com emojis moderados. Use {nome} para personalização.
Máx 200 palavras. Inclua data (23 de abril, 14h, Hotel Blue Tree Sua Cidade) e convite de inscrição.

Retorne apenas o texto da mensagem, sem aspas ou markdown.`;

      result.message = await callAI(systemPrompt, userPrompt);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[AI Generate]", err?.message);
    return NextResponse.json({ error: err?.message || "Erro ao gerar conteúdo" }, { status: 500 });
  }
}
