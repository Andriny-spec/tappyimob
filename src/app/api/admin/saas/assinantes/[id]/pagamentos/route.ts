import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin, proximoVencimento, referenciaDo, registrarEvento } from "@/lib/saas";

// POST — gera a próxima cobrança do assinante (ou uma avulsa, com valor e vencimento)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro, session } = await exigirAdmin();
  if (erro) return erro;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));

  const a = await prisma.saasAssinante.findUnique({
    where: { id },
    include: { pagamentos: { orderBy: { vencimento: "desc" }, take: 1 } },
  });
  if (!a) return NextResponse.json({ error: "Assinante não encontrado" }, { status: 404 });

  // Sem data informada: um ciclo depois da última cobrança
  const base = a.pagamentos[0]?.vencimento ?? a.proximaCobranca ?? new Date();
  const vencimento = b.vencimento ? new Date(`${b.vencimento}T12:00:00`) : a.pagamentos[0] ? proximoVencimento(base, a.ciclo) : base;
  if (Number.isNaN(vencimento.getTime())) return NextResponse.json({ error: "Vencimento inválido" }, { status: 400 });
  const valor = b.valor !== undefined && b.valor !== "" ? Number(b.valor) : a.valor;
  if (!(valor > 0)) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });

  const pagamento = await prisma.saasPagamento.create({
    data: {
      assinanteId: id,
      valor,
      vencimento,
      referencia: b.referencia || referenciaDo(vencimento, a.ciclo),
      metodo: ["PIX", "BOLETO", "CARTAO", "MANUAL"].includes(b.metodo) ? b.metodo : "PIX",
      observacao: b.observacao || null,
    },
  });
  await prisma.saasAssinante.update({ where: { id }, data: { proximaCobranca: vencimento } });
  await registrarEvento(
    id,
    "COBRANCA",
    `Cobrança ${pagamento.referencia} gerada: ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}, vence em ${vencimento.toLocaleDateString("pt-BR")}.`,
    session!.name
  );
  return NextResponse.json(pagamento, { status: 201 });
}
