"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiHome4Line,
  RiGridLine,
  RiListUnordered,
  RiSortDesc,
  RiLoader4Line,
  RiArrowDownSLine,
  RiCheckLine,
  RiFilterLine,
  RiCloseLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import Link from "next/link";

import { ImovelCardMini, ordenacaoOptions } from "@/components/imoveis";
import type { FiltersState } from "@/components/imoveis";
import { getDisplayTitle } from "@/utils/property";

// Tipo do imóvel vindo da API
type ImovelAPI = {
  id: string;
  slug?: string;
  code: string;
  title: string;
  category: string;
  type: string;
  subType?: string | null;
  isExclusive: boolean;
  isFeatured: boolean;
  isOffMarket: boolean;
  address?: string;
  neighborhood: string;
  city: string;
  bedrooms: number;
  suites: number;
  parkingSpaces: number;
  area: number;
  totalArea?: number;
  condoFee?: number;
  price: number;
  rentPrice?: number;
  thumbnail: string | null;
  images: string[];
  acceptsExchange: boolean;
  isFurnished: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
  // Campos de Locação
  acceptsPets?: boolean | null;
  rentalWarranties?: string[];
  // Campos de Terreno
  landTopography?: string | null;
  hasApprovedProject?: boolean | null;
  // Status de finalidade
  saleStatus?: string | null;
  rentalStatus?: string | null;
  websitePublishMode?: string | null;
  // Condomínio
  condominium?: { id: string; name: string; slug?: string } | null;
  // Categorias do site
  websiteCategories?: string[];
  // Amenities / Features / Extras
  amenities?: string[];
  features?: string[];
  extras?: string[];
};

// Tipo interno para o card
type ImovelCard = {
  id: string;
  slug?: string;
  ref: string;
  titulo: string;
  negocio: string;
  tipo: string;
  exclusivo: boolean;
  isOffMarket: boolean;
  subtipo?: string;
  endereco: string;
  localizacao: string;
  condominio: string;
  condominiumId?: string;
  condominiumSlug?: string;
  condominioNome?: string;
  dormitorios: number;
  suites: number;
  garagens: number;
  areaConstruida: number;
  areaTerreno?: number;
  taxaCondominio?: number;
  preco: number;
  precoAluguel?: number;
  imagens: string[];
  acceptsExchange?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  // Campos de Locação
  aceitaPet?: boolean | null;
  garantias?: string[];
  // Campos de Terreno
  topografia?: string | null;
  projetoAprovado?: boolean | null;
  // Categorias do site
  categoriasEspeciais?: string[];
  // Diferenciais (extras + features + amenities combinados)
  diferenciais: string[];
};

// Calcular negócio efetivo para exibição no site
const getEffectiveNegocio = (imovel: ImovelAPI): string => {
  const cat = imovel.category;
  if (cat === "VENDA") return "venda";
  if (cat === "LOCACAO") return "aluguel";
  // VENDA_LOCACAO: verificar se alguma finalidade foi concluída
  const sale = imovel.saleStatus || "ATIVO";
  const rent = imovel.rentalStatus || "ATIVO";
  // Se websitePublishMode está definido, respeitar
  if (imovel.websitePublishMode === "VENDA") return "venda";
  if (imovel.websitePublishMode === "LOCACAO") return "aluguel";
  // Se venda vendida, mostrar só aluguel
  if (sale === "VENDIDO" || sale === "INATIVO" || sale === "SUSPENSO") return "aluguel";
  // Se aluguel alugado, mostrar só venda
  if (rent === "ALUGADO" || rent === "INATIVO" || rent === "SUSPENSO") return "venda";
  // Ambos ativos
  return "venda_locacao";
};

// Converter imóvel da API para o formato do card
const convertToCardFormat = (imovel: ImovelAPI): ImovelCard => ({
  id: imovel.id,
  slug: imovel.slug,
  ref: imovel.code,
  titulo: imovel.condominium?.name || getDisplayTitle(imovel.title),
  negocio: getEffectiveNegocio(imovel),
  tipo: imovel.type.toLowerCase(),
  subtipo: imovel.subType?.toLowerCase() || undefined,
  exclusivo: imovel.isExclusive,
  isOffMarket: imovel.isOffMarket || false,
  endereco: imovel.address || "",
  localizacao: `${imovel.neighborhood} - ${imovel.city}`,
  condominio: imovel.neighborhood.toLowerCase().replace(/\s+/g, "-"),
  condominiumId: imovel.condominium?.id || undefined,
  condominiumSlug: imovel.condominium?.slug || undefined,
  condominioNome: imovel.condominium?.name,
  dormitorios: imovel.bedrooms,
  suites: imovel.suites,
  garagens: imovel.parkingSpaces,
  areaConstruida: imovel.area,
  areaTerreno: imovel.totalArea,
  taxaCondominio: imovel.condoFee,
  preco: imovel.price,
  precoAluguel: imovel.rentPrice,
  imagens: imovel.images.length > 0 
    ? imovel.images 
    : [imovel.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"],
  acceptsExchange: imovel.acceptsExchange || false,
  views: imovel.views || 0,
  createdAt: imovel.createdAt,
  updatedAt: imovel.updatedAt,
  // Campos de Locação
  aceitaPet: imovel.acceptsPets,
  garantias: imovel.rentalWarranties || [],
  // Campos de Terreno
  topografia: imovel.landTopography,
  projetoAprovado: imovel.hasApprovedProject,
  // Categorias do site
  categoriasEspeciais: imovel.websiteCategories || [],
  // Diferenciais combinados para filtragem
  diferenciais: [
    ...(imovel.extras || []),
    ...(imovel.features || []),
    ...(imovel.amenities || []),
  ],
});

const initialFilters: FiltersState = {
  negocio: "",
  tipos: [],
  subtipos: [],
  precoMin: "",
  precoMax: "",
  quartos: [],
  suites: [],
  vagas: [],
  condominios: [],
  caracteristicas: [],
  perfil: [],
  estagio: [],
  aceitaPermuta: null,
  parcelamentoDireto: null,
  comMobilia: null,
  areaMin: "",
  areaMax: "",
};

// Estado estendido para filtros avançados
interface ExtendedFilters {
  dormitoriosMin: string;
  dormitoriosOperador: "igual" | "maior";
  suitesMin: string;
  suitesOperador: "igual" | "maior";
  vagasMin: string;
  areaPrivativaMin: string;
  areaPrivativaMax: string;
  areaTerrenoMin: string;
  areaTerrenoMax: string;
  // Condições Comerciais
  permuta: boolean | null;
  parcelamentoDireto: boolean | null;
  // Diferenciais selecionados (match contra extras/features/amenities do imóvel)
  diferencialsSelecionados: string[];
  // Filtros de Locação
  aceitaPet: boolean | null;
  garantiaCalcao: boolean | null;
  garantiaFiador: boolean | null;
  garantiaSeguroFianca: boolean | null;
  // Filtros de Terreno
  topografiaPlana: boolean | null;
  topografiaAclive: boolean | null;
  topografiaDeclive: boolean | null;
  projetoAprovado: boolean | null;
}

// Opções de filtros
const tipoOptions = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
];

