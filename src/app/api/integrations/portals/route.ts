import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// Helpers
// ============================================================

function esc(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Resolve endereço: usa fake quando disponível e showRealAddress é false
function resolveAddress(p: any) {
  const condo = p.condominium;
  const useFake = condo && condo.showRealAddress === false && condo.fakeAddress;
  return {
    address: useFake ? (condo.fakeAddress || "") : (condo?.address || p.address || ""),
    number: useFake ? (condo.fakeNumber || "") : (condo?.number || p.number || ""),
    neighborhood: useFake ? (condo.fakeNeighborhood || condo?.neighborhood || p.neighborhood || "") : (condo?.neighborhood || p.neighborhood || ""),
    city: useFake ? (condo.fakeCity || condo?.city || p.city || "") : (condo?.city || p.city || ""),
    state: useFake ? (condo.fakeState || condo?.state || p.state || "") : (condo?.state || p.state || ""),
    zipCode: useFake ? (condo.fakeZipCode || condo?.zipCode || p.zipCode || "") : (condo?.zipCode || p.zipCode || ""),
  };
}

function cdata(val: string | null | undefined): string {
  if (!val) return "";
  return `<![CDATA[${val.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function mapPropertyType(type: string): string {
  const map: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    CASA_CONDOMINIO: "Casa de Condomínio",
    COBERTURA: "Cobertura",
    FLAT: "Flat",
    KITNET: "Kitnet",
    LOFT: "Loft",
    SOBRADO: "Sobrado",
    STUDIO: "Studio",
    TERRENO: "Terreno",
    TERRENO_CONDOMINIO: "Terreno em Condomínio",
    COMERCIAL: "Comercial/Industrial",
    SALA_COMERCIAL: "Sala Comercial",
    LOJA: "Loja/Ponto Comercial",
    GALPAO: "Galpão",
    RURAL: "Sítio/Fazenda",
    INDUSTRIAL: "Comercial/Industrial",
    CHACARA: "Chácara",
  };
  return map[type] || "Outros";
}

function mapOlxType(type: string): string {
  const map: Record<string, string> = {
    APARTAMENTO: "apartment",
    CASA: "house",
    CASA_CONDOMINIO: "house_condo",
    TERRENO: "land",
    TERRENO_CONDOMINIO: "land_condo",
    COMERCIAL: "commercial",
    SALA_COMERCIAL: "commercial",
    LOJA: "commercial",
    GALPAO: "commercial",
    COBERTURA: "penthouse",
    FLAT: "flat",
    KITNET: "kitnet",
  };
  return map[type] || "other";
}

function mapCategory(category: string): string {
  if (category === "VENDA") return "Venda";
  if (category === "LOCACAO") return "Aluguel";
  return "Venda e Aluguel";
}

// Resolver URL de imagem para absoluta
function resolveImageUrl(img: string, baseUrl: string): string {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  // URL relativa — prefixar com baseUrl
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = img.startsWith("/") ? img : `/${img}`;
  return `${cleanBase}${cleanPath}`;
}

// Mapeamento PropertyType → vrsync PropertyType (Grupo ZAP)
function mapVrSyncPropertyType(type: string): string {
  const map: Record<string, string> = {
    APARTAMENTO: "Residential / Apartment",
    CASA: "Residential / Home",
    CASA_CONDOMINIO: "Residential / Condo",
    COBERTURA: "Residential / Penthouse",
    FLAT: "Residential / Flat",
    KITNET: "Residential / Kitnet",
    LOFT: "Residential / Loft",
    SOBRADO: "Residential / Sobrado",
    STUDIO: "Residential / Studio",
    TERRENO: "Residential / Land Lot",
    TERRENO_CONDOMINIO: "Residential / Land Lot",
    COMERCIAL: "Commercial / Building",
    SALA_COMERCIAL: "Commercial / Office",
    LOJA: "Commercial / Store",
    GALPAO: "Commercial / Warehouse",
    RURAL: "Residential / Farm/Ranch",
    INDUSTRIAL: "Commercial / Industrial",
    CHACARA: "Residential / Farm/Ranch",
  };
  return map[type] || "Residential / Home";
}

// Mapeamento estado completo → sigla UF
function stateAbbreviation(state: string): string {
  if (state.length === 2) return state.toUpperCase();
  const map: Record<string, string> = {
    "acre": "AC", "alagoas": "AL", "amapá": "AP", "amazonas": "AM",
    "bahia": "BA", "ceará": "CE", "distrito federal": "DF",
    "espírito santo": "ES", "goiás": "GO", "maranhão": "MA",
    "mato grosso": "MT", "mato grosso do sul": "MS", "minas gerais": "MG",
    "pará": "PA", "paraíba": "PB", "paraná": "PR", "pernambuco": "PE",
    "piauí": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
    "rio grande do sul": "RS", "rondônia": "RO", "roraima": "RR",
    "santa catarina": "SC", "são paulo": "SP", "sergipe": "SE",
    "tocantins": "TO",
  };
  return map[state.toLowerCase()] || state;
}

// Mapeamento addressVisibility → displayAddress (vrsync)
function mapDisplayAddress(visibility: string): string {
  if (visibility === "SOMENTE_RUA") return "Street";
  if (visibility === "SOMENTE_BAIRRO") return "Neighborhood";
  return "All";
}

// Mapeamento portal ID para filtro no activePortals
// No form, "zap" cobre ZAP + VivaReal + OLX (Grupo ZAP+)
function getPortalFilter(portal: string): string[] {
  switch (portal) {
    case "zap": return ["zap"];
    case "vivareal": return ["zap"]; // ZAP+ cobre VivaReal
    case "olx": return ["zap", "olx"]; // ZAP+ cobre OLX, ou OLX standalone
    case "imovelweb": return ["imovelweb"];
    case "chavesnamao": return ["chavesnamao"];
    case "trovit": return ["trovit"];
    case "123i": return ["123i"];
    case "casaminheira": return ["casaminheira"];
    case "lugarcerto": return ["lugarcerto"];
    default: return [portal];
  }
}

// ============================================================
// Gerador XML — Formato vrsync (Canal Pro: ZAP / VivaReal / OLX)
// Docs: https://developers.grupozap.com/feeds/vrsync/
// ============================================================

function generateVrSyncXML(properties: any[], baseUrl: string) {
  const publishDate = new Date().toISOString().replace(/\.\d+Z$/, "");

  const listings = properties.map((p) => {
    const resolved = resolveAddress(p);
    const addr = resolved.address;
    const num = resolved.number;
    const hood = resolved.neighborhood;
    const cityName = resolved.city;
    const stateName = resolved.state;
    const zip = resolved.zipCode.replace(/\D/g, "");
    const stateAbbr = stateAbbreviation(stateName);
    const displayAddr = mapDisplayAddress(p.addressVisibility || "COMPLETO");

    // Respeitar saleStatus/rentalStatus para VENDA_LOCACAO
    const saleActive = !p.saleStatus || p.saleStatus === "ATIVO";
    const rentalActive = !p.rentalStatus || p.rentalStatus === "ATIVO";

    // TransactionType — ajustar quando uma das finalidades está inativa
    let transactionType = "For Sale";
    if (p.category === "LOCACAO") transactionType = "For Rent";
    else if (p.category === "VENDA_LOCACAO") {
      if (saleActive && rentalActive) transactionType = "Sale/Rent";
      else if (saleActive) transactionType = "For Sale";
      else if (rentalActive) transactionType = "For Rent";
    }

    // PropertyType (vrsync)
    const propertyType = mapVrSyncPropertyType(p.type);

    // UsageType
    const isCommercial = ["COMERCIAL", "SALA_COMERCIAL", "LOJA", "GALPAO", "INDUSTRIAL"].includes(p.type);
    const usageType = isCommercial ? "Commercial" : "Residential";

    // Pricing — inteiros sem decimais, respeitando status individual
    const salePrice = (p.category !== "LOCACAO" && saleActive) ? Math.round(p.price || 0) : 0;
    const rentPrice = (p.category === "LOCACAO" || (p.category === "VENDA_LOCACAO" && rentalActive)) ? Math.round(p.rentPrice || 0) : 0;
    const condoFee = Math.round(p.condoFee || 0);
    const iptuValue = Math.round(p.iptu || 0);
    const iptuPeriod = p.iptuPeriod === "MENSAL" ? "Monthly" : "Yearly";

    // Areas — inteiros
    const livingArea = Math.round(p.usefulArea || p.area || 0);
    const lotArea = Math.round(p.totalArea || p.area || 0);
    const isLandType = ["TERRENO", "TERRENO_CONDOMINIO", "GALPAO", "RURAL", "CHACARA"].includes(p.type);

    // PublicationType — portalPositions é a fonte de verdade POR portal.
    // Só cai no fallback de flags globais quando não há posição definida para
    // este portal (evita que um destaque de outro portal vaze pra cá).
    const positions = (p.portalPositions as Record<string, string>) || {};
    const portalCat = positions["grupozap"] || positions["zap"] || "";
    let pubType = "STANDARD";
    if (portalCat) {
      if (portalCat === "super_destaque") pubType = "SUPER_PREMIUM";
      else if (portalCat === "destaque_exclusivo" || portalCat === "destaque") pubType = "PREMIUM";
      // "simples" → STANDARD (default)
    } else {
      // Sem configuração específica deste portal → fallback flags globais
      if (p.isSuperFeatured) pubType = "SUPER_PREMIUM";
      else if (p.isFeatured) pubType = "PREMIUM";
    }

    // Title — 10 a 100 caracteres
    let title = (p.marketplaceTitle || p.title || "").replace(/<[^>]+>/g, "").trim();
    if (title.length > 100) title = title.substring(0, 97) + "...";
    if (title.length < 10) title = title.padEnd(10, " ");

    // Description — 50 a 3000 caracteres
    let desc = (p.description || "").replace(/<[^>]+>/g, "").trim();
    if (desc.length > 3000) desc = desc.substring(0, 2997) + "...";
    if (desc.length < 50) desc = desc.padEnd(50, " ");

    // Media
    const mediaItems: string[] = [];
    if (p.videoYoutube) {
      mediaItems.push(`        <Item medium="video">${esc(p.videoYoutube)}</Item>`);
    }
    (p.images || []).forEach((img: string, idx: number) => {
      const url = resolveImageUrl(img, baseUrl);
      if (idx === 0) {
        mediaItems.push(`        <Item medium="image" caption="foto${idx + 1}" primary="true">${esc(url)}</Item>`);
      } else {
        mediaItems.push(`        <Item medium="image" caption="foto${idx + 1}">${esc(url)}</Item>`);
      }
    });

    // Pricing XML
    let pricingXml = "";
    if (transactionType === "For Sale" || transactionType === "Sale/Rent") {
      pricingXml += `\n        <ListPrice currency="BRL">${salePrice}</ListPrice>`;
    }
    if (transactionType === "For Rent" || transactionType === "Sale/Rent") {
      pricingXml += `\n        <RentalPrice currency="BRL" period="Monthly">${rentPrice}</RentalPrice>`;
    }

    return `
    <Listing>
      <ListingID>${esc(p.code || p.id)}</ListingID>
      <Title>${cdata(title)}</Title>
      <TransactionType>${transactionType}</TransactionType>
      <PublicationType>${pubType}</PublicationType>
      <Location displayAddress="${displayAddr}">
        <Country abbreviation="BR">Brasil</Country>
        <State abbreviation="${stateAbbr}">${cdata(stateName)}</State>
        <City>${cdata(cityName)}</City>
        <Neighborhood>${cdata(hood)}</Neighborhood>
        ${addr ? `<Address>${cdata(addr)}</Address>` : ""}
        ${num ? `<StreetNumber>${esc(num)}</StreetNumber>` : ""}
        ${p.complement ? `<Complement>${cdata(p.complement)}</Complement>` : ""}
        ${zip ? `<PostalCode>${zip}</PostalCode>` : ""}
        ${p.latitude ? `<Latitude>${p.latitude}</Latitude>` : ""}
        ${p.longitude ? `<Longitude>${p.longitude}</Longitude>` : ""}
      </Location>
      <Details>
        <PropertyType>${propertyType}</PropertyType>
        <Description>${cdata(desc)}</Description>${pricingXml}
        ${condoFee > 0 ? `<PropertyAdministrationFee currency="BRL">${condoFee}</PropertyAdministrationFee>` : ""}
        ${iptuValue > 0 ? `<Iptu currency="BRL" period="${iptuPeriod}">${iptuValue}</Iptu>` : ""}
        ${isLandType ? `<LotArea unit="square metres">${lotArea}</LotArea>` : `<LivingArea unit="square metres">${livingArea}</LivingArea>
        <LotArea unit="square metres">${lotArea}</LotArea>`}
        <Bedrooms>${p.bedrooms || 0}</Bedrooms>
        ${p.suites ? `<Suites>${p.suites}</Suites>` : ""}
        <Bathrooms>${p.bathrooms || 0}</Bathrooms>
        <Garage>${p.parkingSpaces || 0}</Garage>
        ${p.totalFloors ? `<Floors>${p.totalFloors}</Floors>` : ""}
        ${p.floor ? `<UnitFloor>${p.floor}</UnitFloor>` : ""}
        ${p.yearBuilt ? `<YearBuilt>${p.yearBuilt}</YearBuilt>` : ""}
        <UsageType>${usageType}</UsageType>
      </Details>
      <Media>
${mediaItems.join("\n")}
      </Media>
      <ContactInfo>
        <Name><![CDATA[Tappy Imob]]></Name>
        <Email>administracao@tappyimob.com.br</Email>
        <Website>${baseUrl}</Website>
        <Telephone>(11) 94752-2498</Telephone>
      </ContactInfo>
      ${p.virtualTour ? `<VirtualTourLink>${esc(p.virtualTour)}</VirtualTourLink>` : ""}
    </Listing>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">
  <Header>
    <Provider>Tappy Imob</Provider>
    <Email>administracao@tappyimob.com.br</Email>
    <ContactName>Tappy Imob</ContactName>
    <PublishDate>${publishDate}</PublishDate>
    <Telephone>(11) 94752-2498</Telephone>
  </Header>
  <Listings>${listings}
  </Listings>
</ListingDataFeed>`;
}

// ============================================================
// Gerador JSON — Padrão OLX
// ============================================================

function generateOlxJSON(properties: any[], baseUrl: string) {
  return properties.map((p) => {
    const slug = p.slug || p.id;
    return {
      id: p.code || p.id,
      operation: p.category === "LOCACAO" ? "rent" : "sale",
      type: mapOlxType(p.type),
      title: p.marketplaceTitle || p.title,
      description: p.description || "",
      price: p.category === "LOCACAO" ? (p.rentPrice || p.price) : p.price,
      rental_price: p.rentPrice || undefined,
      condominium_fee: p.condoFee || 0,
      iptu: p.iptu || 0,
      address: {
        street: resolveAddress(p).address,
        number: resolveAddress(p).number,
        complement: p.complement || "",
        neighborhood: resolveAddress(p).neighborhood,
        city: resolveAddress(p).city,
        state: resolveAddress(p).state,
        zipcode: resolveAddress(p).zipCode.replace(/\D/g, ""),
        latitude: p.latitude || undefined,
        longitude: p.longitude || undefined,
      },
      area: p.totalArea || p.area || 0,
      useful_area: p.usefulArea || p.area || 0,
      bedrooms: p.bedrooms || 0,
      suites: p.suites || 0,
      bathrooms: p.bathrooms || 0,
      parking_spaces: p.parkingSpaces || 0,
      floor: p.floor || undefined,
      furnished: p.isFurnished || false,
      accepts_exchange: p.acceptsExchange || false,
      images: (p.images || []).map((url: string) => ({ url: resolveImageUrl(url, baseUrl) })),
      video_url: p.videoYoutube || undefined,
      virtual_tour_url: p.virtualTour || undefined,
      url: `${baseUrl}/imovel/${slug}`,
      active: p.status === "DISPONIVEL",
      updated_at: p.updatedAt?.toISOString(),
    };
  });
}

// ============================================================
// Gerador XML — Padrão OpenNavent (ImovelWeb / Grupo QuintoAndar)
// Docs: https://open-classifieds.notion.site/arg/bra/xml/
// ============================================================

// Mapeamento tipoPropriedade → idTipo + idSubTipo (ImovelWeb/OpenNavent API)
// IDs consultados em: api-br-open.navent.com/v1/tipopropriedade + /subtipos
// Tipo 1=Casa, 2=Apartamento, 1003=Terreno, 1004=Rurais, 1005=Comercial
function mapOpenNaventTypeIds(type: string): { idTipo: string; idSubTipo: string; nome: string } {
  const map: Record<string, { idTipo: string; idSubTipo: string; nome: string }> = {
    APARTAMENTO:        { idTipo: "2",    idSubTipo: "1",  nome: "Apartamento" },
    COBERTURA:          { idTipo: "2",    idSubTipo: "26", nome: "Cobertura" },
    FLAT:               { idTipo: "2",    idSubTipo: "4",  nome: "Flat" },
    KITNET:             { idTipo: "2",    idSubTipo: "2",  nome: "Kitchenette/Studio" },
    LOFT:               { idTipo: "2",    idSubTipo: "3",  nome: "Loft" },
    STUDIO:             { idTipo: "2",    idSubTipo: "2",  nome: "Kitchenette/Studio" },
    CASA:               { idTipo: "1",    idSubTipo: "5",  nome: "Casa" },
    CASA_CONDOMINIO:    { idTipo: "1",    idSubTipo: "6",  nome: "Casa de Condomínio" },
    SOBRADO:            { idTipo: "1",    idSubTipo: "33", nome: "Sobrado" },
    TERRENO:            { idTipo: "1003", idSubTipo: "8",  nome: "Terreno Padrão" },
    TERRENO_CONDOMINIO: { idTipo: "1003", idSubTipo: "9",  nome: "Loteamento/Condomínio" },
    COMERCIAL:          { idTipo: "1005", idSubTipo: "32", nome: "Área Comercial" },
    SALA_COMERCIAL:     { idTipo: "1005", idSubTipo: "16", nome: "Conjunto Comercial/Sala" },
    LOJA:               { idTipo: "1005", idSubTipo: "19", nome: "Loja/Salão" },
    GALPAO:             { idTipo: "1005", idSubTipo: "20", nome: "Galpão/Depósito/Barracão" },
    INDUSTRIAL:         { idTipo: "1005", idSubTipo: "25", nome: "Indústria" },
    RURAL:              { idTipo: "1004", idSubTipo: "11", nome: "Sítio" },
    CHACARA:            { idTipo: "1004", idSubTipo: "10", nome: "Chácara" },
  };
  return map[type] || { idTipo: "2", idSubTipo: "1", nome: "Apartamento" };
}

// Mapeamento estado abreviado → nome completo (Fix 3: localidade sem abreviações)
function stateFullName(state: string): string {
  if (state.length > 2) return state;
  const map: Record<string, string> = {
    "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas",
    "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal",
    "ES": "Espírito Santo", "GO": "Goiás", "MA": "Maranhão",
    "MT": "Mato Grosso", "MS": "Mato Grosso do Sul", "MG": "Minas Gerais",
    "PA": "Pará", "PB": "Paraíba", "PR": "Paraná", "PE": "Pernambuco",
    "PI": "Piauí", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul", "RO": "Rondônia", "RR": "Roraima",
    "SC": "Santa Catarina", "SP": "São Paulo", "SE": "Sergipe",
    "TO": "Tocantins",
  };
  return map[state.toUpperCase()] || state;
}

function generateImovelWebXML(properties: any[], baseUrl: string) {
  const timestamp = Date.now();

  const items = properties.map((p) => {
    const resolved = resolveAddress(p);
    const slug = p.slug || p.id;

    // Fix 1: tipoPropriedade com idTipo e idSubTipo
    const typeIds = mapOpenNaventTypeIds(p.type);

    // Preços — respeitar saleStatus/rentalStatus para VENDA_LOCACAO
    // Fix 2: operacao usa VENTA/ALQUILER (padrão OpenNavent)
    const saleActive = !p.saleStatus || p.saleStatus === "ATIVO";
    const rentalActive = !p.rentalStatus || p.rentalStatus === "ATIVO";
    const precos: string[] = [];
    if (p.category !== "LOCACAO" && p.price && saleActive) {
      precos.push(`
          <preco>
            <quantidade>${cdata(String(Math.round(p.price)))}</quantidade>
            <moeda>${cdata("BRL")}</moeda>
            <operacao>${cdata("VENTA")}</operacao>
          </preco>`);
    }
    if ((p.category === "LOCACAO" || (p.category === "VENDA_LOCACAO" && rentalActive)) && (p.rentPrice || p.price)) {
      precos.push(`
          <preco>
            <quantidade>${cdata(String(Math.round(p.rentPrice || p.price)))}</quantidade>
            <moeda>${cdata("BRL")}</moeda>
            <operacao>${cdata("ALQUILER")}</operacao>
          </preco>`);
    }

    // Imagens
    const imagens = (p.images || []).map((img: string, idx: number) => `
          <imagem>
            <urlImagem>${cdata(resolveImageUrl(img, baseUrl))}</urlImagem>
            <titulo>${cdata(`Foto ${idx + 1}`)}</titulo>
          </imagem>`).join("");

    // Vídeos
    const videos = p.videoYoutube ? `
        <videos>
          <video>
            <codigoVideo>${cdata(p.videoYoutube)}</codigoVideo>
            <titulo>${cdata("Vídeo do imóvel")}</titulo>
          </video>
        </videos>` : "";

    // Tour 360
    const tours = p.virtualTour ? `
        <tours360>
          <tour360>
            <codigoTour360>${cdata(p.virtualTour)}</codigoTour360>
            <titulo>${cdata("Tour virtual")}</titulo>
          </tour360>
        </tours360>` : "";

    // Características no formato correto OpenNavent (sem CDATA, sem tag CON1)
    // Formato: <id>, <nome>, <valor> ou <idValor>
    const chars: string[] = [];
    const totalArea = p.totalArea || p.area || 0;
    const usefulArea = p.usefulArea || p.area || 0;
    let hasAreaUnit = false;
    if (totalArea > 0) {
      chars.push(`
          <caracteristica>
            <id>CFT100</id>
            <nome>MEDIDAS|AREA_TOTAL</nome>
            <valor>${totalArea}</valor>
          </caracteristica>`);
      hasAreaUnit = true;
    }
    if (usefulArea > 0) {
      chars.push(`
          <caracteristica>
            <id>CFT101</id>
            <nome>MEDIDAS|AREA_UTIL</nome>
            <valor>${usefulArea}</valor>
          </caracteristica>`);
      hasAreaUnit = true;
    }
    // Unidade de medida como característica separada
    if (hasAreaUnit) {
      chars.push(`
          <caracteristica>
            <id>CON1</id>
            <nome>MEDIDAS|UNIDAD_DE_MEDIDA</nome>
            <idValor>M2</idValor>
          </caracteristica>`);
    }
    if (p.bedrooms) {
      chars.push(`
          <caracteristica>
            <id>CFT2</id>
            <nome>AMBIENTES|DORMITORIOS</nome>
            <valor>${p.bedrooms}</valor>
          </caracteristica>`);
    }
    if (p.suites) {
      chars.push(`
          <caracteristica>
            <id>CFT28</id>
            <nome>AMBIENTES|SUITES</nome>
            <valor>${p.suites}</valor>
          </caracteristica>`);
    }
    if (p.bathrooms) {
      chars.push(`
          <caracteristica>
            <id>CFT3</id>
            <nome>AMBIENTES|BANHEIROS</nome>
            <valor>${p.bathrooms}</valor>
          </caracteristica>`);
    }
    if (p.parkingSpaces) {
      chars.push(`
          <caracteristica>
            <id>CFT7</id>
            <nome>AMBIENTES|VAGAS_NA_GARAGEM</nome>
            <valor>${p.parkingSpaces}</valor>
          </caracteristica>`);
    }
    if (p.condoFee) {
      chars.push(`
          <caracteristica>
            <id>CFT18</id>
            <nome>CUSTOS|CONDOMINIO</nome>
            <valor>${Math.round(p.condoFee)}</valor>
          </caracteristica>`);
    }
    if (p.iptu) {
      chars.push(`
          <caracteristica>
            <id>CFT20</id>
            <nome>CUSTOS|IPTU</nome>
            <valor>${Math.round(p.iptu)}</valor>
          </caracteristica>`);
    }
    // Características adicionais para maior relevância
    if (p.floor) {
      chars.push(`
          <caracteristica>
            <id>CFT5</id>
            <nome>AMBIENTES|ANDAR</nome>
            <valor>${p.floor}</valor>
          </caracteristica>`);
    }
    if (p.totalFloors) {
      chars.push(`
          <caracteristica>
            <id>CFT6</id>
            <nome>AMBIENTES|TOTAL_ANDARES</nome>
            <valor>${p.totalFloors}</valor>
          </caracteristica>`);
    }
    if (p.yearBuilt) {
      chars.push(`
          <caracteristica>
            <id>CFT9</id>
            <nome>GERAIS|ANO_CONSTRUCAO</nome>
            <valor>${p.yearBuilt}</valor>
          </caracteristica>`);
    }
    if (p.hasElevator) {
      chars.push(`
          <caracteristica>
            <id>CFT10</id>
            <nome>GERAIS|ELEVADOR</nome>
            <valor>1</valor>
          </caracteristica>`);
    }
    if (p.isFurnished) {
      chars.push(`
          <caracteristica>
            <id>CFT11</id>
            <nome>GERAIS|MOBILIADO</nome>
            <valor>1</valor>
          </caracteristica>`);
    }
    if (p.acceptsPets) {
      chars.push(`
          <caracteristica>
            <id>CFT30</id>
            <nome>GERAIS|ACEITA_ANIMAIS</nome>
            <valor>1</valor>
          </caracteristica>`);
    }
    // Amenidades do condomínio
    const amenities = p.amenities || [];
    const amenityMap: Record<string, { nome: string; id: string }> = {
      "Piscina":         { nome: "COMODIDADES|PISCINA",          id: "CFT12" },
      "Academia":        { nome: "COMODIDADES|ACADEMIA",          id: "CFT13" },
      "Churrasqueira":   { nome: "COMODIDADES|CHURRASQUEIRA",     id: "CFT14" },
      "Salão de Festas": { nome: "COMODIDADES|SALAO_FESTAS",      id: "CFT15" },
      "Playground":      { nome: "COMODIDADES|PLAYGROUND",         id: "CFT16" },
      "Quadra":          { nome: "COMODIDADES|QUADRA_ESPORTES",    id: "CFT17" },
      "Sauna":           { nome: "COMODIDADES|SAUNA",              id: "CFT19" },
      "Portaria 24h":    { nome: "SEGURANCA|PORTARIA_24H",        id: "CFT21" },
      "Segurança 24h":   { nome: "SEGURANCA|SEGURANCA_24H",       id: "CFT22" },
      "Brinquedoteca":   { nome: "COMODIDADES|BRINQUEDOTECA",     id: "CFT23" },
      "Espaço Gourmet":  { nome: "COMODIDADES|ESPACO_GOURMET",    id: "CFT24" },
      "Lavanderia":      { nome: "COMODIDADES|LAVANDERIA",         id: "CFT25" },
      "Jardim":          { nome: "COMODIDADES|JARDIM",              id: "CFT26" },
      "Varanda":         { nome: "AMBIENTES|VARANDA",               id: "CFT27" },
    };
    for (const amenity of amenities) {
      const mapped = amenityMap[amenity];
      if (mapped) {
        chars.push(`
          <caracteristica>
            <id>${mapped.id}</id>
            <nome>${mapped.nome}</nome>
            <valor>1</valor>
          </caracteristica>`);
      }
    }
    // Features da área privativa
    const features = p.features || [];
    const featureMap: Record<string, { nome: string; id: string }> = {
      "Ar Condicionado":    { nome: "COMODIDADES|AR_CONDICIONADO",  id: "CFT31" },
      "Aquecimento":        { nome: "COMODIDADES|AQUECIMENTO",       id: "CFT32" },
      "Closet":             { nome: "AMBIENTES|CLOSET",               id: "CFT33" },
      "Despensa":           { nome: "AMBIENTES|DESPENSA",             id: "CFT34" },
      "Escritório":         { nome: "AMBIENTES|ESCRITORIO",           id: "CFT35" },
      "Hidromassagem":      { nome: "COMODIDADES|HIDROMASSAGEM",      id: "CFT36" },
      "Lareira":            { nome: "COMODIDADES|LAREIRA",             id: "CFT37" },
    };
    for (const feature of features) {
      const mapped = featureMap[feature];
      if (mapped) {
        chars.push(`
          <caracteristica>
            <id>${mapped.id}</id>
            <nome>${mapped.nome}</nome>
            <valor>1</valor>
          </caracteristica>`);
      }
    }
    // Terreno
    if (p.landFrontWidth) {
      chars.push(`
          <caracteristica>
            <id>CFT102</id>
            <nome>MEDIDAS|FRENTE</nome>
            <valor>${p.landFrontWidth}</valor>
          </caracteristica>`);
    }
    if (p.landDepth) {
      chars.push(`
          <caracteristica>
            <id>CFT103</id>
            <nome>MEDIDAS|FUNDO</nome>
            <valor>${p.landDepth}</valor>
          </caracteristica>`);
    }

    // Fix 3: Localização — localidade completa sem abreviações (Bairro, Cidade, Estado, Brasil)
    const enderecoFull = [resolved.address, resolved.number].filter(Boolean).join(", ");
    const fullState = stateFullName(resolved.state);
    const localidade = [resolved.neighborhood, resolved.city, fullState, "Brasil"].filter(Boolean).join(", ");

    // Fix 4: mostrarMapa com valores EXACTO/APROXIMADO/NO
    let mostrarMapa = "EXACTO";
    if (p.addressVisibility === "SOMENTE_BAIRRO") mostrarMapa = "NO";
    else if (p.addressVisibility === "SOMENTE_RUA") mostrarMapa = "APROXIMADO";

    // Tipo publicação — portalPositions["imovelweb"] é a fonte de verdade.
    // Só usa flags globais quando não há posição definida para o Imóvel Web
    // (impede que destaque de outro portal vaze e inverta a categoria aqui).
    const positions = (p.portalPositions as Record<string, string>) || {};
    const portalPos = positions["imovelweb"] || "";
    let tipoPub = "SIMPLE";
    if (portalPos) {
      if (portalPos === "super_destaque") tipoPub = "SUPER_DESTAQUE";
      else if (portalPos === "destaque" || portalPos === "destaque_exclusivo") tipoPub = "DESTAQUE";
      // "simples" → SIMPLE (default)
    } else {
      if (p.isSuperFeatured) tipoPub = "SUPER_DESTAQUE";
      else if (p.isFeatured) tipoPub = "DESTAQUE";
    }

    return `
    <Imovel>
      <codigoAnuncio>${cdata(p.code || p.id)}</codigoAnuncio>
      <tipoPropriedade>
        <idTipo>${cdata(typeIds.idTipo)}</idTipo>
        <tipo>${cdata(typeIds.nome)}</tipo>
        <idSubTipo>${cdata(typeIds.idSubTipo)}</idSubTipo>
      </tipoPropriedade>
      <codigoReferencia>${cdata(p.code || p.id)}</codigoReferencia>
      <titulo>${cdata((p.marketplaceTitle || p.title || "").substring(0, 200))}</titulo>
      <descricao>${cdata((p.description || "").replace(/<[^>]+>/g, "").substring(0, 6000))}</descricao>
      <precos>${precos.join("")}
      </precos>
      <multimidia>
        <imagens>${imagens}
        </imagens>${videos}${tours}
      </multimidia>
      <localizacao>
        <endereco>${cdata(enderecoFull)}</endereco>
        <localidade>${cdata(localidade)}</localidade>
        <codigoPostal>${cdata(resolved.zipCode.replace(/\D/g, ""))}</codigoPostal>
        <mostrarMapa>${mostrarMapa}</mostrarMapa>
        ${p.latitude ? `<latitude>${cdata(String(p.latitude))}</latitude>` : ""}
        ${p.longitude ? `<longitude>${cdata(String(p.longitude))}</longitude>` : ""}
      </localizacao>
      <publicador>
        <codigoImobiliaria>${cdata("35438-J")}</codigoImobiliaria>
        <emailUsuario>${cdata("administracao@tappyimob.com.br")}</emailUsuario>
        <emailContato>${cdata("administracao@tappyimob.com.br")}</emailContato>
        <nomeContato>${cdata("Tappy Imob")}</nomeContato>
        <telefoneContato>${cdata("(11) 94752-2498")}</telefoneContato>
      </publicador>
      <publicacao>
        <tipoPublicacao>${cdata(tipoPub)}</tipoPublicacao>
      </publicacao>
      <caracteristicas>${chars.join("")}
      </caracteristicas>
    </Imovel>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenNavent>
  <dataModificacao>${cdata(String(timestamp))}</dataModificacao>
  <Imoveis>${items}
  </Imoveis>
</OpenNavent>`;
}

// ============================================================
// Gerador XML — Padrão Chaves na Mão
// ============================================================

function generateChavesNaMaoXML(properties: any[], baseUrl: string) {
  const items = properties.map((p) => {
    const slug = p.slug || p.id;
    const fotos = (p.images || []).map((img: string, idx: number) => `
        <foto ordem="${idx + 1}"><![CDATA[${resolveImageUrl(img, baseUrl)}]]></foto>`).join("");

    return `
    <imovel>
      <codigo>${esc(p.code || p.id)}</codigo>
      <titulo>${cdata(p.marketplaceTitle || p.title)}</titulo>
      <tipo>${esc(mapPropertyType(p.type))}</tipo>
      <finalidade>${(() => {
        if (p.category === "LOCACAO") return "Locação";
        if (p.category === "VENDA_LOCACAO") {
          const sa = !p.saleStatus || p.saleStatus === "ATIVO";
          const ra = !p.rentalStatus || p.rentalStatus === "ATIVO";
          if (sa && ra) return "Venda e Locação";
          if (sa) return "Venda";
          if (ra) return "Locação";
        }
        return "Venda";
      })()}</finalidade>
      <valor_venda>${(p.category !== "LOCACAO" && (!p.saleStatus || p.saleStatus === "ATIVO")) ? (p.price || 0) : 0}</valor_venda>
      <valor_locacao>${(p.category === "LOCACAO" || (p.category === "VENDA_LOCACAO" && (!p.rentalStatus || p.rentalStatus === "ATIVO"))) ? (p.rentPrice || 0) : 0}</valor_locacao>
      <valor_condominio>${p.condoFee || 0}</valor_condominio>
      <valor_iptu>${p.iptu || 0}</valor_iptu>
      <endereco>${cdata(resolveAddress(p).address)}</endereco>
      <numero>${esc(resolveAddress(p).number)}</numero>
      <bairro>${cdata(resolveAddress(p).neighborhood)}</bairro>
      <cidade>${cdata(resolveAddress(p).city)}</cidade>
      <estado>${esc(resolveAddress(p).state)}</estado>
      <cep>${esc(resolveAddress(p).zipCode.replace(/\D/g, ""))}</cep>
      ${p.latitude && p.longitude ? `<latitude>${p.latitude}</latitude>
      <longitude>${p.longitude}</longitude>` : ""}
      <area_total>${p.totalArea || p.area || 0}</area_total>
      <area_util>${p.usefulArea || p.area || 0}</area_util>
      <quartos>${p.bedrooms || 0}</quartos>
      <suites>${p.suites || 0}</suites>
      <banheiros>${p.bathrooms || 0}</banheiros>
      <vagas>${p.parkingSpaces || 0}</vagas>
      <descricao>${cdata(p.description || "")}</descricao>
      <fotos>${fotos}
      </fotos>
      <url><![CDATA[${baseUrl}/imovel/${slug}]]></url>
      <atualizado_em>${new Date(p.updatedAt).toISOString().split("T")[0]}</atualizado_em>
    </imovel>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<imoveis>${items}
</imoveis>`;
}

// ============================================================
// API Route — GET /api/integrations/portals
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portal = searchParams.get("portal") || "zap";
    const token = searchParams.get("token");

    // Validar token de acesso
    const expectedToken = process.env.PORTAL_EXPORT_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Buscar imóveis disponíveis para portais
    // - status DISPONIVEL
    // - não off-market
    // - visíveis no site (showOnWebsite !== false)
    // O status principal sozinho não basta: existem imóveis com status
    // DISPONIVEL cujo saleStatus/rentalStatus já está VENDIDO/ALUGADO/INATIVO —
    // eles vinham sendo exportados e o cliente ligava pedindo imóvel que já
    // saiu. O sub-status vale por CATEGORIA: num VENDA_LOCACAO com a locação
    // fechada mas a venda ativa, o anúncio continua legítimo.
    const encerrado = ["VENDIDO", "ALUGADO", "INATIVO"];

    const properties = await prisma.property.findMany({
      where: {
        status: "DISPONIVEL",
        isOffMarket: false,
        showOnWebsite: { not: false },
        NOT: [
          { category: "LOCACAO", rentalStatus: { in: encerrado } },
          { category: "VENDA", saleStatus: { in: encerrado } },
          {
            category: "VENDA_LOCACAO",
            saleStatus: { in: encerrado },
            rentalStatus: { in: encerrado },
          },
        ],
      },
      include: {
        condominium: {
          select: {
            name: true,
            address: true,
            number: true,
            neighborhood: true,
            city: true,
            state: true,
            zipCode: true,
            fakeAddress: true,
            fakeNumber: true,
            fakeNeighborhood: true,
            fakeCity: true,
            fakeState: true,
            fakeZipCode: true,
            showRealAddress: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tappyimob.com.br";

    // ZAP / VivaReal / OLX (Canal Pro) → XML vrsync
    if (portal === "zap" || portal === "vivareal" || portal === "olx") {
      const xml = generateVrSyncXML(properties, baseUrl);
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // ImovelWeb → XML próprio
    if (portal === "imovelweb") {
      const xml = generateImovelWebXML(properties, baseUrl);
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Chaves na Mão → XML próprio
    if (portal === "chavesnamao") {
      const xml = generateChavesNaMaoXML(properties, baseUrl);
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Retornar lista genérica (outros portais ou debug)
    return NextResponse.json({
      portal,
      total: properties.length,
      feedUrl: `${baseUrl}/api/integrations/portals?portal=${portal}${expectedToken ? `&token=${expectedToken}` : ""}`,
      properties: properties.map((p) => ({
        id: p.id,
        code: p.code,
        title: p.title,
        type: p.type,
        category: p.category,
        price: p.price,
        status: p.status,
        activePortals: p.activePortals,
      })),
    });
  } catch (error) {
    console.error("Error exporting to portal:", error);
    return NextResponse.json(
      { error: "Erro ao exportar imóveis" },
      { status: 500 }
    );
  }
}

// ============================================================
// API Route — GET /api/integrations/portals/stats
// Endpoint para o dashboard de portais (dados reais)
// ============================================================
