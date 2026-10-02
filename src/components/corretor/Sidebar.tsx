"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import {
  RiHome4Line,
  RiHome4Fill,
  RiBuilding2Line,
  RiBuilding2Fill,
  RiUserLine,
  RiUserFill,
  RiTeamLine,
  RiTeamFill,
  RiMoneyDollarCircleLine,
  RiMoneyDollarCircleFill,
  RiMegaphoneLine,
  RiMegaphoneFill,
  RiCalendarLine,
  RiCalendarFill,
  RiBarChartLine,
  RiBarChartFill,
  RiSettings4Line,
  RiSettings4Fill,
  RiPlugLine,
  RiPlugFill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiCloseLine,
  RiWhatsappLine,
  RiMailLine,
  RiFilter3Line,
  RiFlag2Line,
  RiSearchEyeLine,
  RiSearchEyeFill,
  RiRobot2Line,
  RiMapPinLine,
  RiKeyLine,
  RiHandCoinLine,
  RiExchangeLine,
  RiCustomerService2Line,
  RiSparklingLine,
  RiSparklingFill,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiChat1Line,
  RiChat1Fill,
  RiUserStarLine,
  RiArticleLine,
  RiArticleFill,
  RiPriceTag3Line,
  RiEditLine,
  RiGlobalLine,
  RiGlobalFill,
  RiSlideshowLine,
  RiLayoutGridLine,
  RiMindMap,
  RiToolsLine,
  RiToolsFill,
  RiHardDriveLine,
  RiHardDriveFill,
  RiFolderLine,
  RiUploadCloud2Line,
  RiDeleteBinLine,
  RiMailFill,
  RiMailSendLine,
  RiMailSettingsLine,
  RiShieldLine,
  RiScales2Line,
  RiScales2Fill,
} from "react-icons/ri";
import { useSidebar as useSidebarContext } from "@/components/corretor/CorretorLayoutClient";

interface MenuItem {
  name: string;
  moduleKey: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconActive: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  submenu?: {
    name: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
    moduleKey?: string; // permissão própria do sub-item (ex.: Captação)
  }[];
}

