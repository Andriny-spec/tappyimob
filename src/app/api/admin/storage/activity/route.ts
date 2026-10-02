import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar atividades de um arquivo ou pasta
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const folderId = searchParams.get("folderId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = {};
    if (fileId) where.fileId = fileId;
    if (folderId) where.folderId = folderId;

    // Se nenhum filtro, retorna atividades recentes gerais (só admin)
    if (!fileId && !folderId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const [logs, total] = await Promise.all([
      prisma.storageActivityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.storageActivityLog.count({ where }),
    ]);

    // Enriquecer com nomes de usuário se não tiver
    const userIds = [...new Set(logs.filter((l) => l.userId).map((l) => l.userId!))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, avatar: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedLogs = logs.map((log) => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Erro ao listar atividades:", error);
    return NextResponse.json({ error: "Erro ao listar atividades" }, { status: 500 });
  }
}
