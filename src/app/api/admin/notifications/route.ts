import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
    return decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
}

// GET - Buscar notificações do usuário logado
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";
    const targetUserId = searchParams.get("userId") || userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const where: any = { userId: targetUserId };
    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: targetUserId, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

// PUT - Marcar notificações como lidas
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserFromToken();
    const body = await request.json();
    const { notificationId, markAll } = body;

    const targetUserId = body.userId || userId;
    if (!targetUserId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: targetUserId, read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
