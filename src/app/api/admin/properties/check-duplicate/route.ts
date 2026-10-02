import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Extrair nome significativo do logradouro (sem prefixos como Rua, Alameda, etc.)
function extractStreetName(addr: string): string {
  const prefixes = /^(rua|r\.|avenida|av\.|alameda|al\.|travessa|tv\.|estrada|estr\.|rodovia|rod\.|praca|praça|pc\.|viela|beco|largo)\s+/i;
  return addr.replace(prefixes, "").trim();
}

// Remover acentos
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// API para verificar se já existe imóvel similar antes do cadastro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { 
      condominiumId, 
      towerName, 
      unitNumber, 
      floor,
      address,
      number,
      neighborhood,
      city,
      zipCode,
      condoType
    } = body;

    // Se o endereço termina com número e o campo number está vazio, extrair automaticamente
    if (address && !number) {
      const trailingNumber = address.trim().match(/^(.+?)\s+(\d+)\s*$/);
      if (trailingNumber) {
        address = trailingNumber[1].trim();
        number = trailingNumber[2];
      }
    }

    const includeRelations = {
      condominium: {
        select: { id: true, name: true }
      },
      owner: {
        select: { id: true, name: true }
      },
      propertyOwner: {
        select: { id: true, name: true, phones: true }
      }
    };

    let allResults: any[] = [];

    // ====== BUSCA POR CONDOMÍNIO ======
    if (condominiumId) {
      if (condoType === "VILLAGIO" && unitNumber) {
        const condoResults = await prisma.property.findMany({
          where: {
            condominiumId,
            unitNumber: { equals: unitNumber, mode: "insensitive" },
            status: { not: "INATIVO" }
          },
          include: includeRelations,
        });
        allResults.push(...condoResults);
      } else {
        const condoResults = await prisma.property.findMany({
          where: { condominiumId, status: { not: "INATIVO" } },
          include: includeRelations,
        });
        allResults.push(...condoResults);
      }
    }

    // ====== BUSCA POR ENDEREÇO (PRIORIDADE MÁXIMA) ======
    if (address) {
      const streetName = extractStreetName(address);
      const streetNameUnaccented = removeAccents(streetName);
      const addressUnaccented = removeAccents(address);

      // Busca 1: endereço completo (ex: "Alameda Bertioga")
      const byFullAddress = await prisma.property.findMany({
        where: {
          address: { contains: address, mode: "insensitive" },
          status: { not: "INATIVO" }
        },
        include: includeRelations,
        take: 100
      });
      allResults.push(...byFullAddress);

      // Busca 2: apenas nome da rua sem prefixo (ex: "Bertioga")
      if (streetName.length >= 3 && streetName.toLowerCase() !== address.toLowerCase()) {
        const byStreetName = await prisma.property.findMany({
          where: {
            address: { contains: streetName, mode: "insensitive" },
            status: { not: "INATIVO" }
          },
          include: includeRelations,
          take: 100
        });
        allResults.push(...byStreetName);
      }

      // Busca 3: sem acentos via raw SQL
      try {
        const unaccentParam = `%${addressUnaccented}%`;
        const unaccentIds: Array<{ id: string }> = await prisma.$queryRaw`
          SELECT id FROM properties
          WHERE unaccent(LOWER(address)) LIKE unaccent(LOWER(${unaccentParam}))
          AND status != 'INATIVO'
          LIMIT 100
        `;
        if (unaccentIds.length > 0) {
          const byUnaccent = await prisma.property.findMany({
            where: { id: { in: unaccentIds.map(r => r.id) } },
            include: includeRelations,
          });
          allResults.push(...byUnaccent);
        }
      } catch (e) {
        // unaccent extension may not be available
      }

      // Busca 4: nome da rua sem acentos via raw SQL
      if (streetNameUnaccented !== addressUnaccented && streetNameUnaccented.length >= 3) {
        try {
          const param = `%${streetNameUnaccented}%`;
          const ids: Array<{ id: string }> = await prisma.$queryRaw`
            SELECT id FROM properties
            WHERE unaccent(LOWER(address)) LIKE unaccent(LOWER(${param}))
            AND status != 'INATIVO'
            LIMIT 100
          `;
          if (ids.length > 0) {
            const results = await prisma.property.findMany({
              where: { id: { in: ids.map(r => r.id) } },
              include: includeRelations,
            });
            allResults.push(...results);
          }
        } catch (e) {}
      }
    }

    // ====== BUSCA POR CEP ======
    if (zipCode && !address) {
      const cleanZip = zipCode.replace(/\D/g, "");
      const byCep = await prisma.property.findMany({
        where: { zipCode: cleanZip, status: { not: "INATIVO" } },
        include: includeRelations,
        take: 100
      });
      allResults.push(...byCep);
    }

    // Se não tem condições suficientes, retornar vazio
    if (allResults.length === 0 && !condominiumId && !address && !zipCode) {
      return NextResponse.json({ 
        properties: [],
        message: "Informe mais dados para verificar duplicatas"
      });
    }

    // Deduplicar resultados
    const seenIds = new Set<string>();
    const uniqueResults = allResults.filter(p => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });

    // ====== SCORING ======
    const streetName = address ? extractStreetName(address).toLowerCase() : "";
    const streetNameUnaccented = removeAccents(streetName);

    const scoredProperties = uniqueResults.map(prop => {
      let score = 0;
      let matchDetails: string[] = [];
      const propAddr = (prop.address || "").toLowerCase();
      const propAddrUnaccented = removeAccents(propAddr);
      const propStreet = extractStreetName(prop.address || "").toLowerCase();
      const propStreetUnaccented = removeAccents(propStreet);

      // === ENDEREÇO ===
      if (address) {
        const searchLower = address.toLowerCase();
        const searchUnaccented = removeAccents(searchLower);

        // Match exato do logradouro completo (ex: "Alameda Bertioga" está em "Alameda BERTIOGA")
        if (propAddrUnaccented.includes(searchUnaccented) || searchUnaccented.includes(propAddrUnaccented)) {
          score += 50;
          matchDetails.push(`Endereço: ${prop.address}`);
        }
        // Match pelo nome da rua sem prefixo (ex: "Bertioga" está em "Alameda BERTIOGA")
        else if (streetName.length >= 3 && (propStreetUnaccented.includes(streetNameUnaccented) || streetNameUnaccented.includes(propStreetUnaccented))) {
          score += 45;
          matchDetails.push(`Logradouro: ${prop.address}`);
        }
      }

      // === NÚMERO (só pontua se o endereço já bateu) ===
      if (number && prop.number && score > 0) {
        if (prop.number === number) {
          score += 40;
          matchDetails.push(`Número: ${prop.number}`);
        }
      }

      // === CONDOMÍNIO ===
      if (condominiumId && prop.condominium?.id === condominiumId) {
        score += 40;
        matchDetails.push("Mesmo condomínio");
        
        if (towerName && prop.towerName?.toLowerCase().includes(towerName.toLowerCase())) {
          score += 15;
          matchDetails.push(`Torre: ${prop.towerName}`);
        }
        
        const propUnit = (prop.unitNumber || prop.complement || "").toLowerCase();
        if (unitNumber && propUnit && propUnit === unitNumber.toLowerCase()) {
          score += 35;
          matchDetails.push(`Unidade: ${prop.unitNumber || prop.complement}`);
        }

        if (floor && prop.floor === parseInt(floor)) {
          score += 5;
          matchDetails.push(`Andar: ${prop.floor}`);
        }
      }

      // === CEP (peso baixo, apenas complementar) ===
      if (zipCode && prop.zipCode === zipCode.replace(/\D/g, "")) {
        score += 5;
        matchDetails.push("Mesmo CEP");
      }
      
      // === BAIRRO (peso baixo, apenas complementar) ===
      if (neighborhood && prop.neighborhood?.toLowerCase().includes(neighborhood.toLowerCase())) {
        score += 3;
        matchDetails.push(`Bairro: ${prop.neighborhood}`);
      }

      return {
        id: prop.id,
        code: prop.code,
        title: prop.title,
        type: prop.type,
        category: prop.category,
        status: prop.status,
        address: prop.address,
        number: prop.number,
        complement: prop.complement,
        neighborhood: prop.neighborhood,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode,
        towerName: prop.towerName,
        unitNumber: prop.unitNumber,
        floor: prop.floor,
        bedrooms: prop.bedrooms,
        suites: prop.suites,
        bathrooms: prop.bathrooms,
        parkingSpaces: prop.parkingSpaces,
        area: prop.area,
        price: prop.price,
        rentPrice: prop.rentPrice,
        thumbnail: prop.thumbnail,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt,
        condominium: prop.condominium,
        owner: prop.owner,
        propertyOwner: prop.propertyOwner,
        similarityScore: score,
        matchDetails,
        isProbableDuplicate: (number && prop.number === number && score >= 80) || (condominiumId && unitNumber && score >= 75)
      };
    });

    // Ordenar por score
    scoredProperties.sort((a, b) => b.similarityScore - a.similarityScore);

    // Filtrar: só mostrar resultados que tenham match de endereço real (score >= 40)
    // Se tem número, o match exato (endereço+número) vai pro topo com score >= 90
    const relevantProperties = scoredProperties.filter(p => p.similarityScore >= 40).slice(0, 30);

    return NextResponse.json({
      properties: relevantProperties,
      hasProbableDuplicate: relevantProperties.some(p => p.isProbableDuplicate),
      message: relevantProperties.length > 0 
        ? `Encontrados ${relevantProperties.length} imóvel(is) similar(es)`
        : "Nenhum imóvel similar encontrado"
    });

  } catch (error) {
    console.error("Erro ao verificar duplicatas:", error);
    return NextResponse.json(
      { error: "Erro ao verificar duplicatas" },
      { status: 500 }
    );
  }
}
