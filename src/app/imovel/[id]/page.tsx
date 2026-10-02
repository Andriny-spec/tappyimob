"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiShareLine,
  RiHeartLine,
  RiHeartFill,
  RiMapPinLine,
  RiHotelBedLine,
  RiCarLine,
  RiRuler2Line,
  RiWhatsappLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiEyeLine,
  RiFacebookFill,
  RiTwitterXFill,
  RiLinkedinFill,
  RiTelegramFill,
  RiLinkM,
  RiCheckLine,
  RiLoader4Line,
  RiImage2Line,
  RiHome4Line,
} from "react-icons/ri";
import { recordRecentlyViewed } from "@/lib/recently-viewed";
import { LuBath } from "react-icons/lu";
import { VisitRequestModal } from "@/components/VisitRequestModal";
import { useTracking } from "@/hooks/useTracking";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ImovelCardMini } from "@/components/imoveis/ImovelCardMini";
import { TiposCarrossel } from "@/components/sections";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getDisplayTitle } from "@/utils/property";
import { VideoRequestPopup } from "@/components/imovel/VideoRequestPopup";
import { WhatsAppLeadModal } from "@/components/WhatsAppLeadModal";
import { CONTATO } from "@/lib/contato";

// Componente de Imóveis Semelhantes
//
// Antes trazia os 4 primeiros do mesmo tipo/cidade, sem critério nenhum —
// aparecia imóvel de 1 milhão embaixo de um de 5 milhões. Agora vale faixa de
// preço (-10%/+10%) e mesma quantidade de dormitórios.
//
// Se o critério estrito não encher a lista, ele afrouxa por etapas em vez de
// deixar a seção vazia: primeiro aceita 1 dormitório de diferença, depois abre
// a faixa para 20%. Só some da tela se realmente não houver nada parecido.
function SimilarProperties({ currentPropertyId, type, city, neighborhood, category, price, bedrooms }: {
  currentPropertyId: string;
  type: string;
  city: string;
  neighborhood: string;
  category: string;
  price: number;
  bedrooms: number;
}) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        // busca um lote maior porque a filtragem fina acontece aqui
        const res = await fetch(`/api/properties?type=${type}&city=${city}&category=${category}&limit=40`);
        if (res.ok) {
          const data = await res.json();

          const candidatos = (data.properties || []).filter(
            (p: any) => p.id !== currentPropertyId
          );

          const naFaixa = (p: any, tolerancia: number) => {
            if (!price || !p.price) return false;
            return (
              p.price >= price * (1 - tolerancia) &&
              p.price <= price * (1 + tolerancia)
            );
          };

          // do mais parecido ao menos parecido
          const niveis = [
            (p: any) => naFaixa(p, 0.1) && p.bedrooms === bedrooms,
            (p: any) => naFaixa(p, 0.1) && Math.abs((p.bedrooms || 0) - bedrooms) <= 1,
            (p: any) => naFaixa(p, 0.2) && Math.abs((p.bedrooms || 0) - bedrooms) <= 1,
          ];

          const escolhidos: any[] = [];
          for (const criterio of niveis) {
            for (const p of candidatos) {
              if (escolhidos.length >= 4) break;
              if (!escolhidos.some((e) => e.id === p.id) && criterio(p)) {
                escolhidos.push(p);
              }
            }
            if (escolhidos.length >= 4) break;
          }

          // mais próximos de preço primeiro
          escolhidos.sort(
            (a, b) =>
              Math.abs((a.price || 0) - price) - Math.abs((b.price || 0) - price)
          );

          const mapped = escolhidos
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              ref: p.code || p.id.slice(-6).toUpperCase(),
              titulo: p.condominium?.name || getDisplayTitle(p.title),
              tipo: p.type,
              negocio: p.category === "VENDA_LOCACAO" ? "venda_locacao" : p.category === "LOCACAO" ? "aluguel" : "venda",
              exclusivo: p.isExclusive || false,
              isOffMarket: p.isOffMarket || false,
              localizacao: `${p.neighborhood} - ${p.city}`,
              condominio: p.neighborhood?.toLowerCase().replace(/\s+/g, "-") || "",
              condominioNome: p.condominium?.name,
              dormitorios: p.bedrooms || 0,
              suites: p.suites || 0,
              garagens: p.parkingSpaces || 0,
              areaConstruida: p.area || 0,
              areaTerreno: p.totalArea,
              taxaCondominio: p.condoFee,
              preco: p.price || 0,
              precoAluguel: p.rentPrice,
              acceptsExchange: p.acceptsExchange || false,
              imagens: p.images?.length > 0 ? p.images : [p.thumbnail || "/placeholder-imovel.jpg"],
              descricao: p.description || "",
            }));
          setProperties(mapped);
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis semelhantes:", error);
      }
      setLoading(false);
    };
    fetchSimilar();
  }, [currentPropertyId, type, city, category, price, bedrooms]);

  const Titulo = () => (
    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
      Imóveis Semelhantes
    </h2>
  );

  if (loading) {
    return (
      <>
        <Titulo />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  // Sem nada parecido, a seção inteira some — "Nenhum imóvel semelhante
  // encontrado" embaixo de um título é pior que não ter a seção.
  if (properties.length === 0) return null;

  return (
    <>
      <Titulo />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {properties.map((imovel) => (
          <ImovelCardMini key={imovel.id} imovel={imovel} />
        ))}
      </div>
    </>
  );
}


// Tipo do imóvel
type Property = {
  id: string;
  slug?: string;
  code: string;
  title: string;
  description: string;
  condoDescription?: string;
  exchangeDescription?: string;
  type: string;
  category: string;
  status: string;
  saleStatus?: string;
  rentalStatus?: string;
  websitePublishMode?: string;
  price: number;
  rentPrice?: number;
  condoFee?: number;
  iptu?: number;
  iptuPeriod?: string;
  foro?: number;
  area: number;
  totalArea?: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  address: string;
  number?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  thumbnail?: string;
  images: string[];
  features: string[];
  amenities: string[];
  extras: string[];
  isExclusive: boolean;
  isThirdPartyExclusive: boolean;
  isFeatured: boolean;
  acceptsExchange: boolean;
  acceptsFinancing: boolean;
  views: number;
  favorites: number;
  condominium?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    condoType: string;
    neighborhood: string;
    city: string;
    state: string;
    thumbnail: string | null;
    images: string[];
    amenities: string[];
    totalUnits: number | null;
    yearBuilt: number | null;
    builder: string | null;
    isFeatured: boolean;
  };
  owner?: {
    name: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
};

// Função para sanitizar descrição - remove scripts de WhatsApp e contatos
function sanitizeDescription(description: string): string {
  if (!description) return "";
  
  // Padrões a remover
  const patternsToRemove = [
    /PARA MAIS INFORMAÇÕES.*?VIA WHATSAPP/gi,
    /Imobiliária Tappy Imob[\s\S]*?@tappyimob/gi,
    /WhatsApp:?\s*\d{2}\s*\d{4,5}[\s-]?\d{4}.*?(?:CLIQUE AQUI)?/gi,
    /Acesse nosso site:?\s*www\.tappyimob\.com/gi,
    /Instagram:?\s*@tappyimob/gi,
    /\(CLIQUE AQUI\)/gi,
    /CLIQUE AQUI E RECEBA ATENDIMENTO IMEDIATO/gi,
  ];
  
  let cleaned = description;
  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, "");
  }
  
  // Remove linhas em branco extras
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();
  
  // Remove tags de script por segurança
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/on\w+="[^"]*"/gi, "");
  
  // Converte quebras de linha em <br>
  const hasHtmlTags = /<[^>]+>/.test(cleaned);
  if (!hasHtmlTags) {
    // Texto puro: converte todas as quebras de linha
    cleaned = cleaned.replace(/\n/g, "<br>");
  } else {
    // HTML do editor: converte \n entre tags fechantes e abertas em <br>
    // Preserva espaçamentos que o editor inseriu entre blocos
    cleaned = cleaned.replace(/\n{2,}/g, "<br><br>");
    cleaned = cleaned.replace(/(?<=>)\n(?=<)/g, "");
  }
  
  return cleaned;
}

