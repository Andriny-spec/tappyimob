export type PropertyType = 
  | "APARTAMENTO" 
  | "CASA" 
  | "TERRENO" 
  | "COMERCIAL" 
  | "COBERTURA" 
  | "STUDIO" 
  | "FAZENDA" 
  | "GALPAO"
  | "KITNET"
  | "LOFT"
  | "FLAT"
  | "SOBRADO"
  | "CHACARA";

export type PropertyCategory = "VENDA" | "LOCACAO" | "VENDA_LOCACAO";

export type PropertyCondition = "NOVO" | "USADO" | "NA_PLANTA" | "EM_CONSTRUCAO";

export type PropertyStatus = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "RESERVADO" | "SUSPENSO" | "INDISPONIVEL" | "INATIVO";

// Status específico para venda ou locação (usado quando category = VENDA_LOCACAO)
export type FinalityStatus = "ATIVO" | "SUSPENSO" | "INATIVO" | "VENDIDO" | "ALUGADO";

export interface PropertyOwner {
  id: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  email: string;
  creci?: string | null;
}

export interface Property {
  id: string;
  code: string;
  title: string;
  slug: string | null;
  description: string;
  shortDescription: string | null;
  type: PropertyType;
  category: PropertyCategory;
  condition: PropertyCondition;
  status: PropertyStatus;
  saleStatus?: FinalityStatus | null;    // Status da venda (para VENDA_LOCACAO)
  rentalStatus?: FinalityStatus | null;  // Status da locação (para VENDA_LOCACAO)
  price: number;
  rentPrice: number | null;
  pricePerM2: number | null;
  condoFee: number | null;
  iptu: number | null;
  isNegotiable: boolean;
  acceptsExchange: boolean;
  acceptsFinancing: boolean;
  area: number;
  totalArea: number | null;
  usefulArea: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  floor: number | null;
  totalFloors: number | null;
  unitsPerFloor: number | null;
  position: string | null;
  sunPosition: string | null;
  yearBuilt: number | null;
  address: string;
  number: string | null;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  thumbnail: string | null;
  images: string[];
  videos: string[];
  virtualTour: string | null;
  amenities: string[];
  features: string[];
  nearbyPlaces: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  isExclusive: boolean;
  isNew: boolean;
  views: number;
  favorites: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  ownerId: string;
  owner: PropertyOwner;
  _count?: {
    leadsList: number;
    visitsList: number;
    favoritesList: number;
  };
}

export interface Condominium {
  id: string;
  name: string;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  _count?: {
    properties: number;
  };
}

export interface PropertyFilters {
  search?: string;
  category?: PropertyCategory;
  categories?: PropertyCategory[];
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  neighborhood?: string;
  condominiumId?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  isFeatured?: boolean;
  hasElevator?: boolean;
  isFurnished?: boolean;
  hasGroundFloorSuite?: boolean;
  hasFreeView?: boolean;
  acceptsExchange?: boolean;
  hasIrregularDocs?: boolean;
  financingBank?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // Novos filtros
  isExclusive?: boolean;
  isThirdPartyExclusive?: boolean;
  hasPlate?: boolean;
  hasPriceReduction?: boolean;
  hasWall?: boolean;
  soldDateFrom?: string;
  soldDateTo?: string;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  COBERTURA: "Cobertura",
  STUDIO: "Studio",
  FAZENDA: "Fazenda",
  GALPAO: "Galpão",
  KITNET: "Kitnet",
  LOFT: "Loft",
  FLAT: "Flat",
  SOBRADO: "Sobrado",
  CHACARA: "Chácara",
};

export const propertyCategoryLabels: Record<PropertyCategory, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_LOCACAO: "Venda e Locação",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DISPONIVEL: "Disponível",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  RESERVADO: "Reservado",
  SUSPENSO: "Suspenso",
  INDISPONIVEL: "Indisponível",
  INATIVO: "Indisponível",
};

export const finalityStatusLabels: Record<FinalityStatus, string> = {
  ATIVO: "Disponível",
  SUSPENSO: "Suspenso",
  INATIVO: "Indisponível",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
};

export const propertyConditionLabels: Record<PropertyCondition, string> = {
  NOVO: "Novo",
  USADO: "Usado",
  NA_PLANTA: "Na Planta",
  EM_CONSTRUCAO: "Em Construção",
};

export const statusColors: Record<PropertyStatus, { bg: string; text: string }> = {
  DISPONIVEL: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  VENDIDO: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
  ALUGADO: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400" },
  RESERVADO: { bg: "bg-yellow-100 dark:bg-yellow-500/20", text: "text-yellow-700 dark:text-yellow-400" },
  SUSPENSO: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-400" },
  INDISPONIVEL: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-700 dark:text-red-400" },
  INATIVO: { bg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-700 dark:text-neutral-400" },
};

export const finalityStatusColors: Record<FinalityStatus, { bg: string; text: string }> = {
  ATIVO: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  SUSPENSO: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-400" },
  INATIVO: { bg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-700 dark:text-neutral-400" },
  VENDIDO: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
  ALUGADO: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400" },
};

export const categoryColors: Record<PropertyCategory, { bg: string; text: string }> = {
  VENDA: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-400" },
  LOCACAO: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
  VENDA_LOCACAO: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400" },
};
