import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar base IPTU para captação
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchStatus = searchParams.get("matchStatus");
    const captacaoStatus = searchParams.get("captacaoStatus");
    const neighborhood = searchParams.get("neighborhood");
    const hasPhone = searchParams.get("hasPhone") === "true";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    // Ordenação (igual Excel: clicar no cabeçalho ordena asc/desc)
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
    // Colunas que podem ser filtradas/ordenadas (Excel-like).
    const TEXT_COLS = new Set([
      "condominio", "inscricaoImobiliaria", "contribuinte", "compromissario", "loteamento",
      "address", "number", "apto", "complement", "neighborhood", "quadra", "lote",
      "coproprietario", "matricula", "cpfCnpj", "enderecoEntrega", "numeroEntrega",
    ]);
    const NUM_COLS = new Set(["areaTerreno", "areaConstruida"]);

    // ── Endpoint auxiliar: valores distintos de uma coluna (para o dropdown de filtro).
    // Cascata estilo Excel: respeita os filtros JÁ aplicados nas OUTRAS colunas.
    const distinctCol = searchParams.get("distinctCol");
    if (distinctCol && (TEXT_COLS.has(distinctCol) || NUM_COLS.has(distinctCol))) {
      const q = (searchParams.get("q") || "").trim();
      const w: any = {};
      // aplica os filtros das outras colunas (não o da própria coluna sendo listada)
      for (const [key, val] of searchParams.entries()) {
        const field = key.startsWith("cf_") ? key.slice(3) : key.startsWith("cfc_") ? key.slice(4) : null;
        if (!field || field === distinctCol) continue;
        if (key.startsWith("cf_")) {
          const values = val.split("|").map((v) => v.trim()).filter(Boolean);
          if (!values.length) continue;
          if (TEXT_COLS.has(field)) w[field] = { in: values };
          else if (NUM_COLS.has(field)) {
            const nums = values.map(Number).filter((n) => !Number.isNaN(n));
            if (nums.length) w[field] = { in: nums };
          }
        } else if (key.startsWith("cfc_") && TEXT_COLS.has(field) && val.trim()) {
          w[field] = { contains: val.trim(), mode: "insensitive" };
        }
      }
      if (q && TEXT_COLS.has(distinctCol)) w[distinctCol] = { contains: q, mode: "insensitive" };
      const rows = await (prisma.iptuBase as any).findMany({
        where: w,
        distinct: [distinctCol],
        select: { [distinctCol]: true },
        take: 1000,
        orderBy: { [distinctCol]: "asc" },
      });
      const values = rows.map((r: any) => r[distinctCol]).filter((v: any) => v !== null && v !== "");
      return NextResponse.json({ values });
    }

    // Só ordena por campos válidos (evita erro do Prisma).
    const SORTABLE = new Set([
      "createdAt", "andar", "matchStatus", "captacaoStatus", ...TEXT_COLS, ...NUM_COLS,
    ]);
    const orderBy: any = SORTABLE.has(sortBy) ? { [sortBy]: sortDir } : { createdAt: "desc" };

    const where: any = {};

    if (matchStatus) where.matchStatus = matchStatus;
    if (captacaoStatus) where.captacaoStatus = captacaoStatus;
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: "insensitive" };
    if (hasPhone) where.phones = { isEmpty: false };

    // Filtros por coluna (Excel-like): cf_<campo>=v1|v2 (multi-seleção) e cfc_<campo>=texto (contém)
    for (const [key, val] of searchParams.entries()) {
      if (key.startsWith("cf_")) {
        const field = key.slice(3);
        const values = val.split("|").map((v) => v.trim()).filter(Boolean);
        if (!values.length) continue;
        if (TEXT_COLS.has(field)) where[field] = { in: values };
        else if (NUM_COLS.has(field)) {
          const nums = values.map(Number).filter((n) => !Number.isNaN(n));
          if (nums.length) where[field] = { in: nums };
        }
      } else if (key.startsWith("cfc_")) {
        const field = key.slice(4);
        if (TEXT_COLS.has(field) && val.trim()) where[field] = { contains: val.trim(), mode: "insensitive" };
      }
    }

    if (search) {
      where.OR = [
        { address: { contains: search, mode: "insensitive" } },
        { contribuinte: { contains: search, mode: "insensitive" } },
        { compromissario: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
        { condominio: { contains: search, mode: "insensitive" } },
        { loteamento: { contains: search, mode: "insensitive" } },
        { inscricaoImobiliaria: { contains: search, mode: "insensitive" } },
        { matricula: { contains: search, mode: "insensitive" } },
        { cpfCnpj: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      (prisma.iptuBase as any).findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma.iptuBase as any).count({ where }),
    ]);

    // Estatísticas
    const [matchStats, captacaoStats, enrichedCount] = await Promise.all([
      (prisma.iptuBase as any).groupBy({
        by: ["matchStatus"],
        _count: { id: true },
      }),
      (prisma.iptuBase as any).groupBy({
        by: ["captacaoStatus"],
        _count: { id: true },
      }),
      (prisma.iptuBase as any).count({
        where: { phones: { isEmpty: false } },
      }),
    ]);

    const stats = {
      total,
      vinculados: matchStats.find((s: any) => s.matchStatus === "VINCULADO")?._count?.id || 0,
      semMatch: matchStats.find((s: any) => s.matchStatus === "SEM_MATCH")?._count?.id || 0,
      pendentes: matchStats.find((s: any) => s.matchStatus === "PENDENTE")?._count?.id || 0,
      disponiveis: captacaoStats.find((s: any) => s.captacaoStatus === "DISPONIVEL")?._count?.id || 0,
      emContato: captacaoStats.find((s: any) => s.captacaoStatus === "EM_CONTATO")?._count?.id || 0,
      enriquecidos: enrichedCount,
    };

    return NextResponse.json({
      items,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats,
    });
  } catch (error) {
    console.error("Erro ao listar IPTU:", error);
    return NextResponse.json(
      { error: "Erro ao listar IPTU" },
      { status: 500 }
    );
  }
}

