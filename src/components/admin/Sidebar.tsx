"use client";

import { useState, useEffect } from "react";
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
  RiFlag2Line,
  RiVipCrownLine,
  RiToolsLine,
  RiToolsFill,
  RiHardDriveLine,
  RiHardDriveFill,
  RiFolderLine,
  RiDeleteBinLine,
  RiUploadCloud2Line,
  RiMailFill,
  RiMailSendLine,
  RiMailSettingsLine,
  RiShieldLine,
  RiHistoryLine,
  RiDownload2Line,
  RiWindow2Line,
  RiEyeOffLine,
  RiScales2Line,
  RiScales2Fill,
  RiSearchEyeLine,
  RiSearchEyeFill,
  RiWhatsappFill,
  RiAdvertisementLine,
  RiAdvertisementFill,
  RiFacebookCircleLine,
  RiInstagramLine,
  RiGoogleLine,
  RiLineChartLine,
  RiRadarLine,
  RiVipCrownFill,
} from "react-icons/ri";
import { useSidebar as useSidebarContext } from "@/components/admin/AdminLayoutClient";

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
    adminOnly?: boolean;
    moduleKey?: string; // permissão própria do sub-item (ex.: Captação)
  }[];
}

const menuItems: MenuItem[] = [
  {
    name: "Visão Geral",
    moduleKey: "dashboard",
    href: "/admin",
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
    badge: "234",
    submenu: [
      { name: "Todos os Imóveis", href: "/admin/imoveis" },
      { name: "Condomínios", href: "/admin/imoveis/condominios" },
      { name: "Captação", href: "/admin/captacao", icon: RiFlag2Line, moduleKey: "captacao" },
      // { name: "Exclusividades", href: "/admin/imoveis/exclusividades", icon: RiVipCrownLine },
      { name: "Imóveis do Site", href: "/admin/imoveis/site", adminOnly: true },
      { name: "Rankings", href: "/admin/imoveis/rankings" },
      { name: "Histórico", href: "/admin/imoveis/historico", icon: RiHistoryLine },
    ],
  },
  {
    name: "Clientes",
    moduleKey: "clientes",
    icon: RiUserLine,
    iconActive: RiUserFill,
    badge: "89",
    badgeColor: "blue",
    submenu: [
      { name: "Leads", href: "/admin/clientes/leads", badge: "23" },
      { name: "Off Market", href: "/admin/clientes/off-market", icon: RiEyeOffLine },
      { name: "Recepção SDR", href: "/admin/sdr", adminOnly: true },
      { name: "Acervo", href: "/admin/clientes/acervo" },
      { name: "Limbo", href: "/admin/clientes/limbo", adminOnly: true },
      { name: "Importações", href: "/admin/clientes/importacoes", adminOnly: true },
      { name: "Exportações", href: "/admin/clientes/exportacoes", adminOnly: true, icon: RiDownload2Line },
      { name: "Histórico", href: "/admin/clientes/historico" },
    ],
  },
  {
    name: "Leads Whats",
    moduleKey: "leads-whats",
    href: "/admin/leads-whats",
    icon: RiWhatsappFill,
    iconActive: RiWhatsappFill,
    badge: "Novo",
    badgeColor: "green",
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
    name: "Usuários",
    moduleKey: "usuarios",
    href: "/admin/usuarios",
    icon: RiShieldLine,
    iconActive: RiShieldLine,
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
    ],
  },
  {
    name: "Parcerias",
    moduleKey: "parcerias",
    href: "/admin/parcerias",
    icon: RiMindMap,
    iconActive: RiMindMap,
    badge: "Novo",
    badgeColor: "green",
  },
  {
    name: "Contratos",
    moduleKey: "contratos",
    icon: RiScales2Line,
    iconActive: RiScales2Fill,
    badge: "Novo",
    badgeColor: "blue",
    submenu: [
      { name: "Negócios", href: "/admin/negocio" },
      { name: "Novo Negócio", href: "/admin/negocio/novo" },
      { name: "Templates de Minuta", href: "/admin/negocio/templates" },
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
      { name: "Relatórios", href: "/admin/financeiro/relatorios" },
    ],
  },
  // {
  //   name: "Marketing",
  //   moduleKey: "marketing",
  //   icon: RiMegaphoneLine,
  //   iconActive: RiMegaphoneFill,
  //   badge: "Pro",
  //   badgeColor: "purple",
  //   submenu: [
  //     { name: "Campanhas", href: "/admin/marketing/campanhas" },
  //     { name: "Funis de Venda", href: "/admin/marketing/funis", icon: RiFilter3Line },
  //     { name: "Email Marketing", href: "/admin/marketing/email", icon: RiMailLine },
  //     { name: "WhatsApp", href: "/admin/marketing/whatsapp", icon: RiWhatsappLine },
  //     { name: "Landing Pages", href: "/admin/marketing/landing-pages" },
  //   ],
  // },
  {
    name: "Agendamentos",
    moduleKey: "agendamentos",
    icon: RiCalendarLine,
    iconActive: RiCalendarFill,
    badgeColor: "orange",
    submenu: [
      { name: "Calendário", href: "/admin/agendamentos" },
      { name: "Produção de Fotos", href: "/admin/agendamentos/fotos" },
      { name: "Agenda Fotógrafos", href: "/admin/agendamentos/fotos/agenda" },
      { name: "Fotógrafos", href: "/admin/fotografos" },
      { name: "Visitas", href: "/admin/agendamentos/visitas" },
      { name: "Follow-ups", href: "/admin/agendamentos/followups" },
    ],
  },
  {
    name: "Blog",
    moduleKey: "blog",
    icon: RiArticleLine,
    iconActive: RiArticleFill,
    submenu: [
      { name: "Todos os Posts", href: "/admin/blog" },
      { name: "Novo Post", href: "/admin/blog/novo", icon: RiEditLine },
      { name: "Categorias", href: "/admin/blog/categorias", icon: RiPriceTag3Line },
      { name: "Rascunhos", href: "/admin/blog?status=RASCUNHO" },
    ],
  },
  {
    name: "Site",
    moduleKey: "site",
    icon: RiGlobalLine,
    iconActive: RiGlobalFill,
    submenu: [
      { name: "Hero Slider", href: "/admin/site/hero-slider", icon: RiSlideshowLine },
      { name: "Carrossel Tipos", href: "/admin/site/carrossel-tipos", icon: RiLayoutGridLine },
      { name: "Pop-ups", href: "/admin/site/popups", icon: RiWindow2Line },
      { name: "Newsletter", href: "/admin/site/newsletter", icon: RiMailSendLine },
      { name: "Manutenção", href: "/admin/manutencao", icon: RiToolsLine },
    ],
  },
 
  {
    name: "Portais",
    moduleKey: "portais",
    icon: RiExchangeLine,
    iconActive: RiExchangeLine,
    submenu: [
      { name: "Dashboard", href: "/admin/imoveis/portais" },
      { name: "Categorias Anúncio", href: "/admin/imoveis/portais/anuncios" },
    ],
  },

  // SaaS: imobiliárias assinantes, cada uma com site e painel próprios.
  // Só administradores — é a gestão da plataforma, não da imobiliária.
  {
    name: "Assinantes SaaS",
    moduleKey: "saas",
    icon: RiVipCrownLine,
    iconActive: RiVipCrownFill,
    submenu: [
      { name: "Assinaturas", href: "/admin/saas/assinaturas", adminOnly: true },
      { name: "Sites", href: "/admin/saas/sites", adminOnly: true },
      { name: "Planos", href: "/admin/saas/planos", adminOnly: true },
      { name: "Configurações", href: "/admin/saas/configuracoes", adminOnly: true },
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
      { name: "Chat ao Vivo", href: "/admin/imob-ia/chat", icon: RiChat1Line },
      { name: "Leads IA", href: "/admin/clientes/leads", icon: RiUserStarLine },
      { name: "Automação", href: "/admin/imob-ia/automacao", icon: RiRobot2Line },
    ],
  },
  {
    name: "Tarefas",
    moduleKey: "tarefas",
    href: "/admin/tarefas",
    icon: RiLayoutGridLine,
    iconActive: RiLayoutGridLine,
    badge: "Kanban",
    badgeColor: "purple",
  },
  {
    name: "Relatórios",
    moduleKey: "relatorios",
    icon: RiBarChartLine,
    iconActive: RiBarChartFill,
    submenu: [
      { name: "Dashboard Insights", href: "/admin/relatorios" },
      { name: "Tempo de Atendimento", href: "/admin/relatorios/atendimento" },
      { name: "Funil por Corretor", href: "/admin/relatorios/funil" },
      { name: "Performance Equipe", href: "/admin/relatorios/performance" },
      { name: "Exportar", href: "/admin/relatorios/exportar" },
    ],
  },

  
  // {
  //   name: "Integrações",
  //   moduleKey: "integracoes",
  //   icon: RiPlugLine,
  //   iconActive: RiPlugFill,
  //   submenu: [
  //     { name: "Marketplace", href: "/admin/integracoes" },
  //     { name: "Portais", href: "/admin/integracoes/portais" },
  //     { name: "WhatsApp API", href: "/admin/integracoes/whatsapp" },
  //     { name: "Webhooks", href: "/admin/integracoes/webhooks" },
  //     { name: "API Keys", href: "/admin/integracoes/api" },
  //   ],
  // },
  
  {
    name: "Analytics",
    moduleKey: "marketing-analytics",
    href: "/admin/marketing/analytics",
    icon: RiLineChartLine,
    iconActive: RiLineChartLine,
  },
  {
    name: "Facebook",
    moduleKey: "marketing-facebook",
    href: "/admin/marketing/facebook",
    icon: RiFacebookCircleLine,
    iconActive: RiFacebookCircleLine,
  },
  {
    name: "Instagram",
    moduleKey: "marketing-instagram",
    href: "/admin/marketing/instagram",
    icon: RiInstagramLine,
    iconActive: RiInstagramLine,
  },
  {
    name: "Google",
    moduleKey: "marketing-google",
    href: "/admin/marketing/google",
    icon: RiGoogleLine,
    iconActive: RiGoogleLine,
  },
  {
    name: "Insights",
    moduleKey: "marketing-insights",
    href: "/admin/marketing/insights",
    icon: RiRadarLine,
    iconActive: RiRadarLine,
  },
  {
    name: "Config. Marketing",
    moduleKey: "marketing-configuracoes",
    href: "/admin/marketing/configuracoes",
    icon: RiAdvertisementLine,
    iconActive: RiAdvertisementFill,
  },
  {
    name: "Configurações",
    moduleKey: "configuracoes",
    icon: RiSettings4Line,
    iconActive: RiSettings4Fill,
    submenu: [
      { name: "Geral", href: "/admin/configuracoes" },
      // { name: "Empresa", href: "/admin/configuracoes/empresa" },
      // { name: "Usuários", href: "/admin/configuracoes/usuarios" },
      // { name: "Permissões", href: "/admin/configuracoes/permissoes" },
      { name: "Notificações", href: "/admin/configuracoes/notificacoes" },
      // { name: "Personalização", href: "/admin/configuracoes/personalizacao" },
      { name: "Marca d'Água", href: "/admin/configuracoes/marca-dagua" },
    ],
  },
  // {
  //   name: "Manutenção",
  //   moduleKey: "manutencao",
  //   href: "/admin/manutencao",
  //   icon: RiToolsLine,
  //   iconActive: RiToolsFill,
  //   badge: "⚙️",
  //   badgeColor: "orange",
  // },
  {
    name: "Storage",
    moduleKey: "storage",
    icon: RiHardDriveLine,
    iconActive: RiHardDriveFill,
    badge: "Novo",
    badgeColor: "blue",
    submenu: [
      { name: "Arquivos", href: "/admin/storage", icon: RiFolderLine },
      { name: "Upload", href: "/admin/storage/upload", icon: RiUploadCloud2Line },
      { name: "Lixeira", href: "/admin/storage/lixeira", icon: RiDeleteBinLine },
    ],
  },
  {
    name: "Emails Imob",
    moduleKey: "emails",
    icon: RiMailLine,
    iconActive: RiMailFill,
    badge: "Novo",
    badgeColor: "blue",
    submenu: [
      { name: "Contas de Email", href: "/admin/emails", icon: RiMailLine },
      { name: "Enviados", href: "/admin/emails/enviados", icon: RiMailSendLine },
      { name: "Configurações", href: "/admin/emails/configuracoes", icon: RiMailSettingsLine },
    ],
  },
   {
    name: "Multi Sites",
    moduleKey: "multi-sites",
    icon: RiGlobalLine,
    iconActive: RiGlobalFill,
    badge: "Novo",
    badgeColor: "blue",
    submenu: [
      { name: "Parceiros", href: "/admin/multi-sites/parceiros", icon: RiTeamLine },
      { name: "Domínios", href: "/admin/multi-sites/dominios", icon: RiGlobalLine },
      { name: "Permissões", href: "/admin/multi-sites/permissoes", icon: RiKeyLine },
      { name: "Relatórios", href: "/admin/multi-sites/relatorios", icon: RiBarChartLine },
    ],
  },
  
];

