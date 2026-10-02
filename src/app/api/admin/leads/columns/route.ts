import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Colunas padrão ADMIN = Funil de Vendas
const defaultAdminColumns = [
  { title: "Novos", status: "NOVO", color: "#06B6D4", icon: "inbox", order: 1, funnelStage: null, scope: "ADMIN" },
  { title: "Triagem de Demanda", status: "TRIAGEM", color: "#3B82F6", icon: "search", order: 2, funnelStage: "TRIAGEM", scope: "ADMIN" },
  { title: "Qualificação", status: "CONTATADO", color: "#8B5CF6", icon: "phone", order: 3, funnelStage: "QUALIFICACAO", scope: "ADMIN" },
  { title: "Desenvolvimento", status: "QUALIFICADO", color: "#F59E0B", icon: "star", order: 4, funnelStage: "DESENVOLVIMENTO", scope: "ADMIN" },
  { title: "Em Negociação", status: "NEGOCIANDO", color: "#10B981", icon: "handshake", order: 5, funnelStage: "NEGOCIACAO", scope: "ADMIN" },
  { title: "Efetivados", status: "FECHADO", color: "#22C55E", icon: "check", order: 6, funnelStage: "EFETIVADOS", scope: "ADMIN" },
  { title: "Perdidos", status: "PERDIDO", color: "#EF4444", icon: "x", order: 7, funnelStage: null, scope: "ADMIN" },
];

// Colunas padrão SDR = Recepção e Triagem
const defaultSdrColumns = [
  { title: "Novos", status: "NOVO", color: "#3B82F6", icon: "inbox", order: 1, funnelStage: null, scope: "SDR" },
  { title: "Em Contato", status: "CONTATADO", color: "#8B5CF6", icon: "phone", order: 2, funnelStage: null, scope: "SDR" },
  { title: "Qualificados", status: "QUALIFICADO", color: "#F59E0B", icon: "star", order: 3, funnelStage: null, scope: "SDR" },
  { title: "Atribuídos", status: "NEGOCIANDO", color: "#10B981", icon: "handshake", order: 4, funnelStage: null, scope: "SDR" },
];

// GET - Buscar colunas do kanban (filtradas por scope)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "ADMIN";
    const reset = searchParams.get("reset") === "true";

    // Reset: deletar colunas do scope e recriar defaults
    if (reset && session.role === "ADMIN") {
      await prisma.kanbanColumn.deleteMany({ where: { scope } });
    }

    let columns = await prisma.kanbanColumn.findMany({
      where: { scope },
      orderBy: { order: "asc" },
    });

    // Se não existem colunas para o scope, criar as padrão
    if (columns.length === 0) {
      const defaults = scope === "SDR" ? defaultSdrColumns : defaultAdminColumns;
      await prisma.kanbanColumn.createMany({
        data: defaults.map((col) => ({
          title: col.title,
          status: col.status as any,
          color: col.color,
          icon: col.icon,
          order: col.order,
          funnelStage: col.funnelStage,
          scope: col.scope,
          automationEnabled: false,
        })),
      });

      columns = await prisma.kanbanColumn.findMany({
        where: { scope },
        orderBy: { order: "asc" },
      });
    }

    return NextResponse.json({ columns });
  } catch (error) {
    console.error("Erro ao buscar colunas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT - Atualizar uma coluna (título, cor, ordem, automação)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas ADMIN pode editar colunas
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem editar colunas" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, color, icon, order, automationEnabled, automationRules, funnelStage } = body;

    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (automationEnabled !== undefined) updateData.automationEnabled = automationEnabled;
    if (automationRules !== undefined) updateData.automationRules = automationRules;
    if (funnelStage !== undefined) updateData.funnelStage = funnelStage;

    const column = await prisma.kanbanColumn.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ column });
  } catch (error) {
    console.error("Erro ao atualizar coluna:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar nova coluna
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem criar colunas" }, { status: 403 });
    }

    const body = await req.json();
    const { title, status, color, icon, scope: colScope } = body;

    if (!title || !status) {
      return NextResponse.json({ error: "Título e status são obrigatórios" }, { status: 400 });
    }

    const targetScope = colScope || "ADMIN";

    // Verificar se já existe coluna com o mesmo status no scope
    const existing = await prisma.kanbanColumn.findFirst({
      where: { status: status as any, scope: targetScope },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Já existe uma coluna com o status "${status}" neste kanban. Use um status diferente.` },
        { status: 409 }
      );
    }

    // Pegar a maior ordem existente para o scope
    const maxOrder = await prisma.kanbanColumn.aggregate({
      _max: { order: true },
      where: { scope: targetScope },
    });
    const newOrder = (maxOrder._max.order || 0) + 1;

    const column = await prisma.kanbanColumn.create({
      data: {
        title,
        status: status as any,
        color: color || "#6B7280",
        icon: icon || "folder",
        order: newOrder,
        scope: targetScope,
        automationEnabled: false,
      },
    });

    return NextResponse.json({ column });
  } catch (error) {
    console.error("Erro ao criar coluna:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Deletar coluna
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem deletar colunas" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    await prisma.kanbanColumn.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar coluna:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PATCH - Reordenar colunas (batch update)
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas ADMIN pode reordenar
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem reordenar colunas" }, { status: 403 });
    }

    const body = await req.json();
    const { columns, columnIds } = body;

    // Aceitar dois formatos:
    // 1) { columns: [{ id, order }] }
    // 2) { columnIds: ["id1", "id2", ...] } - ordem inferida pela posição no array
    let updates: { id: string; order: number }[] = [];

    if (columnIds && Array.isArray(columnIds)) {
      updates = columnIds.map((id: string, index: number) => ({ id, order: index + 1 }));
    } else if (columns && Array.isArray(columns)) {
      updates = columns;
    } else {
      return NextResponse.json({ error: "Array de colunas obrigatório (columns ou columnIds)" }, { status: 400 });
    }

    // Atualizar ordem de cada coluna
    await Promise.all(
      updates.map((col) =>
        prisma.kanbanColumn.update({
          where: { id: col.id },
          data: { order: col.order },
        })
      )
    );

    const updated = await prisma.kanbanColumn.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ columns: updated });
  } catch (error) {
    console.error("Erro ao reordenar colunas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
