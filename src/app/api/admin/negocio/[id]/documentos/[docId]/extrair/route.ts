import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { minioClient, BUCKET_NAME } from "@/lib/minio";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Modelo usado na extração — troque via OPENAI_EXTRACTION_MODEL no .env
// gpt-5.5 é o modelo mais recente e capaz da conta — usa max_completion_tokens
// Para trocar: OPENAI_EXTRACTION_MODEL=gpt-5.5-pro no .env
const EXTRACTION_MODEL = process.env.OPENAI_EXTRACTION_MODEL || "gpt-5.5";

// gpt-5.x e modelos de raciocínio (o3/o4) usam max_completion_tokens e
// NÃO aceitam temperature != 1 (só o default). Modelos antigos usam max_tokens.
const IS_REASONING_MODEL =
  EXTRACTION_MODEL.startsWith("gpt-5") ||
  EXTRACTION_MODEL.startsWith("o3") ||
  EXTRACTION_MODEL.startsWith("o4");

// Monta os parâmetros de tokens de forma compatível com cada geração de modelo
function tokenParam(n: number) {
  return IS_REASONING_MODEL ? { max_completion_tokens: n } : { max_tokens: n };
}

// gpt-5.x rejeita temperature: 0 ("Only the default (1) value is supported").
// Para esses modelos, omitimos o parâmetro; para os antigos, fixamos em 0.
const TEMPERATURE_PARAM = IS_REASONING_MODEL ? {} : { temperature: 0 };

type Params = { params: Promise<{ id: string; docId: string }> };

