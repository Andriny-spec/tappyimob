import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

// Mapeamento automático de colunas do Excel → campos do Lead
const AUTO_MAP: Record<string, string> = {
  "nome": "name",
  "name": "name",
  "cpf": "cpf",
  "contatos": "phone",
  "contato": "phone",
  "telefone": "phone",
  "phone": "phone",
  "celular": "phone",
  "whatsapp": "phone",
  "e-mail": "email",
  "email": "email",
  "data de nascimento": "birthDate",
  "nascimento": "birthDate",
  "imóvel de entrada": "propertyCode",
  "imovel de entrada": "propertyCode",
  "tipo": "type",
  "sub tipo": "subType",
  "subtipo": "subType",
  "finalidade": "ticket",
  "mídia": "source",
  "midia": "source",
  "origem": "source",
  "permuta": "hasPermuta",
  "código permuta": "permutaPropertyCode",
  "codigo permuta": "permutaPropertyCode",
  "tipo de permuta": "permutaType",
  "local da permuta": "permutaLocation",
  "valor da permuta": "permutaValue",
  "descrição da permuta": "permutaDescription",
  "descricao da permuta": "permutaDescription",
  "ticket locação": "ticketLocacao",
  "ticket locacao": "ticketLocacao",
  "ticket venda": "ticketVenda",
  "garantias": "rentalGuarantees",
  "mobiliário": "searchFurnished",
  "mobiliario": "searchFurnished",
  "nº de dormitórios": "searchBedrooms",
  "dormitórios": "searchBedrooms",
  "dormitorios": "searchBedrooms",
  "condomínios": "condominiumsOfInterest",
  "condominios": "condominiumsOfInterest",
  "observações": "observations",
  "observacoes": "observations",
  "agrupar": "groupColumn",
  "temperatura": "temperature",
  "corretor": "corretorName",
  "criado em": "createdAt",
  "atualizado em": "updatedAt",
  "ação": "action",
  "acao": "action",
};

// Mapeamento de fontes/mídias para LeadSource enum
const SOURCE_MAP: Record<string, string> = {
  "site": "SITE",
  "instagram tappy": "INSTAGRAM_TAPPY_ORGANICO",
  "instagram tappy (orgânico)": "INSTAGRAM_TAPPY_ORGANICO",
  "instagram tappy (ads)": "INSTAGRAM_TAPPY_ADS",
  "instagram pessoal": "INSTAGRAM_PESSOAL_ORGANICO",
  "instagram pessoal (orgânico)": "INSTAGRAM_PESSOAL_ORGANICO",
  "instagram pessoal (ads)": "INSTAGRAM_PESSOAL_ADS",
  "facebook groups": "FACEBOOK_GROUPS",
  "facebook pessoal": "FACEBOOK",
  "google": "GOOGLE",
  "imóvel web": "IMOVELWEB",
  "imovel web": "IMOVELWEB",
  "zap imóveis": "ZAP_IMOVEIS",
  "zap imoveis": "ZAP_IMOVEIS",
  "olx": "OLX",
  "chaves na mão": "CHAVES_NA_MAO",
  "chaves na mao": "CHAVES_NA_MAO",
  "mercado livre": "MERCADO_LIVRE",
  "attria": "ATTRIA",
  "e-mail": "EMAIL",
  "email": "EMAIL",
  "placa": "PLACA",
  "open house": "OPEN_HOUSE",
  "indicação": "INDICACAO",
  "indicacao": "INDICACAO",
  "telefone": "TELEFONE",
  "parceria corretor": "PARCERIA_CORRETOR",
  "viva real": "VIVA_REAL",
  "sac - geral": "TELEFONE",
  "não informado": "OUTROS",
  "nao informado": "OUTROS",
};

// Mapeamento de temperatura
const TEMP_MAP: Record<string, string> = {
  "quente": "QUENTE",
  "morno": "MORNO",
  "frio": "FRIO",
};

// Mapeamento de destino da aba → status do lead
const DESTINATION_STATUS: Record<string, string> = {
  "LEADS": "NOVO",
  "ACERVO": "ARQUIVADO",
  "LIMBO": "ARQUIVADO",
};

