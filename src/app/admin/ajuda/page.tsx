"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiPlayCircleFill,
  RiTimeLine,
  RiBookOpenLine,
  RiComputerLine,
  RiSmartphoneLine,
  RiSettings4Line,
  RiTeamLine,
  RiHome4Line,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiCustomerService2Line,
  RiQuestionLine,
  RiFilterLine,
  RiCloseLine,
  RiArrowRightLine,
} from "react-icons/ri";

// Categorias de treinamento
const categorias = [
  { id: "todos", nome: "Todos", icon: RiBookOpenLine, cor: "neutral" },
  { id: "site", nome: "Site", icon: RiComputerLine, cor: "blue" },
  { id: "crm", nome: "CRM", icon: RiTeamLine, cor: "green" },
  { id: "imoveis", nome: "Imóveis", icon: RiHome4Line, cor: "orange" },
  { id: "contratos", nome: "Contratos", icon: RiFileList3Line, cor: "purple" },
  { id: "financeiro", nome: "Financeiro", icon: RiMoneyDollarCircleLine, cor: "emerald" },
  { id: "configuracoes", nome: "Configurações", icon: RiSettings4Line, cor: "slate" },
  { id: "app", nome: "App Mobile", icon: RiSmartphoneLine, cor: "pink" },
];

// Vídeos de treinamento (fallback/exemplo)
const videosTreinamento = [
  {
    id: "1",
    titulo: "Bem-vindo ao Tappy Imob",
    descricao: "Conheça a plataforma e aprenda os primeiros passos para começar a usar o sistema.",
    categoria: "site",
    duracao: "5:30",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    videoUrl: "",
    ordem: 1,
  },
  {
    id: "2",
    titulo: "Como cadastrar um imóvel",
    descricao: "Tutorial completo sobre como adicionar novos imóveis ao sistema com todas as informações.",
    categoria: "imoveis",
    duracao: "8:45",
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    videoUrl: "",
    ordem: 2,
  },
  {
    id: "3",
    titulo: "Gerenciando clientes e leads",
    descricao: "Aprenda a organizar seus clientes, qualificar leads e acompanhar o funil de vendas.",
    categoria: "crm",
    duracao: "12:20",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    videoUrl: "",
    ordem: 3,
  },
  {
    id: "4",
    titulo: "Criando contratos digitais",
    descricao: "Veja como gerar contratos de compra, venda e locação de forma automática.",
    categoria: "contratos",
    duracao: "10:15",
    thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    videoUrl: "",
    ordem: 4,
  },
  {
    id: "5",
    titulo: "Configurações do sistema",
    descricao: "Personalize o sistema de acordo com as necessidades da sua imobiliária.",
    categoria: "configuracoes",
    duracao: "7:00",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    videoUrl: "",
    ordem: 5,
  },
  {
    id: "6",
    titulo: "Usando o App Mobile",
    descricao: "Acesse o sistema pelo celular e gerencie seus imóveis de qualquer lugar.",
    categoria: "app",
    duracao: "6:30",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    videoUrl: "",
    ordem: 6,
  },
  {
    id: "7",
    titulo: "Relatórios e métricas",
    descricao: "Entenda os relatórios disponíveis e como analisar o desempenho da sua imobiliária.",
    categoria: "financeiro",
    duracao: "9:45",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    videoUrl: "",
    ordem: 7,
  },
  {
    id: "8",
    titulo: "Personalizando o site",
    descricao: "Configure o Hero Slider, carrossel de tipos e outras seções do seu site.",
    categoria: "site",
    duracao: "11:00",
    thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80",
    videoUrl: "",
    ordem: 8,
  },
];

// Card de vídeo
function VideoCard({ video }: { video: typeof videosTreinamento[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const categoria = categorias.find(c => c.id === video.categoria);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Thumbnail com overlay de play */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.titulo}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Botão de play */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0.7 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center shadow-xl">
            <RiPlayCircleFill className="w-10 h-10 text-[#0B2545] dark:text-white" />
          </div>
        </motion.div>

        {/* Badge de categoria */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5`}>
            {categoria && <categoria.icon className="w-3.5 h-3.5" />}
            {categoria?.nome}
          </span>
        </div>

        {/* Duração */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-black/70 text-white flex items-center gap-1">
            <RiTimeLine className="w-3.5 h-3.5" />
            {video.duracao}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-[#0B2545] dark:group-hover:text-sky-400 transition-colors">
          {video.titulo}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
          {video.descricao}
        </p>
      </div>
    </motion.div>
  );
}

export default function AjudaPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar vídeos
  const videosFiltrados = videosTreinamento.filter(video => {
    const matchCategoria = categoriaAtiva === "todos" || video.categoria === categoriaAtiva;
    const matchBusca = video.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       video.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  // Contar vídeos por categoria
  const contarPorCategoria = (catId: string) => {
    if (catId === "todos") return videosTreinamento.length;
    return videosTreinamento.filter(v => v.categoria === catId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <RiBookOpenLine className="w-5 h-5 text-white" />
            </div>
            Central de Ajuda
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Vídeos de treinamento e tutoriais para usar o sistema
          </p>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar vídeos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#0B2545] focus:border-transparent"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Botão filtro mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
          >
            <RiFilterLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categorias - Desktop */}
      <div className="hidden md:flex flex-wrap gap-2">
        {categorias.map((cat) => {
          const isActive = categoriaAtiva === cat.id;
          const count = contarPorCategoria(cat.id);
          
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-[#0B2545] text-white shadow-lg"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.nome}
              <span className={`px-1.5 py-0.5 text-xs rounded-md ${
                isActive 
                  ? "bg-white/20 text-white" 
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categorias - Mobile */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
              {categorias.map((cat) => {
                const isActive = categoriaAtiva === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaAtiva(cat.id);
                      setShowFilters(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      isActive
                        ? "bg-[#0B2545] text-white"
                        : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.nome}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de vídeos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {videosFiltrados.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </AnimatePresence>
      </div>

      {/* Estado vazio */}
      {videosFiltrados.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <RiQuestionLine className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhum vídeo encontrado
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Tente buscar por outro termo ou selecione outra categoria
          </p>
          <button
            onClick={() => {
              setBusca("");
              setCategoriaAtiva("todos");
            }}
            className="px-4 py-2 bg-[#0B2545] text-white rounded-xl font-medium hover:bg-[#081733] transition-colors"
          >
            Limpar filtros
          </button>
        </motion.div>
      )}

      {/* Card de suporte */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#0B2545] to-[#2d3a6d] rounded-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <RiCustomerService2Line className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Precisa de mais ajuda?</h3>
              <p className="text-white/70 text-sm">Nossa equipe de suporte está pronta para ajudar você</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0B2545] rounded-xl font-semibold hover:bg-white/90 transition-colors">
            Falar com suporte
            <RiArrowRightLine className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
