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
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMenuLine,
  RiCloseLine,
  RiLogoutBoxRLine,
  RiAddCircleLine,
} from "react-icons/ri";
import { useSidebar } from "@/components/parceiro/ParceiroLayoutClient";

const menuItems = [
  {
    name: "Dashboard",
    href: "/parceiro",
    icon: RiHome4Line,
    iconActive: RiHome4Fill,
    exact: true,
  },
  {
    name: "Meus Imóveis",
    href: "/parceiro/imoveis",
    icon: RiBuilding2Line,
    iconActive: RiBuilding2Fill,
  },
  {
    name: "Meus Dados",
    href: "/parceiro/dados",
    icon: RiUserLine,
    iconActive: RiUserFill,
  },
];

export function ParceiroSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const isActive = (item: (typeof menuItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-transform lg:transition-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B2545] to-[#081733] flex items-center justify-center flex-shrink-0">
                  <RiHome4Line className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm text-neutral-900 dark:text-white whitespace-nowrap">
                  Tappy <span className="text-[#0B2545] dark:text-sky-400">Parceiro</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          >
            {isCollapsed ? <RiArrowRightSLine className="w-4 h-4" /> : <RiArrowLeftSLine className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item);
            const Icon = active ? item.iconActive : item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  active
                    ? "bg-[#0B2545] text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* Novo imóvel CTA */}
          <div className="pt-2">
            <Link
              href="/parceiro/imoveis/novo"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20`}
              title={isCollapsed ? "Novo Imóvel" : undefined}
            >
              <RiAddCircleLine className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                  >
                    Novo Imóvel
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </nav>

        {/* Footer — user */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-[#0B2545] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">Parceiro externo</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1 ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Sair" : undefined}
          >
            <RiLogoutBoxRLine className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
