"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMenuLine,
  RiNotification3Line,
  RiMessage3Line,
  RiSunLine,
  RiMoonLine,
  RiAddLine,
  RiUserAddLine,
  RiCalendarCheckLine,
  RiArrowDownSLine,
  RiCheckDoubleLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiBuilding2Line,
} from "react-icons/ri";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSidebar } from "@/components/corretor/CorretorLayoutClient";
import { useAuth } from "@/providers/auth-provider";
import { TaskNotifications } from "@/components/admin/TaskNotifications";

const quickActions = [
  { icon: RiBuilding2Line, label: "Novo Imóvel", href: "/corretor/imoveis/novo", color: "orange" },
  { icon: RiCalendarCheckLine, label: "Agendar Visita", href: "/corretor/agendamentos/visitas", color: "purple" },
];

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

const messages: Array<{ id: number; name: string; message: string; time: string; avatar: null; unread: boolean }> = [];

export function Topbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar notificações reais do banco
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications?limit=10");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Agora";
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Erro ao marcar notificações:", error);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const closeAll = () => {
    setShowQuickActions(false);
    setShowNotifications(false);
    setShowMessages(false);
    setShowProfile(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              <RiMenuLine className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Page title */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Visão Geral
              </h1>
              <p className="text-xs text-neutral-500">
                Bem-vindo de volta, {user?.name?.split(" ")[0] || "Usuário"}! 👋
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Quick actions */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  closeAll();
                  setShowQuickActions(!showQuickActions);
                }}
                className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-[#0B2545] text-white hover:bg-[#081733] transition-colors"
              >
                <RiAddLine className="w-4 h-4" />
                <span className="text-sm font-medium">Novo</span>
                <RiArrowDownSLine className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
                  >
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        onClick={() => setShowQuickActions(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          action.color === "orange" ? "bg-[#0B2545]/10 text-[#0B2545] dark:bg-[#0B2545]/20 dark:text-blue-300" :
                          action.color === "blue" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                          action.color === "green" ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                          "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                        }`}>
                          <action.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                          {action.label}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              {isFullscreen ? (
                <RiFullscreenExitLine className="w-5 h-5" />
              ) : (
                <RiFullscreenLine className="w-5 h-5" />
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              {mounted && resolvedTheme === "dark" ? (
                <RiSunLine className="w-5 h-5" />
              ) : (
                <RiMoonLine className="w-5 h-5" />
              )}
            </button>

            {/* Messages */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAll();
                  setShowMessages(!showMessages);
                }}
                className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                <RiMessage3Line className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showMessages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Mensagens</h3>
                      <span className="text-xs text-neutral-500">{unreadMessages} novas</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {messages.map((msg) => (
                        <button
                          key={msg.id}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#0B2545] flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {msg.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-neutral-900 dark:text-white">{msg.name}</span>
                              <span className="text-xs text-neutral-400">{msg.time}</span>
                            </div>
                            <p className="text-sm text-neutral-500 truncate">{msg.message}</p>
                          </div>
                          {msg.unread && (
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-neutral-200 dark:border-neutral-700">
                      <Link
                        href="/corretor/mensagens"
                        className="block w-full py-2 text-center text-sm font-medium text-[#0B2545] hover:bg-[#0B2545]/5 dark:text-blue-300 dark:hover:bg-[#0B2545]/10 rounded-lg transition-colors"
                      >
                        Ver todas as mensagens
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Task & Visit Notifications */}
            <TaskNotifications />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAll();
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                <RiNotification3Line className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Notificações</h3>
                      {unreadNotifications > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-[#0B2545] dark:text-blue-300 hover:underline flex items-center gap-1">
                          <RiCheckDoubleLine className="w-3 h-3" />
                          Marcar todas
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="px-4 py-6 text-center text-sm text-neutral-500">Carregando...</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-neutral-500">Nenhuma notificação</div>
                      ) : (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            href={notif.link || "#"}
                            onClick={() => setShowNotifications(false)}
                            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left ${
                              !notif.read ? "bg-[#0B2545]/5 dark:bg-[#0B2545]/10" : ""
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notif.type.includes("lead") ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                              notif.type.includes("visit") ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" :
                              "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                            }`}>
                              {notif.type.includes("lead") ? <RiUserAddLine className="w-4 h-4" /> : <RiBuilding2Line className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-neutral-900 dark:text-white">{notif.title}</span>
                                <span className="text-xs text-neutral-400">{getTimeAgo(notif.createdAt)}</span>
                              </div>
                              <p className="text-sm text-neutral-500 truncate">{notif.message}</p>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-[#0B2545] rounded-full flex-shrink-0 mt-2" />
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-neutral-200 dark:border-neutral-700">
                      <Link
                        href="/corretor/notificacoes"
                        className="block w-full py-2 text-center text-sm font-medium text-[#0B2545] hover:bg-[#0B2545]/5 dark:text-blue-300 dark:hover:bg-[#0B2545]/10 rounded-lg transition-colors"
                      >
                        Ver todas as notificações
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAll();
                  setShowProfile(!showProfile);
                }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0B2545] flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "C"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{user?.name?.split(" ")[0] || "Corretor"}</p>
                  <p className="text-[10px] text-neutral-500">Corretor</p>
                </div>
                <RiArrowDownSLine className="w-4 h-4 text-neutral-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="font-semibold text-neutral-900 dark:text-white">{user?.name || "Corretor"}</p>
                      <p className="text-xs text-neutral-500">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/corretor/configuracoes"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                      >
                        <RiSettings4Line className="w-4 h-4" />
                        Configurações
                      </Link>
                      <Link
                        href="/corretor/ajuda"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                      >
                        <RiQuestionLine className="w-4 h-4" />
                        Ajuda
                      </Link>
                    </div>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 py-1">
                      <button 
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <RiLogoutBoxRLine className="w-4 h-4" />
                        Sair da conta
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close dropdowns */}
      {(showQuickActions || showNotifications || showMessages || showProfile) && (
        <div
          className="fixed inset-0 z-20"
          onClick={closeAll}
        />
      )}
    </>
  );
}
