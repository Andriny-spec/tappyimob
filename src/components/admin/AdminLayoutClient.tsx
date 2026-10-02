"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { QueryProvider } from "@/providers/QueryProvider";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
  isHoverExpanded: boolean;
  setIsHoverExpanded: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  isHoverExpanded: false,
  setIsHoverExpanded: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  return (
    <QueryProvider>
      <SidebarContext.Provider
        value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isHoverExpanded, setIsHoverExpanded }}
      >
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <div
            className={`transition-all duration-300 ${
              isCollapsed ? "lg:pl-20" : "lg:pl-72"
            }`}
          >
            {/* Topbar */}
            <Topbar />

            {/* Page content */}
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </SidebarContext.Provider>
    </QueryProvider>
  );
}