const menuItems: MenuItem[] = [
  {
    name: "Visão Geral",
    moduleKey: "dashboard",
    href: "/corretor",
    icon: RiHome4Line,
    iconActive: RiHome4Fill,
  },
  {
    name: "Tappy IA",
    moduleKey: "tappy-ia",
    href: "/tappy-ia",
    icon: RiSparklingLine,
    iconActive: RiSparklingFill,
    badge: "IA",
    badgeColor: "orange",
  },
  {
    name: "Imóveis",
    moduleKey: "imoveis",
    icon: RiBuilding2Line,
    iconActive: RiBuilding2Fill,
    submenu: [
      { name: "Todos os Imóveis", href: "/corretor/imoveis" },
      { name: "Condomínios", href: "/corretor/imoveis/condominios" },
      { name: "Captação", href: "/admin/captacao", icon: RiFlag2Line, moduleKey: "captacao" },
      { name: "Rankings", href: "/corretor/imoveis/rankings", icon: RiBarChartLine },
    ],
  },
  {
    name: "Clientes",
    moduleKey: "clientes",
    icon: RiUserLine,
    iconActive: RiUserFill,
    submenu: [
      { name: "Leads", href: "/corretor/clientes/leads" },
      { name: "Acervo", href: "/corretor/clientes/acervo" },
      { name: "Histórico", href: "/corretor/clientes/historico" },
    ],
  },
  {
    name: "BuscaImob",
    moduleKey: "tappy-iq",
    href: "/admin/tappy-iq",
    icon: RiSearchEyeLine,
    iconActive: RiSearchEyeFill,
    badge: "Novo",
    badgeColor: "green",
  },
  {
    name: "Agendamentos",
    moduleKey: "agendamentos",
    icon: RiCalendarLine,
    iconActive: RiCalendarFill,
    submenu: [
      { name: "Agenda", href: "/corretor/agenda" },
      { name: "Visitas", href: "/corretor/agendamentos/visitas" },
      { name: "Follow-ups", href: "/corretor/agendamentos/followups" },
    ],
  },
  {
    name: "Imob IA",
    moduleKey: "imob-ia",
    icon: RiSparklingLine,
    iconActive: RiSparklingFill,
    badge: "✨",
    badgeColor: "purple",
    submenu: [
      { name: "Chat ao Vivo", href: "/corretor/imob-ia/chat", icon: RiChat1Line },
      { name: "Leads IA", href: "/corretor/clientes/leads", icon: RiUserStarLine },
    ],
  },
  {
    name: "Relatórios",
    moduleKey: "relatorios",
    icon: RiBarChartLine,
    iconActive: RiBarChartFill,
    submenu: [
      { name: "Minha Performance", href: "/corretor/relatorios" },
      { name: "Vendas", href: "/corretor/relatorios/vendas" },
      { name: "Conversão", href: "/corretor/relatorios/conversao" },
    ],
  },
  {
    name: "Vendedores",
    moduleKey: "vendedores",
    href: "/admin/vendedores",
    icon: RiUserStarLine,
    iconActive: RiUserStarLine,
  },
  {
    name: "Corretores",
    moduleKey: "corretores",
    icon: RiTeamLine,
    iconActive: RiTeamFill,
    submenu: [
      { name: "Equipe", href: "/admin/corretores" },
      { name: "Comissões", href: "/admin/corretores/comissoes", icon: RiHandCoinLine },
      { name: "Metas", href: "/admin/corretores/metas" },
      { name: "Ranking", href: "/admin/corretores/ranking" },
    ],
  },
  {
    name: "Parcerias",
    moduleKey: "parcerias",
    href: "/admin/parcerias",
    icon: RiMindMap,
    iconActive: RiMindMap,
  },
  {
    name: "Contratos",
    moduleKey: "contratos",
    icon: RiScales2Line,
    iconActive: RiScales2Fill,
    submenu: [
      { name: "Meus Negócios", href: "/admin/negocio" },
      { name: "Novo Negócio", href: "/admin/negocio/novo" },
    ],
  },
  {
    name: "Financeiro",
    moduleKey: "financeiro",
    icon: RiMoneyDollarCircleLine,
    iconActive: RiMoneyDollarCircleFill,
    submenu: [
      { name: "Dashboard", href: "/admin/financeiro" },
      { name: "Receitas", href: "/admin/financeiro/receitas" },
      { name: "Despesas", href: "/admin/financeiro/despesas" },
      { name: "Comissões", href: "/admin/financeiro/comissoes" },
    ],
  },
  {
    name: "Marketing",
    moduleKey: "marketing",
    icon: RiMegaphoneLine,
    iconActive: RiMegaphoneFill,
    submenu: [
      { name: "Campanhas", href: "/admin/marketing/campanhas" },
      { name: "Email Marketing", href: "/admin/marketing/email" },
      { name: "WhatsApp", href: "/admin/marketing/whatsapp" },
    ],
  },
  {
    name: "Blog",
    moduleKey: "blog",
    icon: RiArticleLine,
    iconActive: RiArticleFill,
    submenu: [
      { name: "Todos os Posts", href: "/admin/blog" },
      { name: "Novo Post", href: "/admin/blog/novo" },
    ],
  },
  {
    name: "Site",
    moduleKey: "site",
    icon: RiGlobalLine,
    iconActive: RiGlobalFill,
    submenu: [
      { name: "Hero Slider", href: "/admin/site/hero-slider" },
      { name: "Carrossel Tipos", href: "/admin/site/carrossel-tipos" },
    ],
  },
  {
    name: "Multi Sites",
    moduleKey: "multi-sites",
    icon: RiGlobalLine,
    iconActive: RiGlobalFill,
    submenu: [
      { name: "Parceiros", href: "/admin/multi-sites/parceiros" },
      { name: "Domínios", href: "/admin/multi-sites/dominios" },
    ],
  },
  {
    name: "Portais",
    moduleKey: "portais",
    href: "/admin/imoveis/portais",
    icon: RiExchangeLine,
    iconActive: RiExchangeLine,
  },
  {
    name: "Tarefas",
    moduleKey: "tarefas",
    href: "/corretor/agendamentos/followups",
    icon: RiLayoutGridLine,
    iconActive: RiLayoutGridLine,
  },
  {
    name: "Integrações",
    moduleKey: "integracoes",
    icon: RiPlugLine,
    iconActive: RiPlugFill,
    submenu: [
      { name: "Marketplace", href: "/admin/integracoes" },
      { name: "WhatsApp API", href: "/admin/integracoes/whatsapp" },
    ],
  },
  {
    name: "Manutenção",
    moduleKey: "manutencao",
    href: "/admin/manutencao",
    icon: RiToolsLine,
    iconActive: RiToolsFill,
  },
  {
    name: "Storage",
    moduleKey: "storage",
    icon: RiHardDriveLine,
    iconActive: RiHardDriveFill,
    submenu: [
      { name: "Arquivos", href: "/admin/storage" },
      { name: "Upload", href: "/admin/storage/upload" },
    ],
  },
  {
    name: "Emails Imob",
    moduleKey: "emails",
    icon: RiMailLine,
    iconActive: RiMailFill,
    submenu: [
      { name: "Contas de Email", href: "/admin/emails" },
      { name: "Enviados", href: "/admin/emails/enviados" },
    ],
  },
  {
    name: "Usuários",
    moduleKey: "usuarios",
    href: "/admin/usuarios",
    icon: RiShieldLine,
    iconActive: RiShieldLine,
  },
  {
    name: "Configurações",
    moduleKey: "configuracoes",
    icon: RiSettings4Line,
    iconActive: RiSettings4Fill,
    submenu: [
      { name: "Meu Perfil", href: "/corretor/configuracoes" },
      { name: "Notificações", href: "/corretor/configuracoes/notificacoes" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isHoverExpanded, setIsHoverExpanded } = useSidebarContext();
  const { user, logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["Imóveis"]);

  // Quando colapsada + hover, exibe expandida visualmente
  const effectiveCollapsed = isCollapsed && !isHoverExpanded;

  // Filtrar menu baseado em permissões do usuário
  const allowedSet = new Set(user?.allowedModules || []);
  const hasModules = allowedSet.size > 0;
  // Dashboard e Tappy IA sempre visíveis; demais módulos filtrados por allowedModules
  const ALWAYS_VISIBLE = new Set(["dashboard", "tappy-ia"]);
  const visibleMenuItems = hasModules
    ? menuItems.filter(item => ALWAYS_VISIBLE.has(item.moduleKey) || allowedSet.has(item.moduleKey))
    : menuItems.filter(item => ALWAYS_VISIBLE.has(item.moduleKey) || item.moduleKey === "imoveis");

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(name) ? [] : [name] // Fecha todos e abre apenas o clicado
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/corretor") return pathname === "/corretor";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 ${effectiveCollapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/corretor" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#0B2545] flex items-center justify-center flex-shrink-0">
            <RiHome4Line className="w-5 h-5 text-white" />
          </div>
          {!effectiveCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                Tappy<span className="text-[#0B2545]"> Imóvel</span>
              </span>
              <span className="text-[10px] text-neutral-500 -mt-1">Admin Panel</span>
            </motion.div>
          )}
        </Link>
        
        {!effectiveCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 lg:flex hidden"
          >
            <RiArrowLeftSLine className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleMenuItems.map((item) => {
          const active = isActive(item.href) || item.submenu?.some((sub) => isActive(sub.href));
          const isOpen = openSubmenus.includes(item.name);

          return (
            <div key={item.name}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    active
                      ? "bg-[#0B2545]/10 dark:bg-[#0B2545]/20 text-[#0B2545] dark:text-blue-300"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {active ? (
                    <item.iconActive className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                  )}
                  {!effectiveCollapsed && (
                    <>
                      <span className="flex-1 font-medium text-sm">{item.name}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          item.badgeColor === "blue" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                          item.badgeColor === "green" ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                          item.badgeColor === "purple" ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" :
                          item.badgeColor === "orange" ? "bg-[#0B2545]/10 text-[#0B2545] dark:bg-[#0B2545]/20 dark:text-blue-300" :
                          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? "bg-[#0B2545]/10 dark:bg-[#0B2545]/20 text-[#0B2545] dark:text-blue-300"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {active ? (
                      <item.iconActive className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    {!effectiveCollapsed && (
                      <>
                        <span className="flex-1 text-left font-medium text-sm">{item.name}</span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            item.badgeColor === "blue" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                            item.badgeColor === "green" ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                            item.badgeColor === "purple" ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" :
                            item.badgeColor === "orange" ? "bg-[#0B2545]/10 text-[#0B2545] dark:bg-[#0B2545]/20 dark:text-blue-300" :
                            "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RiArrowDownSLine className="w-4 h-4" />
                        </motion.div>
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  <AnimatePresence>
                    {isOpen && !effectiveCollapsed && item.submenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-4 mt-1 space-y-1 border-l-2 border-neutral-200 dark:border-neutral-700">
                          {item.submenu
                            .filter((sub) => !sub.moduleKey || ALWAYS_VISIBLE.has(sub.moduleKey) || allowedSet.has(sub.moduleKey))
                            .map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                isActive(sub.href)
                                  ? "text-[#0B2545] dark:text-blue-300 bg-[#0B2545]/5 dark:bg-[#0B2545]/10"
                                  : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              }`}
                            >
                              {sub.icon && <sub.icon className="w-4 h-4" />}
                              <span>{sub.name}</span>
                              {sub.badge && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#0B2545]/10 text-[#0B2545] dark:bg-[#0B2545]/20 dark:text-blue-300 rounded-full">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-neutral-200 dark:border-neutral-800 p-3 ${effectiveCollapsed ? "items-center" : ""}`}>

        {/* Help & Logout */}
        <div className="space-y-1">
          <Link
            href="/corretor/ajuda"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${effectiveCollapsed ? "justify-center" : ""}`}
          >
            <RiQuestionLine className="w-5 h-5" />
            {!effectiveCollapsed && <span className="text-sm font-medium">Central de Ajuda</span>}
          </Link>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ${effectiveCollapsed ? "justify-center" : ""}`}
          >
            <RiLogoutBoxRLine className="w-5 h-5" />
            {!effectiveCollapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>

        {/* Collapse button */}
        {effectiveCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center mt-2 p-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowRightSLine className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: effectiveCollapsed ? 80 : 288 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onMouseEnter={() => { if (isCollapsed) setIsHoverExpanded(true); }}
        onMouseLeave={() => { if (isCollapsed) setIsHoverExpanded(false); }}
        className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-40 hidden lg:flex flex-col ${isHoverExpanded ? "shadow-2xl" : ""}`}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-900 z-50 lg:hidden flex flex-col"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
