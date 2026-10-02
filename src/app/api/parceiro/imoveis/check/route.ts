import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { condominiumId, condoType, towerName, unitNumber, zipCode, address, number, city } =
    await request.json();

  const select = {
    id: true, code: true, title: true, status: true, thumbnail: true,
    towerName: true, unitNumber: true,
    address: true, number: true, neighborhood: true, city: true,
  };

  let allResults: any[] = [];
  let hasProbableDuplicate = false;

  if (condominiumId) {
    if ((condoType === "VERTICAL" || condoType === "MISTO") && unitNumber) {
      // Exato: mesmo condo + mesma torre + mesma unidade
      const exact = await prisma.property.findMany({
        where: {
          condominiumId,
          unitNumber: { equals: unitNumber, mode: "insensitive" },
          ...(towerName ? { towerName: { equals: towerName, mode: "insensitive" } } : {}),
          status: { not: "INATIVO" },
        },
        select,
      });
      if (exact.length > 0) {
        hasProbableDuplicate = true;
        allResults.push(...exact.map((p) => ({ ...p, matchReason: "Mesmo apartamento" })));
      }
      // Mesma unidade em torre diferente (provável duplicata)
      if (!hasProbableDuplicate) {
        const sameUnit = await prisma.property.findMany({
          where: {
            condominiumId,
            unitNumber: { equals: unitNumber, mode: "insensitive" },
            status: { not: "INATIVO" },
          },
          select,
        });
        allResults.push(...sameUnit.map((p) => ({ ...p, matchReason: "Mesma unidade (torre diferente)" })));
      }
    } else if (condoType === "VILLAGIO" && unitNumber) {
      const matches = await prisma.property.findMany({
        where: {
          condominiumId,
          unitNumber: { equals: unitNumber, mode: "insensitive" },
          status: { not: "INATIVO" },
        },
        select,
      });
      if (matches.length > 0) hasProbableDuplicate = true;
      allResults.push(...matches.map((p) => ({ ...p, matchReason: "Mesma unidade" })));
    } else if (condoType === "HORIZONTAL" && number) {
      const matches = await prisma.property.findMany({
        where: {
          condominiumId,
          number: { equals: number, mode: "insensitive" },
          status: { not: "INATIVO" },
        },
        select,
      });
      if (matches.length > 0) hasProbableDuplicate = true;
      allResults.push(...matches.map((p) => ({ ...p, matchReason: "Mesmo número no condomínio" })));
    } else {
      // Sem unidade — lista o que existe no condo para referência
      const condoMatches = await prisma.property.findMany({
        where: { condominiumId, status: { not: "INATIVO" } },
        select,
        take: 20,
      });
      allResults.push(...condoMatches.map((p) => ({ ...p, matchReason: "Mesmo condomínio" })));
    }
  } else {
    // Sem condomínio — verifica por CEP + número ou endereço + número
    if (zipCode && number) {
      const byZip = await prisma.property.findMany({
        where: {
          zipCode,
          number: { equals: number, mode: "insensitive" },
          status: { not: "INATIVO" },
        },
        select,
      });
      if (byZip.length > 0) hasProbableDuplicate = true;
      allResults.push(...byZip.map((p) => ({ ...p, matchReason: "Mesmo endereço e número" })));
    } else if (address && number) {
      // Usa equals para evitar falso-positivo: "Rua das Flores" != "Rua das Flores do Campo"
      const byAddr = await prisma.property.findMany({
        where: {
          address: { equals: address.trim(), mode: "insensitive" },
          number: { equals: number, mode: "insensitive" },
          ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
          status: { not: "INATIVO" },
        },
        select,
      });
      if (byAddr.length > 0) hasProbableDuplicate = true;
      allResults.push(...byAddr.map((p) => ({ ...p, matchReason: "Mesmo endereço" })));
    }
  }

  // Deduplicar
  const seen = new Set<string>();
  const unique = allResults.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const message =
    unique.length === 0
      ? "Nenhum imóvel similar encontrado"
      : hasProbableDuplicate
        ? "Este imóvel provavelmente já está cadastrado"
        : `${unique.length} imóvel(is) encontrado(s) no mesmo local`;

  return NextResponse.json({ properties: unique, hasProbableDuplicate, message });
}
