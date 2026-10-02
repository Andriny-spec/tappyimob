"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiSearchLine,
  RiMapPinLine,
  RiHome4Line,
  RiBuilding2Line,
  RiMoneyDollarCircleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiHeartLine,
  RiHeartFill,
  RiStarFill,
  RiRulerLine,
  RiHotelBedLine,
  RiCarLine,
  RiPhoneLine,
  RiWhatsappLine,
  RiShieldCheckLine,
  RiUserStarLine,
  RiTimeLine,
  RiAwardLine,
  RiCloseLine,
  RiCheckLine,
  RiStore2Line,
  RiLandscapeLine,
  RiHotelLine,
  RiCommunityLine,
} from "react-icons/ri";

// ==================== DADOS MOCK ====================
const categorias = [
  { id: "1", nome: "Tamboré I, II e III", quantidade: 234, imagem: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80" },
  { id: "2", nome: "Retrofit", quantidade: 156, imagem: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80" },
  { id: "3", nome: "Casas Térreas", quantidade: 45, imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" },
  { id: "4", nome: "Villagios", quantidade: 89, imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80" },
  { id: "5", nome: "Casas (Centro de Sua Cidade)", quantidade: 67, imagem: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
  { id: "6", nome: "Lançamentos", quantidade: 34, imagem: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" },
];

const imoveis = [
  { id: "1", titulo: "Apartamento Luxo Moema", tipo: "Apartamento", endereco: "Moema, São Paulo", preco: 1250000, area: 145, quartos: 3, vagas: 2, imagem: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", destaque: true },
  { id: "2", titulo: "Casa Sua Cidade", tipo: "Casa", endereco: "Sua Cidade, Barueri", preco: 2800000, area: 320, quartos: 4, vagas: 4, imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", destaque: true },
  { id: "3", titulo: "Cobertura Duplex", tipo: "Cobertura", endereco: "Jardins, São Paulo", preco: 4500000, area: 280, quartos: 4, vagas: 3, imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", destaque: false },
  { id: "4", titulo: "Studio Moderno", tipo: "Studio", endereco: "Pinheiros, São Paulo", preco: 450000, area: 35, quartos: 1, vagas: 1, imagem: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", destaque: false },
  { id: "5", titulo: "Apartamento Vila Olímpia", tipo: "Apartamento", endereco: "Vila Olímpia, São Paulo", preco: 980000, area: 85, quartos: 2, vagas: 1, imagem: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80", destaque: true },
  { id: "6", titulo: "Casa Morumbi", tipo: "Casa", endereco: "Morumbi, São Paulo", preco: 3200000, area: 450, quartos: 5, vagas: 4, imagem: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", destaque: false },
  { id: "7", titulo: "Loft Industrial", tipo: "Loft", endereco: "Vila Madalena, São Paulo", preco: 780000, area: 75, quartos: 1, vagas: 1, imagem: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80", destaque: false },
  { id: "8", titulo: "Apartamento Brooklin", tipo: "Apartamento", endereco: "Brooklin, São Paulo", preco: 1150000, area: 110, quartos: 3, vagas: 2, imagem: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", destaque: true },
  { id: "9", titulo: "Penthouse Itaim", tipo: "Cobertura", endereco: "Itaim Bibi, São Paulo", preco: 5800000, area: 380, quartos: 4, vagas: 5, imagem: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80", destaque: true },
  { id: "10", titulo: "Casa Alto de Pinheiros", tipo: "Casa", endereco: "Alto de Pinheiros, SP", preco: 4200000, area: 520, quartos: 5, vagas: 6, imagem: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80", destaque: false },
];

const avaliacoes = [
  { id: "1", nome: "Carlos Silva", foto: "https://randomuser.me/api/portraits/men/32.jpg", nota: 5, texto: "Excelente atendimento! Encontrei o apartamento dos meus sonhos em menos de 2 semanas.", data: "Há 2 dias" },
  { id: "2", nome: "Ana Costa", foto: "https://randomuser.me/api/portraits/women/44.jpg", nota: 5, texto: "Profissionais muito atenciosos. Me ajudaram em todo o processo de compra.", data: "Há 1 semana" },
  { id: "3", nome: "Roberto Almeida", foto: "https://randomuser.me/api/portraits/men/67.jpg", nota: 5, texto: "A melhor imobiliária que já trabalhei. Transparência total em toda negociação.", data: "Há 2 semanas" },
  { id: "4", nome: "Mariana Santos", foto: "https://randomuser.me/api/portraits/women/68.jpg", nota: 5, texto: "Vendemos nossa casa em tempo recorde! Equipe super competente.", data: "Há 3 semanas" },
  { id: "5", nome: "Fernando Lima", foto: "https://randomuser.me/api/portraits/men/52.jpg", nota: 5, texto: "Atendimento impecável do início ao fim. Recomendo a todos!", data: "Há 1 mês" },
  { id: "6", nome: "Juliana Oliveira", foto: "https://randomuser.me/api/portraits/women/33.jpg", nota: 5, texto: "Encontrei meu primeiro imóvel com eles. Paciência e dedicação incríveis.", data: "Há 1 mês" },
  { id: "7", nome: "Pedro Henrique", foto: "https://randomuser.me/api/portraits/men/45.jpg", nota: 5, texto: "Plataforma muito moderna e corretores qualificados. Top demais!", data: "Há 2 meses" },
];

const tiposImovel = [
  { valor: "apartamento", label: "Apartamento", icone: RiBuilding2Line },
  { valor: "casa", label: "Casa", icone: RiHome4Line },
  { valor: "cobertura", label: "Cobertura", icone: RiHotelLine },
  { valor: "studio", label: "Studio", icone: RiCommunityLine },
  { valor: "comercial", label: "Comercial", icone: RiStore2Line },
  { valor: "terreno", label: "Terreno", icone: RiLandscapeLine },
];

const cidadesPopulares = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR",
  "Campinas, SP", "Guarulhos, SP", "Santos, SP", "Santo André, SP",
];

const faixasPreco = [
  { valor: "ate-300k", label: "Até R$ 300 mil", min: 0, max: 300000 },
  { valor: "300k-500k", label: "R$ 300 mil - R$ 500 mil", min: 300000, max: 500000 },
  { valor: "500k-1m", label: "R$ 500 mil - R$ 1 milhão", min: 500000, max: 1000000 },
  { valor: "1m-2m", label: "R$ 1 milhão - R$ 2 milhões", min: 1000000, max: 2000000 },
  { valor: "2m-5m", label: "R$ 2 milhões - R$ 5 milhões", min: 2000000, max: 5000000 },
  { valor: "acima-5m", label: "Acima de R$ 5 milhões", min: 5000000, max: null },
];

// ==================== COMPONENTES ====================

// Card de Categoria
function CategoriaCard({ categoria }: { categoria: typeof categorias[0] }) {
  return (
    <Link href={`/imoveis?categoria=${categoria.nome.toLowerCase()}`}>
      <motion.div whileHover={{ y: -8 }} className="flex-shrink-0 w-44 group cursor-pointer">
        <div className="relative h-28 rounded-2xl overflow-hidden mb-2">
          <Image src={categoria.imagem} alt={categoria.nome} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3">
            <p className="text-white font-semibold text-sm">{categoria.nome}</p>
            <p className="text-white/70 text-xs">{categoria.quantidade} imóveis</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Card de Imóvel estilo Netflix
function ImovelCard({ imovel }: { imovel: typeof imoveis[0] }) {
  const [favorito, setFavorito] = useState(false);

  return (
    <Link href={`/imovel/${imovel.id}`} target="_blank">
      <motion.div whileHover={{ y: -8 }} className="flex-shrink-0 w-[280px] bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-lg group">
        <div className="relative h-44">
          <Image src={imovel.imagem} alt={imovel.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            {imovel.destaque && <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-lg">Destaque</span>}
            <span className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium rounded-lg">{imovel.tipo}</span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); setFavorito(!favorito); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {favorito ? <RiHeartFill className="w-4 h-4 text-red-500" /> : <RiHeartLine className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1 text-neutral-500 text-xs mb-1">
            <RiMapPinLine className="w-3.5 h-3.5" />
            <span>{imovel.endereco}</span>
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-2 line-clamp-1">{imovel.titulo}</h3>
          
          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
            <span className="flex items-center gap-1"><RiRulerLine className="w-3.5 h-3.5" /> {imovel.area}m²</span>
            <span className="flex items-center gap-1"><RiHotelBedLine className="w-3.5 h-3.5" /> {imovel.quartos}</span>
            <span className="flex items-center gap-1"><RiCarLine className="w-3.5 h-3.5" /> {imovel.vagas}</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-orange-500">R$ {(imovel.preco / 1000).toFixed(0)}K</p>
            <span className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium">Ver Detalhes</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Mini Card Grid
function MiniImovelCard({ imovel }: { imovel: typeof imoveis[0] }) {
  return (
    <Link href={`/imovel/${imovel.id}`} target="_blank">
      <motion.div whileHover={{ scale: 1.02 }} className="flex gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer group">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={imovel.imagem} alt={imovel.titulo} fill className="object-cover group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-500 mb-1">{imovel.tipo}</p>
          <h4 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1">{imovel.titulo}</h4>
          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
            <RiMapPinLine className="w-3 h-3" /> {imovel.endereco}
          </p>
          <p className="text-orange-500 font-bold mt-2">R$ {(imovel.preco / 1000).toFixed(0)}K</p>
        </div>
      </motion.div>
    </Link>
  );
}

// Avaliação Card (sem iPhone mockup)
function AvaliacaoCard({ avaliacao, index }: { avaliacao: typeof avaliacoes[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-[300px] bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-100 dark:border-neutral-800"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
          <Image src={avaliacao.foto} alt={avaliacao.nome} width={48} height={48} className="object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white">{avaliacao.nome}</h4>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <RiStarFill key={i} className="w-3.5 h-3.5 text-amber-400" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">"{avaliacao.texto}"</p>
      <p className="text-xs text-neutral-400">{avaliacao.data}</p>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function HomePage() {
  const router = useRouter();
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [precoFiltro, setPrecoFiltro] = useState("");
  const [refFiltro, setRefFiltro] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal states para filtros expandidos
  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [precoModalOpen, setPrecoModalOpen] = useState(false);

  const categoriasRef = useRef<HTMLDivElement>(null);
  const imoveisRef = useRef<HTMLDivElement>(null);
  const avaliacoesRef = useRef<HTMLDivElement>(null);

  const scrollCarrossel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    const params = new URLSearchParams();
    if (tipoFiltro) params.set("tipo", tipoFiltro.toLowerCase());
    if (cidadeFiltro) params.set("cidade", cidadeFiltro);
    if (precoFiltro) params.set("preco", precoFiltro);
    if (refFiltro.trim()) params.set("ref", refFiltro.trim());
    
    setTimeout(() => {
      router.push(`/imoveis?${params.toString()}`);
    }, 600);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] md:min-h-[75vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="Imobiliária"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-neutral-950" />
        </div>

        <div className="relative container mx-auto px-4 py-8 md:py-16 lg:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-white">Mais de 500 imóveis disponíveis</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 md:mb-4">
            Encontre o imóvel dos seus<span className="text-orange-500"> sonhos</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm md:text-base lg:text-lg text-white/80 mb-5 md:mb-8 max-w-2xl mx-auto px-2">
            Apartamentos, casas, coberturas e muito mais. Descubra seu próximo lar com a melhor imobiliária de São Paulo.
          </motion.p>

          {/* Search Filter - Airbnb Style */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-4xl mx-auto relative z-50">
            {/* Desktop filter */}
            <div className="hidden md:flex bg-white dark:bg-neutral-900 rounded-full p-2 shadow-2xl items-center">
              {/* Tipo */}
              <div className="relative flex-1">
                <button
                  onClick={() => { setTipoModalOpen(!tipoModalOpen); setCidadeModalOpen(false); setPrecoModalOpen(false); }}
                  className="w-full px-6 py-4 text-left rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">Tipo</p>
                  <p className="text-sm text-neutral-500">{tipoFiltro || "Qualquer tipo"}</p>
                </button>

                <AnimatePresence>
                  {tipoModalOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-[calc(100%+8px)] left-0 w-80 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 z-[100]"
                    >
                      <p className="font-semibold mb-3 text-neutral-900 dark:text-white">Tipo de imóvel</p>
                      <div className="grid grid-cols-2 gap-2">
                        {tiposImovel.map(tipo => (
                          <button
                            key={tipo.valor}
                            onClick={() => { setTipoFiltro(tipo.label); setTipoModalOpen(false); }}
                            className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${tipoFiltro === tipo.label ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}
                          >
                            <tipo.icone className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                            <span className="text-sm font-medium">{tipo.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cidade - OCULTO conforme solicitado
              <div className="w-px h-10 bg-neutral-200 dark:bg-neutral-700" />

              <div className="relative flex-1">
                <button
                  onClick={() => { setCidadeModalOpen(!cidadeModalOpen); setTipoModalOpen(false); setPrecoModalOpen(false); }}
                  className="w-full px-6 py-4 text-left rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">Localização</p>
                  <p className="text-sm text-neutral-500">{cidadeFiltro || "Onde você quer morar?"}</p>
                </button>

                <AnimatePresence>
                  {cidadeModalOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-[calc(100%+8px)] left-0 w-80 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 z-[100]"
                    >
                      <p className="font-semibold mb-3 text-neutral-900 dark:text-white">Cidades populares</p>
                      <div className="space-y-1">
                        {cidadesPopulares.map(cidade => (
                          <button
                            key={cidade}
                            onClick={() => { setCidadeFiltro(cidade); setCidadeModalOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                          >
                            <RiMapPinLine className="w-5 h-5 text-orange-500" />
                            <span className="text-sm">{cidade}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-10 bg-neutral-200 dark:bg-neutral-700" />
              */}

              {/* Preço */}
              <div className="relative flex-1">
                <button
                  onClick={() => { setPrecoModalOpen(!precoModalOpen); setTipoModalOpen(false); setCidadeModalOpen(false); }}
                  className="w-full px-6 py-4 text-left rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">Preço</p>
                  <p className="text-sm text-neutral-500">{precoFiltro || "Faixa de preço"}</p>
                </button>

                <AnimatePresence>
                  {precoModalOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-[calc(100%+8px)] right-0 w-80 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 z-[100]"
                    >
                      <p className="font-semibold mb-3 text-neutral-900 dark:text-white">Faixa de preço</p>
                      <div className="space-y-1">
                        {faixasPreco.map(faixa => (
                          <button
                            key={faixa.valor}
                            onClick={() => { setPrecoFiltro(faixa.label); setPrecoModalOpen(false); }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${precoFiltro === faixa.label ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-500" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                          >
                            <span className="text-sm">{faixa.label}</span>
                            {precoFiltro === faixa.label && <RiCheckLine className="w-5 h-5 text-orange-500" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={handleSearch}
                disabled={isSearching}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-70"
                whileTap={{ scale: 0.95 }}
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RiSearchLine className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <RiSearchLine className="w-5 h-5" />
                )}
                {isSearching ? "Buscando..." : "Buscar"}
              </motion.button>
            </div>

            {/* Mobile filter - compacto */}
            <div className="md:hidden bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-2xl">
              {/* Busca por referência */}
              <div className="relative mb-2">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Código do imóvel (ex: CNCD892)"
                  value={refFiltro}
                  onChange={(e) => setRefFiltro(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => { setTipoModalOpen(!tipoModalOpen); setCidadeModalOpen(false); setPrecoModalOpen(false); }}
                  className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-left"
                >
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase">Tipo</p>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{tipoFiltro || "Todos"}</p>
                </button>
                {/* Cidade/Local - OCULTO conforme solicitado */}
                <button
                  onClick={() => { setPrecoModalOpen(!precoModalOpen); setTipoModalOpen(false); setCidadeModalOpen(false); }}
                  className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-left"
                >
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase">Preço</p>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{precoFiltro ? precoFiltro.split(" ")[0] : "Todos"}</p>
                </button>
              </div>
              <motion.button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm"
                whileTap={{ scale: 0.98 }}
              >
                {isSearching ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RiSearchLine className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <RiSearchLine className="w-4 h-4" />
                )}
                {isSearching ? "Buscando..." : "Buscar imóveis"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categorias - Carrossel */}
      <section className="py-6 md:py-10 container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] md:text-xs text-[#0B2545] dark:text-sky-400 font-medium mb-0.5">CATEGORIAS</p>
            <h2 className="text-base md:text-xl font-bold text-neutral-900 dark:text-white">Explore por tipo de imóvel</h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => scrollCarrossel(categoriasRef, "left")} className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700">
              <RiArrowLeftLine className="w-4 h-4" />
            </button>
            <button onClick={() => scrollCarrossel(categoriasRef, "right")} className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700">
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div ref={categoriasRef} className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categorias.map(cat => <CategoriaCard key={cat.id} categoria={cat} />)}
        </div>
      </section>

      {/* Imóveis em Destaque - Netflix Style (sai da tela à direita) */}
      <section className="py-6 md:py-10 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] md:text-xs text-[#0B2545] dark:text-sky-400 font-medium mb-0.5">DESTAQUES</p>
              <h2 className="text-base md:text-xl font-bold text-neutral-900 dark:text-white">Imóveis em Destaque</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => scrollCarrossel(imoveisRef, "left")} className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                <RiArrowLeftLine className="w-4 h-4" />
              </button>
              <button onClick={() => scrollCarrossel(imoveisRef, "right")} className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Carrossel que sai da tela à direita */}
        <div className="relative">
          <div className="absolute right-0 top-0 bottom-4 w-32 bg-gradient-to-l from-white dark:from-neutral-900 to-transparent z-10 pointer-events-none" />
          <div ref={imoveisRef} className="flex gap-6 overflow-x-auto pb-4 container mx-auto px-4 scrollbar-hide">
            {imoveis.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
            <div className="flex-shrink-0 w-16" /> {/* Spacer para padding direito */}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-20 bg-gradient-to-r from-orange-500 to-emerald-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Quer vender ou alugar seu imóvel?</h2>
          <p className="text-white/90 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">Anuncie com a gente e alcance milhares de interessados.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-orange-600 font-semibold hover:bg-neutral-100 transition-colors">
              <RiPhoneLine className="w-5 h-5" />
              Fale Conosco
            </button>
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
              <RiWhatsappLine className="w-5 h-5" />
              WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Imóveis */}
      <section className="py-6 md:py-10 container mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-[10px] md:text-xs text-[#0B2545] dark:text-sky-400 font-medium mb-0.5">MAIS IMÓVEIS</p>
          <h2 className="text-base md:text-xl font-bold text-neutral-900 dark:text-white">Confira todas as opções disponíveis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {imoveis.slice(0, 10).map(imovel => <MiniImovelCard key={imovel.id} imovel={imovel} />)}
        </div>
        <div className="text-center mt-8">
          <button className="px-8 py-3 rounded-xl border-2 border-orange-500 text-orange-500 font-medium hover:bg-orange-500 hover:text-white transition-colors">
            Ver Todos os Imóveis
          </button>
        </div>
      </section>

      {/* Avaliações - Carrossel com fade */}
      <section className="py-6 md:py-10 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-[10px] md:text-xs text-[#0B2545] dark:text-sky-400 font-medium mb-0.5">AVALIAÇÕES</p>
            <h2 className="text-base md:text-xl font-bold text-neutral-900 dark:text-white">O que nossos clientes dizem</h2>
          </div>
        </div>

        {/* Carrossel com fade nas bordas */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neutral-100 dark:from-neutral-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neutral-100 dark:from-neutral-900 to-transparent z-10 pointer-events-none" />
          
          <div ref={avaliacoesRef} className="flex gap-6 overflow-x-auto pb-4 px-16 scrollbar-hide">
            {avaliacoes.map((av, i) => <AvaliacaoCard key={av.id} avaliacao={av} index={i} />)}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-6 md:py-10 container mx-auto px-4 pb-20 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: RiShieldCheckLine, titulo: "Segurança Total", desc: "Todos os imóveis verificados" },
            { icon: RiUserStarLine, titulo: "Atendimento VIP", desc: "Corretores especializados" },
            { icon: RiTimeLine, titulo: "Agilidade", desc: "Resposta em até 2 horas" },
            { icon: RiAwardLine, titulo: "Qualidade", desc: "Mais de 10 anos de mercado" },
          ].map((item, i) => (
            <motion.div key={item.titulo} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{item.titulo}</h3>
              <p className="text-sm text-neutral-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
