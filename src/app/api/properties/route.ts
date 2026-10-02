import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logPropertyActivity } from "@/lib/property-logger";
import { z } from "zod";

// Schema de validação para criar imóvel
const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  shortDescription: z.string().nullable().optional(),
  type: z.enum(["APARTAMENTO", "CASA", "TERRENO", "COMERCIAL", "COBERTURA", "STUDIO", "FAZENDA", "GALPAO", "KITNET", "LOFT", "FLAT", "SOBRADO", "CHACARA"]),
  category: z.enum(["VENDA", "LOCACAO", "VENDA_LOCACAO"]),
  condition: z.enum(["NOVO", "USADO", "NA_PLANTA", "EM_CONSTRUCAO"]).nullable().optional(),
  status: z.enum(["DISPONIVEL", "VENDIDO", "ALUGADO", "RESERVADO", "SUSPENSO", "INDISPONIVEL", "INATIVO"]).optional(),
  // Status separados para imóveis com dupla finalidade (VENDA_LOCACAO)
  saleStatus: z.enum(["ATIVO", "SUSPENSO", "INATIVO", "VENDIDO", "ALUGADO"]).optional().nullable(),
  rentalStatus: z.enum(["ATIVO", "SUSPENSO", "INATIVO", "VENDIDO", "ALUGADO"]).optional().nullable(),
  price: z.number().min(0),
  rentPrice: z.number().min(0).nullable().optional(),
  condoFee: z.number().nullable().optional(),
  iptu: z.number().nullable().optional(),
  area: z.number().min(0),
  bedrooms: z.number().int().min(0).default(0),
  suites: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  parkingSpaces: z.number().int().min(0).default(0),
  floor: z.number().int().nullable().optional(),
  yearBuilt: z.number().int().nullable().optional(),
  address: z.string(),
  number: z.string().nullable().optional(),
  complement: z.string().nullable().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  hasWatermark: z.boolean().default(false),
  videos: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  extras: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isExclusive: z.boolean().default(false),
  // Placa e Situação
  hasPlate: z.boolean().default(false),
  isOccupied: z.boolean().default(false),
  // Publicação
  showOnWebsite: z.boolean().default(true),
  websitePublishMode: z.string().nullable().optional(),
  isOffMarket: z.boolean().default(false),
  activePortals: z.array(z.string()).default([]),
  websiteCategories: z.array(z.string()).default([]),
  // Campos específicos de LOCAÇÃO
  acceptsPets: z.boolean().nullable().optional(),
  rentalWarranties: z.array(z.string()).default([]),
  // Campos do proprietário
  propertyOwnerId: z.string().nullable().optional(),
  // Campos adicionais
  code: z.string().nullable().optional(),
  propertyClass: z.string().nullable().optional(),
  subType: z.string().nullable().optional(),
  marketplaceTitle: z.string().nullable().optional(),
  condoDescription: z.string().nullable().optional(),
  exchangeDescription: z.string().nullable().optional(),
  brokerNotes: z.string().nullable().optional(),
  condominiumId: z.string().nullable().optional(),
  towerName: z.string().nullable().optional(),
  unitNumber: z.string().nullable().optional(),
  addressVisibility: z.string().nullable().optional(),
  usefulArea: z.number().nullable().optional(),
  totalArea: z.number().nullable().optional(),
  totalFloors: z.number().int().nullable().optional(),
  propertyAge: z.string().nullable().optional(),
  highlights: z.array(z.string()).default([]),
  videoYoutube: z.string().nullable().optional(),
  virtualTour: z.string().nullable().optional(),
  isSuperFeatured: z.boolean().optional(),
  acceptsExchange: z.boolean().optional(),
  acceptsFinancing: z.boolean().optional(),
  acceptsFGTS: z.boolean().optional(),
  acceptsDirectPayment: z.boolean().optional(),
  directPaymentMonths: z.number().int().nullable().optional(),
  isNegotiable: z.boolean().optional(),
  exchangeTypes: z.array(z.string()).default([]),
  exchangeLocations: z.array(z.string()).default([]),
  exchangeMinValue: z.number().nullable().optional(),
  exchangeMaxValue: z.number().nullable().optional(),
  exclusivityManagerId: z.string().nullable().optional(),
  condoFeeExempt: z.boolean().optional(),
  iptuPeriod: z.string().nullable().optional(),
  foro: z.number().nullable().optional(),
  foroExempt: z.boolean().optional(),
  hasFinancingBalance: z.boolean().nullable().optional(),
  financingBalance: z.number().nullable().optional(),
  financingBank: z.string().nullable().optional(),
  hasIrregularDocs: z.boolean().optional(),
  irregularDocsNotes: z.string().nullable().optional(),
  // Campos de terreno
  landTopography: z.string().nullable().optional(),
  landFrontWidth: z.number().nullable().optional(),
  landDepth: z.number().nullable().optional(),
  hasApprovedProject: z.boolean().nullable().optional(),
  isGroundFloor: z.boolean().nullable().optional(),
  isCornerHouse: z.boolean().nullable().optional(),
  hasNonBuildableArea: z.boolean().nullable().optional(),
}).passthrough();

