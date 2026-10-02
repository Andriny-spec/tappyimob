import { prisma } from "@/lib/prisma";

/**
 * Detecta automaticamente leads duplicados ao criar um novo lead.
 * Verifica por telefone, email, CPF e nome+telefone parcial.
 * Cria registros LeadDuplicate para revisão manual.
 */
export async function detectDuplicatesForLead(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true, email: true, phone: true, cpf: true, corretorId: true },
    });

    if (!lead) return { found: 0 };

    const phone = lead.phone?.replace(/\D/g, "") || "";
    const email = lead.email?.toLowerCase().trim() || "";
    const cpf = (lead as any).cpf?.replace(/\D/g, "") || "";
    const name = lead.name?.toLowerCase().trim() || "";

    // Build OR conditions for potential matches
    const orConditions: any[] = [];

    if (phone && phone.length >= 8) {
      orConditions.push({ phone: { not: null } });
    }
    if (email) {
      orConditions.push({ email: { equals: email, mode: "insensitive" } });
    }
    if (cpf) {
      orConditions.push({ cpf: { not: null } });
    }

    if (orConditions.length === 0 && !name) return { found: 0 };

    // Fetch potential matches (exclude the lead itself)
    const candidates = await prisma.lead.findMany({
      where: {
        id: { not: leadId },
        OR: orConditions.length > 0 ? orConditions : undefined,
      },
      select: { id: true, name: true, email: true, phone: true, cpf: true, corretorId: true },
    });

    const duplicatesFound: string[] = [];

    for (const other of candidates) {
      let matchType: string | null = null;
      let matchScore = 0;

      // Check phone (normalized)
      const otherPhone = other.phone?.replace(/\D/g, "") || "";
      if (phone && otherPhone && phone === otherPhone) {
        matchType = "PHONE";
        matchScore = 100;
      }

      // Check email
      if (!matchType && email && other.email?.toLowerCase().trim() === email) {
        matchType = "EMAIL";
        matchScore = 100;
      }

      // Check CPF
      if (!matchType && cpf) {
        const otherCpf = (other as any).cpf?.replace(/\D/g, "") || "";
        if (otherCpf && cpf === otherCpf) {
          matchType = "CPF";
          matchScore = 100;
        }
      }

      // Check name + partial phone
      if (!matchType && name && other.name) {
        const otherName = other.name.toLowerCase().trim();
        if (name === otherName && phone && otherPhone && phone.slice(-8) === otherPhone.slice(-8)) {
          matchType = "NAME_PHONE";
          matchScore = 90;
        }
      }

      if (matchType) {
        // Ensure consistent ordering (smaller id first)
        const id1 = leadId < other.id ? leadId : other.id;
        const id2 = leadId < other.id ? other.id : leadId;

        try {
          await prisma.leadDuplicate.create({
            data: {
              leadId1: id1,
              leadId2: id2,
              matchType,
              matchScore,
              corretor1Id: id1 === leadId ? lead.corretorId : other.corretorId,
              corretor2Id: id2 === leadId ? lead.corretorId : other.corretorId,
            },
          });
          duplicatesFound.push(other.id);
        } catch (err: any) {
          // Unique constraint violation = duplicate pair already exists, skip
          if (err.code !== "P2002") {
            console.error("Erro ao criar registro de duplicado:", err);
          }
        }
      }
    }

    return { found: duplicatesFound.length, duplicateLeadIds: duplicatesFound };
  } catch (error) {
    console.error("Erro na detecção automática de duplicados:", error);
    return { found: 0 };
  }
}