const PROMPTS: Record<string, string> = {
  MATRICULA: `Você é um tabelião especialista em análise de matrículas de imóveis brasileiras (Registro de Imóveis).
Leia TODO o documento com atenção, inclusive averbações e registros (R-1, R-2, Av-1...), que costumam atualizar proprietário, estado civil e ônus.

Retorne SOMENTE um JSON válido com esta estrutura EXATA (não invente dados — se não encontrar, use null):
{
  "matriculaNumero": "número da matrícula (somente o número, ex: 45892)",
  "cri": "nome/número do Cartório de Registro de Imóveis competente",
  "logradouro": "tipo + nome da via (ex: Rua das Acácias, Avenida Brasil, Alameda dos Anjos)",
  "numero": "número do imóvel na via (ex: 138)",
  "complemento": "apartamento, bloco, torre, casa, lote, quadra (ex: Apto 42, Bloco B, Casa 3, Lote 5 Quadra 2)",
  "bairro": "bairro/distrito",
  "cidade": "município",
  "uf": "sigla do estado com 2 letras (ex: SP)",
  "cep": "CEP no formato 00000-000 se presente",
  "condominio": "nome do condomínio ou empreendimento se houver",
  "inscricaoFiscal": "número de inscrição municipal/IPTU/contribuinte se presente",
  "areaPrivativa": "área privativa em m² (número) se constar",
  "areaTotal": "área total/terreno em m² (número) se constar",
  "situacao": "QUITADO se não há ônus ativo; FINANCIADO se há hipoteca; ALIENACAO_FIDUCIARIA se há alienação fiduciária registrada e não baixada",
  "saldoDevedor": "valor numérico do saldo devedor se houver financiamento/AF",
  "bancoCredor": "nome do banco/credor da garantia se houver",
  "laudemio": "true se há enfiteuse, foreiro, terreno de marinha, RIP ou laudêmio; senão false",
  "dataEmissao": "data de emissão/expedição da certidão no formato YYYY-MM-DD",
  "proprietarios": [
    {
      "nome": "nome completo do(s) atual(is) proprietário(s) conforme o ÚLTIMO registro/averbação",
      "cpf": "CPF somente números (11 dígitos) se constar",
      "cnpj": "CNPJ somente números (14 dígitos) se for pessoa jurídica",
      "estadoCivil": "Solteiro(a) | Casado(a) | Divorciado(a) | Viúvo(a) | União estável",
      "regimeBens": "Comunhão parcial de bens | Comunhão universal de bens | Separação total de bens | Participação final nos aquestos",
      "conjuge": "nome do cônjuge se casado"
    }
  ]
}

⚠️ REGRA CRÍTICA — PROPRIETÁRIO ATUAL (NÃO os antigos):
A matrícula contém a CADEIA DE TRANSMISSÕES em ordem cronológica (R-1, R-2, R-3...).
Cada registro de compra e venda transfere o imóvel para um novo dono. Você DEVE:
1. Ler TODOS os registros (R-1, R-2, ...) e averbações em ordem.
2. Identificar o ÚLTIMO registro de transmissão de propriedade (compra e venda,
   adjudicação, doação, etc.) — geralmente o de número mais ALTO.
3. Em "proprietarios", colocar SOMENTE o(s) ADQUIRENTE(S) desse último registro.
   Os proprietários/transmitentes dos registros ANTERIORES já venderam o imóvel —
   eles são donos ANTIGOS e devem ser TOTALMENTE IGNORADOS.
4. Se houve averbação de divórcio/partilha/inventário posterior alterando a
   titularidade, use a titularidade mais recente.

Exemplo: se R-1 registra "João comprou", R-2 "João vendeu para Maria", R-3
"Maria vendeu para Pedro" — o proprietário ATUAL é PEDRO. João e Maria são antigos.

OUTRAS REGRAS:
- Separe o endereço em campos distintos (logradouro, número, complemento, bairro, cidade, UF). NUNCA junte tudo num campo só.
- Se o imóvel pertence a um casal no último registro, inclua ambos como proprietários.
- Atenção a abreviações de cartório (ex: "1º CRI de Barueri").

Adicione também "confiancaPorCampo": { "campo": 0.0 a 1.0 } para os campos principais.`,

  RG_CNH: `Você é especialista em análise de documentos de identidade brasileiros.
Extraia os seguintes campos e retorne JSON:
{
  "nome": "nome completo",
  "cpf": "CPF somente números",
  "nascimento": "data de nascimento YYYY-MM-DD",
  "filiacaoMae": "nome da mãe",
  "filiacaoPai": "nome do pai",
  "rg": "número do RG",
  "rgExpedicao": "data de expedição do RG YYYY-MM-DD",
  "orgaoExpedidor": "órgão expedidor"
}
Campos não encontrados devem ser null.
Adicione "confiancaPorCampo": { "campo": 0.95 }.`,

  CERTIDAO_CIVIL: `Você é especialista em certidões de estado civil brasileiras.
Extraia os seguintes campos e retorne JSON:
{
  "estadoCivil": "Solteiro(a) | Casado(a) | Divorciado(a) | Viúvo(a) | União estável",
  "regimeBens": "Comunhão parcial de bens | Comunhão universal de bens | Separação total de bens | Participação final nos aquestos",
  "conjuge": "nome do cônjuge/companheiro se casado/união",
  "dataEvento": "data do casamento/divórcio YYYY-MM-DD",
  "cartorio": "nome do cartório emissor"
}
Campos não encontrados devem ser null.
Adicione "confiancaPorCampo": { "campo": 0.95 }.`,

  COMPROVANTE_ENDERECO: `Você é especialista em análise de comprovantes de endereço brasileiros.
Extraia os seguintes campos e retorne JSON:
{
  "logradouro": "logradouro completo",
  "numero": "número",
  "complemento": "complemento se houver",
  "bairro": "bairro",
  "cidade": "cidade",
  "uf": "UF (2 letras)",
  "cep": "CEP somente números"
}
Campos não encontrados devem ser null.
Adicione "confiancaPorCampo": { "campo": 0.95 }.`,

  ESPELHO_IPTU: `Você é especialista em análise de espelhos de IPTU brasileiros.
Extraia os seguintes campos e retorne JSON:
{
  "inscricaoFiscal": "número de inscrição fiscal",
  "endereco": "endereço do imóvel",
  "temDebitos": true,
  "valorVenal": "valor venal numérico"
}
Campos não encontrados devem ser null.
Adicione "confiancaPorCampo": { "campo": 0.95 }.`,
};

