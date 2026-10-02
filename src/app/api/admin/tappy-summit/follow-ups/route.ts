import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVENT_SLUG = "tappy-summit-2026";

// GET /api/admin/tappy-summit/follow-ups - List all follow-ups
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const followUps = await prisma.eventFollowUp.findMany({
      where: { eventSlug: EVENT_SLUG },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });

    // Count sent logs per follow-up
    const followUpsWithStats = await Promise.all(
      followUps.map(async (fu) => {
        const [whatsappSentCount, emailSentCount, pendingCount] = await Promise.all([
          prisma.eventFollowUpLog.count({
            where: { followUpId: fu.id, whatsappSent: true },
          }),
          prisma.eventFollowUpLog.count({
            where: { followUpId: fu.id, emailSent: true },
          }),
          prisma.eventFollowUpLog.count({
            where: {
              followUpId: fu.id,
              scheduledFor: { lte: new Date() },
              OR: [
                { whatsappSent: false },
                { emailSent: false },
              ],
            },
          }),
        ]);

        return {
          ...fu,
          stats: {
            total: fu._count.logs,
            whatsappSent: whatsappSentCount,
            emailSent: emailSentCount,
            pending: pendingCount,
          },
        };
      })
    );

    return NextResponse.json({ followUps: followUpsWithStats });
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json({ error: "Erro ao buscar follow-ups" }, { status: 500 });
  }
}

// POST /api/admin/tappy-summit/follow-ups - Create a new follow-up
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const followUp = await prisma.eventFollowUp.create({
      data: {
        eventSlug: EVENT_SLUG,
        name: body.name,
        delayHours: body.delayHours ?? 0,
        delayType: body.delayType || "after_registration",
        sortOrder: body.sortOrder || 0,
        whatsappEnabled: body.whatsappEnabled ?? true,
        whatsappMessage: body.whatsappMessage || "",
        whatsappMediaUrl: body.whatsappMediaUrl || null,
        whatsappMediaType: body.whatsappMediaType || null,
        emailEnabled: body.emailEnabled ?? true,
        emailSubject: body.emailSubject || "Tappy Summit 2026",
        emailBody: body.emailBody || "",
        active: body.active ?? true,
      },
    });

    // Schedule this follow-up for all existing registrations
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventSlug: EVENT_SLUG },
      select: { id: true, createdAt: true },
    });

    if (registrations.length > 0) {
      await prisma.eventFollowUpLog.createMany({
        data: registrations.map((reg) => ({
          followUpId: followUp.id,
          registrationId: reg.id,
          scheduledFor: new Date(reg.createdAt.getTime() + followUp.delayHours * 60 * 60 * 1000),
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(followUp);
  } catch (error) {
    console.error("Error creating follow-up:", error);
    return NextResponse.json({ error: "Erro ao criar follow-up" }, { status: 500 });
  }
}
