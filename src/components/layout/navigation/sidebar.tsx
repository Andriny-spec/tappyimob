'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import {
  Home,
  Building2,
  Users,
  Briefcase,
  CreditCard,
  BarChart4,
  Settings,
  LogOut,
  MessagesSquare,
  Star,
  Zap,
  Bot,
  BookOpen,
  Menu,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  LayoutGrid,
  UserCheck,
  FileText,
  HelpCircle,
  Bell,
  Cog,
  Gauge
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Tipo para os itens do menu
type MenuItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
  submenu?: MenuItem[];
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'danger';
  };
  isNew?: boolean;
};

// Props para o componente Sidebar
interface SidebarProps {
  variant: 'admin' | 'imobiliaria' | 'corretor' | 'cliente';
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ variant, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Função para alternar a expansão de um item do menu
  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  // Função para verificar se um item está ativo
  const isActive = (href: string) => pathname === href;

  // Obtém os itens do menu com base na variante
  const getMenuItems = (): MenuItem[] => {
    switch (variant) {
      case 'admin':
        return [
          { title: 'Visão Geral', icon: <Gauge className="h-5 w-5" />, href: '/admin/dashboard' },
          { title: 'Assinaturas', icon: <CreditCard className="h-5 w-5" />, href: '/admin/dashboard/assinaturas' },
          { title: 'Imobiliárias', icon: <Building2 className="h-5 w-5" />, href: '/admin/dashboard/imobiliarias' },
          { title: 'Planos', icon: <LayoutGrid className="h-5 w-5" />, href: '/admin/dashboard/planos' },
          { title: 'Integrações', icon: <ExternalLink className="h-5 w-5" />, href: '/admin/dashboard/integracoes' },
          { 
            title: 'Tappy I.A', 
            icon: <Bot className="h-4 w-4" />, 
            href: '/admin/dashboard/tappyia',
            isNew: true 
          },
          { title: 'Relatórios', icon: <BarChart4 className="h-4 w-4" />, href: '/admin/dashboard/relatorios' },
          { title: 'Páginas', icon: <FileText className="h-4 w-4" />, href: '/admin/dashboard/paginas' },
          { title: 'Blog', icon: <BookOpen className="h-4 w-4" />, href: '/admin/dashboard/blog' },
          { title: 'Configuração', icon: <Settings className="h-4 w-4" />, href: '/admin/dashboard/configuracao' },
        ];

      case 'imobiliaria':
        return [
          { title: 'Visão Geral', icon: <Gauge className="h-4 w-4" />, href: '/imobiliaria/dashboard' },
          { title: 'Imóveis', icon: <Building2 className="h-4 w-4" />, href: '/imobiliaria/dashboard/imoveis' },
          { title: 'Corretores', icon: <Briefcase className="h-4 w-4" />, href: '/imobiliaria/dashboard/corretores' },
          { title: 'Clientes', icon: <Users className="h-4 w-4" />, href: '/imobiliaria/dashboard/clientes' },
          { 
            title: 'Tappy I.A', 
            icon: <Bot className="h-4 w-4" />, 
            href: '/imobiliaria/dashboard/tappyia',
            isNew: true 
          },
          { 
            title: 'Meu Site', 
            icon: <Zap   className="h-4 w-4" />, 
            href: '/imobiliaria/dashboard/meusite',
            badge: { text: 'Premium', variant: 'success' }
          },
          { 
            title: 'Meu Plano', 
            icon: <CreditCard className="h-4 w-4" />, 
            href: '/imobiliaria/dashboard/plano',
            badge: { text: 'Premium', variant: 'success' }
          },
          { title: 'Integrações', icon: <MessagesSquare className="h-4 w-4" />, href: '/imobiliaria/dashboard/integracoes' },
          { title: 'Avaliações', icon: <Star className="h-4 w-4" />, href: '/imobiliaria/dashboard/avaliacoes' },
          { title: 'Relatórios', icon: <BarChart4 className="h-4 w-4" />, href: '/imobiliaria/dashboard/relatorios' },
         
          { title: 'Configuração', icon: <Settings className="h-4 w-4" />, href: '/imobiliaria/dashboard/configuracao' },
        ];
        
      case 'corretor':
        return [
          { title: 'Visão Geral', icon: <Gauge className="h-4 w-4" />, href: '/corretor/dashboard' },
          { title: 'Imóveis', icon: <Building2 className="h-4 w-4" />, href: '/corretor/dashboard/imoveis' },
          { title: 'Clientes', icon: <Users className="h-4 w-4" />, href: '/corretor/dashboard/clientes' },
          { title: 'Avaliações', icon: <Star className="h-4 w-4" />, href: '/corretor/dashboard/avaliacoes' },
          { title: 'Mensagens', icon: <MessagesSquare className="h-4 w-4" />, href: '/corretor/dashboard/mensagens' },
          { title: 'Relatórios', icon: <BarChart4 className="h-4 w-4" />, href: '/corretor/dashboard/relatorios' },
          { title: 'Configuração', icon: <Settings className="h-4 w-4" />, href: '/corretor/dashboard/configuracao' },
        ];
        
      case 'cliente':
        return [
          { title: 'Visão Geral', icon: <Gauge className="h-4 w-4" />, href: '/cliente/dashboard' },
          { title: 'Meus Imóveis', icon: <Building2 className="h-4 w-4" />, href: '/cliente/dashboard/imoveis' },
          { title: 'Contratos', icon: <FileText className="h-4 w-4" />, href: '/cliente/dashboard/contratos' },
          { title: 'Mensagens', icon: <MessagesSquare className="h-4 w-4" />, href: '/cliente/dashboard/mensagens' },
          { title: 'Suporte', icon: <HelpCircle className="h-4 w-4" />, href: '/cliente/dashboard/suporte' },
        ];
        
      default:
        return [];
    }
  };

