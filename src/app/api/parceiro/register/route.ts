import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "PARCEIRO_EXTERNO",
        isActive: true,
      },
    });

    // Vincular com BusinessPartner existente pelo telefone (normalizado)
    const phoneDigits = phone.replace(/\D/g, "");
    const existingPartner = await prisma.businessPartner.findFirst({
      where: {
        phone: { contains: phoneDigits.slice(-8) },
      },
    });

    if (existingPartner) {
      if (!existingPartner.userId || !existingPartner.tags.includes("CADASTRO_SITE")) {
        await prisma.businessPartner.update({
          where: { id: existingPartner.id },
          data: {
            userId: existingPartner.userId ?? user.id,
            tags: existingPartner.tags.includes("CADASTRO_SITE")
              ? existingPartner.tags
              : [...existingPartner.tags, "CADASTRO_SITE"],
          },
        });
      }
    } else {
      // Nenhum parceiro correspondente: cria a ficha automaticamente a partir do auto-cadastro
      const newPartner = await prisma.businessPartner.create({
        data: {
          type: "CORRETOR",
          name,
          email,
          phone,
          userId: user.id,
          isAutonomous: true,
          partnershipFormat: "CAPTADOR",
          creciStatus: "ATIVO",
          partnershipTermStatus: "SEM_CONTRATO",
          tags: ["CADASTRO_SITE"],
        },
      });
      await prisma.businessPartnerActivity.create({
        data: {
          partnerId: newPartner.id,
          type: "CADASTRO",
          description: `Parceiro ${newPartner.name} cadastrado via auto-cadastro pelo site`,
        },
      });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });

    const headerStore = await headers();
    const isHttps = headerStore.get("x-forwarded-proto") === "https";
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        allowedModules: user.allowedModules,
      },
    });
  } catch (error) {
    console.error("Parceiro register error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
