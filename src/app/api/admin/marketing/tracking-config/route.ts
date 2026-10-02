import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TRACKING_CONFIG_KEY as CONFIG_KEY, DEFAULT_TRACKING_CONFIG } from "@/lib/tracking-config";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "MARKETING")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const config = await prisma.systemConfig.findUnique({ where: { key: CONFIG_KEY } });
    const value = { ...DEFAULT_TRACKING_CONFIG, ...((config?.value as object) || {}) };

    return NextResponse.json({ config: value, isCustomized: !!config });
  } catch (error) {
    console.error("Erro ao buscar config de tracking:", error);
    return NextResponse.json({ error: "Erro ao buscar configuração" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "MARKETING")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const value = {
      gtmId: (body.gtmId || "").trim(),
      ga4Id: (body.ga4Id || "").trim(),
      metaPixelId: (body.metaPixelId || "").trim(),
      metaPixelIdSummit: (body.metaPixelIdSummit || "").trim(),
      googleAdsId: (body.googleAdsId || "").trim(),
    };

    const config = await prisma.systemConfig.upsert({
      where: { key: CONFIG_KEY },
      update: { value },
      create: { key: CONFIG_KEY, value },
    });
    revalidateTag("marketing-tracking-config", "minutes");

    return NextResponse.json({ config: config.value });
  } catch (error) {
    console.error("Erro ao salvar config de tracking:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 });
  }
}