// POST - Importar base IPTU (processar arquivo)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let matched = 0;
    let skipped = 0;

    // Campos de texto livres mapeados diretamente da planilha.
    const TEXT_FIELDS = [
      "contribuinte", "compromissario", "coproprietario", "cpfCnpj", "matricula",
      "condominio", "loteamento", "quadra", "lote", "number", "apto", "andar",
      "complement", "enderecoEntrega", "numeroEntrega", "zipCode",
      "tipoImovel", "usoImovel",
    ];
    const str = (v: any) => {
      const s = v?.toString().trim();
      return s ? s : null;
    };

    // Normaliza todos os itens do lote em registros prontos para o banco.
    const records = (items as any[]).map((item) => {
      const inscricao = str(item.inscricaoImobiliaria);
      const data: any = {
        address: str(item.address) || "Endereço não informado",
        neighborhood: str(item.neighborhood) || "Bairro não informado",
        city: str(item.city) || "Santana de Parnaíba",
        state: str(item.state) || "SP",
        inscricaoImobiliaria: inscricao,
      };
      for (const f of TEXT_FIELDS) if (item[f] !== undefined) data[f] = str(item[f]);
      if (item.areaTerreno !== undefined) data.areaTerreno = item.areaTerreno ?? null;
      if (item.areaConstruida !== undefined) data.areaConstruida = item.areaConstruida ?? null;
      if (item.anoConstricao !== undefined) data.anoConstricao = item.anoConstricao ?? null;
      return { inscricao, data };
    });

    // Uma única query para descobrir quais inscrições já existem (rápido).
    const inscricoes = records.map((r) => r.inscricao).filter(Boolean) as string[];
    const existing = inscricoes.length
      ? await (prisma.iptuBase as any).findMany({
          where: { inscricaoImobiliaria: { in: inscricoes } },
          select: { id: true, inscricaoImobiliaria: true },
        })
      : [];
    const existingMap = new Map<string, string>(existing.map((e: any) => [e.inscricaoImobiliaria, e.id]));

    // Cria os novos em MASSA (createMany) — evita timeout em planilhas grandes.
    const seen = new Set<string>();
    const toCreate = records
      .filter((r) => !r.inscricao || !existingMap.has(r.inscricao))
      .filter((r) => {
        if (!r.inscricao) return true; // sem inscrição: sempre cria
        if (seen.has(r.inscricao)) return false; // dedup dentro do mesmo lote
        seen.add(r.inscricao);
        return true;
      })
      .map((r) => ({ ...r.data, matchStatus: "PENDENTE", captacaoStatus: "DISPONIVEL" }));

    if (toCreate.length) {
      const resCreate = await (prisma.iptuBase as any).createMany({ data: toCreate, skipDuplicates: true });
      created += resCreate.count;
    }

    // Atualiza apenas os que já existiam (preserva valores já enriquecidos).
    // Em chunks paralelos para não estourar o tempo do request em reimportações grandes.
    const toUpdate = records.filter((r) => r.inscricao && existingMap.has(r.inscricao));
    const CHUNK = 20;
    for (let i = 0; i < toUpdate.length; i += CHUNK) {
      const chunk = toUpdate.slice(i, i + CHUNK);
      await Promise.all(
        chunk.map(async (r) => {
          const updateData: any = {};
          for (const [k, v] of Object.entries(r.data)) {
            if (k === "inscricaoImobiliaria") continue;
            if (v !== null && v !== undefined && v !== "") updateData[k] = v;
          }
          try {
            await (prisma.iptuBase as any).update({ where: { id: existingMap.get(r.inscricao!) }, data: updateData });
            updated++;
          } catch (e: any) {
            console.error("Erro ao atualizar item IPTU:", e?.message);
            skipped++;
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      matched,
      skipped,
      total: items.length,
    });
  } catch (error) {
    console.error("Erro ao importar IPTU:", error);
    return NextResponse.json(
      { error: "Erro ao importar IPTU" },
      { status: 500 }
    );
  }
}

// PATCH - Editar um registro IPTU (botão Editar)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, data } = body;
    if (!id || !data || typeof data !== "object") {
      return NextResponse.json({ error: "id e data são obrigatórios" }, { status: 400 });
    }

    // Campos editáveis (whitelist)
    const TEXT_FIELDS = [
      "contribuinte", "compromissario", "coproprietario", "cpfCnpj", "matricula",
      "condominio", "loteamento", "quadra", "lote", "address", "number", "apto",
      "andar", "complement", "neighborhood", "enderecoEntrega", "numeroEntrega",
      "city", "state", "zipCode", "tipoImovel", "usoImovel",
      "inscricaoImobiliaria", "captacaoStatus", "captacaoNotes",
    ];
    const NUM_FIELDS = ["areaTerreno", "areaConstruida"];

    const updateData: any = {};
    for (const f of TEXT_FIELDS) {
      if (data[f] !== undefined) updateData[f] = data[f]?.toString().trim() || null;
    }
    for (const f of NUM_FIELDS) {
      if (data[f] !== undefined) {
        const n = parseFloat(String(data[f]).replace(",", "."));
        updateData[f] = Number.isNaN(n) ? null : n;
      }
    }
    if (data.anoConstricao !== undefined) {
      const n = parseInt(String(data.anoConstricao));
      updateData.anoConstricao = Number.isNaN(n) ? null : n;
    }

    try {
      const updated = await (prisma.iptuBase as any).update({ where: { id }, data: updateData });
      return NextResponse.json({ success: true, item: updated });
    } catch (e: any) {
      // inscrição duplicada (unique) etc.
      if (e?.code === "P2002") {
        return NextResponse.json({ error: "Inscrição imobiliária já existe em outro registro" }, { status: 409 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Erro ao editar IPTU:", error);
    return NextResponse.json({ error: "Erro ao editar registro IPTU" }, { status: 500 });
  }
}

// DELETE - Excluir registros IPTU em lote
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, deleteAll, matchStatus, captacaoStatus } = body;

    let where: any = {};

    if (deleteAll) {
      // Deletar todos os registros (com filtro opcional)
      if (matchStatus) where.matchStatus = matchStatus;
      if (captacaoStatus) where.captacaoStatus = captacaoStatus;
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      where.id = { in: ids };
    } else {
      return NextResponse.json({ error: "Informe IDs ou use deleteAll" }, { status: 400 });
    }

    const result = await (prisma.iptuBase as any).deleteMany({ where });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Erro ao excluir IPTU:", error);
    return NextResponse.json(
      { error: "Erro ao excluir registros IPTU" },
      { status: 500 }
    );
  }
}
