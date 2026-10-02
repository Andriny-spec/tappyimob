import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Buscar opções customizadas do banco via Prisma model
async function getCustomOptions() {
  try {
    return await prisma.propertyCustomOption.findMany({
      select: { category: true, value: true, hidden: true },
      orderBy: { value: "asc" },
    });
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // Sem filtro restritivo — mostrar features/extras de TODOS os imóveis
    // para que os filtros no admin/corretor funcionem com qualquer status

    // Get distinct features from properties (Área Privativa no DB)
    const propertiesFeatures = await prisma.property.findMany({
      where: {
        features: { isEmpty: false },
      },
      select: { features: true },
    });

    const privateSet = new Set<string>();
    for (const p of propertiesFeatures) {
      for (const f of p.features) {
        const trimmed = f.trim();
        if (trimmed) privateSet.add(trimmed);
      }
    }

    // Get distinct extras from properties (Diferenciais no DB)
    const propertiesExtras = await prisma.property.findMany({
      where: {
        extras: { isEmpty: false },
      },
      select: { extras: true },
    });

    const extrasSet = new Set<string>();
    for (const p of propertiesExtras) {
      for (const e of p.extras) {
        const trimmed = e.trim();
        if (trimmed) extrasSet.add(trimmed);
      }
    }

    // Get distinct amenities from properties
    const propertiesAmenities = await prisma.property.findMany({
      where: { amenities: { isEmpty: false } },
      select: { amenities: true },
    });
    for (const p of propertiesAmenities) {
      for (const a of p.amenities) {
        const trimmed = a.trim();
        if (trimmed) extrasSet.add(trimmed);
      }
    }

    // Default options that should always be available (even if no property has them yet)
    const defaultExtras = [
      "Energia Fotovoltaica", "Aquecimento Solar", "Elevador", "Escritório",
      "Cinema", "Sauna", "Terreno com Verde", "Vista Livre", "Automação Residencial",
      "Churrasqueira", "Moderna", "Retrofit", "Sala de TV", "Terreno Amplo",
      "Esquina", "Último Andar", "Suíte Térrea", "Próximo da Portaria",
      "Próximo da Área de Lazer", "Oportunidade", "Mobiliado",
    ];

    const defaultPrivate = [
      "Ar condicionado", "Varanda", "Closet", "Cozinha americana",
      "Quintal", "Piscina privativa", "Mobiliado",
    ];

    const defaultCategories = [
      "Tamboré I", "Tamboré II", "Tamboré III", "Retrofit",
      "Casas Térreas", "Villagios", "Casas (Centro de Sua Cidade)",
      "Lançamentos", "Exclusividades", "Vistas Incríveis",
      "Aptos (Centro de Sua Cidade)",
    ];

    // Buscar opções customizadas (inclui hidden para filtragem)
    const customOptions = await getCustomOptions();
    const hiddenSet = new Set<string>();
    for (const opt of customOptions) {
      if (opt.hidden) {
        hiddenSet.add(`${opt.category}::${opt.value}`);
      }
    }

    // Merge defaults with DB values (excluindo hidden)
    for (const f of defaultPrivate) {
      if (!hiddenSet.has(`private::${f}`)) privateSet.add(f);
    }
    for (const f of defaultExtras) {
      if (!hiddenSet.has(`extras::${f}`)) extrasSet.add(f);
    }

    // Merge custom options visíveis
    for (const opt of customOptions) {
      if (opt.hidden) continue;
      if (opt.category === "private") privateSet.add(opt.value);
      else if (opt.category === "extras") extrasSet.add(opt.value);
      else if (opt.category === "propertyCategories") defaultCategories.push(opt.value);
    }

    // Filtrar hidden de valores vindos de outros imóveis também
    for (const h of hiddenSet) {
      const [cat, val] = h.split("::");
      if (cat === "private") privateSet.delete(val);
      else if (cat === "extras") extrasSet.delete(val);
    }

    return NextResponse.json({
      // "features" = opções para Diferenciais e Características (extras no DB)
      features: Array.from(extrasSet).sort(),
      // "extras" = legacy, mantido por compatibilidade
      extras: Array.from(extrasSet).sort(),
      // "private" = opções para Área Privativa (features no DB) - agora agrega do DB!
      private: Array.from(privateSet).sort(),
      propertyCategories: [...new Set(defaultCategories)].sort(),
    });
  } catch (error) {
    console.error("Error fetching property options:", error);
    return NextResponse.json(
      { error: "Erro ao buscar opções" },
      { status: 500 }
    );
  }
}

// POST - Salvar nova opção customizada (persiste mesmo se não selecionada em nenhum imóvel)
export async function POST(request: NextRequest) {
  try {
    const { category, value } = await request.json();
    if (!category || !value?.trim()) {
      return NextResponse.json({ error: "category e value são obrigatórios" }, { status: 400 });
    }

    await prisma.propertyCustomOption.upsert({
      where: { category_value: { category, value: value.trim() } },
      update: { hidden: false },
      create: { category, value: value.trim(), hidden: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving custom option:", error);
    return NextResponse.json({ error: "Erro ao salvar opção" }, { status: 500 });
  }
}

// DELETE - Remover/ocultar opção (marca como hidden em vez de deletar)
export async function DELETE(request: NextRequest) {
  try {
    const { category, value } = await request.json();
    if (!category || !value) {
      return NextResponse.json({ error: "category e value são obrigatórios" }, { status: 400 });
    }

    await prisma.propertyCustomOption.upsert({
      where: { category_value: { category, value: value.trim() } },
      update: { hidden: true },
      create: { category, value: value.trim(), hidden: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error hiding custom option:", error);
    return NextResponse.json({ error: "Erro ao remover opção" }, { status: 500 });
  }
}
