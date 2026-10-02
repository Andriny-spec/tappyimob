import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAliases, createAlias, updateAlias, deleteAlias } from "@/lib/mailcow";

// GET /api/admin/email/aliases
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain") || undefined;

    const aliases = await getAliases(domain);

    return NextResponse.json({
      aliases: aliases.map((a) => ({
        id: a.id,
        address: a.address,
        goto: a.goto,
        domain: a.domain,
        active: a.active === 1,
        created: a.created,
      })),
      total: aliases.length,
    });
  } catch (error: any) {
    console.error("Erro ao listar aliases:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/email/aliases
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { address, goto, active } = body;
      if (!address || !goto) {
        return NextResponse.json({ error: "address e goto obrigatórios" }, { status: 400 });
      }

      const result = await createAlias({
        address,
        goto,
        active: active ? 1 : 0,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === "delete") {
      const { ids } = body;
      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: "ids obrigatório" }, { status: 400 });
      }

      const result = await deleteAlias(ids);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na operação de alias:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
