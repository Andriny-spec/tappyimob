import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin, registrarEvento } from "@/lib/saas";

const ROTULO: Record<string, string> = { PAGO: "paga", CANCELADO: "cancelada", ESTORNADO: "estornada", PENDENTE: "reaberta" };

// PATCH — baixa manual, cancelamento, estorno ou reabertura de uma cobrança.
// Pagar a última pendência de um inadimplente reativa a assinatura.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro, session } = await exigirAdmin();
  if (erro) return erro;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  if (!["PAGO", "CANCELADO", "ESTORNADO", "PENDENTE"].includes(b.status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const p = await prisma.saasPagamento.findUnique({ where: { id }, include: { assinante: true } });
  if (!p) return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });

  const pagamento = await prisma.saasPagamento.update({
    where: { id },
    data: {
      status: b.status === "PENDENTE" && p.vencimento < new Date() ? "ATRASADO" : b.status,
      pagoEm: b.status === "PAGO" ? (b.pagoEm ? new Date(`${b.pagoEm}T12:00:00`) : new Date()) : null,
      ...(b.metodo ? { metodo: b.metodo } : {}),
    },
  });

  const a = p.assinante;
  if (b.status === "PAGO") {
    const pendentes = await prisma.saasPagamento.count({ where: { assinanteId: a.id, status: "ATRASADO" } });
    // Primeiro pagamento encerra o teste; quitar a dívida reativa
    if ((a.status === "TRIAL" || a.status === "INADIMPLENTE") && pendentes === 0) {
      await prisma.saasAssinante.update({ where: { id: a.id }, data: { status: "ATIVA", siteStatus: a.siteStatus === "SUSPENSO" ? "PUBLICADO" : a.siteStatus } });
      await registrarEvento(a.id, "STATUS", "Assinatura ativa após pagamento.", session!.name);
    }
  }
  await registrarEvento(a.id, "PAGAMENTO", `Cobrança ${p.referencia} ${ROTULO[b.status]}.`, session!.name);
  return NextResponse.json(pagamento);
}