function parseMoneyValue(val: string | null | undefined): number | null {
  if (!val) return null;
  const cleaned = String(val)
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/\u00a0/g, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(val: string | null | undefined): Date | null {
  if (!val) return null;
  const str = String(val).trim();
  // Formato: "18/02/2026, 11:29:08" ou "01/08/2025, 15:58:29"
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,?\s*(\d{2}):(\d{2}):(\d{2}))?$/);
  if (match) {
    const [, day, month, year, hour, min, sec] = match;
    return new Date(
      parseInt(year), parseInt(month) - 1, parseInt(day),
      hour ? parseInt(hour) : 0,
      min ? parseInt(min) : 0,
      sec ? parseInt(sec) : 0
    );
  }
  // Tentar parse nativo
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// POST /api/admin/leads/import/preview - Preview do arquivo
// POST /api/admin/leads/import - Executar importação
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const action = formData.get("action") as string; // "preview" ou "import"
    const corretorId = formData.get("corretorId") as string | null;
    const destination = formData.get("destination") as string || "LEADS";
    const sheetName = formData.get("sheetName") as string | null;
    const customMapping = formData.get("columnMapping") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }

    // Ler o arquivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Se action = preview, retornar info das abas e colunas
    if (action === "preview") {
      const sheets = workbook.SheetNames.map((name) => {
        const ws = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        const headers = (data[0] || []) as string[];
        const rowCount = Math.max(0, data.length - 1);

        // Auto-mapear colunas
        const mapping: Record<string, string> = {};
        headers.forEach((h) => {
          const key = String(h).toLowerCase().trim();
          if (AUTO_MAP[key]) {
            mapping[h] = AUTO_MAP[key];
          }
        });

        // Preview: primeiras 3 linhas
        const preview = data.slice(1, 4).map((row) => {
          const obj: Record<string, unknown> = {};
          headers.forEach((h, i) => {
            obj[h] = (row as unknown[])[i] ?? null;
          });
          return obj;
        });

        return { name, headers, rowCount, mapping, preview };
      });

      return NextResponse.json({ sheets, fileName: file.name });
    }

    // action = import-batch — importar múltiplas abas de uma vez
    if (action === "import-batch") {
      const sheetsConfigRaw = formData.get("sheetsConfig") as string | null;
      if (!sheetsConfigRaw) {
        return NextResponse.json({ error: "sheetsConfig obrigatório" }, { status: 400 });
      }
      const sheetsConfig: Array<{ sheetName: string; destination: string; mapping: Record<string, string> }> = JSON.parse(sheetsConfigRaw);

      const results: Array<{
        sheetName: string;
        destination: string;
        importedCount: number;
        skippedCount: number;
        totalRows: number;
        errors: Array<{ row: number; error: string }>;
      }> = [];

      for (const sheetCfg of sheetsConfig) {
        const { sheetName: sName, destination: sDest, mapping: sMapping } = sheetCfg;
        if (!workbook.SheetNames.includes(sName)) continue;

        const result = await importSheet(workbook, sName, sDest, sMapping, corretorId, session, file.name);
        results.push(result);
      }

      return NextResponse.json({
        success: true,
        batch: true,
        results,
        totalImported: results.reduce((s, r) => s + r.importedCount, 0),
        totalSkipped: results.reduce((s, r) => s + r.skippedCount, 0),
        totalRows: results.reduce((s, r) => s + r.totalRows, 0),
      });
    }

    // action = import — executar importação de uma única aba
    if (!sheetName || !workbook.SheetNames.includes(sheetName)) {
      return NextResponse.json({ error: "Aba inválida" }, { status: 400 });
    }

    const result = await importSheet(workbook, sheetName, destination, customMapping ? JSON.parse(customMapping) : null, corretorId, session, file.name);

    return NextResponse.json({
      success: true,
      importId: result.importId,
      importedCount: result.importedCount,
      skippedCount: result.skippedCount,
      totalRows: result.totalRows,
      errors: result.errors.slice(0, 50),
    });
  } catch (error) {
    console.error("Error importing leads:", error);
    return NextResponse.json({ error: "Erro ao importar leads" }, { status: 500 });
  }
}

