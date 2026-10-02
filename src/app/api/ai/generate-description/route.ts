import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = "Você é um corretor de imóveis experiente e redator profissional. Gere descrições persuasivas, profissionais e atraentes para anúncios de imóveis no Brasil.";

// Tenta DeepSeek primeiro
async function tryDeepSeek(prompt: string): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com/v1";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) return null;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek falhou:", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Erro DeepSeek:", error);
    return null;
  }
}

// Fallback: OpenAI GPT
async function tryOpenAI(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI falhou:", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Erro OpenAI:", error);
    return null;
  }
}

// Fallback: Grok (xAI)
async function tryGrok(prompt: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("Grok falhou:", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Erro Grok:", error);
    return null;
  }
}

// Gerar prompt baseado no tipo de descrição
function buildPrompt(type: string, propertyData: any, customPrompt?: string): string {
  if (customPrompt) return customPrompt;
  
  if (type === "condo") {
    return `Gere uma descrição profissional e atraente para o CONDOMÍNIO de um imóvel com as seguintes características:
- Tipo de imóvel: ${propertyData.type || "Apartamento"}
- Bairro: ${propertyData.neighborhood || "não informado"}
- Cidade: ${propertyData.city || "não informada"}
- Amenidades: ${propertyData.amenities?.join(", ") || "não informadas"}

Descreva as áreas comuns, infraestrutura, segurança e diferenciais do condomínio.
A descrição deve ter entre 100 e 200 palavras, ser atraente e destacar os benefícios de morar neste condomínio.
Não repita informações do imóvel em si, foque apenas no condomínio.`;
  }
  
  if (type === "exchange") {
    return `Gere uma descrição profissional para a PERMUTA aceita em um imóvel à venda com as seguintes características:
- Tipo de imóvel: ${propertyData.type || "Imóvel"}
- Categoria: ${propertyData.category === "VENDA" ? "Venda" : "Locação"}
- Valor aproximado: R$ ${propertyData.price?.toLocaleString("pt-BR") || "não informado"}
- Cidade: ${propertyData.city || "não informada"}
- Bairro: ${propertyData.neighborhood || "não informado"}

Sugira tipos de bens que poderiam ser aceitos em permuta (imóveis menores, veículos, terrenos, etc.) de forma profissional.
A descrição deve ter entre 80 e 150 palavras e ser clara sobre as possibilidades de negociação.
Comece diretamente com "Aceita permuta por..." ou "Estudo permuta por...".`;
  }
  
  // Default: descrição do imóvel
  return customPrompt || "Gere uma descrição profissional para um imóvel.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type, propertyData } = body;

    // Construir prompt baseado no tipo ou usar prompt customizado
    const finalPrompt = buildPrompt(type, propertyData, prompt);

    if (!finalPrompt) {
      return NextResponse.json(
        { error: "Prompt ou tipo é obrigatório" },
        { status: 400 }
      );
    }

    // Tenta na ordem: DeepSeek -> OpenAI -> Grok
    let description = await tryDeepSeek(finalPrompt);
    let provider = "deepseek";

    if (!description) {
      console.log("Tentando fallback OpenAI...");
      description = await tryOpenAI(finalPrompt);
      provider = "openai";
    }

    if (!description) {
      console.log("Tentando fallback Grok...");
      description = await tryGrok(finalPrompt);
      provider = "grok";
    }

    if (!description) {
      return NextResponse.json(
        { error: "Nenhum provedor de IA disponível. Verifique as API keys." },
        { status: 503 }
      );
    }

    console.log(`Descrição gerada com sucesso via ${provider}`);
    return NextResponse.json({ description, provider });
  } catch (error) {
    console.error("Erro ao gerar descrição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
