import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
  className?: string;
}

export function Header1({
  logoUrl,
  nomeSite,
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  className
}: HeaderProps) {
  // Usa o pathname para extrair o segmento da imobiliária
  const pathname = usePathname();
  const imobiliariaSegment = pathname?.split('/')?.[1] || '';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // URLs dinâmicas que serão definidas posteriormente
  const links = [
    { nome: 'Home', url: `/${imobiliariaSegment}/home` },
    { nome: 'Imóveis', url: `/${imobiliariaSegment}/imoveis` },
    { nome: 'Sobre', url: `/${imobiliariaSegment}/sobre` },
    { nome: 'Atendimento', url: `/${imobiliariaSegment}/atendimento` }
  ];

  const headerStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
  } as React.CSSProperties;

  return (
    <header 
      className={cn("w-full py-4 bg-white sticky top-0 z-50 shadow-sm", className)}
      style={headerStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo à esquerda */}
          <div className="flex items-center">
            {logoUrl ? (
              <div className="relative h-10 w-40 mr-2">
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
                {nomeSite || 'Imobiliária'}
              </div>
            )}
          </div>

          {/* Menu desktop centralizado */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.nome}
                href={link.url}
                className="font-medium hover:text-primary transition duration-200 text-base"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                {link.nome}
              </Link>
            ))}
          </nav>

          {/* Botões à direita */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-full"
              style={{ 
                borderColor: 'var(--cor-primaria)',
                color: 'var(--cor-primaria)',
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              Ver Imóveis
            </Button>
            <Button 
              size="sm"
              className="rounded-full"
              style={{ 
                backgroundColor: 'var(--cor-primaria)',
                color: 'white',
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              Atendimento
            </Button>
          </div>

          {/* Botão menu mobile */}
          <div className="md:hidden">
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
            className="md:hidden overflow-hidden bg-white"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
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
              <div className="flex flex-col space-y-3 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full w-full"
                  style={{ 
                    borderColor: 'var(--cor-primaria)',
                    color: 'var(--cor-primaria)',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Ver Imóveis
                </Button>
                <Button 
                  size="sm"
                  className="rounded-full w-full"
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)',
                    color: 'white',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Atendimento
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