// Lê um objeto do MinIO e retorna como Buffer
async function downloadFromMinio(fileKey: string): Promise<Buffer> {
  const stream = await minioClient.getObject(BUCKET_NAME, fileKey);
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  let docId = "";
  let uploadedFileId: string | null = null;

  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id, docId: dId } = await params;
    docId = dId;

    const documento = await prisma.negocioDocumento.findUnique({ where: { id: docId } });
    if (!documento || documento.negocioId !== id) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }
    if (!documento.fileKey) {
      return NextResponse.json({ error: "Arquivo não disponível para extração" }, { status: 400 });
    }

    let prompt = PROMPTS[documento.tipo] || PROMPTS["RG_CNH"];

    // "Agente de contexto e aprendizado": a IA recebe as orientações que a
    // equipe vai acumulando — a base geral + os macetes do formato da operação.
    const preambulos: string[] = [];

    // (1) Base de conhecimento geral da imobiliária
    const iaConfig = await prisma.juridicoIAConfig.findUnique({ where: { id: "default" } });
    if (iaConfig?.baseConhecimento?.trim()) {
      preambulos.push(`DIRETRIZES GERAIS DA IMOBILIÁRIA:\n${iaConfig.baseConhecimento.trim()}`);
    }

    // (2) Instrução específica do formato/tipo de operação do negócio
    const negocio = await prisma.negocio.findUnique({
      where: { id },
      select: { tipoOperacao: true },
    });
    if (negocio?.tipoOperacao) {
      const tmpl = await prisma.contratoTemplate.findUnique({
        where: { tipoOperacao: negocio.tipoOperacao },
        select: { aiInstrucao: true },
      });
      if (tmpl?.aiInstrucao?.trim()) {
        preambulos.push(`ORIENTAÇÕES PARA O FORMATO "${negocio.tipoOperacao}":\n${tmpl.aiInstrucao.trim()}`);
      }
    }

    if (preambulos.length) {
      prompt = `${preambulos.join("\n\n---\n\n")}\n\n---\n\n${prompt}`;
    }

    await prisma.negocioDocumento.update({ where: { id: docId }, data: { status: "PROCESSANDO" } });

    const fileBuffer = await downloadFromMinio(documento.fileKey);
    const fileName = documento.fileName || "documento";
    const ext = fileName.toLowerCase().split(".").pop() || "";
    const isPdf = ext === "pdf";

    console.log(`[EXTRAIR] ${documento.tipo} — ${fileName} (${Math.round(fileBuffer.length / 1024)}KB) → ${EXTRACTION_MODEL}`);

    let rawText = "{}";

    if (isPdf) {
      // PDFs: upload na Files API da OpenAI → referencia por file_id
      // Isso é mais confiável do que enviar base64 inline no payload
      const pdfFile = await toFile(fileBuffer, fileName, { type: "application/pdf" });
      const uploaded = await openai.files.create({ file: pdfFile, purpose: "user_data" });
      uploadedFileId = uploaded.id;

      console.log(`[EXTRAIR] PDF enviado à OpenAI Files API → file_id=${uploadedFileId}`);

      const response = await openai.chat.completions.create({
        model: EXTRACTION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              // @ts-expect-error — file type suportado pelo gpt-4o com Files API
              { type: "file", file: { file_id: uploadedFileId } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        ...TEMPERATURE_PARAM,
        ...tokenParam(4096),
      });

      rawText = response.choices[0].message.content || "{}";
    } else {
      // Imagens (RG, certidão, foto): envio via image_url com detalhe alto
      const mimeType =
        ext === "png" ? "image/png" :
        ext === "webp" ? "image/webp" :
        "image/jpeg";

      const base64 = fileBuffer.toString("base64");

      const response = await openai.chat.completions.create({
        model: EXTRACTION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        ...TEMPERATURE_PARAM,
        ...tokenParam(4096),
      });

      rawText = response.choices[0].message.content || "{}";
    }

    console.log(`[EXTRAIR] ${documento.tipo} resposta (${rawText.length} chars):`, rawText.slice(0, 800));

    const dados = JSON.parse(rawText);
    const { confiancaPorCampo, ...dadosExtraidos } = dados;

    await prisma.negocioDocumento.update({
      where: { id: docId },
      data: { status: "EXTRAIDO", dadosExtraidos, confiancaPorCampo: confiancaPorCampo || {} },
    });

    await prisma.negocioLog.create({
      data: {
        negocioId: id,
        campo: `extracao_${documento.tipo}`,
        valorAnterior: null,
        valorNovo: JSON.stringify(dadosExtraidos),
        origem: "extraido_confirmado",
        userId: session.id,
        userName: session.name,
      },
    });

    return NextResponse.json({ dadosExtraidos, confiancaPorCampo: confiancaPorCampo || {} });
  } catch (error: any) {
    console.error("[EXTRAIR]", error?.message || error);
    if (docId) {
      await prisma.negocioDocumento.update({
        where: { id: docId },
        data: { status: "ENVIADO" },
      }).catch(() => {});
    }
    return NextResponse.json({ error: "Erro ao extrair dados do documento" }, { status: 500 });
  } finally {
    // Sempre limpar o arquivo da OpenAI após o uso (evita acúmulo e custo desnecessário)
    if (uploadedFileId) {
      // SDK openai v6: o método é `delete` (não `del`). Envolvido em try/catch
      // porque isto roda no finally — uma exceção aqui sobrescreveria o return.
      try {
        await openai.files.delete(uploadedFileId);
      } catch (e: any) {
        console.warn("[EXTRAIR] Falha ao deletar file_id da OpenAI:", e?.message || e);
      }
    }
  }
}
