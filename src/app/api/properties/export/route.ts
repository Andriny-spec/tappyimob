import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Telefone com DDI: "+55 (11) 99999-9999"
function formatPhoneDDI(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `+55 (${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `+55 (${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw.trim().startsWith("+") ? raw.trim() : `+55 ${raw.trim()}`;
}

function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const simNao = (b: boolean | null | undefined) => (b ? "Sim" : "Não");

// Tradução dos status
const statusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  SUSPENSO: "Suspenso",
  INDISPONIVEL: "Indisponível",
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

function formatStatus(s: string | null | undefined): string {
  if (!s) return "";
  return statusLabels[s] || s;
}

function formatPrice(v: number | null | undefined): string {
  if (!v) return "";
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Números inteiros (área, dormitórios) com separador de milhar — ex: 10000 -> "10.000"
function formatNumber(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return v.toLocaleString("pt-BR");
}

// Tipologia macro (Casa / Apartamento / Terreno / Comercial) a partir do tipo detalhado
const tipologiaMacroMap: Record<string, string> = {
  CASA: "Casa", SOBRADO: "Casa", CHACARA: "Casa", FAZENDA: "Casa",
  APARTAMENTO: "Apartamento", COBERTURA: "Apartamento", STUDIO: "Apartamento", FLAT: "Apartamento", LOFT: "Apartamento", KITNET: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial", GALPAO: "Comercial",
};
function formatTipologiaMacro(type: string | null | undefined): string {
  if (!type) return "";
  return tipologiaMacroMap[type] || "Outro";
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // Construir where dinâmico baseado nos filtros
    const where: any = {};
    const AND: any[] = [];

    // Filtros de texto (busca)
    const search = searchParams.get("search");
    if (search) {
      AND.push({
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { neighborhood: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Filtros de categoria
    const categories = searchParams.get("categories");
    const category = searchParams.get("category");
    if (categories) {
      where.category = { in: categories.split(",") };
    } else if (category) {
      where.category = category;
    }

    // Tipo
    const type = searchParams.get("type");
    if (type) where.type = type;

    // Status
    const status = searchParams.get("status");
    if (status) where.status = status;

    // Condomínio
    const condominiumId = searchParams.get("condominiumId");
    const condominiumIds = searchParams.get("condominiumIds");
    if (condominiumIds) {
      where.condominiumId = { in: condominiumIds.split(",") };
    } else if (condominiumId) {
      where.condominiumId = condominiumId;
    }

    // Endereço
    const address = searchParams.get("address");
    if (address) where.address = { contains: address, mode: "insensitive" };

    // Bairro
    const neighborhood = searchParams.get("neighborhood");
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: "insensitive" };

    // Preço
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = Number(minPrice);
      if (maxPrice) priceFilter.lte = Number(maxPrice);
      AND.push({ OR: [{ price: priceFilter }, { rentPrice: priceFilter }] });
    }

    // Área construída
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");
    if (minArea) where.area = { ...(where.area || {}), gte: Number(minArea) };
    if (maxArea) where.area = { ...(where.area || {}), lte: Number(maxArea) };

    // Área terreno
    const minTotalArea = searchParams.get("minTotalArea");
    const maxTotalArea = searchParams.get("maxTotalArea");
    if (minTotalArea) where.totalArea = { ...(where.totalArea || {}), gte: Number(minTotalArea) };
    if (maxTotalArea) where.totalArea = { ...(where.totalArea || {}), lte: Number(maxTotalArea) };

    // Quartos e vagas
    const bedrooms = searchParams.get("bedrooms");
    if (bedrooms) where.bedrooms = { gte: Number(bedrooms) };
    const parkingSpaces = searchParams.get("parkingSpaces");
    if (parkingSpaces) where.parkingSpaces = { gte: Number(parkingSpaces) };

    // Booleanos
    if (searchParams.get("isExclusive") === "true") where.isExclusive = true;
    if (searchParams.get("hasPlate") === "true") where.hasPlate = true;
    if (searchParams.get("acceptsExchange") === "true") where.acceptsExchange = true;
    if (searchParams.get("isFeatured") === "true") where.isFeatured = true;
    if (searchParams.get("hiddenFromSite") === "true") where.showOnWebsite = false;
    if (searchParams.get("semFoto") === "true") {
      AND.push({ OR: [{ thumbnail: null }, { thumbnail: "" }] });
    }

    // Proprietário
    const ownerId = searchParams.get("ownerId");
    if (ownerId) where.propertyOwnerId = ownerId;
    const ownerSearch = searchParams.get("ownerSearch");
    if (ownerSearch) {
      where.propertyOwner = {
        OR: [
          { name: { contains: ownerSearch, mode: "insensitive" } },
          { cpf: { contains: ownerSearch, mode: "insensitive" } },
        ],
      };
    }

    if (AND.length > 0) where.AND = AND;

    const properties = await prisma.property.findMany({
      where,
      include: {
        propertyOwner: { select: { name: true, email: true, phones: true } },
        condominium: { select: { name: true, condoType: true } },
        owner: { select: { name: true } },           // Captador (usuário que cadastrou)
        updatedBy: { select: { name: true } },         // Último usuário que atualizou
        exclusivity: { select: { status: true, captadorName: true, gestorName: true } },
      },
      orderBy: { code: "asc" },
    });

    // Gestor de exclusividade (Corretor/Imobiliária): resolvido em lote para evitar N+1.
    // exclusivityManagerId aponta pra RealEstateAgency (se type=IMOBILIARIA) ou
    // User/BusinessPartner (corretor interno/externo) caso contrário.
    const agencyIds = new Set<string>();
    const corretorIds = new Set<string>();
    for (const p of properties) {
      if (!p.exclusivityManagerId) continue;
      if (p.exclusivityManagerType === "IMOBILIARIA") agencyIds.add(p.exclusivityManagerId);
      else corretorIds.add(p.exclusivityManagerId);
    }
    const [agencies, corretorUsers, corretorPartners] = await Promise.all([
      agencyIds.size > 0
        ? prisma.realEstateAgency.findMany({ where: { id: { in: [...agencyIds] } }, select: { id: true, companyName: true, tradeName: true, phone: true } })
        : [],
      corretorIds.size > 0
        ? prisma.user.findMany({ where: { id: { in: [...corretorIds] } }, select: { id: true, phone: true } })
        : [],
      corretorIds.size > 0
        ? prisma.businessPartner.findMany({ where: { id: { in: [...corretorIds] } }, select: { id: true, phone: true } })
        : [],
    ]);
    const agencyMap = new Map(agencies.map((a) => [a.id, a]));
    const corretorPhoneMap = new Map<string, string | null>([
      ...corretorUsers.map((u) => [u.id, u.phone] as const),
      ...corretorPartners.map((p) => [p.id, p.phone] as const),
    ]);

    function resolveGestor(p: (typeof properties)[number]): { tipo: string; telefone: string } {
      if (!p.exclusivityManagerId) return { tipo: "", telefone: "" };
      if (p.exclusivityManagerType === "IMOBILIARIA") {
        const agency = agencyMap.get(p.exclusivityManagerId);
        return { tipo: "Imobiliária", telefone: formatPhoneDDI(agency?.phone) };
      }
      return { tipo: "Corretor", telefone: formatPhoneDDI(corretorPhoneMap.get(p.exclusivityManagerId)) };
    }

    const typeLabels: Record<string, string> = {
      APARTAMENTO: "Apartamento", CASA: "Casa", TERRENO: "Terreno", COMERCIAL: "Comercial",
      COBERTURA: "Cobertura", STUDIO: "Studio", FAZENDA: "Fazenda", GALPAO: "Galpão",
      KITNET: "Kitnet", LOFT: "Loft", FLAT: "Flat", SOBRADO: "Sobrado", CHACARA: "Chácara",
    };

    // Colunas conforme solicitado pela Tappy.
    const xlsxHeaders = [
      "Código do Imóvel",
      "Condomínio", "Logradouro", "Número", "Torre", "Apartamento", "Quadra", "Lote",
      "Proprietário (Nome)", "Telefone", "E-mail", "Tipo Detalhado", "Tipologia",
      "Dormitórios",
      "Status Venda", "Valor Venda", "Status Locação", "Valor Locação", "Permuta", "Parcelamento Direto",
      "Área Construída", "Área Terreno", "Área Útil", "Habitado", "Placa", "Ocultado no Site",
      "Exclusividade", "Gestor da Exclusividade",
      "Gestão de Terceiros", "Tipo Gestor", "Telefone Gestor", "Gestão Tappy", "Captador",
      "Data Cadastro", "Data Última Atualização", "Última Atualização (Usuário)",
    ];

    const xlsxRows: (string | number)[][] = properties.map((p) => {
      let quadra = "";
      let lote = "";
      const comp = p.complement || "";
      const quadraMatch = comp.match(/(?:quadra|qd\.?)\s*([^\s,;]+)/i);
      const loteMatch = comp.match(/(?:lote|lt\.?)\s*([^\s,;]+)/i);
      if (quadraMatch) quadra = quadraMatch[1];
      if (loteMatch) lote = loteMatch[1];
      const isHorizontal = p.condominium?.condoType === "HORIZONTAL";
      if (isHorizontal && p.unitNumber && !lote) lote = p.unitNumber;

      const phones = (p.propertyOwner?.phones || []).map(formatPhoneDDI).filter(Boolean).join(" / ");

      let permuta = "Não";
      if (p.acceptsExchange) permuta = p.exchangeType ? `Sim - ${p.exchangeType}` : "Sim";

      // Exclusividade: Tappy (própria) / Terceiros / Não — para filtrar/excluir do mailing.
      const exclusividadeAtiva = !!p.exclusivity && p.exclusivity.status === "ATIVA";
      let exclusividade = "Não";
      let gestorExcl = "";
      if (p.isExclusive || exclusividadeAtiva) {
        exclusividade = "Tappy";
        gestorExcl = p.exclusivity?.gestorName || p.exclusivity?.captadorName || "";
      } else if (p.isThirdPartyExclusive) {
        exclusividade = "Terceiros";
      }

      // "Gestão de Terceiros": considera tanto o flag quanto a presença de um gestor
      // vinculado (caso tenha ou já tenha tido uma gestão em algum momento).
      const temGestaoTerceiros = p.isThirdPartyExclusive || !!p.exclusivityManagerId;
      const gestor = resolveGestor(p);

      // Status/valor de venda e locação só fazem sentido conforme a categoria real do
      // imóvel — muitos registros têm saleStatus/rentalStatus "ATIVO" preenchido mesmo
      // nunca tendo sido anunciados naquela finalidade (dado herdado da importação).
      const isVenda = p.category === "VENDA" || p.category === "VENDA_LOCACAO";
      const isLocacao = p.category === "LOCACAO" || p.category === "VENDA_LOCACAO";

      return [
        p.code || "",                                   // Código do Imóvel
        p.condominium?.name || "",
        p.address || "",
        p.number || "",
        p.towerName || "",
        p.unitNumber || "",
        quadra,
        lote,
        p.propertyOwner?.name || "",
        phones,
        p.propertyOwner?.email || "",
        typeLabels[p.type] || p.type || "",             // Tipo Detalhado
        formatTipologiaMacro(p.type),                   // Tipologia: Casa/Apartamento/Terreno/Comercial
        formatNumber(p.bedrooms),                       // Dormitórios
        isVenda ? formatStatus(p.saleStatus) : "",
        isVenda ? formatPrice(p.price) : "",
        isLocacao ? formatStatus(p.rentalStatus) : "",
        isLocacao ? formatPrice(p.rentPrice) : "",
        permuta,
        simNao(p.acceptsDirectPayment),                 // Parcelamento Direto
        formatNumber(p.area),                           // Área Construída
        formatNumber(p.totalArea),                      // Área Terreno
        formatNumber(p.usefulArea),                     // Área Útil
        simNao(p.isOccupied),                            // Habitado
        simNao(p.hasPlate),                             // Placa (S/N)
        simNao(!p.showOnWebsite),                       // Ocultado no Site
        exclusividade,                                  // Exclusividade: Tappy / Terceiros / Não
        gestorExcl,                                     // Gestor da Exclusividade
        simNao(temGestaoTerceiros),                     // Gestão de Terceiros
        gestor.tipo,                                     // Tipo Gestor: Corretor / Imobiliária
        gestor.telefone,                                 // Telefone Gestor
        simNao(p.isExclusive),                          // Gestão Tappy
        p.owner?.name || "",                            // Captador
        formatDateTime(p.createdAt),
        formatDateTime(p.updatedAt),
        p.updatedBy?.name || "",
      ];
    });

    if (format === "csv") {
      const headers = xlsxHeaders;
      const rows = xlsxRows;

      const BOM = "\uFEFF";
      const csv = BOM + [headers.map((c) => esc(String(c))).join(";"), ...rows.map((r) => r.map((c) => esc(String(c ?? ""))).join(";"))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="imoveis_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "json") return NextResponse.json(properties);

    // Excel (.xlsx) \u2014 padr\u00E3o. Reaproveita os mesmos cabe\u00E7alhos/linhas do CSV.
    {
      const ws = XLSX.utils.aoa_to_sheet([xlsxHeaders, ...xlsxRows]);
      ws["!cols"] = xlsxHeaders.map((h) => ({ wch: Math.min(Math.max(h.length + 2, 12), 32) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Im\u00F3veis");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="imoveis_${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting properties:", error);
    return NextResponse.json(
      { error: "Erro ao exportar imóveis" },
      { status: 500 }
    );
  }
}
