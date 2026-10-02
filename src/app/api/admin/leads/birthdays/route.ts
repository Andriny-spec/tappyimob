import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar aniversariantes da semana (leads com birthDate)
export async function GET() {
  try {
    const session = await getSession();
    const isCorretor = session?.role === "CORRETOR";

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();

    // Buscar todos os leads com birthDate definida e que não estejam arquivados/banidos
    // Corretor só vê aniversários dos seus próprios leads
    const leadsWithBirthday = await prisma.lead.findMany({
      where: {
        birthDate: { not: null },
        archivedAt: null,
        isBanned: false,
        ...(isCorretor && session?.id ? { corretorId: session.id } : {}),
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        phone: true,
        email: true,
        birthDate: true,
        temperature: true,
        status: true,
        corretor: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Filtrar por semana: hoje até 7 dias no futuro (considerando mês/dia)
    const weekBirthdays: any[] = [];
    const todayBirthdays: any[] = [];

    for (const lead of leadsWithBirthday) {
      if (!lead.birthDate) continue;
      const bd = new Date(lead.birthDate);
      const bdMonth = bd.getMonth() + 1;
      const bdDay = bd.getDate();

      // Calcular se está dentro dos próximos 7 dias
      for (let offset = 0; offset <= 7; offset++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + offset);
        if (checkDate.getMonth() + 1 === bdMonth && checkDate.getDate() === bdDay) {
          const age = now.getFullYear() - bd.getFullYear();
          const entry = {
            ...lead,
            birthdayDay: bdDay,
            birthdayMonth: bdMonth,
            age,
            daysUntil: offset,
            isToday: offset === 0,
          };
          weekBirthdays.push(entry);
          if (offset === 0) todayBirthdays.push(entry);
          break;
        }
      }
    }

    // Ordenar por dias até o aniversário
    weekBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

    return NextResponse.json({
      today: todayBirthdays,
      week: weekBirthdays,
      totalToday: todayBirthdays.length,
      totalWeek: weekBirthdays.length,
    });
  } catch (error: any) {
    console.error("Erro ao buscar aniversariantes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
