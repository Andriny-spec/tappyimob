import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST - Importar parceiros em lote
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { items, type } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of items) {
      try {
        const name = item.name?.toString().trim();
        if (!name) { skipped++; continue; }

        const cpf = item.cpf?.toString().trim() || null;
        const email = item.email?.toString().trim() || null;
        const phone = item.phone?.toString().trim() || null;
        const creci = item.creci?.toString().trim() || null;

        // Verificar duplicata por CPF ou CRECI
        let existing = null;
        if (cpf) {
          existing = await prisma.businessPartner.findUnique({ where: { cpf } });
        }
        if (!existing && creci) {
          existing = await prisma.businessPartner.findFirst({ where: { creci, type: type || "CORRETOR" } });
        }
        if (!existing && email) {
          existing = await prisma.businessPartner.findFirst({ where: { email, type: type || "CORRETOR" } });
        }

        if (existing) {
          // Atualizar existente (apenas campos não vazios)
          const updateData: any = {};
          if (phone && !existing.phone) updateData.phone = phone;
          if (email && !existing.email) updateData.email = email;
          if (creci && !existing.creci) updateData.creci = creci;
          if (item.rg && !existing.rg) updateData.rg = item.rg;
          if (item.gender && !existing.gender) updateData.gender = item.gender;
          if (item.address && !existing.address) updateData.address = item.address;
          if (item.neighborhood && !existing.neighborhood) updateData.neighborhood = item.neighborhood;
          if (item.city && !existing.city) updateData.city = item.city;
          if (item.state && !existing.state) updateData.state = item.state;
          if (item.zipCode && !existing.zipCode) updateData.zipCode = item.zipCode;
          if (item.pixKey && !existing.pixKey) updateData.pixKey = item.pixKey;
          if (item.bankName && !existing.bankName) updateData.bankName = item.bankName;
          if (item.bankAgency && !existing.bankAgency) updateData.bankAgency = item.bankAgency;
          if (item.bankAccount && !existing.bankAccount) updateData.bankAccount = item.bankAccount;
          if (item.partnershipFormat) updateData.partnershipFormat = item.partnershipFormat;
          if (item.creciStatus) updateData.creciStatus = item.creciStatus;

          if (Object.keys(updateData).length > 0) {
            await prisma.businessPartner.update({
              where: { id: existing.id },
              data: updateData,
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Criar novo
          await prisma.businessPartner.create({
            data: {
              type: type || "CORRETOR",
              name,
              email,
              phone,
              cpf,
              rg: item.rg || null,
              creci,
              creciStatus: item.creciStatus || "ATIVO",
              gender: item.gender || null,
              birthDate: item.birthDate ? new Date(item.birthDate) : null,
              isAutonomous: true,
              partnershipFormat: item.partnershipFormat || "CAPTADOR",
              address: item.address || null,
              neighborhood: item.neighborhood || null,
              city: item.city || null,
              state: item.state || null,
              zipCode: item.zipCode || null,
              pixKey: item.pixKey || null,
              bankName: item.bankName || null,
              bankAgency: item.bankAgency || null,
              bankAccount: item.bankAccount || null,
              tags: item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : [],
            },
          });
          created++;
        }
      } catch (itemError: any) {
        console.error("Erro ao processar parceiro:", itemError.message);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
      total: items.length,
    });
  } catch (error) {
    console.error("Erro ao importar parceiros:", error);
    return NextResponse.json(
      { error: "Erro ao importar parceiros" },
      { status: 500 }
    );
  }
}