// GET - Listar imóveis com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paginação
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    
    // Filtros
    const search = searchParams.get("search");
    const category = searchParams.get("categoria") || searchParams.get("category");
    const categories = searchParams.get("categories"); // Multi-seleção: "VENDA,LOCACAO"
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const parkingSpaces = searchParams.get("parkingSpaces");
    const isFeatured = searchParams.get("isFeatured");
    const condominiumId = searchParams.get("condominiumId");
    const condominiumIds = searchParams.get("condominiumIds");
    const condominiumSlugs = searchParams.get("condominiumSlugs");
    const hasElevator = searchParams.get("hasElevator");
    const isFurnished = searchParams.get("isFurnished");
    const hasGroundFloorSuite = searchParams.get("hasGroundFloorSuite");
    const hasFreeView = searchParams.get("hasFreeView");
    const acceptsExchange = searchParams.get("acceptsExchange");
    const ownerId = searchParams.get("ownerId"); // Filtro por corretor captador/responsável
    const featuresFilter = searchParams.get("featuresFilter");
    const noCondominium = searchParams.get("noCondominium");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Construir where clause
    const where: any = {};

    if (search) {
      // Limpar busca para detectar se é telefone ou CPF
      const cleanSearch = search.replace(/\D/g, "");
      // Detectar se parece telefone/CPF: 4+ dígitos e pelo menos metade do input são dígitos
      const digitRatio = cleanSearch.length / search.trim().length;
      const isPhoneOrCpf = cleanSearch.length >= 4 && digitRatio >= 0.5;
      
      // Verificar se a busca termina com número (ex: "Tamboré 1", "Sua Cidade 12", "Alameda Bertioga, 62", "Alameda Bertioga,62")
      const endsWithNumber = /[\s,]+\d+$/.test(search.trim()) || /\s+\d+$/.test(search.trim());
      
      // Detectar se parece código de imóvel (CNC, CNCD, CNCX, CNCP, IMB seguido de números)
      const isPropertyCode = /^(CNC[A-Z]?|IMB)\d+(-[A-Z0-9]+)?$/i.test(search.trim());

      // Função para remover acentos (busca accent-insensitive)
      const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchUnaccented = removeAccents(search.trim());
      const hasAccentDiff = searchUnaccented !== search.trim();
      
      // Função para expandir abreviações de logradouro
      const expandAddressAbbreviations = (text: string): string[] => {
        const abbreviations: Record<string, string[]> = {
          "al.": ["alameda", "al."],
          "alameda": ["alameda", "al."],
          "r.": ["rua", "r."],
          "rua": ["rua", "r."],
          "av.": ["avenida", "av."],
          "avenida": ["avenida", "av."],
          "trav.": ["travessa", "trav."],
          "travessa": ["travessa", "trav."],
          "pç.": ["praça", "pç."],
          "praça": ["praça", "pç."],
          "praca": ["praça", "pç.", "praca"],
          "est.": ["estrada", "est."],
          "estrada": ["estrada", "est."],
          "rod.": ["rodovia", "rod."],
          "rodovia": ["rodovia", "rod."],
        };
        const words = text.split(/\s+/);
        const firstWord = words[0].toLowerCase();
        const rest = words.slice(1).join(" ");
        const variants = abbreviations[firstWord];
        if (variants) {
          return variants.map(v => `${v} ${rest}`);
        }
        return [text];
      };

      if (isPropertyCode) {
        // Busca parcial por código (CNCL1 encontra CNCL100, CNCL1-2, etc)
        where.OR = [
          { code: { contains: search.trim(), mode: "insensitive" } },
          { title: { contains: search.trim(), mode: "insensitive" } },
        ];
      } else if (isPhoneOrCpf) {
        // Busca por telefone ou CPF do proprietário
        // Raw SQL para buscar telefone com dígitos stripped (ignora formatação)
        const phoneParam = `%${cleanSearch}%`;
        let phoneMatchIds: string[] = [];
        try {
          const phoneResults: Array<{ id: string }> = await prisma.$queryRaw`
            SELECT DISTINCT p.id FROM properties p
            INNER JOIN property_owners po ON p."propertyOwnerId" = po.id
            WHERE EXISTS (
              SELECT 1 FROM unnest(po.phones) AS phone
              WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE ${phoneParam}
            )
            OR regexp_replace(COALESCE(po."phoneContacts"::text, ''), '[^0-9]', '', 'g') LIKE ${phoneParam}
            OR regexp_replace(COALESCE(po.cpf, ''), '[^0-9]', '', 'g') LIKE ${phoneParam}
            LIMIT 500
          `;
          phoneMatchIds = phoneResults.map(r => r.id);
        } catch (e) {
          console.warn("Phone search raw query failed:", e);
        }

        where.OR = [
          { code: { contains: search, mode: "insensitive" } },
          // Busca por telefone via raw SQL (digits stripped)
          ...(phoneMatchIds.length > 0 ? [{ id: { in: phoneMatchIds } }] : []),
          // Fallback: match exato no array + parcial no JSON
          { propertyOwner: { phones: { hasSome: [cleanSearch, search.trim()] } } },
          { propertyOwner: { phoneContacts: { string_contains: cleanSearch } } },
          // Busca por CPF do proprietário
          { propertyOwner: { cpf: { contains: cleanSearch } } },
          // Busca normal também
          { title: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      } else if (endsWithNumber) {
        // Busca mais precisa: palavra + número exato (usando regex para word boundary)
        const searchExact = search.trim();
        // Detectar padrão "endereço, número" (ex: "Al. Ouro, 33" ou "Alameda Ouro, 33")
        const commaMatch = searchExact.match(/^(.+?)\s*,\s*(\d+)$/);
        const addressPart = commaMatch ? commaMatch[1].trim() : searchExact;
        const numberPart = commaMatch ? commaMatch[2] : undefined;
        
        if (numberPart) {
          // Expandir abreviações de logradouro (Al. → Alameda, R. → Rua, etc)
          const addressVariants = expandAddressAbbreviations(addressPart);
          
          // Busca flexível: combinação exata OU endereço contendo o texto OU busca geral
          const orConditions: any[] = [];
          
          // Para cada variante do endereço, buscar combinação com número E endereço sozinho
          for (const variant of addressVariants) {
            orConditions.push(
              { AND: [{ address: { contains: variant, mode: "insensitive" } }, { number: numberPart }] },
              { address: { contains: variant, mode: "insensitive" } },
            );
          }
          
          // Busca accent-insensitive via unaccent()
          try {
            const unaccentParam = `%${removeAccents(addressPart)}%`;
            const unaccentIds: Array<{ id: string }> = await prisma.$queryRaw`
              SELECT id FROM properties
              WHERE unaccent(LOWER(address)) LIKE unaccent(LOWER(${unaccentParam}))
              LIMIT 500
            `;
            if (unaccentIds.length > 0) {
              orConditions.push({ id: { in: unaccentIds.map(r => r.id) } });
            }
          } catch (e) {}
          
          // Busca por código, título e proprietário
          orConditions.push(
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: addressPart, mode: "insensitive" } },
            { propertyOwner: { name: { contains: addressPart, mode: "insensitive" } } },
          );
          
          where.OR = orConditions;
        } else {
          // Extrair número do final do texto (ex: "Alameda das Camélias 338" → address="Alameda das Camélias", num="338")
          const trailingNumMatch = searchExact.match(/^(.+?)\s+(\d+)$/);
          const addrWithoutNum = trailingNumMatch ? trailingNumMatch[1].trim() : searchExact;
          const extractedNum = trailingNumMatch ? trailingNumMatch[2] : undefined;
          
          const addressVariantsLocal = expandAddressAbbreviations(addrWithoutNum);
          
          const orConditions: any[] = [
            { title: { equals: searchExact, mode: "insensitive" } },
            { title: { startsWith: searchExact + " ", mode: "insensitive" } },
            { title: { endsWith: " " + searchExact, mode: "insensitive" } },
            { title: { contains: " " + searchExact + " ", mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            // Busca por endereço completo (contém o texto)
            { address: { contains: addressPart, mode: "insensitive" } },
            { neighborhood: { equals: searchExact, mode: "insensitive" } },
            { neighborhood: { startsWith: searchExact + " ", mode: "insensitive" } },
            { neighborhood: { endsWith: " " + searchExact, mode: "insensitive" } },
            // Também incluir busca por condomínio
            { condominium: { name: { equals: searchExact, mode: "insensitive" } } },
            { condominium: { name: { startsWith: searchExact + " ", mode: "insensitive" } } },
            { condominium: { name: { endsWith: " " + searchExact, mode: "insensitive" } } },
            // Busca por nome do proprietário
            { propertyOwner: { name: { contains: searchExact, mode: "insensitive" } } },
          ];
          
          // Se extraiu número do final, buscar endereço sem número + campo number separado
          if (extractedNum) {
            for (const variant of addressVariantsLocal) {
              orConditions.push(
                { AND: [{ address: { contains: variant, mode: "insensitive" } }, { number: extractedNum }] },
                { address: { contains: variant, mode: "insensitive" } },
              );
            }
            orConditions.push(
              { title: { contains: addrWithoutNum, mode: "insensitive" } },
            );
          }
          
          // Busca accent-insensitive via PostgreSQL unaccent()
          try {
            const unaccentParam = `%${removeAccents(addrWithoutNum)}%`;
            const unaccentIds: Array<{ id: string }> = await prisma.$queryRaw`
              SELECT p.id FROM properties p
              LEFT JOIN condominiums c ON p."condominiumId" = c.id
              WHERE unaccent(LOWER(p.title)) LIKE unaccent(LOWER(${unaccentParam}))
                 OR unaccent(LOWER(p.address)) LIKE unaccent(LOWER(${unaccentParam}))
                 OR unaccent(LOWER(p.neighborhood)) LIKE unaccent(LOWER(${unaccentParam}))
                 OR unaccent(LOWER(COALESCE(c.name, ''))) LIKE unaccent(LOWER(${unaccentParam}))
              LIMIT 500
            `;
            if (unaccentIds.length > 0) {
              orConditions.push({ id: { in: unaccentIds.map(r => r.id) } });
            }
          } catch (e) {
            // unaccent extension may not be available
          }
          
          where.OR = orConditions;
        }
      } else {
        // Busca normal com contains + accent-insensitive via unaccent()
        const searchTrimmed = search.trim();
        
        // Fallback: se contém vírgula+número, extrair parte do endereço
        const commaFallback = searchTrimmed.match(/^(.+?)\s*,\s*(\d+)$/);
        const effectiveSearch = commaFallback ? commaFallback[1].trim() : searchTrimmed;
        const extractedNumber = commaFallback ? commaFallback[2] : undefined;
        
        const addressVariants = expandAddressAbbreviations(effectiveSearch);
        
        const orConditions: any[] = [
          { title: { contains: effectiveSearch, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: effectiveSearch, mode: "insensitive" } },
          { neighborhood: { contains: effectiveSearch, mode: "insensitive" } },
          { city: { contains: effectiveSearch, mode: "insensitive" } },
          { address: { contains: effectiveSearch, mode: "insensitive" } },
          { condominium: { name: { contains: effectiveSearch, mode: "insensitive" } } },
          // Busca por nome do proprietário
          { propertyOwner: { name: { contains: effectiveSearch, mode: "insensitive" } } },
        ];
        
        // Se extraiu número da vírgula, buscar endereço+número combinado
        if (extractedNumber) {
          for (const variant of addressVariants) {
            orConditions.push(
              { AND: [{ address: { contains: variant, mode: "insensitive" } }, { number: extractedNumber }] },
            );
          }
        }
        
        // Adicionar variantes de endereço (Al. → Alameda, etc)
        for (const variant of addressVariants) {
          orConditions.push({ address: { contains: variant, mode: "insensitive" } });
        }

        // Busca accent-insensitive via PostgreSQL unaccent()
        // Encontra IDs onde título, endereço, bairro ou cidade matcham sem acentos
        try {
          const effectiveUnaccented = removeAccents(effectiveSearch);
          const unaccentParam = `%${effectiveUnaccented}%`;
          const unaccentIds: Array<{ id: string }> = await prisma.$queryRaw`
            SELECT p.id FROM properties p
            LEFT JOIN condominiums c ON p."condominiumId" = c.id
            WHERE unaccent(LOWER(p.title)) LIKE unaccent(LOWER(${unaccentParam}))
               OR unaccent(LOWER(p.address)) LIKE unaccent(LOWER(${unaccentParam}))
               OR unaccent(LOWER(p.neighborhood)) LIKE unaccent(LOWER(${unaccentParam}))
               OR unaccent(LOWER(p.city)) LIKE unaccent(LOWER(${unaccentParam}))
               OR unaccent(LOWER(COALESCE(c.name, ''))) LIKE unaccent(LOWER(${unaccentParam}))
            LIMIT 500
          `;
          if (unaccentIds.length > 0) {
            orConditions.push({ id: { in: unaccentIds.map(r => r.id) } });
          }
        } catch (e) {
          // Se unaccent não estiver disponível, ignora silenciosamente
          console.warn("unaccent search failed:", e);
        }
        
        where.OR = orConditions;
      }
    }

    if (categories) {
      // Multi-seleção de categorias (ex: "VENDA,LOCACAO")
      const categoryList = categories.split(",").map(c => c.trim().toUpperCase());
      
      // Construir condições de categoria com checks de status para VENDA_LOCACAO
      const categoryConditions: any[] = [];
      
      for (const cat of categoryList) {
        categoryConditions.push({ category: cat });
      }
      
      // Incluir VENDA_LOCACAO com checks de status apropriados
      // IMPORTANTE: notIn do Prisma NÃO inclui NULL, então sempre adicionar { field: null } como alternativa
      if (categoryList.includes("VENDA") && categoryList.includes("LOCACAO")) {
        // Ambos selecionados: VENDA_LOCACAO se pelo menos um status está ativo
        categoryConditions.push({
          AND: [
            { category: "VENDA_LOCACAO" },
            { OR: [
              { saleStatus: { notIn: ["INATIVO", "VENDIDO"] } },
              { saleStatus: null },
              { rentalStatus: { notIn: ["INATIVO", "ALUGADO"] } },
              { rentalStatus: null },
            ]},
          ],
        });
      } else if (categoryList.includes("VENDA")) {
        categoryConditions.push({
          AND: [
            { category: "VENDA_LOCACAO" },
            { OR: [
              { saleStatus: { notIn: ["INATIVO", "VENDIDO"] } },
              { saleStatus: null },
            ]},
          ],
        });
      } else if (categoryList.includes("LOCACAO")) {
        categoryConditions.push({
          AND: [
            { category: "VENDA_LOCACAO" },
            { OR: [
              { rentalStatus: { notIn: ["INATIVO", "ALUGADO"] } },
              { rentalStatus: null },
            ]},
          ],
        });
      } else {
        categoryConditions.push({ category: "VENDA_LOCACAO" });
      }

      // Se já existe where.OR (de busca), usar AND para combinar
      if (where.OR) {
        where.AND = [
          ...(where.AND || []),
          { OR: where.OR },
          { OR: categoryConditions },
        ];
        delete where.OR;
      } else {
        where.OR = categoryConditions;
      }
    } else if (category) {
      where.category = category.toUpperCase();
    }

    if (type) {
      const types = type.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);
      if (types.length === 1) {
        where.type = types[0];
      } else if (types.length > 1) {
        where.type = { in: types };
      }
    }

    const subType = searchParams.get("subType");
    if (subType) {
      where.subType = subType;
    }

    // Parâmetro showAll para admin ver todos os status
    const showAll = searchParams.get("showAll");
    
    if (status) {
      where.status = status.toUpperCase();
    } else if (showAll === "true") {
      // Admin vê todos os status
    } else {
      // Por padrão, mostrar apenas disponíveis (ocultar vendidos, alugados, suspensos, inativos)
      where.status = { notIn: ["VENDIDO", "ALUGADO", "SUSPENSO", "INATIVO", "INDISPONIVEL"] };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (neighborhood) {
      where.neighborhood = { contains: neighborhood, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      // Detectar se é busca por aluguel para filtrar por rentPrice
      const isRentalSearch = categories?.toUpperCase().includes("LOCACAO") || category?.toUpperCase() === "LOCACAO";
      
      if (isRentalSearch) {
        // Para aluguel: VENDA_LOCACAO deve filtrar SOMENTE por rentPrice
        // Para LOCACAO puro: filtrar por rentPrice OU price (dados legados)
        const rentPriceCondition: any = {};
        const priceCondition: any = {};
        if (minPrice) {
          rentPriceCondition.gte = parseFloat(minPrice);
          priceCondition.gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          rentPriceCondition.lte = parseFloat(maxPrice);
          priceCondition.lte = parseFloat(maxPrice);
        }
        const priceOR = [
          // rentPrice no range (funciona para VENDA_LOCACAO e LOCACAO)
          { rentPrice: rentPriceCondition },
          // price no range MAS apenas para LOCACAO puro (não VENDA_LOCACAO, que usaria price de venda)
          { AND: [{ category: "LOCACAO" }, { price: priceCondition }] },
        ];
        if (where.AND) {
          where.AND.push({ OR: priceOR });
        } else if (where.OR) {
          where.AND = [{ OR: where.OR }, { OR: priceOR }];
          delete where.OR;
        } else {
          where.AND = [{ OR: priceOR }];
        }
      } else {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }

    const minTotalArea = searchParams.get("minTotalArea");
    const maxTotalArea = searchParams.get("maxTotalArea");
    if (minTotalArea || maxTotalArea) {
      where.totalArea = {};
      if (minTotalArea) where.totalArea.gte = parseFloat(minTotalArea);
      if (maxTotalArea) where.totalArea.lte = parseFloat(maxTotalArea);
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }

    if (bathrooms) {
      where.bathrooms = { gte: parseInt(bathrooms) };
    }

    if (parkingSpaces) {
      where.parkingSpaces = { gte: parseInt(parkingSpaces) };
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (condominiumSlugs) {
      const slugs = condominiumSlugs.split(",").filter(Boolean);
      if (slugs.length > 0) {
        // Aceitar tanto slugs quanto IDs (backward compatibility com URLs antigas)
        const condos = await prisma.condominium.findMany({
          where: { OR: [{ slug: { in: slugs } }, { id: { in: slugs } }] },
          select: { id: true },
        });
        const resolvedIds = condos.map(c => c.id);
        if (resolvedIds.length > 0) {
          where.condominiumId = { in: resolvedIds };
        } else {
          where.condominiumId = "__none__";
        }
      }
    } else if (condominiumIds) {
      const ids = condominiumIds.split(",").filter(Boolean);
      if (ids.length > 0) {
        where.condominiumId = { in: ids };
      }
    } else if (condominiumId) {
      where.condominiumId = condominiumId;
    }

    if (noCondominium === "true") {
      where.condominiumId = null;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const idsArray = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (idsArray.length > 0) {
        where.id = { in: idsArray };
      }
    }

    if (featuresFilter) {
      const feats = featuresFilter.split(",").filter(Boolean);
      if (feats.length > 0) {
        where.AND = [
          ...(where.AND || []),
          ...feats.map((f: string) => ({
            OR: [
              { features: { hasSome: [f] } },
              { extras: { hasSome: [f] } },
              { amenities: { hasSome: [f] } },
            ],
          })),
        ];
      }
    }

    // Filtro por endereço (com suporte a variações de acentos)
    const address = searchParams.get("address");
    if (address) {
      // Função para remover acentos
      const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Remove preposições comuns para busca mais flexível
      const preposicoes = ["dos", "das", "de", "do", "da", "e", "a", "o", "as", "os"];
      const palavras = address.split(/\s+/).filter(p => 
        p.length > 2 && !preposicoes.includes(p.toLowerCase())
      );
      
      // Cria variações: com acento, sem acento, palavras individuais
      const variacoes: string[] = [address];
      const semAcento = removeAccents(address);
      if (semAcento !== address) variacoes.push(semAcento);
      
      // Adiciona cada palavra significativa
      palavras.forEach(palavra => {
        variacoes.push(palavra);
        const palavraSemAcento = removeAccents(palavra);
        if (palavraSemAcento !== palavra) variacoes.push(palavraSemAcento);
      });
      
      // Busca OR para todas as variações
      where.OR = [
        ...(where.OR || []),
        ...variacoes.map(v => ({ address: { contains: v, mode: "insensitive" as const } }))
      ];
    }

    // Filtro por número
    const number = searchParams.get("number");
    if (number) {
      where.number = number;
    }

    // Filtro por complemento (torre/bloco/apto)
    const complement = searchParams.get("complement");
    if (complement) {
      where.complement = { contains: complement, mode: "insensitive" };
    }

    // Filtro por vendedor (CPF, telefone ou Nome do proprietário)
    const ownerSearch = searchParams.get("ownerSearch");
    if (ownerSearch) {
      const cleanSearch = ownerSearch.replace(/\D/g, "");
      const digitRatioOwner = cleanSearch.length / ownerSearch.trim().length;
      const isNumeric = cleanSearch.length >= 4 && digitRatioOwner >= 0.5;
      
      if (isNumeric) {
        // Busca por CPF ou telefone do proprietário via raw SQL (digits stripped)
        const phoneParam = `%${cleanSearch}%`;
        let ownerMatchIds: string[] = [];
        try {
          const results: Array<{ id: string }> = await prisma.$queryRaw`
            SELECT DISTINCT p.id FROM properties p
            INNER JOIN property_owners po ON p."propertyOwnerId" = po.id
            WHERE regexp_replace(COALESCE(po.cpf, ''), '[^0-9]', '', 'g') LIKE ${phoneParam}
               OR EXISTS (
                 SELECT 1 FROM unnest(po.phones) AS phone
                 WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE ${phoneParam}
               )
               OR regexp_replace(COALESCE(po."phoneContacts"::text, ''), '[^0-9]', '', 'g') LIKE ${phoneParam}
            LIMIT 500
          `;
          ownerMatchIds = results.map(r => r.id);
        } catch (e) {
          console.warn("Owner search raw query failed:", e);
        }
        
        if (ownerMatchIds.length > 0) {
          if (!where.AND) where.AND = [];
          where.AND.push({ id: { in: ownerMatchIds } });
        } else {
          // Fallback: Prisma-based search
          if (!where.AND) where.AND = [];
          where.AND.push({
            OR: [
              { propertyOwner: { cpf: { contains: cleanSearch } } },
              { propertyOwner: { phones: { hasSome: [cleanSearch, ownerSearch.trim()] } } },
              { propertyOwner: { phoneContacts: { string_contains: cleanSearch } } },
            ],
          });
        }
      } else {
        // Busca por nome do proprietário
        where.propertyOwner = { name: { contains: ownerSearch, mode: "insensitive" } };
      }
    }

    if (hasElevator === "true") {
      where.hasElevator = true;
    }

    if (isFurnished === "true") {
      where.isFurnished = true;
    }

    if (hasGroundFloorSuite === "true") {
      where.hasGroundFloorSuite = true;
    }

    if (hasFreeView === "true") {
      where.hasFreeView = true;
    }

    if (acceptsExchange === "true") {
      where.acceptsExchange = true;
    }

    // Filtro de parcelamento direto
    const acceptsDirectPayment = searchParams.get("acceptsDirectPayment");
    if (acceptsDirectPayment === "true") {
      where.acceptsDirectPayment = true;
    }

    // Filtro de documentação irregular
    const hasIrregularDocs = searchParams.get("hasIrregularDocs");
    if (hasIrregularDocs === "true") {
      where.hasIrregularDocs = true;
    } else if (hasIrregularDocs === "false") {
      where.hasIrregularDocs = false;
    }

    // Filtro de banco do financiamento
    const financingBank = searchParams.get("financingBank");
    if (financingBank) {
      where.financingBank = financingBank;
    }

    // Filtro de exclusividade
    const isExclusive = searchParams.get("isExclusive");
    if (isExclusive === "true") {
      where.isExclusive = true;
    }

    // Filtro de exclusividade de terceiros (gestor responsável)
    const isThirdPartyExclusive = searchParams.get("isThirdPartyExclusive");
    if (isThirdPartyExclusive === "true") {
      where.isThirdPartyExclusive = true;
    }

    // Filtro de imóveis com placa
    const hasPlate = searchParams.get("hasPlate");
    if (hasPlate === "true") {
      where.hasPlate = true;
    }

    // Filtro de imóveis sem placa
    const noPlate = searchParams.get("noPlate");
    if (noPlate === "true") {
      where.hasPlate = false;
    }

    // Filtro de imóveis habitados/ocupados
    const isOccupied = searchParams.get("isOccupied");
    if (isOccupied === "true") {
      where.isOccupied = true;
    }

    // Filtro de imóveis com muro
    const hasWall = searchParams.get("hasWall");
    if (hasWall === "true") {
      where.hasWall = true;
    }

    // Filtro de imóveis ocultos do site (não publicados)
    const hiddenFromSite = searchParams.get("hiddenFromSite");
    if (hiddenFromSite === "true") {
      where.showOnWebsite = false;
    }
    
    // Filtro de imóveis publicados no site
    const showOnWebsite = searchParams.get("showOnWebsite");
    if (showOnWebsite === "true") {
      where.showOnWebsite = true;
    }

    // Filtro de imóveis sem foto
    const semFoto = searchParams.get("semFoto");
    if (semFoto === "true") {
      if (!where.AND) where.AND = [];
      where.AND.push({
        OR: [
          { thumbnail: null },
          { thumbnail: "" },
        ],
      });
    }

    // Filtro de imóveis com redução de preço (via PriceHistory)
    const hasPriceReduction = searchParams.get("hasPriceReduction");
    if (hasPriceReduction === "true") {
      if (!where.AND) where.AND = [];
      where.AND.push({
        priceHistory: { some: { changeType: "REDUCTION" } },
      });
    }

    // Filtro de imóveis com aumento de valor (via PriceHistory)
    const hasPriceIncrease = searchParams.get("hasPriceIncrease");
    if (hasPriceIncrease === "true") {
      if (!where.AND) where.AND = [];
      where.AND.push({
        priceHistory: { some: { changeType: "INCREASE" } },
      });
    }

    // Filtro por quem vendeu (TAPPY ou CONCORRENCIA)
    const soldBy = searchParams.get("soldBy");
    if (soldBy) {
      where.soldBy = soldBy;
    }

    // Filtro de data de venda/inativação (para vendidos, alugados, inativos)
    // Filtro por período de cadastro
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo + "T23:59:59");
    }

    // Filtro por período de atualização
    const updatedFrom = searchParams.get("updatedFrom");
    const updatedTo = searchParams.get("updatedTo");

    const soldDateFrom = searchParams.get("soldDateFrom");
    const soldDateTo = searchParams.get("soldDateTo");
    if (updatedFrom || updatedTo) {
      where.updatedAt = {};
      if (updatedFrom) where.updatedAt.gte = new Date(updatedFrom);
      if (updatedTo) where.updatedAt.lte = new Date(updatedTo + "T23:59:59");
    } else if (soldDateFrom || soldDateTo) {
      where.updatedAt = {};
      if (soldDateFrom) where.updatedAt.gte = new Date(soldDateFrom);
      if (soldDateTo) where.updatedAt.lte = new Date(soldDateTo + "T23:59:59");
    }

    // Filtro por categorias do site (websiteCategories)
    // Usa "|" como separador pois os tipos podem conter vírgulas (ex: "TAMBORÉ_1,_2_E_3")
    const websiteCategory = searchParams.get("websiteCategory");
    if (websiteCategory) {
      const cats = websiteCategory.split("|").filter(Boolean);
      if (cats.length > 0) {
        // Se "Exclusividades" está entre as categorias, incluir também isExclusive=true
        const hasExclusividades = cats.some(c => c.toLowerCase() === "exclusividades");
        if (hasExclusividades) {
          if (!where.AND) where.AND = [];
          where.AND.push({
            OR: [
              { websiteCategories: { hasSome: cats } },
              { isExclusive: true },
            ],
          });
        } else {
          where.websiteCategories = { hasSome: cats };
        }
      }
    }

    // Filtro Off-Market
    const offMarket = searchParams.get("offMarket");
    const isOffMarketFilter = searchParams.get("isOffMarket");
    // Se filtro explícito isOffMarket=true (checkbox), mostrar apenas Off-Market
    if (isOffMarketFilter === "true") {
      where.isOffMarket = true;
    } else if (offMarket === "true") {
      where.isOffMarket = true;
    } else if (offMarket === "all") {
      // Não filtra - mostra todos (para admin/corretor)
    } else {
      // Padrão: exclui Off-Market da listagem normal
      where.isOffMarket = false;
    }

    // Filtro temporário: ocultar imóveis sem foto e com preço 0
    // Admin (showAll=true) ou busca por código exato ignora este filtro
    const hideIncomplete = searchParams.get("hideIncomplete");
    const isExactCodeSearch = search && /^CNC[A-Z]?\d+(-[A-Z0-9]+)?$/i.test(search.trim());
    if (hideIncomplete !== "false" && showAll !== "true" && !isExactCodeSearch) {
      // Por padrão, oculta imóveis incompletos (sem foto ou preço 0)
      where.thumbnail = { not: null };
      // Pelo menos um preço deve ser maior que 0
      where.AND = [
        ...(where.AND || []),
        { OR: [{ price: { gt: 0 } }, { rentPrice: { gt: 0 } }] },
        { NOT: { title: { contains: "teste", mode: "insensitive" } } },
      ];
    }

    // Construir ordenação - a escolha do usuário sempre tem prioridade
    const orderByClause: any[] = [];
    
    // Ordenação principal escolhida pelo usuário
    if (sortBy && sortBy !== 'price') {
      orderByClause.push({ [sortBy]: sortOrder || 'desc' });
    }
    
    // Se filtrando por vendidos/inativos com filtro de data, ordenar por updatedAt
    if ((status === 'VENDIDO' || status === 'ALUGADO' || status === 'INATIVO') && (soldDateFrom || soldDateTo)) {
      // Ordenar por data de atualização (mais recente primeiro por padrão)
      if (!sortBy || sortBy === 'updatedAt') {
        orderByClause.unshift({ updatedAt: sortOrder || 'desc' });
      }
    }
    
    // Ordenação secundária: imóveis com foto primeiro (se não for a ordenação principal)
    if (sortBy !== 'thumbnail' && sortBy !== 'price') {
      orderByClause.push({ thumbnail: { sort: 'desc', nulls: 'last' } });
    }
    
    // Se ordenar por preço, buscar todos e ordenar manualmente para considerar rentPrice
    const isPriceSort = sortBy === 'price';
    
    // Modo minimal: retorna apenas campos necessários para listagem (site público)
    const fieldsMode = searchParams.get("fields");
    const isMinimal = fieldsMode === "minimal";
    
    const minimalSelect = isMinimal ? {
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        subType: true,
        category: true,
        status: true,
        saleStatus: true,
        rentalStatus: true,
        websitePublishMode: true,
        price: true,
        rentPrice: true,
        condoFee: true,
        area: true,
        totalArea: true,
        bedrooms: true,
        suites: true,
        parkingSpaces: true,
        neighborhood: true,
        city: true,
        address: true,
        thumbnail: true,
        images: true,
        isFeatured: true,
        isExclusive: true,
        isOffMarket: true,
        views: true,
        acceptsExchange: true,
        isFurnished: true,
        acceptsPets: true,
        rentalWarranties: true,
        landTopography: true,
        hasApprovedProject: true,
        websiteCategories: true,
        amenities: true,
        features: true,
        extras: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        condominium: {
          select: { id: true, name: true, slug: true },
        },
      },
    } : {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
          },
        },
        condominium: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            leadsList: true,
            visitsList: true,
            favoritesList: true,
          },
        } as any,
      },
    };
    
    // Imóveis de parceiros externos só entram na lista (painel/site) após aprovação.
    // Pendentes/reprovados ficam restritos à tela "Parcerias › Cadastros de Imóveis".
    // Null-safe: imóveis comuns têm partnerSubmittedById = NULL e continuam visíveis.
    const partnerVisibility = {
      OR: [{ partnerSubmittedById: null }, { partnerApprovalStatus: "APROVADO" as const }],
    };
    if (Array.isArray(where.AND)) where.AND.push(partnerVisibility);
    else if (where.AND) where.AND = [where.AND, partnerVisibility];
    else where.AND = [partnerVisibility];

    const [propertiesRaw, total, totalAll] = await Promise.all([
      prisma.property.findMany({
        where,
        ...minimalSelect,
        orderBy: isPriceSort ? undefined : orderByClause,
        skip: isPriceSort ? 0 : skip,
        take: isPriceSort ? undefined : limit,
      }),
      prisma.property.count({ where }),
      prisma.property.count(), // Total real sem filtros
    ]);

    // Se ordenar por preço, ordenar manualmente considerando rentPrice
    let properties: any[] = propertiesRaw;
    const isRentalSort = categories?.toUpperCase().includes("LOCACAO") || category?.toUpperCase() === "LOCACAO";
    if (isPriceSort) {
      properties = [...propertiesRaw].sort((a: any, b: any) => {
        let priceA: number, priceB: number;
        if (isRentalSort) {
          // Para aluguel: VENDA_LOCACAO usa rentPrice, LOCACAO usa rentPrice ou price
          priceA = a.category === "VENDA_LOCACAO" ? (a.rentPrice || 0) : (a.rentPrice || a.price || 0);
          priceB = b.category === "VENDA_LOCACAO" ? (b.rentPrice || 0) : (b.rentPrice || b.price || 0);
        } else {
          // Para venda: usa price se > 0, senão usa rentPrice
          priceA = a.price > 0 ? a.price : (a.rentPrice || 0);
          priceB = b.price > 0 ? b.price : (b.rentPrice || 0);
        }
        
        if (sortOrder === 'asc') {
          return priceA - priceB;
        }
        return priceB - priceA;
      });
      
      // Aplicar paginação após ordenação
      properties = properties.slice(skip, skip + limit);
    }

    // No modo minimal, truncar images para max 3 por imóvel (reduz payload ~80%)
    const finalProperties = isMinimal
      ? properties.map((p: any) => ({
          ...p,
          images: (p.images || []).slice(0, 3),
        }))
      : properties;

    const response = NextResponse.json({
      properties: finalProperties,
      pagination: {
        page,
        limit,
        total,
        totalAll, // Total real de imóveis no banco
        totalPages: Math.ceil(total / limit),
      },
    });

    // Cache público para requisições do site (fields=minimal) — reduz carga no servidor
    if (isMinimal) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    }

    return response;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imóveis" },
      { status: 500 }
    );
  }
}

