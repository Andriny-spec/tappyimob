import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  avatar: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birthDate: z.string().optional().nullable(),
  creci: z.string().optional(),
  maritalStatus: z.string().optional(),
  addressFull: z.string().optional(),
  partnerType: z.string().optional(),
  agencyName: z.string().optional(),
  pixKey: z.string().optional(),
  // Dados bancários
  bankName: z.string().optional(),
  bankAgency: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountType: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});

// Campos cujas alterações são registradas no histórico (Meus Dados)
const TRACKED_FIELDS: (keyof z.infer<typeof profileSchema>)[] = [
  "name", "phone", "email", "cpf", "rg", "creci", "maritalStatus",
  "addressFull", "partnerType", "agencyName", "pixKey",
  "bankName", "bankAgency", "bankAccount", "bankAccountType",
];

const FIELD_LABELS: Record<string, string> = {
  name: "Nome", phone: "Telefone", email: "E-mail", cpf: "CPF", rg: "RG",
  creci: "CRECI", maritalStatus: "Estado civil", addressFull: "Endereço",
  partnerType: "Atuação", agencyName: "Imobiliária", pixKey: "Chave PIX",
  bankName: "Banco", bankAgency: "Agência", bankAccount: "Conta",
  bankAccountType: "Tipo de conta", birthDate: "Data de nascimento",
};

const SELECT = {
  id: true, name: true, phone: true, email: true, avatar: true, cpf: true, rg: true,
  birthDate: true, creci: true, maritalStatus: true, addressFull: true,
  partnerType: true, agencyName: true, pixKey: true,
  bankName: true, bankAgency: true, bankAccount: true, bankAccountType: true,
} as const;

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  // Rota de troca de senha
  if (body.currentPassword !== undefined || body.newPassword !== undefined) {
    const validation = passwordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: session.id }, select: { password: true } });
    if (!dbUser?.password) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const valid = await bcrypt.compare(validation.data.currentPassword, dbUser.password);
    if (!valid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(validation.data.newPassword, 10);
    await prisma.user.update({ where: { id: session.id }, data: { password: hashed } });
    await prisma.userProfileLog.create({
      data: { userId: session.id, field: "password", oldValue: null, newValue: "(alterada)", changedBy: session.id },
    });
    return NextResponse.json({ ok: true });
  }

  // Rota de atualização de perfil
  const validation = profileSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { birthDate, email, ...rest } = validation.data;

  // Estado atual (para diff do histórico e checagem de e-mail)
  const current = await prisma.user.findUnique({ where: { id: session.id }, select: SELECT });
  if (!current) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Alteração de e-mail — valida unicidade
  const data: any = { ...rest };
  if (email !== undefined && email.toLowerCase() !== (current.email || "").toLowerCase()) {
    const normalized = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
    if (exists && exists.id !== session.id) {
      return NextResponse.json({ error: "Este e-mail já está em uso por outra conta." }, { status: 409 });
    }
    data.email = normalized;
  }
  if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;

  // Monta logs de alterações (compara valor antigo x novo)
  const logs: { userId: string; field: string; oldValue: string | null; newValue: string | null; changedBy: string }[] = [];
  for (const f of TRACKED_FIELDS) {
    if (data[f] === undefined) continue;
    const oldVal = (current as any)[f] ?? null;
    const newVal = data[f] ?? null;
    if (String(oldVal ?? "") !== String(newVal ?? "")) {
      logs.push({
        userId: session.id,
        field: FIELD_LABELS[f] || f,
        oldValue: oldVal != null ? String(oldVal) : null,
        newValue: newVal != null ? String(newVal) : null,
        changedBy: session.id,
      });
    }
  }

  const user = await prisma.user.update({ where: { id: session.id }, data, select: SELECT });
  if (logs.length) await prisma.userProfileLog.createMany({ data: logs });

  // Se trocou o e-mail, o JWT antigo continua válido (claim não muda o login),
  // mas avisamos o cliente para refazer login se necessário.
  return NextResponse.json({ user, emailChanged: data.email !== undefined });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const [user, logs] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id }, select: SELECT }),
    prisma.userProfileLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, field: true, oldValue: true, newValue: true, createdAt: true },
    }),
  ]);
  return NextResponse.json({ user, logs });
}