// Todas as moduleKeys disponíveis (exportadas para uso na página de Usuários)
export const ALL_MODULE_KEYS = [
  ...menuItems.map(item => ({ key: item.moduleKey, label: item.name })),
  // sub-itens com permissão própria (ex.: Imóveis → Captação)
  ...menuItems.flatMap(item =>
    (item.submenu || [])
      .filter((sub: any) => sub.moduleKey)
      .map((sub: any) => ({ key: sub.moduleKey as string, label: `${item.name} → ${sub.name}` }))
  ),
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isHoverExpanded, setIsHoverExpanded } = useSidebarContext();
  const { user, logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["Imóveis"]);
  const [followUpCount, setFollowUpCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/agendamentos/followups/count")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.count != null) setFollowUpCount(d.count); })
      .catch(() => {});
  }, []);

  // Quando colapsada + hover, exibe expandida visualmente
  const effectiveCollapsed = isCollapsed && !isHoverExpanded;

  // Filtrar menu baseado em permissões do usuário
  const isAdminFullAccess = user?.role === "ADMIN" && (!user.allowedModules || user.allowedModules.length === 0);
  const allowedSet = new Set(user?.allowedModules || []);
  const visibleMenuItems = isAdminFullAccess
    ? menuItems
    : menuItems.filter(item => allowedSet.has(item.moduleKey));

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(name) ? [] : [name] // Fecha todos e abre apenas o clicado
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 ${effectiveCollapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/admin" className="flex items-center gap-2">
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
              <span className="text-[10px] text-neutral-500 -mt-1">{user?.role === "MARKETING" ? "Painel Marketing" : "Admin Panel"}</span>
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
      <nav className="flex-1 overflow-y-auto scrollbar-orange py-4 px-3 space-y-1">
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
                      {(item.badge || (item.name === "Agendamentos" && followUpCount != null && followUpCount > 0)) && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          item.badgeColor === "blue" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                          item.badgeColor === "green" ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                          item.badgeColor === "purple" ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" :
                          item.badgeColor === "orange" ? "bg-[#0B2545]/10 text-[#0B2545] dark:bg-[#0B2545]/20 dark:text-blue-300" :
                          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}>
                          {item.name === "Agendamentos" && followUpCount != null ? followUpCount : item.badge}
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
                            .filter((sub) => !sub.adminOnly || user?.role === "ADMIN")
                            .filter((sub) => !sub.moduleKey || isAdminFullAccess || allowedSet.has(sub.moduleKey))
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
            href="/admin/ajuda"
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
