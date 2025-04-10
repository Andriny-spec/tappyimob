'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Menu, 
  X, 
  ChevronDown,
  ChevronRight, 
  User, 
  Search,
  Phone,
  Home,
  BookOpen,
  HelpCircle,
  Settings,
  BarChart3,
  DollarSign,
  Layers,
  PieChart,
  Puzzle,
  Globe,
  Users,
  MessageSquare,
  Lightbulb,
  ShieldCheck,
  Trophy,
  Handshake,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);

  // Detecta scroll para mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fecha o mega menu quando clica fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (menu: string) => {
    setActiveMenu(menu);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsMegaMenuOpen(false);
    setActiveMenu(null);
  };

  return (
    <TooltipProvider>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-gradient-to-r from-slate-900/90 via-blue-900/85 to-slate-900/90 shadow-lg backdrop-blur-md py-3 border-b border-cyan-500/20' 
            : 'bg-gradient-to-r from-slate-900/70 via-blue-900/65 to-slate-900/70 backdrop-blur-sm py-5'
        )}
      >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="text-emerald-400">Tappy</span>Imob
          </span>
        </Link>

        {/* Menu de navegação desktop */}
        <div className="hidden lg:flex items-center space-x-0">
          <nav className="flex" onMouseLeave={handleMouseLeave} ref={megaMenuRef}>
            {/* Produto */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'produto' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('produto')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Produto</span>
                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </button>
              
              {activeMenu === 'produto' && isMegaMenuOpen && (
                <div className="absolute left-0 top-full min-w-[600px] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-md border border-cyan-500/20 shadow-xl rounded-b-md overflow-hidden z-50">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div>
                      <h3 className="font-semibold text-emerald-400 mb-4">CRM Imobiliário</h3>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <BarChart3 className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Dashboard</p>
                              <p className="text-xs text-white/70">Visualize todas as métricas do seu negócio</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Users className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Gestão de Leads</p>
                              <p className="text-xs text-white/70">Acompanhamento completo de clientes</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Building2 className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Gestão de Imóveis</p>
                              <p className="text-xs text-white/70">Cadastro e busca avançada</p>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-800/30 p-4 rounded-md">
                      <h3 className="font-semibold text-emerald-400 mb-2">Em destaque</h3>
                      <div className="flex flex-col gap-3 text-white/90">
                        <p className="text-sm">Nossa plataforma completa revoluciona a gestão imobiliária com funcionalidades integradas para imobiliárias e corretores.</p>
                        <div className="bg-emerald-500/20 p-3 rounded-md border border-emerald-500/30">
                          <p className="text-emerald-300 font-medium">Novo: Inteligência Artificial</p>
                          <p className="text-xs text-white/80 mt-1">Nosso assistente IA ajuda você a fechar mais negócios</p>
                        </div>
                        <Button size="sm" className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white w-fit">
                          Conhecer a plataforma
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Preços */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'precos' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('precos')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Preços</span>
                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </button>
              
           
            </div>
            
            {/* Recursos */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'recursos' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('recursos')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Recursos</span>
                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </button>
              
              {activeMenu === 'recursos' && isMegaMenuOpen && (
                <div className="absolute left-0 top-full min-w-[550px] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-md border border-cyan-500/20 shadow-xl rounded-b-md overflow-hidden z-50">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div>
                      <h3 className="font-semibold text-emerald-400 mb-4">Recursos Principais</h3>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Puzzle className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Integrações</p>
                              <p className="text-xs text-white/70">Conecte com outros sistemas</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <BarChart3 className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Relatórios</p>
                              <p className="text-xs text-white/70">Análises detalhadas para tomada de decisão</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Globe className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Portal Web</p>
                              <p className="text-xs text-white/70">Site responsivo para seus imóveis</p>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-400 mb-4">Automações</h3>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <MessageSquare className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Chat Automático</p>
                              <p className="text-xs text-white/70">Atendimento 24/7 para seus clientes</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Zap className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Automação de Marketing</p>
                              <p className="text-xs text-white/70">E-mails e notificações automáticas</p>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Soluções */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'solucoes' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('solucoes')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Soluções</span>
                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </button>
              
              {activeMenu === 'solucoes' && isMegaMenuOpen && (
                <div className="absolute left-0 top-full min-w-[550px] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-md border border-cyan-500/20 shadow-xl rounded-b-md overflow-hidden z-50">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div>
                      <h3 className="font-semibold text-emerald-400 mb-4">Por segmento</h3>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Building2 className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Imobiliárias</p>
                              <p className="text-xs text-white/70">Soluções completas para sua empresa</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <User className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Corretores autônomos</p>
                              <p className="text-xs text-white/70">Aumente sua produtividade</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="flex items-center gap-2 text-white/90 hover:text-emerald-400 transition-colors">
                            <Home className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Incorporadoras</p>
                              <p className="text-xs text-white/70">Gestão de lançamentos e vendas</p>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-800/30 p-4 rounded-md">
                      <h3 className="font-semibold text-emerald-400 mb-2">Caso de sucesso</h3>
                      <div className="flex flex-col gap-2 text-white/90">
                        <p className="text-sm">A imobiliária XYZ aumentou suas vendas em 45% após 3 meses usando o TappyImob.</p>
                        <div className="flex items-center gap-1 text-emerald-300 text-sm mt-2">
                          <Handshake className="h-4 w-4" /> Ver depoimento completo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Integrações */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'integracoes' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('integracoes')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Integrações</span>
                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </button>
              
              {activeMenu === 'integracoes' && isMegaMenuOpen && (
                <div className="absolute left-0 top-full min-w-[450px] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-md border border-cyan-500/20 shadow-xl rounded-b-md overflow-hidden z-50">
                  <div className="p-6">
                    <h3 className="font-semibold text-emerald-400 mb-4">Conecte com suas ferramentas favoritas</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-md hover:bg-blue-800/30 transition-colors">
                        <div className="bg-white/10 h-12 w-12 mx-auto rounded-full flex items-center justify-center mb-2">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-white">WhatsApp</p>
                      </div>
                      <div className="text-center p-3 rounded-md hover:bg-blue-800/30 transition-colors">
                        <div className="bg-white/10 h-12 w-12 mx-auto rounded-full flex items-center justify-center mb-2">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-white">Portais</p>
                      </div>
                      <div className="text-center p-3 rounded-md hover:bg-blue-800/30 transition-colors">
                        <div className="bg-white/10 h-12 w-12 mx-auto rounded-full flex items-center justify-center mb-2">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-white">Financeiro</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-500/20">
                      <Button variant="link" className="text-emerald-400 p-0 h-auto">
                        Ver todas as integrações <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Parceiros */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'parceiros' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('parceiros')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Parceiros</span>
              </button>
            </div>
            
            {/* Por que o TappyImob */}
            <div 
              className={cn(
                "relative px-3 py-2 group",
                activeMenu === 'porque' && isMegaMenuOpen ? 'bg-blue-800/50 rounded-t-md' : ''
              )}
              onMouseEnter={() => handleMouseEnter('porque')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-emerald-400 transition-colors group-hover:text-emerald-400">
                <span className="font-medium text-sm">Por que o TappyImob</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Botões de ação */}
        <div className="hidden lg:flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 text-white border-blue-500/40 hover:bg-blue-900/40 bg-blue-900/20 backdrop-blur-sm"
                >
                  <Search className="h-4 w-4 text-emerald-400" />
                  <span className="text-white/90">Buscar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900/95 text-emerald-400 border-emerald-500/20">
                Buscar imóveis ou corretores
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="gap-2 text-white/90 hover:bg-blue-900/40 hover:text-emerald-400"
              >
                <User className="h-4 w-4 text-emerald-400" />
                Entrar
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 backdrop-blur-md border border-cyan-500/20">
              <DropdownMenuLabel className="text-emerald-400">Acesso ao Sistema</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-blue-500/20" />
              <DropdownMenuItem asChild className="text-white/90 focus:bg-blue-900/50 focus:text-emerald-400">
                <Link href="/admin/dashboard" className="w-full flex items-center gap-2">
                  <Settings className="h-4 w-4 text-emerald-400" />
                  Acesso Admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-white/90 focus:bg-blue-900/50 focus:text-emerald-400">
                <Link href="/imobiliaria/dashboard" className="w-full flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  Portal da Imobiliária
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-blue-500/20" />
              <div className="px-2 py-2">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-600/20 border-none text-sm">
                  Ver planos
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-600/20 border-none" 
            size="sm"
          >
            <Phone className="h-4 w-4" />
              Atendimento
          </Button>
        </div>

        {/* Menu mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white hover:text-emerald-400 hover:bg-blue-900/40"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:max-w-md bg-slate-900/95 backdrop-blur-md border-l border-cyan-500/20 text-white">
            <SheetHeader className="border-b border-blue-500/20 pb-4 mb-4">
              <SheetTitle className="text-white">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">TappyImob</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4">
              <SheetClose asChild>
                <Link 
                  href="/" 
                  className="text-lg font-medium px-4 py-3 hover:bg-blue-900/40 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-white/90"
                >
                  <Home className="h-5 w-5 text-emerald-400" />
                  Início
                </Link>
              </SheetClose>
              <div className="border-t border-blue-500/20 my-1"></div>
              <SheetClose asChild>
                <Link 
                  href="/buscar/em-destaque" 
                  className="text-lg font-medium px-4 py-3 hover:bg-blue-900/40 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-white/90"
                >
                  <Search className="h-5 w-5 text-emerald-400" />
                  Imóveis em Destaque
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link 
                  href="/imobiliarias" 
                  className="text-lg font-medium px-4 py-3 hover:bg-blue-900/40 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-white/90"
                >
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  Imobiliárias
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link 
                  href="/corretores" 
                  className="text-lg font-medium px-4 py-3 hover:bg-blue-900/40 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-white/90"
                >
                  <User className="h-5 w-5 text-emerald-400" />
                  Vantagens
                </Link>
              </SheetClose>
              <div className="border-t border-blue-500/20 my-1"></div>
              <SheetClose asChild>
                <Link 
                  href="/sobre" 
                  className="text-lg font-medium px-4 py-3 hover:bg-blue-900/40 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-white/90"
                >
                  <HelpCircle className="h-5 w-5 text-emerald-400" />
                  Sobre Nós
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link 
                  href="/blog" 
                  className="text-lg font-medium px-4 py-3 hover:bg-blue-900/40 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-white/90"
                >
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                  Blog
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link 
                  href="/contato" 
                  className="text-lg font-medium px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Contato
                </Link>
              </SheetClose>
            </nav>
              
            <div className="py-4 border-t mt-8">
              <div className="grid grid-cols-1 gap-4">
                <SheetClose asChild>
                  <Link href="/admin/dashboard">
                    <Button variant="outline" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      Acessar painel
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Contato
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    </TooltipProvider>
  );
}
