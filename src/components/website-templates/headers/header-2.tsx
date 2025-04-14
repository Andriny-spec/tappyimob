import React, { useState } from 'react';
import { Menu, X, Search, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  logoUrl: string;
  nomeSite: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  telefone?: string;
  endereco?: string;
  className?: string;
}

export function Header2({
  logoUrl,
  nomeSite,
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  telefone,
  endereco,
  className
}: HeaderProps) {
  // Usa o pathname para extrair o segmento da imobiliária
  const pathname = usePathname();
  const imobiliariaSegment = pathname?.split('/')?.[1] || '';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // URLs dinâmicas que serão definidas posteriormente
  const links = [
    { nome: 'Home', url: `/${imobiliariaSegment}/home` },
    { nome: 'Comprar', url: `/${imobiliariaSegment}/imoveis?tipo=venda` },
    { nome: 'Alugar', url: `/${imobiliariaSegment}/imoveis?tipo=aluguel` },
    { nome: 'Sobre', url: `/${imobiliariaSegment}/sobre` },
    { nome: 'Contato', url: `/${imobiliariaSegment}/atendimento` }
  ];

  const headerStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
  } as React.CSSProperties;

  return (
    <header 
      className={cn("w-full bg-white sticky top-0 z-50 shadow-sm", className)}
      style={headerStyle}
    >
      {/* Barra superior com telefone e endereço */}
      <div className="w-full py-2 hidden md:block" style={{ backgroundColor: 'var(--cor-primaria)' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {telefone && (
                <div className="flex items-center text-white text-sm">
                  <span>{telefone}</span>
                </div>
              )}
              {endereco && (
                <div className="flex items-center text-white text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{endereco}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/favoritos" className="text-white text-sm flex items-center hover:underline">
                <Heart className="h-3 w-3 mr-1" />
                <span>Favoritos</span>
              </Link>
              <Link href="/atendimento" className="text-white text-sm hover:underline">
                Atendimento
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Menu principal */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {logoUrl ? (
              <div className="relative h-12 w-44">
                <Image 
                  src={logoUrl} 
                  alt={nomeSite} 
                  fill 
                  style={{ objectFit: 'contain' }} 
                  className="w-auto h-auto"
                />
              </div>
            ) : (
              <div 
                className="text-xl font-bold" 
                style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}
              >
                {nomeSite || 'Imobiliária Premium'}
              </div>
            )}
          </div>

          {/* Menu de navegação desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.nome}
                href={link.url}
                className="font-medium hover:text-primary transition duration-200"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                {link.nome}
              </Link>
            ))}
          </nav>

          {/* Botão de pesquisa */}
          <div className="hidden md:flex">
            <Button 
              size="sm"
              className="gap-2 rounded-full px-5"
              style={{ 
                backgroundColor: 'var(--cor-primaria)',
                color: 'white',
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              <Search className="w-4 h-4" />
              <span>Buscar Imóveis</span>
            </Button>
          </div>

          {/* Botão menu mobile */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {telefone && (
                <a 
                  href={`tel:${telefone.replace(/\D/g, '')}`}
                  className="flex items-center gap-2 py-2 px-3 rounded-md bg-gray-50"
                  style={{ color: 'var(--cor-primaria)' }}
                >
                  {telefone}
                </a>
              )}
              
              {endereco && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-md bg-gray-50 text-sm">
                  <MapPin className="h-4 w-4" style={{ color: 'var(--cor-primaria)' }} />
                  <span>{endereco}</span>
                </div>
              )}
            
              {links.map((link) => (
                <Link
                  key={link.nome}
                  href={link.url}
                  className="font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition duration-200"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.nome}
                </Link>
              ))}
              
              <Button 
                size="sm"
                className="w-full flex items-center justify-center gap-2 mt-4 rounded-full"
                style={{ 
                  backgroundColor: 'var(--cor-primaria)',
                  color: 'white',
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                <Search className="w-4 h-4" />
                <span>Buscar Imóveis</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
