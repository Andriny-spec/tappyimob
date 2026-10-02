"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RiMenuLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";
import { useSidebar } from "@/components/parceiro/ParceiroLayoutClient";

export function ParceiroTopbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setIsMobileOpen } = useSidebar();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <RiMenuLine className="w-5 h-5" />
        </button>
        <div className="hidden lg:block">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Bem-vindo, <span className="font-semibold text-neutral-900 dark:text-white">{user?.name}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {resolvedTheme === "dark" ? <RiSunLine className="w-5 h-5" /> : <RiMoonLine className="w-5 h-5" />}
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-[#0B2545] flex items-center justify-center">
          <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