async function importSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  destination: string,
  customMapping: Record<string, string> | null,
  corretorId: string | null,
  session: { id: string; role?: string },
  fileName: string
) {
  const ws = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
  const headers = (rawData[0] || []) as string[];
  const rows = rawData.slice(1);

  // Usar mapeamento customizado ou auto
  let mapping: Record<string, string> = {};
  if (customMapping) {
    mapping = customMapping;
  } else {
    headers.forEach((h) => {
      const key = String(h).toLowerCase().trim();
      if (AUTO_MAP[key]) mapping[h] = AUTO_MAP[key];
    });
  }

  const errors: Array<{ row: number; error: string }> = [];
  let importedCount = 0;
  let skippedCount = 0;

  // Buscar imóveis por código para vincular propertyId
  const propertyCodes = new Set<string>();
  rows.forEach((row) => {
    const rowObj = buildRowObj(headers, row as unknown[], mapping);
    const code = rowObj["propertyCode"];
    if (code) propertyCodes.add(String(code).trim());
  });

  const properties = propertyCodes.size > 0
    ? await prisma.property.findMany({
        where: { code: { in: Array.from(propertyCodes) } },
        select: { id: true, code: true },
      })
    : [];
  const propertyMap = new Map(properties.map((p) => [p.code, p.id]));

  // Processar cada linha
  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i] as unknown[];
      const rowObj = buildRowObj(headers, row, mapping);

      if (!rowObj.name || String(rowObj.name).trim() === "") {
        skippedCount++;
        continue;
      }

      const name = String(rowObj.name).trim();
      const phone = rowObj.phone ? String(rowObj.phone).trim() : null;
      const email = rowObj.email ? String(rowObj.email).trim() : null;
      const cpf = rowObj.cpf ? String(rowObj.cpf).trim() : null;

      // Verificar duplicatas por telefone
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length >= 8) {
          const existing = await prisma.lead.findFirst({
            where: { phone: { contains: cleanPhone } },
            select: { id: true },
          });
          if (existing) {
            skippedCount++;
            errors.push({ row: i + 2, error: `Duplicado: ${name} (${phone}) já existe` });
            continue;
          }
        }
      }

      const sourceRaw = rowObj.source ? String(rowObj.source).toLowerCase().trim() : "";
      const source = SOURCE_MAP[sourceRaw] || "OUTROS";
      const tempRaw = rowObj.temperature ? String(rowObj.temperature).toLowerCase().trim() : "";
      const temperature = TEMP_MAP[tempRaw] || "MORNO";
      const ticketRaw = rowObj.ticket ? String(rowObj.ticket).toLowerCase().trim() : "";
      let leadTicket = "COMPRA";
      if (ticketRaw.includes("locação") || ticketRaw.includes("locacao") || ticketRaw.includes("aluguel")) {
        leadTicket = "LOCACAO";
      } else if (ticketRaw.includes("ambos")) {
        leadTicket = "AMBOS";
      }

      const ticketVenda = parseMoneyValue(rowObj.ticketVenda as string);
      const ticketLocacao = parseMoneyValue(rowObj.ticketLocacao as string);
      const budget = ticketVenda || ticketLocacao || null;

      const permutaRaw = rowObj.hasPermuta ? String(rowObj.hasPermuta).toLowerCase().trim() : "";
      const hasPermuta = permutaRaw === "sim" || permutaRaw === "s" || permutaRaw === "yes" || permutaRaw === "true";

      const condos = rowObj.condominiumsOfInterest
        ? String(rowObj.condominiumsOfInterest).split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
        : [];

      const propertyCode = rowObj.propertyCode ? String(rowObj.propertyCode).trim() : null;
      const propertyId = propertyCode ? propertyMap.get(propertyCode) || null : null;
      const createdAt = parseDate(rowObj.createdAt as string) || new Date();
      const updatedAt = parseDate(rowObj.updatedAt as string) || createdAt;

      let status = DESTINATION_STATUS[destination] || "NOVO";
      if (destination === "LEADS" && rowObj.groupColumn) {
        const group = String(rowObj.groupColumn).toLowerCase().trim();
        if (group.includes("qualificaç") || group.includes("qualificac")) status = "QUALIFICADO";
        else if (group.includes("negociaç") || group.includes("negociac")) status = "NEGOCIANDO";
        else if (group.includes("contatad")) status = "CONTATADO";
        else if (group.includes("desenvolv")) status = "CONTATADO";
        else if (group.includes("fechad") || group.includes("efetivad")) status = "FECHADO";
        else status = "NOVO";
      }

      const bedrooms = rowObj.searchBedrooms ? String(rowObj.searchBedrooms).trim() : null;
      const furnRaw = rowObj.searchFurnished ? String(rowObj.searchFurnished).toLowerCase().trim() : "";
      const searchFurnished = furnRaw === "sim" || furnRaw === "s" || furnRaw === "mobiliado" ? true
        : furnRaw === "não" || furnRaw === "nao" || furnRaw === "n" ? false : null;

      const type = rowObj.type ? String(rowObj.type).trim() : null;
      const subType = rowObj.subType ? String(rowObj.subType).trim() : null;
      const searchTypologies = type ? [type] : [];

      const lead = await prisma.lead.create({
        data: {
          name,
          phone,
          email: email || null,
          cpf: cpf || null,
          birthDate: parseDate(rowObj.birthDate as string),
          status: status as any,
          source: source as any,
          ticket: leadTicket as any,
          temperature: temperature as any,
          profile: "COMPRADOR",
          score: 50,
          probability: 50,
          budget,
          hasPermuta,
          permutaPropertyCode: rowObj.permutaPropertyCode ? String(rowObj.permutaPropertyCode) : null,
          permutaType: rowObj.permutaType ? String(rowObj.permutaType) : null,
          permutaLocation: rowObj.permutaLocation ? String(rowObj.permutaLocation) : null,
          permutaValue: parseMoneyValue(rowObj.permutaValue as string),
          permutaDescription: rowObj.permutaDescription ? String(rowObj.permutaDescription) : null,
          condominiumsOfInterest: condos,
          searchTypologies,
          searchSubtype: subType,
          searchBedrooms: bedrooms,
          searchFurnished,
          rentalGuarantees: rowObj.rentalGuarantees
            ? String(rowObj.rentalGuarantees).split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
            : [],
          propertyId,
          corretorId: corretorId || null,
          createdById: session.id,
          tags: [],
          createdAt,
          updatedAt,
          lastContact: updatedAt !== createdAt ? updatedAt : null,
          ...(destination === "ACERVO" || destination === "LIMBO"
            ? {
                archivedAt: new Date(),
                archivedReason: `Importado de ${sheetName} - ${destination}`,
                archivedCategory: destination === "LIMBO" ? "perdido" : "sem_interacao",
              }
            : {}),
        },
      });

      const obs = rowObj.observations ? String(rowObj.observations).trim() : null;
      if (obs && obs.length > 0) {
        await prisma.leadNote.create({
          data: {
            leadId: lead.id,
            content: obs,
            authorId: session.id,
          },
        });
      }

      importedCount++;
    } catch (err: any) {
      skippedCount++;
      errors.push({ row: i + 2, error: err.message || "Erro desconhecido" });
    }
  }

  // Salvar histórico da importação
  const importRecord = await prisma.leadImport.create({
    data: {
      fileName,
      totalRows: rows.length,
      importedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined,
      destination,
      sheetName,
      columnMapping: mapping,
      userId: session.id,
      corretorId: corretorId || null,
    },
  });

  return {
    sheetName,
    destination,
    importedCount,
    skippedCount,
    totalRows: rows.length,
    errors,
    importId: importRecord.id,
  };
}

function buildRowObj(headers: string[], row: unknown[], mappingOverride?: Record<string, string>): Record<string, unknown> {
  const mapping: Record<string, string> = mappingOverride || {};
  if (!mappingOverride) {
    headers.forEach((h) => {
      const key = String(h).toLowerCase().trim();
      if (AUTO_MAP[key]) mapping[h] = AUTO_MAP[key];
    });
  }

  const obj: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    const field = mapping[h];
    if (field) {
      obj[field] = row[i] ?? null;
    }
  });
  return obj;
}
