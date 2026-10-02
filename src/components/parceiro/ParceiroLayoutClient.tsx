"use client";

import { useState, createContext, useContext } from "react";
import { ParceiroSidebar } from "@/components/parceiro/ParceiroSidebar";
import { ParceiroTopbar } from "@/components/parceiro/ParceiroTopbar";
import { QueryProvider } from "@/providers/QueryProvider";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function ParceiroLayoutClient({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <QueryProvider>
      <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
          <ParceiroSidebar />
          <div className={`transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
            <ParceiroTopbar />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </SidebarContext.Provider>
    </QueryProvider>
  );
}
