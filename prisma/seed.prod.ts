import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Senhas do seed vêm do ambiente — nunca ficam escritas no código.
function senhaObrigatoria(variavel: string): string {
  const v = process.env[variavel];
  if (!v || v.length < 10) {
    throw new Error(`Defina ${variavel} (mínimo 10 caracteres) antes de rodar o seed de produção.`);
  }
  return v;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * SEED PRODUÇÃO - TAPPY IMOB
 * https://tappyimob.com.br
 */

async function main() {
  console.log("🚀 Seed de produção...\n");

  // Admin
  const adminPassword = await bcrypt.hash(senhaObrigatoria("SEED_ADMIN_PASSWORD"), 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tappyimob.com.br" },
    update: {},
    create: {
      email: "admin@tappyimob.com.br",
      password: adminPassword,
      name: "Administrador",
      phone: "(11) 4195-2020",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin:", admin.email);

  // Corretor
  const corretorPassword = await bcrypt.hash(senhaObrigatoria("SEED_CORRETOR_PASSWORD"), 12);
  const corretor = await prisma.user.upsert({
    where: { email: "corretor@tappyimob.com.br" },
    update: {},
    create: {
      email: "corretor@tappyimob.com.br",
      password: corretorPassword,
      name: "Corretor",
      phone: "(11) 4195-2021",
      role: "CORRETOR",
      creci: "000000-F",
      isActive: true,
    },
  });
  console.log("✅ Corretor:", corretor.email);

  console.log("\n========================================");
  console.log("📧 CREDENCIAIS:");
  console.log("----------------------------------------");
  console.log("ADMIN: admin@tappyimob.com.br");
  console.log("SENHA: a definida em SEED_ADMIN_PASSWORD");
  console.log("----------------------------------------");
  console.log("CORRETOR: corretor@tappyimob.com.br");
  console.log("SENHA: a definida em SEED_CORRETOR_PASSWORD");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
