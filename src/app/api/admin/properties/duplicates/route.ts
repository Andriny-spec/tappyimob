import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar imóveis com endereço duplicado
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get("onlyActive") === "true";

    // Buscar todos os imóveis com endereço
    const whereClause: any = {};
    if (onlyActive) {
      whereClause.status = "DISPONIVEL";
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        title: true,
        address: true,
        number: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        status: true,
        price: true,
        thumbnail: true,
        type: true,
        category: true,
        createdAt: true,
        // Campos específicos para apartamentos
        towerName: true,
        unitNumber: true,
        condominiumId: true,
        condominium: {
          select: {
            id: true,
            name: true,
          },
        },
        propertyOwner: {
          select: {
            id: true,
            name: true,
            // NÃO incluir telefone e e-mail por segurança
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { address: "asc" },
        { number: "asc" },
      ],
    });

    // Agrupar por chave de duplicidade baseada no tipo de imóvel
    const addressGroups: Record<string, typeof properties> = {};

    properties.forEach((property) => {
      // APARTAMENTOS: Agrupar por condomínio + torre + unidade
      // CASAS/OUTROS: Agrupar por endereço + número + bairro + cidade
      const duplicateKey = getDuplicateKey(property);

      if (!duplicateKey) return; // Pular se não tiver dados suficientes

      if (!addressGroups[duplicateKey]) {
        addressGroups[duplicateKey] = [];
      }
      addressGroups[duplicateKey].push(property);
    });

    // Filtrar apenas grupos com mais de 1 imóvel (duplicados)
    const duplicates = Object.entries(addressGroups)
      .filter(([_, props]) => props.length > 1)
      .map(([address, props]) => ({
        address,
        count: props.length,
        properties: props.map((p) => ({
          ...p,
          hasActiveStatus: p.status === "DISPONIVEL",
        })),
        hasMultipleActive: props.filter((p) => p.status === "DISPONIVEL").length > 1,
      }))
      .sort((a, b) => {
        // Priorizar grupos com múltiplos ativos
        if (a.hasMultipleActive && !b.hasMultipleActive) return -1;
        if (!a.hasMultipleActive && b.hasMultipleActive) return 1;
        return b.count - a.count;
      });

    // Estatísticas (endereço)
    const totalDuplicateGroups = duplicates.length;
    const totalDuplicateProperties = duplicates.reduce((acc, d) => acc + d.count, 0);
    const groupsWithMultipleActive = duplicates.filter((d) => d.hasMultipleActive).length;

    // Criar mapa de IDs duplicados para uso na listagem
    const duplicateIds = new Set<string>();
    duplicates.forEach((group) => {
      if (group.hasMultipleActive) {
        group.properties.forEach((p) => {
          if (p.hasActiveStatus) {
            duplicateIds.add(p.id);
          }
        });
      }
    });

    // ============================================
    // DUPLICATAS POR CÓDIGO (ex: CNCL2015 e CNCL2015-2)
    // ============================================
    const codeGroups: Record<string, typeof properties> = {};

    properties.forEach((property) => {
      if (!property.code) return;
      // Extrair código base: remover sufixo -2, -3, etc.
      const baseCode = property.code.replace(/-\d+$/, "");
      if (!codeGroups[baseCode]) {
        codeGroups[baseCode] = [];
      }
      codeGroups[baseCode].push(property);
    });

    // Filtrar apenas grupos com mais de 1 imóvel E que tenham pelo menos um com sufixo
    const codeDuplicates = Object.entries(codeGroups)
      .filter(([baseCode, props]) => {
        if (props.length <= 1) return false;
        // Verificar se pelo menos um tem sufixo (-2, -3, etc.)
        return props.some((p) => p.code !== baseCode);
      })
      .map(([baseCode, props]) => ({
        baseCode,
        count: props.length,
        properties: props
          .map((p) => ({
            ...p,
            hasActiveStatus: p.status === "DISPONIVEL",
            hasSuffix: p.code !== baseCode,
          }))
          .sort((a, b) => a.code.localeCompare(b.code)),
        hasMultipleActive: props.filter((p) => p.status === "DISPONIVEL").length > 1,
      }))
      .sort((a, b) => {
        if (a.hasMultipleActive && !b.hasMultipleActive) return -1;
        if (!a.hasMultipleActive && b.hasMultipleActive) return 1;
        return b.count - a.count;
      });

    const codeStats = {
      totalGroups: codeDuplicates.length,
      totalProperties: codeDuplicates.reduce((acc, d) => acc + d.count, 0),
      groupsWithMultipleActive: codeDuplicates.filter((d) => d.hasMultipleActive).length,
    };

    return NextResponse.json({
      duplicates,
      codeDuplicates,
      stats: {
        totalGroups: totalDuplicateGroups,
        totalProperties: totalDuplicateProperties,
        groupsWithMultipleActive,
      },
      codeStats,
      duplicateIds: Array.from(duplicateIds),
    });
  } catch (error) {
    console.error("Erro ao buscar duplicados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar duplicados" },
      { status: 500 }
    );
  }
}

// Função para gerar chave de duplicidade baseada no tipo de imóvel
function getDuplicateKey(property: any): string | null {
  const normalize = (str: string | null | undefined) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const isApartment = property.type === "APARTAMENTO" || property.type === "FLAT" || property.type === "COBERTURA" || property.type === "STUDIO";

  if (isApartment) {
    // APARTAMENTOS: Agrupar por condomínio + torre + unidade
    // Usar complement como fallback para unitNumber (ex: "Apto 123", "Unid. 5")
    const unit = property.unitNumber || property.complement || "";

    // Se tiver condomínio e torre/unidade, usar esses dados
    if (property.condominiumId && property.towerName && unit) {
      return `APT_${normalize(property.condominiumId)}_${normalize(property.towerName)}_${normalize(unit)}`;
    }
    // Condomínio + unidade (sem torre)
    if (property.condominiumId && unit) {
      return `APT_${normalize(property.condominiumId)}_${normalize(unit)}`;
    }
    // Fallback: usar endereço + torre + unidade
    if (property.towerName && unit) {
      return `APT_${normalize(property.address)}_${normalize(property.towerName)}_${normalize(unit)}_${normalize(property.neighborhood)}`;
    }
    // Se não tiver torre/unidade, usar endereço completo (incluindo complemento)
    return `APT_${normalize(property.address)}_${normalize(property.number)}_${normalize(property.complement)}_${normalize(property.neighborhood)}_${normalize(property.city)}`;
  }

  // CASAS E OUTROS: Agrupar por endereço + número + complemento + bairro + cidade
  // Complemento é essencial para diferenciar unidades no mesmo endereço (ex: lotes em condomínio)
  if (!property.address || !property.neighborhood || !property.city) {
    return null; // Dados insuficientes
  }

  return `CASA_${normalize(property.address)}_${normalize(property.number)}_${normalize(property.complement)}_${normalize(property.neighborhood)}_${normalize(property.city)}`;
}