  // Obter cores baseadas na variante
  const getVariantColors = () => {
    switch (variant) {
      case 'admin':
        return {
          bg: 'bg-slate-900',
          hover: 'hover:bg-primary/10',
          active: 'bg-primary/20 text-primary',
          text: 'text-slate-200',
          accent: 'bg-primary'
        };
      case 'imobiliaria':
        return {
          bg: 'bg-slate-900',
          hover: 'hover:bg-blue-600/10',
          active: 'bg-blue-600/20 text-blue-500',
          text: 'text-slate-200',
          accent: 'bg-blue-600'
        };
      case 'corretor':
        return {
          bg: 'bg-slate-900',
          hover: 'hover:bg-purple-600/10',
          active: 'bg-purple-600/20 text-purple-500',
          text: 'text-slate-200',
          accent: 'bg-purple-600'
        };
      case 'cliente':
        return {
          bg: 'bg-slate-900',
          hover: 'hover:bg-amber-500/10',
          active: 'bg-amber-500/20 text-amber-500',
          text: 'text-slate-200',
          accent: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-slate-900',
          hover: 'hover:bg-slate-800',
          active: 'bg-slate-800 text-primary',
          text: 'text-slate-200',
          accent: 'bg-primary'
        };
    }
  };

  const colors = getVariantColors();
  const menuItems = getMenuItems();

  // Variantes para animações
  const sidebarVariants = {
    open: { width: 260, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { width: 80, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  // Renderiza os itens do menu
  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const isItemActive = isActive(item.href);
      const isItemHovered = hoveredItem === item.title;
      const isItemExpanded = expandedItems.includes(item.title);
      const hasSubmenu = item.submenu && item.submenu.length > 0;

      return (
        <div key={item.title}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-md gap-2 text-xs font-medium transition-all",
                      colors.text,
                      isItemActive ? colors.active : colors.hover,
                      isItemHovered && !isItemActive && "bg-opacity-10",
                      "group"
                    )}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      if (hasSubmenu) {
                        e.preventDefault();
                        toggleExpand(item.title);
                      }
                    }}
                  >
                    <span className={cn(
                      "p-1.5 rounded-md transition-colors",
                      isItemActive ? `${colors.active} bg-opacity-20` : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {item.icon}
                    </span>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 whitespace-nowrap overflow-hidden text-xs"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {isOpen && hasSubmenu && (
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform shrink-0",
                        isItemExpanded && "transform rotate-90"
                      )} />
                    )}
                    
                    {isOpen && item.badge && (
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full",
                        item.badge.variant === 'success' && "bg-green-600 text-white",
                        item.badge.variant === 'warning' && "bg-yellow-600 text-white",
                        item.badge.variant === 'danger' && "bg-red-600 text-white",
                        item.badge.variant === 'default' && "bg-blue-600 text-white",
                      )}>
                        {item.badge.text}
                      </span>
                    )}
                    
                    {isOpen && item.isNew && (
                      <span className="px-1.5 py-0.5 text-xs rounded-md bg-primary/20 text-primary font-medium">
                        Novo
                      </span>
                    )}
                  </Link>
                  
                  {/* Destaque para item ativo */}
                  {isItemActive && (
                    <motion.div
                      className={cn("absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-md", colors.accent)}
                      layoutId="activeItem"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </TooltipTrigger>
              {!isOpen && (
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.title}
                  {item.badge && (
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full",
                      item.badge.variant === 'success' && "bg-green-600 text-white",
                      item.badge.variant === 'warning' && "bg-yellow-600 text-white",
                      item.badge.variant === 'danger' && "bg-red-600 text-white",
                      item.badge.variant === 'default' && "bg-blue-600 text-white",
                    )}>
                      {item.badge.text}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 text-xs rounded-md bg-primary/20 text-primary font-medium">
                      Novo
                    </span>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          {/* Submenu */}
          {hasSubmenu && isItemExpanded && isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-10 mt-1 space-y-1"
            >
              {item.submenu!.map((subItem) => (
                <Link
                  key={subItem.title}
                  href={subItem.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all",
                    isActive(subItem.href) 
                      ? colors.active 
                      : `text-muted-foreground ${colors.hover}`
                  )}
                >
                  {subItem.icon}
                  <div className="text-xs font-medium leading-none text-muted-foreground">{subItem.title}</div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      <motion.aside
        className={cn(
          "h-[calc(100vh-4rem)] fixed left-0 top-16 z-30 flex flex-col border-r",
          colors.bg
        )}
        initial={isOpen ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex h-full flex-col">
          {/* Barra de rolagem para os itens de menu */}
          <ScrollArea className="flex-1 pt-3 px-3">
            <nav className="space-y-2">
              {renderMenuItems(menuItems)}
            </nav>
          </ScrollArea>
          
          {/* Rodapé da barra lateral - Item de Logout fixo na parte inferior */}
          <div className="sticky bottom-0 mt-auto p-3 border-t border-t-border/50">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/auth/logout"
                    className={cn(
                      "flex items-center px-4 py-3.5 rounded-md gap-3 text-xs font-medium transition-all",
                      "text-red-500 hover:bg-red-500/10 group"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          Sair
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right">
                    Sair
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
