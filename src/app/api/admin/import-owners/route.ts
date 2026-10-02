import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

// POST - Importar dados dos proprietários da planilha Excel
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Ler arquivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    let updated = 0;
    let created = 0;
    let notFound = 0;
    let noOwnerData = 0;
    const errors: string[] = [];

    for (const row of data) {
      const cnc = row["CNC"];
      const ownerName = row["Nome completo"];
      const ownerPhone = row["Contatos"];
      const ownerEmail = row["E-mail"];
      const ownerCpf = row["CPF"];

      if (!cnc) {
        continue;
      }

      // Verificar se tem dados do proprietário
      if (!ownerName && !ownerPhone && !ownerEmail) {
        noOwnerData++;
        continue;
      }

      try {
        // Buscar imóvel pelo código CNC
        const property = await prisma.property.findFirst({
          where: { code: cnc },
          include: { propertyOwner: true },
        });

        if (!property) {
          notFound++;
          continue;
        }

        // Se já tem proprietário, atualizar
        if (property.propertyOwnerId && property.propertyOwner) {
          await prisma.propertyOwner.update({
            where: { id: property.propertyOwnerId },
            data: {
              name: ownerName || property.propertyOwner.name,
              phones: ownerPhone ? [ownerPhone] : property.propertyOwner.phones,
              email: ownerEmail || property.propertyOwner.email,
              cpf: ownerCpf || property.propertyOwner.cpf,
            },
          });
          updated++;
        } else {
          // Criar novo proprietário
          const newOwner = await prisma.propertyOwner.create({
            data: {
              name: ownerName || "Proprietário",
              phones: ownerPhone ? [ownerPhone] : [],
              email: ownerEmail || null,
              cpf: ownerCpf || null,
            },
          });

          // Vincular ao imóvel
          const propBeforeOwner = await prisma.property.findUnique({ where: { id: property.id }, select: { updatedAt: true } });
          await prisma.property.update({
            where: { id: property.id },
            data: { propertyOwnerId: newOwner.id },
          });
          if (propBeforeOwner) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeOwner.updatedAt} WHERE "id" = ${property.id}`;

          created++;
        }
      } catch (error: any) {
        errors.push(`Erro no CNC ${cnc}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Importação concluída",
      stats: {
        total: data.length,
        updated,
        created,
        notFound,
        noOwnerData,
        errors: errors.length,
      },
      errors: errors.slice(0, 10), // Primeiros 10 erros
    });
  } catch (error: any) {
    console.error("Error importing owners:", error);
    return NextResponse.json(
      { error: "Erro ao importar proprietários: " + error.message },
      { status: 500 }
    );
  }
}