// Subtipos por tipo principal
const subtipoOptions: Record<string, { value: string; label: string }[]> = {
  apartamento: [
    { value: "cobertura", label: "Cobertura" },
    { value: "duplex", label: "Duplex" },
    { value: "garden", label: "Garden" },
    { value: "flat", label: "Flat" },
    { value: "loft", label: "Loft" },
    { value: "studio", label: "Studio" },
  ],
  casa: [
    { value: "sobrado", label: "Sobrado" },
    { value: "terrea", label: "Térrea" },
    { value: "geminada", label: "Geminada" },
    { value: "villagio", label: "Villaggio" },
    { value: "assobradada", label: "Assobradada" },
  ],
  terreno: [
    { value: "esquina", label: "Esquina" },
    { value: "plano", label: "Plano" },
    { value: "aclive", label: "Aclive" },
    { value: "declive", label: "Declive" },
  ],
  comercial: [
    { value: "loja", label: "Loja" },
    { value: "sala", label: "Sala Comercial" },
    { value: "galpao", label: "Galpão" },
    { value: "predio", label: "Prédio" },
  ],
};

// Helper para formatar preço com pontos (1000 → 1.000)
const formatPriceInput = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parsePriceInput = (value: string): string => value.replace(/\./g, "");

const dormitoriosOptions = ["1", "2", "3", "4", "5"];
const suitesOptions = ["1", "2", "3", "4", "5"];
const vagasOptions = ["1", "2", "3", "4", "5+"];

