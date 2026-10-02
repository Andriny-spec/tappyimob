import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Helper: delete all related records for given lead IDs
async function deleteLeadRelations(leadIds: string[]) {
  if (leadIds.length === 0) return;
  // Batch in chunks of 500 to avoid query size limits
  for (let i = 0; i < leadIds.length; i += 500) {
    const chunk = leadIds.slice(i, i + 500);
    // Delete all direct relations (onDelete: Cascade models)
    await Promise.all([
      prisma.leadNote.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.leadActivity.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.leadSchedule.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.leadProperty.deleteMany({ where: { leadId: { in: chunk } } }),
    ]);
    // Relations that might exist
    await Promise.allSettled([
      prisma.scheduledVisit.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.task.updateMany({ where: { leadId: { in: chunk } }, data: { leadId: null } }),
      prisma.contract.updateMany({ where: { leadId: { in: chunk } }, data: { leadId: null } }),
    ]);
    // Optional relations
    await Promise.allSettled([
      prisma.leadQueueAssignment.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.leadDuplicate.deleteMany({ where: { OR: [{ leadId1: { in: chunk } }, { leadId2: { in: chunk } }] } }),
      prisma.leadAutomationLog.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.leadFollowUp.deleteMany({ where: { leadId: { in: chunk } } }),
      prisma.leadEnrichment.deleteMany({ where: { leadId: { in: chunk } } }),
    ]);
  }
}

// POST - Bulk delete leads
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { ids, status, all } = body;

    // Delete by specific IDs
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await deleteLeadRelations(ids);
      const result = await prisma.lead.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ deleted: result.count });
    }

    // Delete all leads with a specific status
    if (status) {
      const leadIds = await prisma.lead.findMany({
        where: { status },
        select: { id: true },
      });
      const idsToDelete = leadIds.map(l => l.id);
      
      if (idsToDelete.length > 0) {
        await deleteLeadRelations(idsToDelete);
        const result = await prisma.lead.deleteMany({
          where: { status },
        });
        return NextResponse.json({ deleted: result.count });
      }
      return NextResponse.json({ deleted: 0 });
    }

    // Delete ALL leads (dangerous - requires explicit confirmation)
    if (all === true) {
      const allLeadIds = await prisma.lead.findMany({ select: { id: true } });
      const idsToDelete = allLeadIds.map(l => l.id);
      await deleteLeadRelations(idsToDelete);
      const result = await prisma.lead.deleteMany({});
      return NextResponse.json({ deleted: result.count });
    }

    return NextResponse.json({ error: "Forneça ids, status, ou all=true" }, { status: 400 });
  } catch (error) {
    console.error("Error bulk deleting leads:", error);
    return NextResponse.json(
      { error: "Erro ao deletar leads em massa" },
      { status: 500 }
    );
  }
}