// POST - Criar imóvel
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Tentar parsear o body com tratamento de erro
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json(
          { error: "Corpo da requisição vazio" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError);
      return NextResponse.json(
        { error: "JSON inválido no corpo da requisição" },
        { status: 400 }
      );
    }

    // Log para debug
    console.log("Dados recebidos para criar imóvel:", JSON.stringify(body, null, 2));

    const validatedData = createPropertySchema.safeParse(body);

    if (!validatedData.success) {
      console.error("Erros de validação:", validatedData.error.issues);
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    const data = { ...validatedData.data } as any;

    // Extrair campos de PropertyDocument antes de remover
    const documentFields: Record<string, string | null> = {};
    for (const key of ["matriculaNumber", "iptuNumber", "certidaoSPU"]) {
      if (data[key] !== undefined && data[key]) {
        documentFields[key] = data[key];
      }
    }
    // Extrair URLs de documentos enviados pelo frontend
    if (data._documentUrls && typeof data._documentUrls === "object") {
      for (const key of ["matriculaUrl", "iptuUrl", "certidaoSPUUrl"]) {
        if (data._documentUrls[key]) {
          documentFields[key] = data._documentUrls[key];
        }
      }
    }

    // Remover campos que não pertencem ao modelo Property (são usados no frontend para criar PropertyOwner)
    const fieldsToRemove = [
      "ownerName", "ownerPhones", "ownerEmail", "ownerCpf", "ownerRg", "ownerBirthDate",
      "ownerAddress", "ownerAddressNumber", "ownerAddressComplement",
      "ownerNeighborhood", "ownerCity", "ownerState", "ownerZipCode",
      "ownerType", "ownerProfiles", "exclusivityManagerName",
      "sellerType", "sellerCreci", "constructorName", "constructorCnpj", "investorType",
      "matriculaNumber", "iptuNumber", "certidaoSPU", "_documentUrls",
      "matriculaFile", "matriculaFileName", "iptuFile", "iptuFileName", "certidaoFile", "certidaoFileName",
      "exchangeNotInformed",
      "ownerEmails", "ownerNickname_temp",
    ];
    fieldsToRemove.forEach(f => delete data[f]);

    // Usar código fornecido pelo corretor, ou gerar automaticamente
    let code = "";
    const userCode = data.code?.trim();
    delete data.code;

    if (userCode && userCode.length > 0) {
      // Código editado pelo corretor: verificar unicidade
      const exists = await prisma.property.findUnique({ where: { code: userCode }, select: { id: true } });
      if (exists) {
        return NextResponse.json({ error: `Código "${userCode}" já existe` }, { status: 400 });
      }
      code = userCode;
    } else {
      // Gerar código único - buscar o maior código IMB existente
      for (let attempt = 0; attempt < 5; attempt++) {
        const lastIMB = await prisma.property.findFirst({
          where: { code: { startsWith: "IMB" } },
          orderBy: { code: "desc" },
          select: { code: true },
        });
        
        const lastNumber = lastIMB?.code 
          ? parseInt(lastIMB.code.replace(/[^0-9]/g, "")) || 0
          : 0;
        const candidate = `IMB${String(lastNumber + 1 + attempt).padStart(5, "0")}`;
        
        // Verificar se já existe
        const exists = await prisma.property.findUnique({ where: { code: candidate }, select: { id: true } });
        if (!exists) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        // Fallback: usar timestamp
        code = `IMB${Date.now().toString(36).toUpperCase()}`;
      }
    }

    // Gerar slug: prioriza condomínio, senão usa título
    let condoNameForSlug = "";
    if (data.condominiumId) {
      const condo = await prisma.condominium.findUnique({ where: { id: data.condominiumId }, select: { name: true } });
      if (condo) condoNameForSlug = condo.name;
    }
    const slugBase = (condoNameForSlug || data.title)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${code.toLowerCase()}`.trim();

    // Limpar campos booleanos não-anuláveis que vieram como null (Prisma rejeita null neles)
    const boolDefaultFalse = [
      "condoFeeExempt", "foroExempt", "acceptsExchange", "acceptsFGTS",
      "acceptsDirectPayment", "hasFinancingBalance", "hasIrregularDocs",
      "hasElevator", "isFurnished", "hasGroundFloorSuite", "hasFreeView",
      "hasPlate", "isOccupied", "isOffMarket", "isFeatured", "isExclusive",
      "isThirdPartyExclusive", "isNew", "isSuperFeatured", "hasPartnerCondition",
    ];
    const boolDefaultTrue = ["isNegotiable", "acceptsFinancing", "showOnWebsite"];
    boolDefaultFalse.forEach(f => { if (data[f] === null || data[f] === undefined) data[f] = false; });
    boolDefaultTrue.forEach(f => { if (data[f] === null || data[f] === undefined) data[f] = true; });

    // Recalcular status principal server-side
    if (data.saleStatus || data.rentalStatus) {
      const saleStatus = data.saleStatus || "ATIVO";
      const rentalStatus = data.rentalStatus || "ATIVO";
      const category = data.category || "VENDA";

      let computedStatus = "DISPONIVEL";
      if (category === "VENDA") {
        if (saleStatus === "VENDIDO") computedStatus = "VENDIDO";
        else if (saleStatus === "SUSPENSO") computedStatus = "SUSPENSO";
        else if (saleStatus === "INATIVO") computedStatus = "INATIVO";
      } else if (category === "LOCACAO") {
        if (rentalStatus === "ALUGADO") computedStatus = "ALUGADO";
        else if (rentalStatus === "SUSPENSO") computedStatus = "SUSPENSO";
        else if (rentalStatus === "INATIVO") computedStatus = "INATIVO";
      } else if (category === "VENDA_LOCACAO") {
        if (saleStatus === "INATIVO" && rentalStatus === "INATIVO") computedStatus = "INATIVO";
        else if (saleStatus === "VENDIDO" && rentalStatus === "ALUGADO") computedStatus = "INATIVO";
        else if (saleStatus === "ATIVO" || rentalStatus === "ATIVO") computedStatus = "DISPONIVEL";
        else if (saleStatus === "VENDIDO") computedStatus = "VENDIDO";
        else if (rentalStatus === "ALUGADO") computedStatus = "ALUGADO";
        else if (saleStatus === "SUSPENSO" && rentalStatus === "SUSPENSO") computedStatus = "SUSPENSO";
        else computedStatus = "INATIVO";
      }
      data.status = computedStatus;
    }

    // Converter IDs escalares para sintaxe de relação (Prisma create exige connect)
    const condominiumId = data.condominiumId;
    const propertyOwnerId = data.propertyOwnerId;
    delete data.ownerId;
    delete data.owner;
    delete data.propertyOwner;
    delete data.condominiumId;
    delete data.propertyOwnerId;

    const property = await prisma.property.create({
      data: {
        ...data,
        code,
        slug,
        owner: { connect: { id: session.id } },
        ...(condominiumId ? { condominium: { connect: { id: condominiumId } } } : {}),
        ...(propertyOwnerId ? { propertyOwner: { connect: { id: propertyOwnerId } } } : {}),
        publishedAt: new Date(),
      } as any,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Salvar campos de documentos em PropertyDocument (tabela separada)
    if (Object.keys(documentFields).length > 0) {
      try {
        await prisma.propertyDocument.create({
          data: { propertyId: property.id, ...documentFields },
        });
      } catch (docErr: any) {
        console.error("Erro ao salvar documentos do imóvel:", docErr.message);
      }
    }

    // Registrar log de atividade
    logPropertyActivity({
      action: "CREATED",
      propertyId: property.id,
      propertyCode: code,
      propertyTitle: data.title,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      description: `Imóvel ${code} criado: ${data.title}`,
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating property:", error);
    const detail = error?.code === "P2002" 
      ? `Campo duplicado: ${error?.meta?.target || "código"}` 
      : error?.message || "Erro interno";
    return NextResponse.json(
      { error: "Erro ao criar imóvel", detail },
      { status: 500 }
    );
  }
}
