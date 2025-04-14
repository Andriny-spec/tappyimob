import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterProps {
  logoUrl: string;
  nomeSite: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  telefone?: string;
  endereco?: string;
  creci?: string;
  cnpj?: string;
  className?: string;
}

export function Footer2({
  logoUrl,
  nomeSite,
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  telefone,
  endereco,
  creci,
  cnpj,
  className
}: FooterProps) {
  const ano = new Date().getFullYear();
  
  const footerStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
  } as React.CSSProperties;

  return (
    <footer 
      className={cn("w-full", className)}
      style={footerStyle}
    >
      {/* Seção superior - Newsletter */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-lg mb-6 md:mb-0">
              <h3 
                className="text-xl md:text-2xl font-semibold mb-2"
                style={{ color: 'var(--cor-texto)', fontFamily: 'var(--fonte-titulos)' }}
              >
                Receba novidades e lançamentos
              </h3>
              <p className="text-sm text-gray-600">
                Cadastre-se para receber as melhores oportunidades em primeira mão.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="w-full sm:w-64 rounded-full" 
                />
                <Button 
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)',
                    color: 'white',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                  className="rounded-full"
                >
                  Cadastrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção principal do footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            {/* Coluna de informações da imobiliária */}
            <div className="md:col-span-4">
              <div className="mb-6">
                {logoUrl ? (
                  <div className="relative h-12 w-44 mb-4 invert">
                    <Image 
                      src={logoUrl} 
                      alt={nomeSite} 
                      fill 
                      style={{ objectFit: 'contain' }} 
                      className="w-auto h-auto brightness-0 invert"
                    />
                  </div>
                ) : (
                  <div 
                    className="text-xl font-bold mb-4 text-white" 
                    style={{ fontFamily: 'var(--fonte-titulos)' }}
                  >
                    {nomeSite || 'Imobiliária Premium'}
                  </div>
                )}
                
                <p className="text-sm text-gray-400 mb-6">
                  Somos especialistas no mercado imobiliário, oferecendo as melhores soluções para compra, venda e locação de imóveis.
                </p>
                
                <div className="flex space-x-3">
                  <a 
                    href="#" 
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                  <a 
                    href="#" 
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                  <a 
                    href="#" 
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Links de navegação */}
            <div className="md:col-span-2">
              <h4 
                className="text-lg font-semibold mb-4 text-white"
                style={{ fontFamily: 'var(--fonte-titulos)' }}
              >
                Imóveis
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/imoveis?tipo=venda" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Comprar</span>
                  </Link>
                </li>
                <li>
                  <Link href="/imoveis?tipo=aluguel" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Alugar</span>
                  </Link>
                </li>
                <li>
                  <Link href="/imoveis?destaque=true" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Destaques</span>
                  </Link>
                </li>
                <li>
                  <Link href="/imoveis?lancamento=true" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Lançamentos</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 
                className="text-lg font-semibold mb-4 text-white"
                style={{ fontFamily: 'var(--fonte-titulos)' }}
              >
                Empresa
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/sobre" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Sobre nós</span>
                  </Link>
                </li>
                <li>
                  <Link href="/atendimento" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Contato</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Privacidade</span>
                  </Link>
                </li>
                <li>
                  <Link href="/termos" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Termos</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contato */}
            <div className="md:col-span-4">
              <h4 
                className="text-lg font-semibold mb-4 text-white"
                style={{ fontFamily: 'var(--fonte-titulos)' }}
              >
                Contato
              </h4>
              <ul className="space-y-4">
                {telefone && (
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-white">Atendimento</p>
                      <a href={`tel:${telefone.replace(/\D/g, '')}`} className="text-sm text-gray-400 hover:text-white">{telefone}</a>
                    </div>
                  </li>
                )}
                {endereco && (
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-white">Sede</p>
                      <address className="text-sm text-gray-400 not-italic">{endereco}</address>
                    </div>
                  </li>
                )}
                <li className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-white">E-mail</p>
                    <a href="mailto:contato@imobiliaria.com.br" className="text-sm text-gray-400 hover:text-white">contato@imobiliaria.com.br</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de copyright */}
      <div className="bg-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © {ano} {nomeSite}. Todos os direitos reservados.
            </div>
            <div className="text-xs text-gray-600">
              {creci && <span>CRECI: {creci}</span>}
              {creci && cnpj && <span className="mx-2">•</span>}
              {cnpj && <span>CNPJ: {cnpj}</span>}
              <span className="mx-2">•</span>
              <span>Desenvolvido por <a href="https://tappy.com.br" className="hover:text-white" style={{ color: 'var(--cor-primaria)' }}>Tappy</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
