"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiUser3Line,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiHome4Line,
  RiFileList3Line,
  RiCustomerService2Line,
  RiArrowRightSLine,
  RiSparklingLine,
  RiDashboardLine,
  RiLoginBoxLine,
} from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

const getMenuItems = (role: string) => {
  const baseItems = [
    {
      label: "Meu Perfil",
      icon: RiUser3Line,
      href: "/profile",
    },
    {
      label: "Configurações",
      icon: RiSettings4Line,
      href: "/settings",
    },
    {
      label: "Suporte",
      icon: RiCustomerService2Line,
      href: "/support",
    },
  ];

  if (role === "ADMIN" || role === "CORRETOR") {
    return [
      {
        label: "Dashboard",
        icon: RiDashboardLine,
        href: "/admin",
      },
      {
        label: "Meus Imóveis",
        icon: RiHome4Line,
        href: "/admin/imoveis",
      },
      {
        label: "Meus Contratos",
        icon: RiFileList3Line,
        href: "/admin/contratos",
      },
      ...baseItems,
    ];
  }

  return [
    {
      label: "Meus Favoritos",
      icon: RiHome4Line,
      href: "/favoritos",
    },
    ...baseItems,
  ];
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "CORRETOR":
      return "Corretor";
    case "CLIENTE":
      return "Cliente";
    default:
      return role;
  }
};

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  // Se está carregando, mostra placeholder
  if (isLoading) {
    return (
      <div className="w-24 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    );
  }

  // Se não está logado, mostra botão de login
  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm" className="gap-2">
          <RiLoginBoxLine className="w-4 h-4" />
          Entrar
        </Button>
      </Link>
    );
  }

  const menuItems = getMenuItems(user.role);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
            {user.name.charAt(0)}
          </div>
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full" />
        </div>

        {/* Name - hidden on mobile */}
        <span className="hidden lg:block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {user.name.split(" ")[0]}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <RiArrowRightSLine className="w-4 h-4 text-neutral-400 rotate-90" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
            >
              {/* User info header */}
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-sm text-orange-100 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-orange-600 bg-white rounded-full">
                    <RiSparklingLine className="w-3 h-3" />
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                {menuItems.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 2 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 transition-colors" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {item.label}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-neutral-200 dark:border-neutral-800">
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <RiLogoutBoxRLine className="w-5 h-5" />
                  <span className="text-sm font-medium">Sair da conta</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
