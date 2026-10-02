import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar aniversariantes da semana
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Corretor só vê aniversários dos seus próprios leads
    const isCorretor = session.role === "CORRETOR";

    // Buscar leads com birthDate
    const leads = await prisma.lead.findMany({
      where: {
        birthDate: { not: null },
        status: { notIn: ["PERDIDO", "ARQUIVADO"] },
        ...(isCorretor ? { corretorId: session.id } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        birthDate: true,
        status: true,
        corretor: {
          select: { id: true, name: true },
        },
      },
    });

    // Buscar proprietários com birthDate
    const owners = await prisma.propertyOwner.findMany({
      where: {
        birthDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phones: true,
        birthDate: true,
      },
    });

    // Buscar parceiros de negócio (corretores externos) com birthDate
    const brokers = await prisma.businessPartner.findMany({
      where: {
        birthDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
      },
    });

    const birthdays: Array<{
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      birthDate: string;
      type: "lead" | "owner" | "broker";
      age: number | null;
      daysUntil: number;
      isToday: boolean;
      assignedTo?: { id: string; name: string } | null;
    }> = [];

    const getDaysUntil = (birthDate: Date): number => {
      const thisYearBday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (thisYearBday < today) {
        thisYearBday.setFullYear(thisYearBday.getFullYear() + 1);
      }
      const diff = thisYearBday.getTime() - today.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const getAge = (birthDate: Date): number => {
      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Processar leads
    for (const lead of leads) {
      if (!lead.birthDate) continue;
      const bd = new Date(lead.birthDate);
      const daysUntil = getDaysUntil(bd);
      if (daysUntil <= 7) {
        birthdays.push({
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          birthDate: bd.toISOString(),
          type: "lead",
          age: getAge(bd) + (daysUntil === 0 ? 0 : 1),
          daysUntil,
          isToday: daysUntil === 0,
          assignedTo: lead.corretor,
        });
      }
    }

    // Processar proprietários
    for (const owner of owners) {
      if (!owner.birthDate) continue;
      const bd = new Date(owner.birthDate);
      const daysUntil = getDaysUntil(bd);
      if (daysUntil <= 7) {
        birthdays.push({
          id: owner.id,
          name: owner.name,
          phone: owner.phones?.[0] || null,
          email: owner.email,
          birthDate: bd.toISOString(),
          type: "owner",
          age: getAge(bd) + (daysUntil === 0 ? 0 : 1),
          daysUntil,
          isToday: daysUntil === 0,
        });
      }
    }

    // Processar parceiros (corretores externos)
    for (const broker of brokers) {
      if (!broker.birthDate) continue;
      const bd = new Date(broker.birthDate);
      const daysUntil = getDaysUntil(bd);
      if (daysUntil <= 7) {
        birthdays.push({
          id: broker.id,
          name: broker.name,
          phone: broker.phone,
          email: broker.email,
          birthDate: bd.toISOString(),
          type: "broker",
          age: getAge(bd) + (daysUntil === 0 ? 0 : 1),
          daysUntil,
          isToday: daysUntil === 0,
        });
      }
    }

    // Ordenar: hoje primeiro, depois por daysUntil
    birthdays.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.daysUntil - b.daysUntil;
    });

    const todayCount = birthdays.filter((b) => b.isToday).length;

    return NextResponse.json({
      birthdays,
      todayCount,
      weekCount: birthdays.length,
    });
  } catch (error) {
    console.error("Erro ao buscar aniversariantes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
