import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  logoUrl: string;
  nomeSite: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  className?: string;
}

export function Footer1({
  logoUrl,
  nomeSite,
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  telefone,
  endereco,
  email = 'contato@imobiliaria.com.br',
  className
}: FooterProps) {
  const ano = new Date().getFullYear();
  
  // URLs dinâmicas que serão definidas posteriormente
  const links = [
    { 
      titulo: 'Navegação', 
      items: [
        { nome: 'Home', url: '/' },
        { nome: 'Imóveis', url: '/imoveis' },
        { nome: 'Sobre', url: '/sobre' },
        { nome: 'Atendimento', url: '/atendimento' }
      ] 
    },
    { 
      titulo: 'Links Legais', 
      items: [
        { nome: 'Política de Privacidade', url: '/privacidade' },
        { nome: 'Termos de Uso', url: '/termos' },
        { nome: 'Cookies', url: '/cookies' }
      ] 
    }
  ];

  const footerStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
  } as React.CSSProperties;

  return (
    <footer 
      className={cn("w-full bg-gray-50 pt-12 pb-6", className)}
      style={footerStyle}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Coluna 1 - Logo e informações */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6">
              {logoUrl ? (
                <div className="relative h-12 w-44 mb-4">
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
                  className="text-xl font-bold mb-4" 
                  style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}
                >
                  {nomeSite || 'Imobiliária'}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4">
                Encontre o imóvel dos seus sonhos com a nossa experiência e dedicação no mercado imobiliário.
              </p>
              
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-200"
                  style={{ color: 'var(--cor-primaria)' }}
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-200"
                  style={{ color: 'var(--cor-primaria)' }}
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-200"
                  style={{ color: 'var(--cor-primaria)' }}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
          
          {/* Coluna 2 e 3 - Links de navegação */}
          {links.map((linkGroup, index) => (
            <div key={index} className="col-span-1">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--cor-texto)', fontFamily: 'var(--fonte-titulos)' }}
              >
                {linkGroup.titulo}
              </h3>
              <ul className="space-y-2">
                {linkGroup.items.map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      href={link.url}
                      className="text-sm text-gray-600 hover:text-primary transition-colors duration-200"
                      style={{ 
                        '--tw-text-opacity': '1',
                        '--primary-color': 'var(--cor-primaria)',
                        ':hover': { color: 'var(--cor-primaria)' } 
                      } as React.CSSProperties}
                    >
                      {link.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Coluna 4 - Contato */}
          <div className="col-span-1">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--cor-texto)', fontFamily: 'var(--fonte-titulos)' }}
            >
              Contato
            </h3>
            <ul className="space-y-3">
              {telefone && (
                <li className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 mt-0.5" style={{ color: 'var(--cor-primaria)' }} />
                  <span className="text-sm text-gray-600">{telefone}</span>
                </li>
              )}
              {endereco && (
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5" style={{ color: 'var(--cor-primaria)' }} />
                  <span className="text-sm text-gray-600">{endereco}</span>
                </li>
              )}
              {email && (
                <li className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 mt-0.5" style={{ color: 'var(--cor-primaria)' }} />
                  <span className="text-sm text-gray-600">{email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Barra de copyright */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © {ano} {nomeSite}. Todos os direitos reservados.
            </div>
            <div className="text-xs text-gray-400">
              <span>CRECI: XXXXX-X</span>
              <span className="mx-2">•</span>
              <span>Desenvolvido por <a href="https://tappy.com.br" className="hover:underline" style={{ color: 'var(--cor-primaria)' }}>Tappy</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
