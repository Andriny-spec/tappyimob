import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [total, pendentes, aprovados, rejeitados] = await Promise.all([
    prisma.property.count({ where: { partnerSubmittedById: session.id } }),
    prisma.property.count({ where: { partnerSubmittedById: session.id, partnerApprovalStatus: "PENDENTE" } }),
    prisma.property.count({ where: { partnerSubmittedById: session.id, partnerApprovalStatus: "APROVADO" } }),
    prisma.property.count({ where: { partnerSubmittedById: session.id, partnerApprovalStatus: "REJEITADO" } }),
  ]);

  return NextResponse.json({ total, pendentes, aprovados, rejeitados });
}
