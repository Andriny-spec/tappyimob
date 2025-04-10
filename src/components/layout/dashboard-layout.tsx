'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Topbar } from './navigation/topbar';
import { Sidebar } from './navigation/sidebar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  variant: 'admin' | 'imobiliaria' | 'corretor' | 'cliente';
}

export function DashboardLayout({ children, variant }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Fecha a sidebar automaticamente em telas menores
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Verifica tamanho inicial
    checkScreenSize();

    // Adiciona listener para mudanças de tamanho de tela
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fecha a sidebar em telas móveis quando mudar de rota
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Toggle da sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar 
        variant={variant} 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
      />
      
      <div className="flex flex-1 mt-16">
        <Sidebar 
          variant={variant} 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
        />
        
        {/* Overlay para fechar o menu em dispositivos móveis */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <motion.main
          className="flex-1 transition-all p-0"
          initial={{ paddingLeft: isSidebarOpen ? (isMobile ? '0' : '280px') : '100px' }}
          animate={{ 
            paddingLeft: isSidebarOpen 
              ? (isMobile ? '0' : '280px') 
              : '100px'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div 
            className={cn(
              "w-full transition-all duration-300"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-[calc(100vh-10rem)]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