// GET - Sincronizar proprietários da planilha existente no servidor
export async function GET(request: NextRequest) {
  try {
    // Permitir sincronização via query param secret ou sessão admin
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    if (secret !== "sync2024") {
      const session = await getSession();
      if (!session || session.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Não autorizado" },
          { status: 401 }
        );
      }
    }

    // Importar da planilha local (Imóveis.xlsx)
    const fs = await import("fs");
    const path = await import("path");
    
    const filePath = path.join(process.cwd(), "Imóveis.xlsx");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Planilha Imóveis.xlsx não encontrada no servidor" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    let updated = 0;
    let created = 0;
    let notFound = 0;

    // Buscar todos os imóveis de uma vez para otimizar
    const allProperties = await prisma.property.findMany({
      select: { id: true, code: true, propertyOwnerId: true },
    });
    const propertyMap = new Map(allProperties.map(p => [p.code, p]));

    // Processar todas as linhas com CNC
    const validRows = data.filter((row: any) => row["CNC"]);

    let obsCreated = 0;

    // Buscar admin para changelog
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    let changelogCreated = 0;

    for (const row of validRows) {
      const cnc = row["CNC"];
      const ownerName = row["Nome completo"];
      const ownerPhone = row["Contatos"];
      const ownerEmail = row["E-mail"];
      const ownerCpf = row["CPF"];
      const observacoes = row["Observações"];
      const observacaoPermuta = row["Observação da permuta"];
      
      // Dados de auditoria da planilha
      const criadoPor = row["Criado por"];
      const criadoEm = row["Criado em"];
      const atualizadoPor = row["Atualizado por"];
      const atualizadoEm = row["Atualizado em"];

      const property = propertyMap.get(cnc);

      if (!property) {
        notFound++;
        continue;
      }

      if (property.propertyOwnerId) {
        await prisma.propertyOwner.update({
          where: { id: property.propertyOwnerId },
          data: {
            name: ownerName || undefined,
            phones: ownerPhone ? [ownerPhone] : undefined,
            email: ownerEmail || undefined,
            cpf: ownerCpf || undefined,
          },
        });
        updated++;
      } else if (ownerName || ownerPhone || ownerEmail) {
        const newOwner = await prisma.propertyOwner.create({
          data: {
            name: ownerName || "Proprietário",
            phones: ownerPhone ? [ownerPhone] : [],
            email: ownerEmail || null,
            cpf: ownerCpf || null,
          },
        });

        const propBeforeOwner2 = await prisma.property.findUnique({ where: { id: property.id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id: property.id },
          data: { propertyOwnerId: newOwner.id },
        });
        if (propBeforeOwner2) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeOwner2.updatedAt} WHERE "id" = ${property.id}`;

        created++;
      }

      // Criar changelog com dados de criação/atualização da planilha
      if (criadoPor || atualizadoPor) {
        // Verificar se já existe changelog de importação
        const existingChangelog = await prisma.propertyChangelog.findFirst({
          where: {
            propertyId: property.id,
            field: { contains: "Importado da planilha" },
          },
        });

        if (!existingChangelog) {
          // Criar registro de criação
          if (criadoPor) {
            await prisma.propertyChangelog.create({
              data: {
                propertyId: property.id,
                field: "Importado da planilha - Cadastro",
                oldValue: null,
                newValue: `Cadastrado por ${criadoPor}${criadoEm ? ` em ${criadoEm}` : ""}`,
                userName: criadoPor,
                userId: admin?.id,
              },
            });
            changelogCreated++;
          }

          // Criar registro de última atualização
          if (atualizadoPor && atualizadoPor !== criadoPor) {
            await prisma.propertyChangelog.create({
              data: {
                propertyId: property.id,
                field: "Importado da planilha - Atualização",
                oldValue: null,
                newValue: `Atualizado por ${atualizadoPor}${atualizadoEm ? ` em ${atualizadoEm}` : ""}`,
                userName: atualizadoPor,
                userId: admin?.id,
              },
            });
            changelogCreated++;
          }
        }
      }

      // Importar observações da planilha
      if (observacoes || observacaoPermuta) {
        // Verificar se já existe observação importada da planilha (identificar pelo prefixo)
        const existingObs = await prisma.propertyObservation.findFirst({
          where: {
            propertyId: property.id,
            content: { contains: "OBSERVAÇÕES DA PLANILHA" },
          },
        });

        if (!existingObs) {
          let obsContent = "";
          if (observacoes) obsContent += `📋 OBSERVAÇÕES DA PLANILHA:\n${observacoes}`;
          if (observacaoPermuta) {
            if (obsContent) obsContent += "\n\n";
            obsContent += `🔄 OBSERVAÇÃO DE PERMUTA:\n${observacaoPermuta}`;
          }

          if (obsContent) {
            // Buscar um admin para ser o autor
            const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
            if (admin) {
              await prisma.propertyObservation.create({
                data: {
                  propertyId: property.id,
                  content: obsContent,
                  isPinned: true,
                  userId: admin.id,
                },
              });
              obsCreated++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sincronização concluída",
      stats: {
        total: data.length,
        updated,
        created,
        notFound,
        obsCreated,
        changelogCreated,
      },
    });
  } catch (error: any) {
    console.error("Error syncing owners:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar proprietários: " + error.message },
      { status: 500 }
    );
  }
}