export default function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [imovel, setImovel] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  
  // Favoritos do contexto global
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(-1); // -1 = grid view, >= 0 = quick view
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  // Convite de vídeo ao chegar na última foto. Reaparece a cada imóvel novo,
  // mas não insiste depois de fechado no mesmo imóvel.
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [whatsModal, setWhatsModal] = useState(false);
  const [videoPopupDispensado, setVideoPopupDispensado] = useState(false);

  // outro imóvel = novo convite, conforme pedido
  useEffect(() => {
    setShowVideoPopup(false);
    setVideoPopupDispensado(false);
  }, [resolvedParams.id]);

  // Observa o índice da foto em vez de depender de um handler específico.
  // O gatilho ficava dentro do nextImage, que só é usado pela seta da galeria
  // em tela cheia — swipe no celular, seta da imagem principal e teclado mexem
  // no índice direto e passavam por fora, então o convite quase nunca aparecia.
  useEffect(() => {
    const total = imovel?.images?.length || 0;
    if (total > 1 && currentImageIndex === total - 1 && !videoPopupDispensado) {
      setShowVideoPopup(true);
    }
  }, [currentImageIndex, imovel?.images?.length, videoPopupDispensado]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: `Olá, estou interessado nesse imóvel que encontrei no site.`,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Tracking
  const { trackView, trackFavorite, trackShare } = useTracking();

  // Proteção de imagens: bloquear clique direito, atalhos de salvar/imprimir/screenshot
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('[data-protected]')) {
        e.preventDefault();
      }
    };

    const blockShortcuts = (e: KeyboardEvent) => {
      // Bloquear Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+Shift+I, PrintScreen
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockShortcuts);
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, []);

  // Navegação por teclado na galeria
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showGallery || !imovel) return;
      
      // Se está no quick view (currentImageIndex >= 0)
      if (currentImageIndex >= 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentImageIndex((prev) => (prev - 1 + (imovel?.images?.length || 1)) % (imovel?.images?.length || 1));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCurrentImageIndex((prev) => (prev + 1) % (imovel?.images?.length || 1));
        } else if (e.key === 'Escape') {
          setCurrentImageIndex(-1); // Volta pro grid
        }
      } else {
        // Se está no grid view
        if (e.key === 'Escape') {
          setShowGallery(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, imovel, currentImageIndex]);

  // Buscar dados do imóvel da API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${resolvedParams.id}`);
        if (!res.ok) {
          throw new Error("Imóvel não encontrado");
        }
        const data = await res.json();
        setImovel(data.property);
        
        // Atualizar título da página para SEO (usa título completo)
        if (data.property?.title) {
          const condoName = data.property.condominium?.name;
          const displayName = condoName || data.property.title;
          document.title = `${displayName} - ${data.property.code} | ${data.property.neighborhood}, ${data.property.city} - Tappy Imob`;
        }
        
        // Redirecionar para URL amigável com slug se acessou por ID
        if (data.property?.slug && resolvedParams.id !== data.property.slug) {
          window.history.replaceState(null, "", `/imovel/${data.property.slug}`);
        }
        
        // Registrar visualização
        if (data.property?.id) {
          trackView(data.property.id);
          recordRecentlyViewed(data.property.id);
          // Disparar evento para o PopupBanner contar visualizações de imóveis
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("propertyClick"));
          }
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar imóvel");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [resolvedParams.id, trackView]);

  // Enviar formulário de contato (cria lead)
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setSubmitError("Por favor, informe seu nome");
      return;
    }
    
    if (!formData.telefone.trim() && !formData.email.trim()) {
      setSubmitError("Por favor, informe seu telefone ou e-mail");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome,
          phone: formData.telefone,
          email: formData.email,
          message: formData.mensagem || `Interesse no imóvel ${imovel?.code || ""}`.trim(),
          propertyId: imovel?.id || resolvedParams.id,
          source: "SITE",
          tags: ["INTERESSE_IMOVEL"],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar mensagem");
      }

      setSubmitSuccess(true);
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        mensagem: `Olá, estou interessado nesse imóvel que encontrei no site.`,
      });

      // Reset após 3 segundos
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (!imovel) return;
    const total = imovel?.images?.length || 1;
    setCurrentImageIndex((prev) => (prev + 1) % total);
  };

  const prevImage = () => {
    if (!imovel) return;
    setCurrentImageIndex((prev) => (prev - 1 + (imovel?.images?.length || 1)) % (imovel?.images?.length || 1));
  };

  // Swipe handlers para galeria
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !imovel) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const imagesArray = imovel.images && imovel.images.length > 0 
      ? imovel.images 
      : [imovel.thumbnail || ""];
    const maxIndex = imagesArray.length - 1;
    
    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (isRightSwipe) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareSocial = (platform: string) => {
    if (!imovel) return;
    
    // Tracking de share
    trackShare(imovel.id);
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Confira este imóvel: ${imovel.title}`);
    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(links[platform], "_blank");
  };

  const handleFavorite = () => {
    if (!imovel) return;
    
    const newFavoriteState = toggleFavorite({
      id: imovel.id,
      title: imovel.title,
      price: imovel.price,
      thumbnail: imovel.thumbnail,
    });
    
    // Tracking de favorito
    trackFavorite(imovel.id, newFavoriteState);
    
    if (newFavoriteState) {
      setShowFavoriteModal(true);
      setTimeout(() => setShowFavoriteModal(false), 2000);
    }
  };
  
  // Verificar se é favorito
  const isFavorite = imovel ? checkIsFavorite(imovel.id) : false;

  const handleWhatsApp = () => {
    if (!imovel) return;
    // Registrar contato via WhatsApp (atualiza updatedAt do imóvel)
    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: imovel.id, event: "whatsapp_contact" }),
    }).catch(() => {});
    // O redirecionamento agora passa pelo modal, que captura o contato antes
    setWhatsModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <RiLoader4Line className="w-10 h-10 text-[#0B2545] animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !imovel) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Imóvel não encontrado</h1>
        <p className="text-neutral-500">{error || "O imóvel que você procura não existe ou foi removido."}</p>
        <Link href="/imoveis" className="px-6 py-3 bg-[#0B2545] text-white rounded-lg hover:bg-[#081733] transition-colors">
          Ver todos os imóveis
        </Link>
      </div>
    );
  }

  // Bloquear exibição de imóveis vendidos/alugados/inativos
  const statusBloqueado: Record<string, string> = {
    VENDIDO: "Este imóvel foi vendido",
    ALUGADO: "Este imóvel foi alugado",
    SUSPENSO: "Este imóvel está temporariamente indisponível",
    INATIVO: "Este imóvel não está mais disponível",
    INDISPONIVEL: "Este imóvel não está mais disponível",
  };

  if (statusBloqueado[imovel.status]) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
          <RiHome4Line className="w-10 h-10 text-neutral-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{statusBloqueado[imovel.status]}</h1>
          <p className="text-neutral-500 max-w-md">
            Infelizmente este imóvel não está mais disponível. Confira outros imóveis semelhantes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/imoveis" className="px-6 py-3 bg-[#0B2545] text-white rounded-lg hover:bg-[#081733] transition-colors font-medium">
            Ver imóveis disponíveis
          </Link>
          <Link href="/" className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium">
            Página inicial
          </Link>
        </div>
      </div>
    );
  }

  // Garantir que images é sempre um array
  const images = imovel.images && imovel.images.length > 0 
    ? imovel.images 
    : [imovel.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop"];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" data-protected>
      {/* Proteção contra print/screenshot via CSS */}
      <style jsx global>{`
        @media print {
          [data-protected] img { display: none !important; }
          [data-protected] [data-protected]::after {
            content: "Imagens protegidas - Tappy Imob";
            display: block;
            font-size: 24px;
            text-align: center;
            padding: 40px;
          }
        }
      `}</style>
      {/* Spacer para não colar no header */}
      <div className="bg-neutral-50 dark:bg-neutral-950" style={{ height: 12 }} />
      {/* Top bar com ações */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => {
                const referrer = document.referrer;
                if (referrer && new URL(referrer).origin === window.location.origin) {
                  window.location.href = referrer;
                } else if (window.history.length > 2) {
                  router.back();
                } else {
                  router.push("/imoveis");
                }
              }}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-[#0B2545] dark:hover:text-white transition-colors"
            >
              <RiArrowLeftLine className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545]"
                }`}
              >
                {isFavorite ? <RiHeartFill className="w-5 h-5" /> : <RiHeartLine className="w-5 h-5" />}
                <span className="text-sm font-medium hidden sm:inline">Favoritar</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545] transition-colors"
              >
                <RiShareLine className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery - Mobile: Carrossel com swipe, Desktop: Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        {/* Mobile Carrossel */}
        <div 
          className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => { setCurrentImageIndex(currentImageIndex >= 0 ? currentImageIndex : 0); setShowGallery(true); }}
        >
          <img 
            src={images[currentImageIndex >= 0 ? currentImageIndex : 0]} 
            alt={imovel.title} 
            className="w-full h-full object-cover select-none pointer-events-none" 
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 text-[10px] font-bold text-white bg-[#0B2545] rounded flex items-center gap-1">
              {imovel.code}
              {imovel.isThirdPartyExclusive && (
                <span title="Exclusividade de Terceiros">🤝</span>
              )}
            </span>
            {imovel.isExclusive && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-[#25D366] rounded-md uppercase">
                Exclusivo
              </span>
            )}
            <span className="px-3 py-1 text-xs font-medium text-white bg-neutral-900/70 backdrop-blur-sm rounded-md">
              {images.length} Fotos
            </span>
          </div>
          {/* Contador + setas de navegação */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2 py-1 text-[10px] font-medium text-white bg-black/60 backdrop-blur-sm rounded">
              {(currentImageIndex >= 0 ? currentImageIndex : 0) + 1} / {images.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1)); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors shadow-lg"
              >
                <RiArrowLeftSLine className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => ((prev + 1) % images.length)); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors shadow-lg"
              >
                <RiArrowRightSLine className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div
          className="hidden md:grid grid-cols-4 gap-2 rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => { setCurrentImageIndex(0); setShowGallery(true); }}
        >
          <div className="col-span-2 row-span-2 relative h-[360px]">
            <img src={images[0]} alt={imovel.title} className="w-full h-full object-cover hover:opacity-95 transition-opacity select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 text-xs font-bold text-white bg-[#0B2545] rounded-md flex items-center gap-1">
                Ref: {imovel.code}
                {imovel.isThirdPartyExclusive && (
                  <span title="Exclusividade de Terceiros">🤝</span>
                )}
              </span>
              {imovel.isExclusive && (
                <span className="px-3 py-1 text-xs font-bold text-white bg-[#25D366] rounded-md uppercase">
                  Exclusivo
                </span>
              )}
              <span className="px-3 py-1 text-xs font-medium text-white bg-neutral-900/70 backdrop-blur-sm rounded-md">
                {images.length} Fotos
              </span>
            </div>
          </div>
          {images.slice(1, 5).map((image, i) => (
            <div key={i} className="relative h-[176px]">
              <img src={image} alt={`${imovel.title} - ${i + 2}`} className="w-full h-full object-cover hover:opacity-95 transition-opacity select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">+{images.length - 5} fotos</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Thumbnails mobile */}
        {images.length > 1 && (
          <div className="md:hidden flex gap-2 mt-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                  (currentImageIndex >= 0 ? currentImageIndex : 0) === idx ? "border-[#0B2545]" : "border-transparent opacity-70"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content - Grid com título e form lado a lado */}
      <div className="container mx-auto px-4 lg:px-8 pb-40 lg:pb-32">
        <div className="grid lg:grid-cols-5 gap-6 mt-3">
          {/* Main Content - 3 colunas */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Title & Info Box */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <h1 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white">
                  {imovel.condominium?.name || getDisplayTitle(imovel.title)}
                </h1>
                <span className="flex-shrink-0 px-4 py-1.5 text-base font-extrabold text-[#0B2545] dark:text-sky-400 bg-[#0B2545]/10 dark:bg-sky-400/10 rounded-lg border border-[#0B2545]/20 dark:border-sky-400/20 tracking-wide">
                  {imovel.code}
                </span>
              </div>
              <p className="text-neutral-500 text-sm mb-2">{imovel.neighborhood}, {imovel.city}/{imovel.state}</p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                {imovel.type !== "TERRENO" && imovel.bedrooms > 0 && (
                  <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-lg font-medium text-xs">
                    <RiHotelBedLine className="w-3 h-3 text-[#0B2545] dark:text-sky-400" />
                    {imovel.bedrooms} quartos{imovel.suites > 0 && ` (${imovel.suites} suítes)`}
                  </span>
                )}
                {imovel.type !== "TERRENO" && imovel.parkingSpaces > 0 && (
                  <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-lg font-medium text-xs">
                    <RiCarLine className="w-3 h-3 text-[#0B2545] dark:text-sky-400" />
                    {imovel.parkingSpaces} vagas
                  </span>
                )}
                {imovel.type !== "TERRENO" && imovel.area > 0 && (
                  <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-lg font-medium text-xs">
                    <RiRuler2Line className="w-3 h-3 text-[#0B2545] dark:text-sky-400" />
                    {imovel.area}m² Área Privativa
                  </span>
                )}
                {imovel.totalArea && imovel.totalArea > 0 && (
                  <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-lg font-medium text-xs">
                    <RiMapPinLine className="w-3 h-3 text-[#0B2545] dark:text-sky-400" />
                    {imovel.totalArea}m² Área do Terreno
                  </span>
                )}
              </div>
            </div>

            {/* DESCRIÇÃO DO IMÓVEL */}
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-3">
                DESCRIÇÃO DO IMÓVEL
              </h2>
              <div 
                className="description-html text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeDescription(imovel.description || "") }}
              />
            </div>

            {/* CTA WhatsApp - Após descrição */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
            >
              <RiWhatsappLine className="w-6 h-6" />
              Iniciar conversa no WhatsApp
            </button>

            {/* SOBRE O CONDOMÍNIO */}
            {imovel.condominium && (
              <div className="rounded-2xl border-2 border-[#0B2545]/30 dark:border-[#0B2545]/40 bg-gradient-to-b from-[#0B2545]/[0.05] to-white dark:from-[#0B2545]/15 dark:to-neutral-900 overflow-hidden shadow-sm">
                <div className="p-6">
                  <h2 className="text-sm font-bold text-[#0B2545] dark:text-sky-400 uppercase tracking-wider mb-4">
                    Condomínio
                  </h2>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-xl bg-[#0B2545]/10 flex items-center justify-center flex-shrink-0">
                      <RiMapPinLine className="w-7 h-7 text-[#0B2545]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {imovel.condominium.slug ? (
                        <Link 
                          href={`/condominio/${imovel.condominium.slug}`}
                          className="text-xl font-bold text-neutral-900 dark:text-white hover:text-[#0B2545] transition-colors"
                        >
                          {imovel.condominium.name}
                        </Link>
                      ) : (
                        <span className="text-xl font-bold text-neutral-900 dark:text-white">
                          {imovel.condominium.name}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-neutral-500">
                        {imovel.condominium.totalUnits && <span>{imovel.condominium.totalUnits} unidades</span>}
                        {imovel.condominium.yearBuilt && <span>• {imovel.condominium.yearBuilt}</span>}
                        {imovel.condominium.builder && <span>• {imovel.condominium.builder}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {imovel.condominium.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 line-clamp-3">
                      {imovel.condominium.description}
                    </p>
                  )}

                  {imovel.condominium.amenities && imovel.condominium.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {imovel.condominium.amenities.slice(0, 8).map((item: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 rounded-full">
                          {item}
                        </span>
                      ))}
                      {imovel.condominium.amenities.length > 8 && (
                        <span className="px-2.5 py-1 bg-[#0B2545]/10 text-[11px] font-medium text-[#0B2545] rounded-full">
                          +{imovel.condominium.amenities.length - 8}
                        </span>
                      )}
                    </div>
                  )}

                  {imovel.condominium.slug ? (
                    <Link
                      href={`/condominio/${imovel.condominium.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white bg-[#0B2545] rounded-xl hover:bg-[#0B2545]/90 transition-colors shadow-md hover:shadow-lg"
                    >
                      Ver imóveis e detalhes do condomínio →
                    </Link>
                  ) : (
                    <Link
                      href={`/imoveis?condominio=${imovel.condominium.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white bg-[#0B2545] rounded-xl hover:bg-[#0B2545]/90 transition-colors shadow-md hover:shadow-lg"
                    >
                      Ver imóveis do condomínio →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* CARACTERÍSTICAS DA UNIDADE - Comentado temporariamente */}
            {/* {imovel.features && imovel.features.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-3">
                  CARACTERÍSTICAS DA UNIDADE
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5">
                  {imovel.features.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <RiCheckLine className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}


            {/* Descrição da permuta */}
            {imovel.acceptsExchange && imovel.exchangeDescription && (
              <div className="p-4 rounded-xl border-l-4 border-green-500 bg-green-50 dark:bg-green-500/10">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-2">
                  ACEITA PERMUTA
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{imovel.exchangeDescription}</p>
              </div>
            )}

              {/* CARACTERÍSTICAS DO CONDOMÍNIO */}
            {imovel.amenities && imovel.amenities.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-3">
                  SOBRE O CONDOMÍNIO
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5">
                  {imovel.amenities.slice(0, 15).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <RiCheckLine className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caixa de contato do imóvel */}
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Solicite mais detalhes deste imóvel — fale conosco agora
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/10 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-600/20 transition-colors border border-green-600/20"
                >
                  <RiWhatsappLine className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isFavorite
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-neutral-300 hover:border-[#0B2545]"
                  }`}
                >
                  {isFavorite ? <RiHeartFill className="w-3.5 h-3.5" /> : <RiHeartLine className="w-3.5 h-3.5" />}
                  Favoritar
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - 2 colunas */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                {(() => {
                  // Determinar quais finalidades mostrar baseado em status
                  const cat = imovel.category;
                  const sale = imovel.saleStatus || "ATIVO";
                  const rent = imovel.rentalStatus || "ATIVO";
                  const pubMode = imovel.websitePublishMode;
                  let showVenda = cat === "VENDA";
                  let showLocacao = cat === "LOCACAO";
                  if (cat === "VENDA_LOCACAO") {
                    if (pubMode === "VENDA") { showVenda = true; showLocacao = false; }
                    else if (pubMode === "LOCACAO") { showVenda = false; showLocacao = true; }
                    else {
                      showVenda = sale === "ATIVO";
                      showLocacao = rent === "ATIVO";
                      if (!showVenda && !showLocacao) { showVenda = true; }
                    }
                  }
                  return (
                    <>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {showVenda && (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-md uppercase bg-[#0B2545] text-white">Venda</span>
                        )}
                        {showLocacao && (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-md uppercase bg-[#25D366] text-white">Locação</span>
                        )}
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md">
                          {imovel.type}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {showVenda && imovel.price > 0 && (
                          <div>
                            <p className="text-[10px] text-neutral-500 uppercase">Valor de Venda</p>
                            <p className="text-2xl font-bold text-[#0B2545] dark:text-white">{formatPrice(imovel.price)}</p>
                          </div>
                        )}
                        {showLocacao && imovel.rentPrice && imovel.rentPrice > 0 && (
                          <div>
                            <p className="text-[10px] text-neutral-500 uppercase">Aluguel</p>
                            <p className="text-xl font-bold text-[#25D366] dark:text-[#5EE08E]">{formatPrice(imovel.rentPrice)}/mês</p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
                
                <div className="mt-3 space-y-1.5 pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Condomínio</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(imovel.condoFee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">IPTU {imovel.iptuPeriod === "MENSAL" ? "Mensal" : "Anual"}</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(imovel.iptu || 0)}</span>
                  </div>
                  {imovel.foro && imovel.foro > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Foro</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(imovel.foro)}</span>
                    </div>
                  )}
                </div>

                {/* Form */}
                {submitSuccess ? (
                  <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <RiCheckLine className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Mensagem enviada!</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">Em breve entraremos em contato.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Seu nome *"
                      autoComplete="name"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-[#0B2545]"
                    />
                    <div className="flex gap-2">
                      <span className="flex items-center px-2.5 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
                        🇧🇷
                      </span>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        autoComplete="tel"
                        value={formData.telefone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                          let masked = digits;
                          if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                          if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                          else if (digits.length > 6) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
                          setFormData({ ...formData, telefone: masked });
                        }}
                        className="flex-1 px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-[#0B2545]"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-[#0B2545]"
                    />
                    <textarea
                      placeholder="Mensagem"
                      rows={2}
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm resize-none focus:ring-2 focus:ring-[#0B2545]"
                    />
                    {submitError && (
                      <p className="text-xs text-red-500">{submitError}</p>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-[#0B2545] text-white font-semibold rounded-lg hover:bg-[#081733] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        "Enviar mensagem"
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Agende visita */}
              <div className="relative overflow-hidden p-5 rounded-2xl border-2 border-[#25D366]/40 bg-gradient-to-br from-[#25D366]/10 via-orange-50 to-white dark:from-[#25D366]/15 dark:via-neutral-900 dark:to-neutral-900">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#25D366]/10" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center shadow-md shadow-[#25D366]/30">
                      <RiMapPinLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Agende sua visita</h3>
                      <p className="text-[10px] text-neutral-500">Conheça o imóvel pessoalmente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVisitModal(true)}
                    className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1DA851] transition-all text-sm shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 active:scale-[0.98]"
                  >
                    Agendar visita →
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <RiEyeLine className="w-4 h-4" />
                  {imovel.views} visualizações
                </span>
                <span className="flex items-center gap-1">
                  <RiHeartLine className="w-4 h-4" />
                  {imovel.favorites} salvos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Imóveis Semelhantes — o próprio componente esconde tudo se não
            houver nada dentro do critério */}
        <div className="mt-12 empty:hidden">
          <SimilarProperties 
            currentPropertyId={imovel.id}
            type={imovel.type}
            city={imovel.city}
            neighborhood={imovel.neighborhood}
            category={imovel.category}
            price={imovel.price || 0}
            bedrooms={imovel.bedrooms || 0}
          />
        </div>

        {/* Carrossel de Tipos */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
            CATEGORIAS ESPECIAIS
          </h2>
          <TiposCarrossel compact />
        </div>

      </div>

      {/* Mobile fixed CTA - acima da nav bar */}
      <div className="fixed bottom-14 left-0 right-0 p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 lg:hidden z-30">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {(() => {
              const cat = imovel.category;
              const sale = imovel.saleStatus || "ATIVO";
              const rent = imovel.rentalStatus || "ATIVO";
              const pubMode = imovel.websitePublishMode;
              let showVenda = cat === "VENDA";
              let showLocacao = cat === "LOCACAO";
              if (cat === "VENDA_LOCACAO") {
                if (pubMode === "VENDA") { showVenda = true; showLocacao = false; }
                else if (pubMode === "LOCACAO") { showVenda = false; showLocacao = true; }
                else {
                  showVenda = sale === "ATIVO";
                  showLocacao = rent === "ATIVO";
                  if (!showVenda && !showLocacao) { showVenda = true; }
                }
              }
              // Fallback: tenta venda, depois locação, depois qualquer um > 0
              let mainPrice = 0;
              let isRent = false;
              if (showVenda && imovel.price > 0) {
                mainPrice = imovel.price;
              } else if (showLocacao && imovel.rentPrice && imovel.rentPrice > 0) {
                mainPrice = imovel.rentPrice;
                isRent = true;
              } else if (imovel.price > 0) {
                mainPrice = imovel.price;
              } else if (imovel.rentPrice && imovel.rentPrice > 0) {
                mainPrice = imovel.rentPrice;
                isRent = true;
              }
              return (
                <>
                  <p className={`text-xl font-bold ${isRent ? 'text-[#25D366]' : 'text-[#0B2545]'} dark:text-white`}>
                    {mainPrice > 0 ? `${formatPrice(mainPrice)}${isRent ? '/mês' : ''}` : 'Consulte-nos'}
                  </p>
                  {imovel.condoFee && imovel.condoFee > 0 && (
                    <p className="text-xs text-neutral-500">Cond. {formatPrice(imovel.condoFee)}/mês</p>
                  )}
                </>
              );
            })()}
          </div>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#081733] transition-colors"
          >
            <RiWhatsappLine className="w-5 h-5" />
            Contato
          </button>
        </div>
      </div>

      {/* Gallery Modal - Imagem ampliada com thumbnails (abre primeiro) */}
      <AnimatePresence>
        {showGallery && currentImageIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 text-white">
              <span className="text-sm font-medium">{currentImageIndex + 1} / {images.length}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentImageIndex(-1)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                >
                  <RiImage2Line className="w-4 h-4" />
                  Mais fotos
                </button>
                <button onClick={() => setShowGallery(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Imagem principal - com suporte a swipe */}
            <div 
              className="flex-1 flex items-center justify-center px-4 lg:px-16 relative"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[currentImageIndex]}
                alt={`${imovel.title} - ${currentImageIndex + 1}`}
                className="max-w-[95vw] lg:max-w-[85vw] max-h-[70vh] lg:max-h-[75vh] object-contain rounded-lg select-none pointer-events-none"
                draggable={false}
                onContextMenu={(e: any) => e.preventDefault()}
              />

              <button onClick={prevImage} className="absolute left-2 lg:left-4 p-3 lg:p-4 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm">
                <RiArrowLeftSLine className="w-7 h-7 lg:w-8 lg:h-8" />
              </button>
              <button onClick={nextImage} className="absolute right-2 lg:right-4 p-3 lg:p-4 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm">
                <RiArrowRightSLine className="w-7 h-7 lg:w-8 lg:h-8" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-2 lg:p-4">
              <div className="flex gap-1.5 lg:gap-2 justify-center overflow-x-auto pb-2 max-w-full">
                {images.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === i ? "border-white ring-2 ring-white/50" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Modal - Todas as fotos em grid */}
      <AnimatePresence>
        {showGallery && currentImageIndex < 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <RiImage2Line className="w-5 h-5" />
                <span className="text-sm font-medium">{images.length} fotos</span>
              </div>
              <button onClick={() => setShowGallery(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            {/* Grid de fotos - Largura total */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1">
                {images.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="aspect-[4/3] overflow-hidden hover:ring-2 hover:ring-white/50 transition-all group"
                  >
                    <img 
                      src={image} 
                      alt={`${imovel.title} - ${i + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 select-none" 
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Modal */}
      <VisitRequestModal
        propertyId={imovel.id}
        propertyTitle={imovel.title}
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
      />

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Compartilhar</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-6">
                <button
                  onClick={() => handleShareSocial("whatsapp")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <RiWhatsappLine className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShareSocial("facebook")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <RiFacebookFill className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400">Facebook</span>
                </button>
                <button
                  onClick={() => handleShareSocial("twitter")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                    <RiTwitterXFill className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400">X</span>
                </button>
                <button
                  onClick={() => handleShareSocial("linkedin")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
                    <RiLinkedinFill className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShareSocial("telegram")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                    <RiTelegramFill className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400">Telegram</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {linkCopied ? (
                  <>
                    <RiCheckLine className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Link copiado!</span>
                  </>
                ) : (
                  <>
                    <RiLinkM className="w-5 h-5" />
                    <span className="text-sm font-medium">Copiar link</span>
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Favorite Confirmation Toast */}
      <AnimatePresence>
        {showFavoriteModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-[#0B2545] text-white rounded-full shadow-lg">
              <RiHeartFill className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium">Adicionado aos favoritos!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Flutuante — só em desktop (mobile já tem CTA bar) */}
      {imovel && (
        <div className="hidden lg:block">
          <FloatingWhatsApp
            message={`Olá, gostaria de mais detalhes e informações sobre o imóvel Cód. ${imovel.code}`}
            propertyId={imovel.id}
          />
        </div>
      )}

      <WhatsAppLeadModal
        aberto={whatsModal}
        onFechar={() => setWhatsModal(false)}
        telefone={CONTATO.whatsapp}
        mensagem={`Olá, gostaria de mais detalhes e informações sobre o imóvel Cód. ${imovel.code}`}
        origem="Botão do imóvel"
        propertyId={imovel.id}
        propertyCode={imovel.code || undefined}
        titulo="Falar sobre este imóvel"
      />

      <VideoRequestPopup
        aberto={showVideoPopup}
        onFechar={() => {
          setShowVideoPopup(false);
          setVideoPopupDispensado(true);
        }}
        codigo={imovel.code || ""}
        propertyId={imovel.id}
        titulo={getDisplayTitle(imovel.title)}
      />
    </div>
  );
}