// Grupo de filtro da sidebar — recolhível.
//
// Cada cliente prioriza um filtro diferente (condomínio é essencial para uns e
// irrelevante para outros), então cada grupo abre e fecha por conta própria e a
// escolha fica guardada no navegador para a próxima visita.
const FILTROS_ABERTOS_KEY = "imoveis:filtros-abertos";

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // lê a preferência salva depois da montagem, para não divergir do HTML do servidor
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(FILTROS_ABERTOS_KEY) || "{}");
      if (typeof salvo[title] === "boolean") setOpen(salvo[title]);
    } catch {}
  }, [title]);

  const toggle = () => {
    const novo = !open;
    setOpen(novo);
    try {
      const salvo = JSON.parse(localStorage.getItem(FILTROS_ABERTOS_KEY) || "{}");
      localStorage.setItem(
        FILTROS_ABERTOS_KEY,
        JSON.stringify({ ...salvo, [title]: novo })
      );
    } catch {}
  };

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-1 group"
      >
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider text-left">
          {title}
        </h4>
        <RiArrowDownSLine
          className={`w-4 h-4 flex-shrink-0 text-neutral-400 transition-transform duration-200 group-hover:text-neutral-600 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Imovies2Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoriaUrl = searchParams.get("categoria");
  const refUrl = searchParams.get("ref");
  const negocioUrl = searchParams.get("negocio");
  const tipoUrl = searchParams.get("tipo");
  const quartosUrl = searchParams.get("quartos");
  const suitesUrl = searchParams.get("suites");
  const vagasUrl = searchParams.get("vagas");
  const valorMinUrl = searchParams.get("valorMin");
  const valorMaxUrl = searchParams.get("valorMax");
  const areaMinUrl = searchParams.get("areaMin");
  const areaMaxUrl = searchParams.get("areaMax");
  const areaTerrenoMinUrl = searchParams.get("areaTerrenoMin");
  const areaTerrenoMaxUrl = searchParams.get("areaTerrenoMax");
  const caracteristicasUrl = searchParams.get("caracteristicas");
  const subtiposUrl = searchParams.get("subtipos");
  const condominioUrl = searchParams.get("condominio");
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [busca, setBusca] = useState(refUrl || "");
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const [filters, setFilters] = useState<FiltersState>({
    ...initialFilters,
    negocio: negocioUrl || "",
    tipos: tipoUrl ? [tipoUrl] : [],
    precoMin: valorMinUrl || "",
    precoMax: valorMaxUrl || "",
    quartos: quartosUrl ? [quartosUrl] : [],
    suites: suitesUrl ? [suitesUrl] : [],
    vagas: vagasUrl ? [vagasUrl] : [],
    condominios: condominioUrl ? condominioUrl.split(",") : [],
    areaMin: areaMinUrl || "",
    areaMax: areaMaxUrl || "",
    subtipos: subtiposUrl ? subtiposUrl.split(",") : [],
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Estado para imóveis da API
  const [imoveis, setImoveis] = useState<ImovelCard[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Estado para condomínios (carregados da API)
  const [condominioOptions, setCondominioOptions] = useState<{ value: string; label: string }[]>([]);
  
  // Estado para categorias especiais (carregadas da API)
  const [categoriasEspeciais, setCategoriasEspeciais] = useState<{ value: string; label: string }[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  
  // Estado para diferenciais (carregados da API - respeita hidden)
  const [diferenciaisOptions, setDiferenciaisOptions] = useState<string[]>([]);
  
  // Ler categoria da URL quando a página carrega
  useEffect(() => {
    if (categoriaUrl) {
      setCategoriasSelecionadas([categoriaUrl]);
    }
  }, [categoriaUrl]);
  
  // Filtros estendidos
  const [extFilters, setExtFilters] = useState<ExtendedFilters>({
    dormitoriosMin: "",
    dormitoriosOperador: "maior",
    suitesMin: "",
    suitesOperador: "maior",
    vagasMin: "",
    areaPrivativaMin: "",
    areaPrivativaMax: "",
    areaTerrenoMin: areaTerrenoMinUrl || "",
    areaTerrenoMax: areaTerrenoMaxUrl || "",
    // Condições Comerciais
    permuta: null,
    parcelamentoDireto: null,
    diferencialsSelecionados: caracteristicasUrl ? caracteristicasUrl.split(",") : [],
    // Filtros de Locação
    aceitaPet: null,
    garantiaCalcao: null,
    garantiaFiador: null,
    garantiaSeguroFianca: null,
    // Filtros de Terreno
    topografiaPlana: null,
    topografiaAclive: null,
    topografiaDeclive: null,
    projetoAprovado: null,
  });

  // Buscar imóveis da API (com filtros server-side para performance)
  const fetchImoveis = async (catFilter?: string[], serverFilters?: {
    negocio?: string;
    condominios?: string[];
    tipos?: string[];
    precoMin?: string;
    precoMax?: string;
    quartos?: string[];
    suites?: string[];
    vagas?: string[];
    busca?: string;
  }) => {
    try {
      // offMarket=all inclui os imóveis Off Market na busca (aparecem travados/borrados,
      // com clique abrindo o formulário de solicitação de acesso)
      let url = "/api/properties?status=DISPONIVEL&showOnWebsite=true&limit=2000&fields=minimal&offMarket=all";
      const cats = catFilter || categoriasSelecionadas;
      if (cats.length > 0) {
        url += `&websiteCategory=${cats.join("|")}`;
      }
      // Pass server-side filters for faster initial load (CTA → /imoveis)
      if (serverFilters?.negocio) {
        url += `&categories=${serverFilters.negocio.toUpperCase() === "ALUGUEL" ? "LOCACAO" : "VENDA"}`;
      }
      if (serverFilters?.condominios && serverFilters.condominios.length > 0) {
        url += `&condominiumSlugs=${serverFilters.condominios.join(",")}`;
      }
      if (serverFilters?.tipos && serverFilters.tipos.length === 1) {
        url += `&type=${serverFilters.tipos[0].toUpperCase()}`;
      }
      if (serverFilters?.precoMin) {
        url += `&minPrice=${serverFilters.precoMin}`;
      }
      if (serverFilters?.precoMax) {
        url += `&maxPrice=${serverFilters.precoMax}`;
      }
      if (serverFilters?.quartos && serverFilters.quartos.length > 0) {
        url += `&bedrooms=${serverFilters.quartos[0]}`;
      }
      if (serverFilters?.busca) {
        url += `&search=${encodeURIComponent(serverFilters.busca)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.properties) {
          setImoveis(data.properties.map(convertToCardFormat));
          setApiTotal(data.pagination?.total || data.properties.length);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
    }
  };

  // Buscar imóveis, condomínios e categorias especiais da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar imóveis, condomínios, categorias e diferenciais em paralelo
        const initialCats = categoriaUrl ? [categoriaUrl] : [];
        const initialServerFilters = {
          negocio: negocioUrl || undefined,
          condominios: condominioUrl ? condominioUrl.split(",") : undefined,
          tipos: tipoUrl ? [tipoUrl] : undefined,
          precoMin: valorMinUrl || undefined,
          precoMax: valorMaxUrl || undefined,
          quartos: quartosUrl ? [quartosUrl] : undefined,
          suites: suitesUrl ? [suitesUrl] : undefined,
          busca: refUrl || undefined,
        };
        const [_, condominiosRes, categoriasRes, opcoesRes] = await Promise.all([
          fetchImoveis(initialCats, initialServerFilters),
          fetch("/api/site/condominiums?limit=500&available=true"),
          fetch("/api/site/property-types?active=true"),
          fetch("/api/admin/properties/options"),
        ]);

        if (condominiosRes.ok) {
          const data = await condominiosRes.json();
          if (data.condominiums) {
            setCondominioOptions(
              data.condominiums
                .map((c: any) => ({
                  value: c.slug || c.id,
                  label: c.name,
                }))
                .sort((a: any, b: any) => a.label.localeCompare(b.label, 'pt-BR'))
            );
          }
        }

        if (categoriasRes.ok) {
          const data = await categoriasRes.json();
          if (data.types && data.types.length > 0) {
            setCategoriasEspeciais(
              data.types.map((t: any) => ({
                value: t.type,
                label: t.title,
              }))
            );
          }
        }

        if (opcoesRes.ok) {
          const data = await opcoesRes.json();
          const allDiferenciais = new Set<string>();
          for (const item of (data.features || [])) { if (item) allDiferenciais.add(item); }
          for (const item of (data.private || [])) { if (item) allDiferenciais.add(item); }
          setDiferenciaisOptions(Array.from(allDiferenciais).sort((a, b) => a.localeCompare(b, 'pt-BR')));
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Re-buscar imóveis quando categorias mudam (server-side filter)
  useEffect(() => {
    if (!loading) {
      fetchImoveis();
    }
  }, [categoriasSelecionadas]);

  // Atualizar URL quando filtros mudam (para compartilhar links de campanhas)
  useEffect(() => {
    if (loading) return; // Não atualizar URL durante carregamento inicial
    const params = new URLSearchParams();
    if (filters.negocio) params.set("negocio", filters.negocio);
    if (filters.tipos.length > 0) params.set("tipo", filters.tipos.join(","));
    if (filters.precoMin) params.set("valorMin", filters.precoMin);
    if (filters.precoMax) params.set("valorMax", filters.precoMax);
    if (filters.quartos.length > 0) params.set("quartos", filters.quartos.join(","));
    if (filters.suites.length > 0) params.set("suites", filters.suites.join(","));
    if (filters.vagas.length > 0) params.set("vagas", filters.vagas.join(","));
    if (filters.condominios.length > 0) params.set("condominio", filters.condominios.join(","));
    if (filters.areaMin) params.set("areaMin", filters.areaMin);
    if (filters.areaMax) params.set("areaMax", filters.areaMax);
    if (busca) params.set("ref", busca);
    if (categoriasSelecionadas.length > 0) params.set("categoria", categoriasSelecionadas.join(","));
    const qs = params.toString();
    const newUrl = qs ? `/imoveis?${qs}` : "/imoveis";
    router.replace(newUrl, { scroll: false });
  }, [filters, busca, categoriasSelecionadas, loading]);

  // Filtrar imóveis
  // Predicado de filtro extraído para função nomeada: permite reaproveitar a mesma
  // lógica para calcular quais condomínios são compatíveis com os demais filtros
  // ativos (opts.skipCondominios ignora o próprio filtro de condomínio nesse cálculo).
  const matchesFilters = (imovel: ImovelCard, opts?: { skipCondominios?: boolean }) => {
    if (busca) {
      const searchTerm = busca.toLowerCase().trim();
      const endsWithNumber = /\s+\d+$/.test(searchTerm);
      
      if (endsWithNumber) {
        // Busca mais precisa quando termina com número (ex: "Tamboré 1")
        // Para evitar "Tamboré 1" trazer "Tamboré 11"
        const locLower = imovel.localizacao.toLowerCase();
        const titLower = imovel.titulo.toLowerCase();
        const endLower = imovel.endereco?.toLowerCase() || "";
        
        const matchExact = (text: string, term: string) => {
          return text === term || 
                 text.startsWith(term + " ") || 
                 text.endsWith(" " + term) || 
                 text.includes(" " + term + " ");
        };
        
        if (!matchExact(locLower, searchTerm) && !matchExact(titLower, searchTerm) && !matchExact(endLower, searchTerm)) {
          return false;
        }
      } else {
        // Busca normal com contains (inclui endereço/alameda e código de referência)
        if (!imovel.localizacao.toLowerCase().includes(searchTerm) && 
            !imovel.titulo.toLowerCase().includes(searchTerm) &&
            !(imovel.endereco?.toLowerCase().includes(searchTerm)) &&
            !imovel.ref.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
    }
    if (filters.negocio) {
      const neg = imovel.negocio;
      // venda_locacao aparece em ambos os filtros
      if (filters.negocio === "venda" && neg !== "venda" && neg !== "venda_locacao") return false;
      if (filters.negocio === "aluguel" && neg !== "aluguel" && neg !== "venda_locacao") return false;
    }
    if (filters.tipos.length > 0 && !filters.tipos.includes(imovel.tipo.toLowerCase())) {
      return false;
    }
    // Subtipos
    if (filters.subtipos.length > 0 && imovel.subtipo) {
      const subLower = imovel.subtipo.toLowerCase();
      const matchSubtipo = filters.subtipos.some(s => subLower.includes(s.toLowerCase()));
      if (!matchSubtipo) return false;
    } else if (filters.subtipos.length > 0 && !imovel.subtipo) {
      return false;
    }
    const precoEfetivo = filters.negocio === "aluguel" 
      ? (imovel.precoAluguel || imovel.preco) 
      : (imovel.preco || imovel.precoAluguel || 0);
    if (filters.precoMin && precoEfetivo < parseInt(filters.precoMin)) {
      return false;
    }
    if (filters.precoMax && precoEfetivo > parseInt(filters.precoMax)) {
      return false;
    }
    if (filters.quartos.length > 0) {
      const hasMatch = filters.quartos.some((q) => {
        if (q === "5+") return imovel.dormitorios >= 5;
        return imovel.dormitorios >= parseInt(q);
      });
      if (!hasMatch) return false;
    }
    if (filters.suites.length > 0) {
      const hasMatch = filters.suites.some((s) => {
        if (s === "5+") return imovel.suites >= 5;
        return imovel.suites >= parseInt(s);
      });
      if (!hasMatch) return false;
    }
    if (filters.vagas.length > 0) {
      const hasMatch = filters.vagas.some((v) => {
        if (v === "5+") return imovel.garagens >= 5;
        return imovel.garagens >= parseInt(v);
      });
      if (!hasMatch) return false;
    }
    // Dormitórios (sidebar/mobile extFilters)
    if (extFilters.dormitoriosMin) {
      const min = parseInt(extFilters.dormitoriosMin);
      if (extFilters.dormitoriosOperador === "maior") {
        if (imovel.dormitorios < min) return false;
      } else {
        if (imovel.dormitorios !== min) return false;
      }
    }
    // Suítes (sidebar/mobile extFilters)
    if (extFilters.suitesMin) {
      const min = parseInt(extFilters.suitesMin);
      if (extFilters.suitesOperador === "maior") {
        if (imovel.suites < min) return false;
      } else {
        if (imovel.suites !== min) return false;
      }
    }
    // Vagas (sidebar/mobile extFilters)
    if (extFilters.vagasMin) {
      if (extFilters.vagasMin === "5+") {
        if (imovel.garagens < 5) return false;
      } else {
        if (imovel.garagens < parseInt(extFilters.vagasMin)) return false;
      }
    }
    // Permuta (sidebar/mobile extFilters)
    if (extFilters.permuta === true && !imovel.acceptsExchange) return false;
    if (!opts?.skipCondominios && filters.condominios.length > 0) {
      // Filtrar por slug do condomínio (URL amigável), ID, ou nome
      const matchByCondoSlug = imovel.condominiumSlug && filters.condominios.includes(imovel.condominiumSlug);
      const matchById = imovel.condominiumId && filters.condominios.includes(imovel.condominiumId);
      const matchByName = filters.condominios.includes(imovel.condominioNome || "");
      const matchBySlug = filters.condominios.includes(imovel.condominio);
      if (!matchByCondoSlug && !matchById && !matchByName && !matchBySlug) return false;
    }
    const effectiveArea = imovel.areaConstruida || imovel.areaTerreno || 0;
    if (filters.areaMin && effectiveArea < parseInt(filters.areaMin)) {
      return false;
    }
    if (filters.areaMax && effectiveArea > parseInt(filters.areaMax)) {
      return false;
    }
    // Área privativa (extFilters)
    if (extFilters.areaPrivativaMin && imovel.areaConstruida < parseInt(extFilters.areaPrivativaMin)) {
      return false;
    }
    if (extFilters.areaPrivativaMax && imovel.areaConstruida > parseInt(extFilters.areaPrivativaMax)) {
      return false;
    }
    // Área terreno (extFilters)
    if (extFilters.areaTerrenoMin && (imovel.areaTerreno || 0) < parseInt(extFilters.areaTerrenoMin)) {
      return false;
    }
    if (extFilters.areaTerrenoMax && (imovel.areaTerreno || 0) > parseInt(extFilters.areaTerrenoMax)) {
      return false;
    }
    
    // Filtros de Locação
    if (extFilters.aceitaPet === true && imovel.aceitaPet !== true) {
      return false;
    }
    if (extFilters.garantiaCalcao === true && !imovel.garantias?.includes("CAUCAO")) {
      return false;
    }
    if (extFilters.garantiaFiador === true && !imovel.garantias?.includes("FIADOR")) {
      return false;
    }
    if (extFilters.garantiaSeguroFianca === true && !imovel.garantias?.includes("SEGURO_FIANCA")) {
      return false;
    }
    
    // Filtros de Terreno
    if (extFilters.topografiaPlana === true && imovel.topografia !== "PLANO") {
      return false;
    }
    if (extFilters.topografiaAclive === true && imovel.topografia !== "ACLIVE") {
      return false;
    }
    if (extFilters.topografiaDeclive === true && imovel.topografia !== "DECLIVE") {
      return false;
    }
    if (extFilters.projetoAprovado === true && imovel.projetoAprovado !== true) {
      return false;
    }
    
    // Filtro por Diferenciais (extras + features + amenities)
    if (extFilters.diferencialsSelecionados.length > 0) {
      const hasAll = extFilters.diferencialsSelecionados.every(dif =>
        imovel.diferenciais.some(d => d.toLowerCase().includes(dif.toLowerCase()))
      );
      if (!hasAll) return false;
    }

    // Filtro por Categorias Especiais
    if (categoriasSelecionadas.length > 0) {
      const hasMatchingCategory = categoriasSelecionadas.some(cat => 
        imovel.categoriasEspeciais?.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }
    
    return true;
  };

  const imoveisFiltrados = imoveis.filter((imovel: ImovelCard) => matchesFilters(imovel));

  // Condomínios compatíveis com os demais filtros ativos (tipo, preço, quartos, etc.) —
  // restringe a lista lateral em vez de sempre mostrar todos os condomínios do site.
  const condominiosCompativeisIds = new Set<string>();
  imoveis.forEach((imovel: ImovelCard) => {
    if (!matchesFilters(imovel, { skipCondominios: true })) return;
    if (imovel.condominiumSlug) condominiosCompativeisIds.add(imovel.condominiumSlug);
    if (imovel.condominiumId) condominiosCompativeisIds.add(imovel.condominiumId);
    if (imovel.condominioNome) condominiosCompativeisIds.add(imovel.condominioNome);
    if (imovel.condominio) condominiosCompativeisIds.add(imovel.condominio);
  });
  const condominioOptionsCompativeis = condominioOptions.filter(
    (opt) => condominiosCompativeisIds.has(opt.value) || filters.condominios.includes(opt.value)
  );

  // Preço efetivo: quando filtro é aluguel, prioriza precoAluguel; quando venda, prioriza preco
  const getEffectivePrice = (imovel: ImovelCard) => {
    if (filters.negocio === "aluguel") return imovel.precoAluguel || imovel.preco || 0;
    if (filters.negocio === "venda") return imovel.preco || imovel.precoAluguel || 0;
    return imovel.preco || imovel.precoAluguel || 0;
  };
  // Área efetiva: usa área construída, ou área terreno se construída = 0
  const getEffectiveArea = (imovel: ImovelCard) => imovel.areaConstruida || imovel.areaTerreno || 0;

  // Ordenar
  const imoveisOrdenados = [...imoveisFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case "relevancia":
        return (b.views || 0) - (a.views || 0);
      case "recentes":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "antigos":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "atualizados":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "preco-asc":
        return getEffectivePrice(a) - getEffectivePrice(b);
      case "preco-desc":
        return getEffectivePrice(b) - getEffectivePrice(a);
      case "area-desc":
        return getEffectiveArea(b) - getEffectiveArea(a);
      case "area-asc":
        return getEffectiveArea(a) - getEffectiveArea(b);
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(imoveisOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const imoveisPaginados = imoveisOrdenados.slice(startIndex, endIndex);

  const goToPage = (page: number | ((prev: number) => number)) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Resetar página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, extFilters, busca, ordenacao, categoriasSelecionadas]);

  const limparFiltros = () => {
    setFilters(initialFilters);
    setBusca("");
    setCategoriasSelecionadas([]);
    setExtFilters({
      dormitoriosMin: "",
      dormitoriosOperador: "maior",
      suitesMin: "",
      suitesOperador: "maior",
      vagasMin: "",
      areaPrivativaMin: "",
      areaPrivativaMax: "",
      areaTerrenoMin: "",
      areaTerrenoMax: "",
      // Condições Comerciais
      permuta: null,
      parcelamentoDireto: null,
      diferencialsSelecionados: [],
      // Filtros de Locação
      aceitaPet: null,
      garantiaCalcao: null,
      garantiaFiador: null,
      garantiaSeguroFianca: null,
      // Filtros de Terreno
      topografiaPlana: null,
      topografiaAclive: null,
      topografiaDeclive: null,
      projetoAprovado: null,
    });
  };

  const toggleTipo = (tipo: string) => {
    setFilters(prev => ({
      ...prev,
      tipos: prev.tipos.includes(tipo) 
        ? prev.tipos.filter(t => t !== tipo)
        : [...prev.tipos, tipo]
    }));
  };

  const toggleCondominio = (c: string) => {
    setFilters(prev => ({
      ...prev,
      condominios: prev.condominios.includes(c) 
        ? prev.condominios.filter(x => x !== c)
        : [...prev.condominios, c]
    }));
  };

  const toggleCategoria = (cat: string) => {
    setCategoriasSelecionadas(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 overflow-x-hidden pt-4">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex max-w-full gap-6">
          {/* Sidebar de filtros - fixo */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="fixed top-[88px] w-64 max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden scrollbar-hide p-4 space-y-4">
              {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-[#0B2545] to-[#163A6B] rounded-xl p-4 -mx-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiFilterLine className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-white">Filtros</h3>
                </div>
                <button
                  onClick={limparFiltros}
                  className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1"
                >
                  <RiCloseLine className="w-3 h-3" />
                  Limpar
                </button>
              </div>
            </div>

            {/* Busca com ícone melhorado */}
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
              <input
                type="text"
                placeholder="Código, endereço..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 focus:outline-none transition-all"
              />
            </div>

            {/* Negócio - Botões elegantes */}
            <FilterSection title="Negócio" defaultOpen>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, negocio: prev.negocio === "venda" ? "" : "venda" }))}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    filters.negocio === "venda" 
                      ? "bg-[#0B2545] text-white shadow-lg shadow-[#0B2545]/30" 
                      : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545] hover:text-[#0B2545]"
                  }`}
                >
                  Comprar
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, negocio: prev.negocio === "aluguel" ? "" : "aluguel" }))}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    filters.negocio === "aluguel" 
                      ? "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30" 
                      : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#25D366] hover:text-[#25D366]"
                  }`}
                >
                  Alugar
                </button>
              </div>
            </FilterSection>

            {/* Tipo de Imóvel - PRIMEIRO */}
            <FilterSection title="Tipo de Imóvel" defaultOpen>
              <div className="space-y-1.5">
                {tipoOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleTipo(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      filters.tipos.includes(opt.value)
                        ? "bg-[#0B2545] text-white shadow-md"
                        : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545]/50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {filters.tipos.includes(opt.value) && <RiCheckLine className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Subtipo - aparece apenas quando um tipo está selecionado */}
            {filters.tipos.length > 0 && (
              <FilterSection title="Subtipo">
                <div className="flex flex-wrap gap-1.5">
                  {filters.tipos.flatMap(tipo => 
                    subtipoOptions[tipo]?.map(sub => (
                      <button
                        key={sub.value}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          subtipos: prev.subtipos.includes(sub.value)
                            ? prev.subtipos.filter(s => s !== sub.value)
                            : [...prev.subtipos, sub.value]
                        }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          filters.subtipos.includes(sub.value) 
                            ? "bg-[#25D366] text-white shadow-sm" 
                            : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#25D366]"
                        }`}
                      >
                        {sub.label}
                      </button>
                    )) || []
                  )}
                </div>
              </FilterSection>
            )}

            {/* Preço */}
            <FilterSection title="Preço" defaultOpen>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Mínimo"
                    value={filters.precoMin ? formatPriceInput(filters.precoMin) : ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, precoMin: parsePriceInput(e.target.value) }))}
                    className="w-full min-w-0 pl-8 pr-2 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#25D366] focus:outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Máximo"
                    value={filters.precoMax ? formatPriceInput(filters.precoMax) : ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, precoMax: parsePriceInput(e.target.value) }))}
                    className="w-full min-w-0 pl-8 pr-2 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#25D366] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Categorias Especiais - DEPOIS DO PREÇO */}
            {categoriasEspeciais.length > 0 && (
              <FilterSection title="Categorias Especiais">
                <div className="space-y-1.5">
                  {categoriasEspeciais.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategoria(cat.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        categoriasSelecionadas.includes(cat.value)
                          ? "bg-[#25D366]/15 text-[#25D366] border-2 border-[#25D366]/30"
                          : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#25D366]/50"
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {categoriasSelecionadas.includes(cat.value) && <RiCheckLine className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Condições Comerciais - OCULTO (informação restrita internamente)
            <FilterSection title="Condições Comerciais">
              <div className="space-y-2">
                <button
                  onClick={() => setExtFilters(prev => ({ ...prev, permuta: prev.permuta === true ? null : true }))}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    extFilters.permuta === true ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400" : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545]/50"
                  }`}
                >
                  <span>Analisa Permuta</span>
                  {extFilters.permuta === true && <RiCheckLine className="w-4 h-4" />}
                </button>
              </div>
            </FilterSection> */}

            {/* Dormitórios */}
            <FilterSection title="Dormitórios">
              <div className="space-y-3">
                <select
                  value={extFilters.dormitoriosOperador}
                  onChange={(e) => setExtFilters(prev => ({ ...prev, dormitoriosOperador: e.target.value as "igual" | "maior" }))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#0B2545] focus:outline-none transition-all"
                >
                  <option value="maior">Maior ou igual ≥</option>
                  <option value="igual">Igual a =</option>
                </select>
                <div className="flex gap-1">
                  {dormitoriosOptions.map(d => (
                    <button
                      key={d}
                      onClick={() => setExtFilters(prev => ({ ...prev, dormitoriosMin: prev.dormitoriosMin === d ? "" : d }))}
                      className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        extFilters.dormitoriosMin === d
                          ? "bg-[#0B2545] text-white shadow-md"
                          : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            {/* Suítes */}
            <FilterSection title="Dormitórios — Suítes">
              <div className="space-y-3">
                <select
                  value={extFilters.suitesOperador}
                  onChange={(e) => setExtFilters(prev => ({ ...prev, suitesOperador: e.target.value as "igual" | "maior" }))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#0B2545] focus:outline-none transition-all"
                >
                  <option value="maior">Maior ou igual ≥</option>
                  <option value="igual">Igual a =</option>
                </select>
                <div className="flex gap-1">
                  {suitesOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setExtFilters(prev => ({ ...prev, suitesMin: prev.suitesMin === s ? "" : s }))}
                      className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        extFilters.suitesMin === s
                          ? "bg-[#0B2545] text-white shadow-md"
                          : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            {/* Vagas */}
            <FilterSection title="Vagas">
              <div className="flex gap-1">
                {vagasOptions.map(v => (
                  <button
                    key={v}
                    onClick={() => setExtFilters(prev => ({ ...prev, vagasMin: prev.vagasMin === v ? "" : v }))}
                    className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      extFilters.vagasMin === v
                        ? "bg-[#25D366] text-white shadow-md"
                        : "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#25D366]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Área Privativa */}
            <FilterSection title="Área Privativa (m²)">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mínimo"
                    value={extFilters.areaPrivativaMin}
                    onChange={(e) => setExtFilters(prev => ({ ...prev, areaPrivativaMin: e.target.value }))}
                    className="w-full min-w-0 px-3 pr-8 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#25D366] focus:outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">m²</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Máximo"
                    value={extFilters.areaPrivativaMax}
                    onChange={(e) => setExtFilters(prev => ({ ...prev, areaPrivativaMax: e.target.value }))}
                    className="w-full min-w-0 px-3 pr-8 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#25D366] focus:outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">m²</span>
                </div>
              </div>
            </FilterSection>

            {/* Área Terreno */}
            <FilterSection title="Área do Terreno (m²)">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mínimo"
                    value={extFilters.areaTerrenoMin}
                    onChange={(e) => setExtFilters(prev => ({ ...prev, areaTerrenoMin: e.target.value }))}
                    className="w-full min-w-0 px-3 pr-8 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#25D366] focus:outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">m²</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Máximo"
                    value={extFilters.areaTerrenoMax}
                    onChange={(e) => setExtFilters(prev => ({ ...prev, areaTerrenoMax: e.target.value }))}
                    className="w-full min-w-0 px-3 pr-8 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-xs focus:border-[#25D366] focus:outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">m²</span>
                </div>
              </div>
            </FilterSection>

            {/* Diferenciais - Carregados da API (respeita hidden) */}
            <FilterSection title="Diferenciais">
              <div className="flex flex-wrap gap-1.5 max-h-[280px] overflow-y-auto scrollbar-hide">
                {diferenciaisOptions.map(dif => (
                  <button
                    key={dif}
                    onClick={() => setExtFilters(prev => ({
                      ...prev,
                      diferencialsSelecionados: prev.diferencialsSelecionados.includes(dif)
                        ? prev.diferencialsSelecionados.filter(d => d !== dif)
                        : [...prev.diferencialsSelecionados, dif]
                    }))}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      extFilters.diferencialsSelecionados.includes(dif)
                        ? "bg-[#0B2545] text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                    }`}
                  >
                    {dif}
                  </button>
                ))}
              </div>
            </FilterSection>


            {/* Filtros para Locação - aparece quando negócio é aluguel */}
            {filters.negocio === "aluguel" && (
              <FilterSection title="Locação">
                <div className="space-y-1">
                  <button
                    onClick={() => setExtFilters(prev => ({ ...prev, aceitaPet: prev.aceitaPet === true ? null : true }))}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      extFilters.aceitaPet === true
                        ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400"
                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"
                    }`}
                  >
                    <span>Aceita Pet</span>
                    {extFilters.aceitaPet === true && <RiCheckLine className="w-3 h-3 flex-shrink-0" />}
                  </button>
                  <p className="text-xs text-neutral-500 px-2 pt-2 pb-1 font-medium">Garantias Aceitas:</p>
                  {[
                    { key: "garantiaCalcao", label: "Caução" },
                    { key: "garantiaFiador", label: "Fiador" },
                    { key: "garantiaSeguroFianca", label: "Seguro Fiança" },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setExtFilters(prev => ({ ...prev, [item.key]: (prev as any)[item.key] === true ? null : true }))}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        (extFilters as any)[item.key] === true
                          ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400"
                          : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"
                      }`}
                    >
                      <span>{item.label}</span>
                      {(extFilters as any)[item.key] === true && <RiCheckLine className="w-3 h-3 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Filtros para Terreno - aparece quando tipo terreno está selecionado */}
            {filters.tipos.includes("terreno") && (
              <FilterSection title="Terreno">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 px-2 pb-1 font-medium">Topografia:</p>
                  {[
                    { key: "topografiaPlana", label: "Plano" },
                    { key: "topografiaAclive", label: "Aclive" },
                    { key: "topografiaDeclive", label: "Declive" },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setExtFilters(prev => ({ ...prev, [item.key]: (prev as any)[item.key] === true ? null : true }))}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        (extFilters as any)[item.key] === true
                          ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400"
                          : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"
                      }`}
                    >
                      <span>{item.label}</span>
                      {(extFilters as any)[item.key] === true && <RiCheckLine className="w-3 h-3 flex-shrink-0" />}
                    </button>
                  ))}
                  <button
                    onClick={() => setExtFilters(prev => ({ ...prev, projetoAprovado: prev.projetoAprovado === true ? null : true }))}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors mt-2 ${
                      extFilters.projetoAprovado === true
                        ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400"
                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"
                    }`}
                  >
                    <span>Projeto Aprovado</span>
                    {extFilters.projetoAprovado === true && <RiCheckLine className="w-3 h-3 flex-shrink-0" />}
                  </button>
                </div>
              </FilterSection>
            )}

            {/* Condomínio */}
            <FilterSection title="Condomínio">
              <div className="space-y-2">
                {condominioOptionsCompativeis.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleCondominio(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.condominios.includes(opt.value)
                        ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400"
                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"
                    }`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    {filters.condominios.includes(opt.value) && <RiCheckLine className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </FilterSection>
            </div>
          </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {/* Banner Off-Market - conteúdo normal, rola com a página */}
          <Link href="/off-market" className="block mb-4 -mt-1">
            <div className="rounded-xl bg-gradient-to-r from-[#0B2545] to-[#2d3a6a] px-3 py-2.5 sm:p-4 cursor-pointer group hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 items-center justify-center flex-shrink-0">
                  <RiEyeOffLine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-xs sm:text-base leading-tight">
                    🔒 Acesse Imóveis Off-Market
                  </h3>
                  <p className="text-white/70 text-[11px] sm:text-sm leading-tight mt-0.5">
                    Lista exclusiva de imóveis fora do mercado aberto
                  </p>
                </div>
                <div className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white text-[#0B2545] group-hover:scale-110 transition-transform flex-shrink-0">
                  <RiArrowRightLine className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Header - Sticky (só contagem + ordenação) */}
          <div className="sticky top-[72px] z-30 bg-neutral-50 dark:bg-neutral-950 -mx-4 lg:-mx-6 px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-neutral-900 dark:text-white">
                  {imoveisOrdenados.length === imoveis.length ? apiTotal : imoveisOrdenados.length} imóveis
                </h1>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                {/* Botão filtros mobile */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B2545] text-white text-xs font-medium"
                >
                  <RiFilterLine className="w-4 h-4" />
                  Filtros
                </button>
                {/* Ordenação */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  >
                    <RiSortDesc className="w-4 h-4" />
                    <span className="hidden sm:inline">Ordenar</span>
                    <RiArrowDownSLine className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50"
                    >
                      {ordenacaoOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setOrdenacao(opt.value);
                            setSortOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                            ordenacao === opt.value ? "text-[#0B2545] dark:text-sky-400 font-medium" : ""
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Grid/List de imóveis */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RiLoader4Line className="w-8 h-8 text-[#0B2545] animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-3">
                {imoveisPaginados.map((imovel, i) => (
                  <motion.div
                    key={imovel.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <ImovelCardMini imovel={imovel} />
                  </motion.div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                  <button
                    onClick={() => goToPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <RiArrowLeftSLine className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {/* Primeira página */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="w-9 h-9 rounded-lg text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="px-1 text-neutral-400">...</span>}
                      </>
                    )}
                    
                    {/* Páginas ao redor da atual */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? "bg-[#0B2545] text-white"
                              : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    
                    {/* Última página */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-1 text-neutral-400">...</span>}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="w-9 h-9 rounded-lg text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => goToPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <RiArrowRightSLine className="w-5 h-5" />
                  </button>
                </div>
              )}

              {imoveisOrdenados.length === 0 && (
                <div className="text-center py-16">
                  <RiHome4Line className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Nenhum imóvel encontrado
                  </h3>
                  <p className="text-neutral-500 text-sm mb-4">Tente ajustar os filtros.</p>
                  <button
                    onClick={limparFiltros}
                    className="px-5 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-medium hover:bg-[#081733] transition-colors"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}

              {/* Banner Off-Market - Final da página */}
              {imoveisOrdenados.length > 0 && (
                <div className="my-5">
                  <Link href="/off-market" className="block">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-xl bg-gradient-to-r from-[#0B2545] to-[#2d3a6a] px-3 py-2.5 sm:p-4 cursor-pointer group hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 items-center justify-center flex-shrink-0">
                          <RiEyeOffLine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-xs sm:text-base leading-tight">
                            🔒 Acesse Imóveis Off-Market
                          </h3>
                          <p className="text-white/70 text-[11px] sm:text-sm leading-tight mt-0.5">
                            Lista exclusiva de imóveis fora do mercado aberto
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white text-[#0B2545] group-hover:scale-110 transition-transform flex-shrink-0">
                          <RiArrowRightLine className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              )}
            </>
          )}
        </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-white dark:bg-neutral-900 z-50 overflow-y-auto overflow-x-hidden lg:hidden"
            >
              {/* Header do drawer */}
              <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 dark:text-white">Filtros</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo dos filtros */}
              <div className="p-4 space-y-4">
                {/* Busca */}
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                  />
                </div>

                {/* Negócio */}
                <FilterSection title="Negócio">
                  <div className="flex gap-2">
                    {["venda", "locacao"].map(neg => (
                      <button
                        key={neg}
                        onClick={() => setFilters(prev => ({ ...prev, negocio: prev.negocio === neg ? "" : neg }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filters.negocio === neg ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        {neg === "venda" ? "Venda" : "Locação"}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Tipo */}
                <FilterSection title="Tipo de imóvel">
                  <div className="grid grid-cols-2 gap-2">
                    {tipoOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleTipo(opt.value)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.tipos.includes(opt.value) ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Subtipo - aparece apenas quando um tipo está selecionado */}
                {filters.tipos.length > 0 && (
                  <FilterSection title="Subtipo">
                    <div className="flex flex-wrap gap-2">
                      {filters.tipos.flatMap(tipo => 
                        subtipoOptions[tipo]?.map(sub => (
                          <button
                            key={sub.value}
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              subtipos: prev.subtipos.includes(sub.value)
                                ? prev.subtipos.filter(s => s !== sub.value)
                                : [...prev.subtipos, sub.value]
                            }))}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                              filters.subtipos.includes(sub.value) ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                            }`}
                          >
                            {sub.label}
                          </button>
                        )) || []
                      )}
                    </div>
                  </FilterSection>
                )}

                {/* Preço */}
                <FilterSection title="Faixa de preço">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Mín"
                        value={filters.precoMin ? formatPriceInput(filters.precoMin) : ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, precoMin: parsePriceInput(e.target.value) }))}
                        className="w-full min-w-0 pl-8 pr-2 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Máx"
                        value={filters.precoMax ? formatPriceInput(filters.precoMax) : ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, precoMax: parsePriceInput(e.target.value) }))}
                        className="w-full min-w-0 pl-8 pr-2 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                      />
                    </div>
                  </div>
                </FilterSection>

                {/* Condições Comerciais - OCULTO (informação restrita internamente)
                <FilterSection title="Condições Comerciais">
                  <div className="space-y-2">
                    <button
                      onClick={() => setExtFilters(prev => ({ ...prev, permuta: prev.permuta === true ? null : true }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        extFilters.permuta === true ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400" : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      <span>Analisa Permuta</span>
                      {extFilters.permuta === true && <RiCheckLine className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setExtFilters(prev => ({ ...prev, parcelamentoDireto: prev.parcelamentoDireto === true ? null : true }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        extFilters.parcelamentoDireto === true ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400" : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      <span>Parcelamento Direto</span>
                      {extFilters.parcelamentoDireto === true && <RiCheckLine className="w-4 h-4" />}
                    </button>
                  </div>
                </FilterSection> */}

                {/* Dormitórios */}
                <FilterSection title="Dormitórios">
                  <div className="space-y-2">
                    <select
                      value={extFilters.dormitoriosOperador}
                      onChange={(e) => setExtFilters(prev => ({ ...prev, dormitoriosOperador: e.target.value as "igual" | "maior" }))}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                    >
                      <option value="maior">Maior ou igual ≥</option>
                      <option value="igual">Igual a =</option>
                    </select>
                    <div className="flex gap-1">
                      {dormitoriosOptions.map(d => (
                        <button
                          key={d}
                          onClick={() => setExtFilters(prev => ({ ...prev, dormitoriosMin: prev.dormitoriosMin === d ? "" : d }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            extFilters.dormitoriosMin === d ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </FilterSection>

                {/* Suítes */}
                <FilterSection title="Sendo Suítes">
                  <div className="space-y-2">
                    <select
                      value={extFilters.suitesOperador}
                      onChange={(e) => setExtFilters(prev => ({ ...prev, suitesOperador: e.target.value as "igual" | "maior" }))}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                    >
                      <option value="maior">Maior ou igual ≥</option>
                      <option value="igual">Igual a =</option>
                    </select>
                    <div className="flex gap-1">
                      {suitesOptions.map(s => (
                        <button
                          key={s}
                          onClick={() => setExtFilters(prev => ({ ...prev, suitesMin: prev.suitesMin === s ? "" : s }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            extFilters.suitesMin === s ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </FilterSection>

                {/* Vagas */}
                <FilterSection title="Vagas">
                  <div className="flex gap-1">
                    {vagasOptions.map(v => (
                      <button
                        key={v}
                        onClick={() => setExtFilters(prev => ({ ...prev, vagasMin: prev.vagasMin === v ? "" : v }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          extFilters.vagasMin === v ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Área Privativa */}
                <FilterSection title="Área Privativa (m²)">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={extFilters.areaPrivativaMin}
                      onChange={(e) => setExtFilters(prev => ({ ...prev, areaPrivativaMin: e.target.value }))}
                      className="w-full min-w-0 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={extFilters.areaPrivativaMax}
                      onChange={(e) => setExtFilters(prev => ({ ...prev, areaPrivativaMax: e.target.value }))}
                      className="w-full min-w-0 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </FilterSection>

                {/* Área Terreno */}
                <FilterSection title="Área Terreno (m²)">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={extFilters.areaTerrenoMin}
                      onChange={(e) => setExtFilters(prev => ({ ...prev, areaTerrenoMin: e.target.value }))}
                      className="w-full min-w-0 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={extFilters.areaTerrenoMax}
                      onChange={(e) => setExtFilters(prev => ({ ...prev, areaTerrenoMax: e.target.value }))}
                      className="w-full min-w-0 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </FilterSection>

                {/* Diferenciais - Carregados da API (respeita hidden) */}
                <FilterSection title="Diferenciais">
                  <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
                    {diferenciaisOptions.map(dif => (
                      <button
                        key={dif}
                        onClick={() => setExtFilters(prev => ({
                          ...prev,
                          diferencialsSelecionados: prev.diferencialsSelecionados.includes(dif)
                            ? prev.diferencialsSelecionados.filter(d => d !== dif)
                            : [...prev.diferencialsSelecionados, dif]
                        }))}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          extFilters.diferencialsSelecionados.includes(dif)
                            ? "bg-[#0B2545] text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                        }`}
                      >
                        {dif}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Condomínio */}
                <FilterSection title="Condomínio">
                  <div className="space-y-2">
                    {condominioOptionsCompativeis.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleCondominio(opt.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.condominios.includes(opt.value)
                            ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400"
                            : "bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {filters.condominios.includes(opt.value) && <RiCheckLine className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Footer do drawer */}
              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4 flex gap-3">
                <button
                  onClick={limparFiltros}
                  className="flex-1 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 rounded-lg bg-[#0B2545] text-white text-sm font-medium"
                >
                  Ver {imoveisOrdenados.length === imoveis.length ? apiTotal : imoveisOrdenados.length} imóveis
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImoveisLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
    </div>
  );
}

export default function Imoveis2Page() {
  return (
    <Suspense fallback={<ImoveisLoading />}>
      <Imovies2Content />
    </Suspense>
  );
}
