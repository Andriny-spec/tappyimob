import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { requireTappyIAAccess } from "@/lib/tappy-ia-auth";
import { uploadFile } from "@/lib/minio";
import { TOOL_DEFINITIONS, type ToolContext } from "@/lib/tappy-ia-tools";
import { TOOL_HANDLERS } from "@/lib/tappy-ia-handlers";
import { ANALYTICS_DEFINITIONS, ANALYTICS_HANDLERS } from "@/lib/tappy-ia-analytics";
import { montarPrompt } from "@/lib/tappy-ia-prompt";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "https://tappyimob.com.br/storage";

/** Modelo de texto. Configurável para trocar sem deploy de código. */
const MODELO = process.env.TAPPY_IA_MODEL || "gpt-5.4-mini";
/** Quantas rodadas de consulta a IA pode encadear numa pergunta. */
const MAX_RODADAS = 6;
/** Resultado de ferramenta maior que isso é cortado — protege o contexto. */
const MAX_CHARS_RESULTADO = 24_000;

/**
 * Versão falada da resposta: sem marcação, sem links e curta. O texto
 * completo continua na tela; o áudio lê o essencial.
 */
function textoParaFala(texto: string) {
  let t = texto
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\*\*|__|`|#+ /g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (t.length > 900) {
    const corte = t.lastIndexOf(".", 900);
    t = t.slice(0, corte > 300 ? corte + 1 : 900) + " Os detalhes completos estão na tela.";
  }
  return t || "Pronto.";
}

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  ...TOOL_DEFINITIONS,
  ...ANALYTICS_DEFINITIONS,
  {
    type: "function",
    function: {
      name: "get_property_photos",
      description:
        "Busca as fotos de um imóvel pelo código (ex: AP-1234) ou parte do nome/título. Use quando o usuário pedir para ver as fotos de um imóvel específico.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Código do imóvel (ex: AP-1234) ou parte do nome/título para busca.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_image",
      description:
        "Edita/modifica uma imagem que o usuário anexou. Use quando o usuário enviar uma imagem E pedir para alterar, melhorar, recriar, mudar estilo, remover/adicionar elementos, etc.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Descrição detalhada em inglês das alterações desejadas na imagem.",
          },
          size: {
            type: "string",
            enum: ["1024x1024", "1024x1536", "1536x1024"],
            description: "Tamanho da imagem resultante. Padrão 1024x1024.",
          },
          quality: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Qualidade. Padrão medium.",
          },
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_image",
      description:
        "Gera uma imagem/arte a partir de uma descrição. Use quando o usuário pedir para criar conteúdo visual SEM ter enviado uma imagem base.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description:
              "Descrição detalhada da imagem a ser gerada, preferencialmente em inglês, com estilo, composição, iluminação e elementos visuais.",
          },
          size: {
            type: "string",
            enum: ["1024x1024", "1024x1536", "1536x1024"],
            description:
              "Formato: 1024x1024 (quadrada), 1024x1536 (retrato/vertical), 1536x1024 (paisagem/horizontal). Padrão 1024x1024.",
          },
          quality: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Qualidade da geração. Padrão medium.",
          },
        },
        required: ["prompt"],
      },
    },
  },
];

async function runImageGeneration(args: {
  prompt: string;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "low" | "medium" | "high";
}) {
  const { prompt, size = "1024x1024", quality = "medium" } = args;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUnavailable = (err: any) => err?.status === 403 || err?.status === 404;

  try {
    const result = await openai.images.generate({ model: "gpt-image-2", prompt, size, quality, n: 1 });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("Imagem não retornada pela API");
    return { b64, size, model: "gpt-image-2" as const };
  } catch (err) {
    if (!isUnavailable(err)) throw err;
  }

  try {
    const result = await openai.images.generate({ model: "gpt-image-1", prompt, size, quality, n: 1 });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("Imagem não retornada pela API");
    return { b64, size, model: "gpt-image-1" as const };
  } catch (err) {
    if (!isUnavailable(err)) throw err;
  }

  const dalleSize: "1024x1024" | "1792x1024" | "1024x1792" =
    size === "1536x1024" ? "1792x1024" :
    size === "1024x1536" ? "1024x1792" :
    "1024x1024";

  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: dalleSize,
    quality: quality === "high" ? "hd" : "standard",
    response_format: "b64_json",
    n: 1,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("Imagem não retornada pela API");
  return { b64, size: dalleSize, model: "dall-e-3" as const };
}

async function runImageEdit(args: {
  prompt: string;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "low" | "medium" | "high";
  imageDataUrl: string;
}) {
  const { prompt, size = "1024x1024", quality = "medium", imageDataUrl } = args;

  // Converte dataUrl em File para a API
  const base64 = imageDataUrl.split(",")[1];
  const mimeType = imageDataUrl.split(";")[0].split(":")[1] || "image/png";
  const buffer = Buffer.from(base64, "base64");
  const imageFile = new File([buffer], "image.png", { type: mimeType });

  const result = await openai.images.edit({
    model: "gpt-image-2",
    image: imageFile,
    prompt,
    n: 1,
    size,
  } as Parameters<typeof openai.images.edit>[0]);

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("Imagem editada não retornada pela API");
  return { b64, size, model: "gpt-image-2" as const };
}

// Gera um título curto a partir da primeira mensagem do user (máx 60 chars)
function buildTitleFromTranscript(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 60) return clean;
  return clean.slice(0, 57).trimEnd() + "...";
}

export async function POST(request: NextRequest) {
  const auth = await requireTappyIAAccess();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const contentType = request.headers.get("content-type") || "";
    let transcript = "";
    let conversationId: string | null = null;
    let attachments: { dataUrl: string; mimeType: string; name?: string }[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      transcript = (body.text || "").trim();
      conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
      if (Array.isArray(body.attachments)) {
        attachments = body.attachments
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a && typeof a.dataUrl === "string" && a.dataUrl.startsWith("data:image/"))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .slice(0, 4)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => ({
            dataUrl: a.dataUrl,
            mimeType: a.mimeType || "image/png",
            name: typeof a.name === "string" ? a.name : undefined,
          }));
      }
      if (!transcript && attachments.length === 0) {
        return NextResponse.json({ error: "Texto ou anexo não recebido" }, { status: 400 });
      }
      if (!transcript) transcript = "(imagem anexada)";
    } else {
      const formData = await request.formData();
      const audio = formData.get("audio") as File | null;
      conversationId = (formData.get("conversationId") as string | null) || null;
      if (!audio) return NextResponse.json({ error: "Áudio não recebido" }, { status: 400 });

      const transcription = await openai.audio.transcriptions.create({
        file: audio,
        model: "whisper-1",
        language: "pt",
      });
      transcript = transcription.text?.trim() || "";
      if (!transcript) return NextResponse.json({ error: "Nenhuma fala detectada" }, { status: 422 });
    }

    // Garante conversa (cria se não veio id) + pega histórico recente para contexto
    let conversation = conversationId
      ? await prisma.tappyIAConversation.findFirst({
          where: { id: conversationId, userId: auth.user.id },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              take: 20,
              select: { role: true, content: true },
            },
          },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.tappyIAConversation.create({
        data: {
          userId: auth.user.id,
          title: buildTitleFromTranscript(transcript),
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 0,
            select: { role: true, content: true },
          },
        },
      });
    }

    // Monta contexto para o GPT (histórico + nova mensagem)
    const history: OpenAI.Chat.ChatCompletionMessageParam[] = (conversation.messages || []).map((m) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
      content: m.content,
    }));
    // Se houver anexos de imagem, monta content multimodal (GPT-4o vision)
    const userContent: OpenAI.Chat.ChatCompletionContentPart[] =
      attachments.length > 0
        ? [
            { type: "text", text: transcript },
            ...attachments.map((a) => ({
              type: "image_url" as const,
              image_url: { url: a.dataUrl },
            })),
          ]
        : [];

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: montarPrompt(auth.user.name || "usuário", auth.user.role) },
      ...history,
      attachments.length > 0
        ? { role: "user", content: userContent }
        : { role: "user", content: transcript },
    ];

    let responseText = "";
    type GeneratedImage = {
      dataUrl: string;
      url: string;
      prompt: string;
      size: string;
      model: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let properties: any[] | null = null;
    let generatedImage: GeneratedImage | null = null;
    let propertyPhotos: { title: string; code: string; images: string[] } | null = null;

    const toolCtx: ToolContext = {
      userId: auth.user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: auth.user.role as any,
    };

    const executarFerramenta = async (call: OpenAI.Chat.ChatCompletionMessageFunctionToolCall) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let args: any = {};
      try { args = JSON.parse(call.function.arguments || "{}"); } catch { /* ignore */ }
      const name = call.function.name;

      // generate_image: caso especial (upload pro MinIO + payload pro frontend)
      if (name === "generate_image") {
        try {
          const imgResult = await runImageGeneration(args);
          const buffer = Buffer.from(imgResult.b64, "base64");
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
          const folder = `tappy-ia/${auth.user.id}/${conversation.id}`;
          const objectKey = await uploadFile(buffer, fileName, "image/png", folder);
          generatedImage = {
            dataUrl: `data:image/png;base64,${imgResult.b64}`,
            url: `${MINIO_PUBLIC_URL}/${objectKey}`,
            prompt: args.prompt,
            size: imgResult.size,
            model: imgResult.model,
          };
          return {
            tool_call_id: call.id,
            content: JSON.stringify({
              success: true,
              size: imgResult.size,
              note: "Imagem gerada com sucesso e exibida ao usuário.",
            }),
          };
        } catch (err) {
          console.error("[tappy-ia] generate_image error:", err);
          return {
            tool_call_id: call.id,
            content: JSON.stringify({ success: false, error: "Falha ao gerar imagem" }),
          };
        }
      }

      // get_property_photos: busca fotos de um imóvel pelo código ou nome
      if (name === "get_property_photos") {
        try {
          const query: string = args.query || "";
          const prop = await prisma.property.findFirst({
            where: {
              OR: [
                { code: { equals: query.trim(), mode: "insensitive" } },
                { title: { contains: query.trim(), mode: "insensitive" } },
              ],
              status: { not: "INATIVO" },
            },
            select: { id: true, title: true, code: true, images: true },
          });
          if (!prop) {
            return {
              tool_call_id: call.id,
              content: JSON.stringify({ found: false, message: "Imóvel não encontrado." }),
            };
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const images = Array.isArray(prop.images) ? (prop.images as any[]).filter((u) => typeof u === "string") : [];
          propertyPhotos = { title: prop.title, code: prop.code, images };
          return {
            tool_call_id: call.id,
            content: JSON.stringify({ found: true, title: prop.title, code: prop.code, totalPhotos: images.length }),
          };
        } catch (err) {
          console.error("[tappy-ia] get_property_photos error:", err);
          return {
            tool_call_id: call.id,
            content: JSON.stringify({ error: "Erro ao buscar fotos do imóvel" }),
          };
        }
      }

      // edit_image: edição de imagem enviada pelo usuário
      if (name === "edit_image") {
        const sourceImage = attachments[0]?.dataUrl;
        if (!sourceImage) {
          return {
            tool_call_id: call.id,
            content: JSON.stringify({ success: false, error: "Nenhuma imagem anexada para editar" }),
          };
        }
        try {
          const imgResult = await runImageEdit({ ...args, imageDataUrl: sourceImage });
          const buffer = Buffer.from(imgResult.b64, "base64");
          const fileName = `${Date.now()}_edit_${Math.random().toString(36).slice(2, 8)}.png`;
          const folder = `tappy-ia/${auth.user.id}/${conversation.id}`;
          const objectKey = await uploadFile(buffer, fileName, "image/png", folder);
          generatedImage = {
            dataUrl: `data:image/png;base64,${imgResult.b64}`,
            url: `${MINIO_PUBLIC_URL}/${objectKey}`,
            prompt: args.prompt,
            size: imgResult.size,
            model: imgResult.model,
          };
          return {
            tool_call_id: call.id,
            content: JSON.stringify({
              success: true,
              size: imgResult.size,
              note: "Imagem editada com sucesso e exibida ao usuário.",
            }),
          };
        } catch (err) {
          console.error("[tappy-ia] edit_image error:", err);
          return {
            tool_call_id: call.id,
            content: JSON.stringify({ success: false, error: "Falha ao editar imagem" }),
          };
        }
      }

      // Query tools (TOOL_HANDLERS)
      const handler = TOOL_HANDLERS[name] ?? ANALYTICS_HANDLERS[name];
      if (!handler) {
        return {
          tool_call_id: call.id,
          content: JSON.stringify({ error: `Ferramenta desconhecida: ${name}` }),
        };
      }
      try {
        const result = await handler(args, toolCtx);
        // Para query_properties, expor itens no payload final (modal de imóveis)
        if (name === "query_properties" && result?.items) {
          properties = result.items;
        }
        return { tool_call_id: call.id, content: JSON.stringify(result) };
      } catch (err) {
        console.error(`[tappy-ia] tool ${name} error:`, err);
        return {
          tool_call_id: call.id,
          content: JSON.stringify({ error: "Erro ao executar ferramenta" }),
        };
      }
    };

    // Laço de consultas: a IA pode encadear várias rodadas (achar o corretor,
    // depois os leads dele, depois comparar). Na última rodada as ferramentas
    // saem da chamada, forçando a resposta final.
    const conversa: OpenAI.Chat.ChatCompletionMessageParam[] = [...messages];
    for (let rodada = 0; rodada < MAX_RODADAS; rodada++) {
      const ultima = rodada === MAX_RODADAS - 1;
      const resposta = await openai.chat.completions.create({
        model: MODELO,
        messages: conversa,
        ...(ultima ? {} : { tools: TOOLS, tool_choice: "auto" as const }),
        max_completion_tokens: 3000,
        reasoning_effort: "low",
      });
      const msg = resposta.choices[0].message;
      const chamadas = (msg.tool_calls || []).filter(
        (t): t is OpenAI.Chat.ChatCompletionMessageFunctionToolCall => t.type === "function"
      );
      if (chamadas.length === 0) {
        responseText = msg.content ?? "";
        break;
      }
      conversa.push(msg);
      const resultados = await Promise.all(chamadas.map(executarFerramenta));
      for (const r of resultados) {
        conversa.push({
          role: "tool",
          tool_call_id: r.tool_call_id,
          content: r.content.length > MAX_CHARS_RESULTADO
            ? r.content.slice(0, MAX_CHARS_RESULTADO) + "…(resultado cortado; peça um recorte menor)"
            : r.content,
        });
      }
    }
    if (!responseText.trim()) {
      responseText = "Não consegui concluir essa análise agora. Tente reformular ou dividir a pergunta.";
    }

    // TTS
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: textoParaFala(responseText),
      response_format: "mp3",
    });
    const audioBase64 = `data:audio/mp3;base64,${Buffer.from(await speech.arrayBuffer()).toString("base64")}`;

    // Upload dos anexos do user pro MinIO (pra exibir na timeline)
    let userImageUrl: string | null = null;
    if (attachments.length > 0) {
      try {
        const first = attachments[0];
        const b64 = first.dataUrl.split(",")[1] || "";
        if (b64) {
          const buffer = Buffer.from(b64, "base64");
          const ext = first.mimeType.split("/")[1]?.split(";")[0] || "png";
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const folder = `tappy-ia/${auth.user.id}/${conversation.id}/uploads`;
          const objectKey = await uploadFile(buffer, fileName, first.mimeType, folder);
          userImageUrl = `${MINIO_PUBLIC_URL}/${objectKey}`;
        }
      } catch (err) {
        console.error("[tappy-ia] upload anexo user:", err);
      }
    }

    // Persiste user + assistant no DB e atualiza updatedAt
    await prisma.$transaction([
      prisma.tappyIAMessage.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: transcript,
          imageUrl: userImageUrl,
        },
      }),
      prisma.tappyIAMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: responseText,
          imageUrl: (generatedImage as GeneratedImage | null)?.url ?? null,
          imagePrompt: (generatedImage as GeneratedImage | null)?.prompt ?? null,
          imageSize: (generatedImage as GeneratedImage | null)?.size ?? null,
          imageModel: (generatedImage as GeneratedImage | null)?.model ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          properties: (properties as any) ?? undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          propertyPhotos: (propertyPhotos as any) ?? undefined,
        },
      }),
      prisma.tappyIAConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      conversationId: conversation.id,
      transcript,
      response: responseText,
      audio: audioBase64,
      properties,
      generatedImage,
      propertyPhotos,
      userImageUrl,
    });
  } catch (err) {
    console.error("[tappy-ia]", err);
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
  }
}
