'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, 
  User, 
  Sun, 
  Moon, 
  Maximize, 
  Minimize,
  Menu,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TopbarProps = {
  variant: 'admin' | 'imobiliaria' | 'corretor' | 'cliente';
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export function Topbar({ variant, onToggleSidebar, isSidebarOpen }: TopbarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; description: string; isRead: boolean }[]>([
    { id: '1', title: 'Nova mensagem', description: 'Você recebeu uma nova mensagem', isRead: false },
    { id: '2', title: 'Atualização', description: 'Sistema atualizado para a versão 2.0', isRead: false }
  ]);

  // Verificar o modo de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Alternar entre modo tela cheia e normal
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Erro ao tentar entrar em modo tela cheia: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Erro ao alternar modo tela cheia:', error);
    }
  };

  // Obter cores baseadas na variante
  const getVariantColors = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gradient-to-r from-[#0f172a] to-primary text-white';
      case 'imobiliaria':
        return 'bg-gradient-to-r from-[#0f172a] to-primary text-white';
      case 'corretor':
        return 'bg-gradient-to-r from-purple-600 to-purple-800 text-white';
      case 'cliente':
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <motion.header
      className={cn(
        "h-16 px-4 flex items-center justify-between z-50 fixed top-0 left-0 right-0",
        getVariantColors()
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Lado Esquerdo: Logo e Toggle do Menu */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar}
          className="text-white hover:bg-white/20"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <Link href="/dashboard" className="flex items-center">
          <Image 
            src="/TAPPY - SOMENTE A LOGO - VERDE.svg"
            alt="TappyImob Logo"
            width={36}
            height={36}
            className="mr-2"
          />
          <span className="font-bold text-lg hidden sm:inline-block">
            TappyImob
            {variant === 'admin' && ' Admin'}
            {variant === 'imobiliaria' && ' Imobiliária'}
            {variant === 'corretor' && ' Corretor'}
            {variant === 'cliente' && ' Cliente'}
          </span>
        </Link>
      </div>
      
      {/* Lado Direito: Ícones e Menu do Usuário */}
      <div className="flex items-center space-x-2">
        {/* Notificações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
              <Bell className="h-5 w-5" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-2 py-4 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    !notification.isRead && "bg-muted/50"
                  )}>
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notification.description}</div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Ver todas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Alternar Tema */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-white hover:bg-white/20"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {/* Tela Cheia */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullscreen}
          className="text-white hover:bg-white/20"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
        
        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/20">
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:flex md:flex-col md:items-start">
                <span className="text-sm font-medium">{session?.user?.name || 'Usuário'}</span>
                <span className="text-xs opacity-80">{session?.user?.email || 'usuario@tappyimob.com'}</span>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
