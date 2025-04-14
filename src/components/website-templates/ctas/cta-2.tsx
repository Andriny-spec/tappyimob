import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Home, Phone } from 'lucide-react';

interface Cta2Props {
  titulo: string;
  subtitulo: string;
  descricao: string;
  botaoTexto1: string;
  botaoUrl1: string;
  botaoTexto2: string;
  botaoUrl2: string;
  imagemUrl?: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function Cta2({
  titulo = "Vamos encontrar o imóvel perfeito para você",
  subtitulo = "Você está a um passo de realizar seu sonho",
  descricao = "Nossa equipe de corretores especializados está pronta para encontrar o imóvel ideal de acordo com suas necessidades e orçamento. Conte com nossa experiência e conhecimento do mercado imobiliário local.",
  botaoTexto1 = "Ver imóveis",
  botaoUrl1 = "/imoveis",
  botaoTexto2 = "Fale conosco",
  botaoUrl2 = "/atendimento",
  imagemUrl = "/images/property-consultant.jpg",
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  className
}: Cta2Props) {
  const ctaStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  return (
    <section 
      className={cn("py-16 md:py-24", className)}
      style={{
        ...ctaStyle,
        backgroundColor: 'var(--cor-secundaria)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Conteúdo */}
          <div>
            <span 
              className="text-sm font-medium uppercase tracking-wider mb-3 inline-block"
              style={{ color: 'var(--cor-primaria)' }}
            >
              {subtitulo}
            </span>
            
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {titulo}
            </h2>
            
            <p 
              className="text-gray-600 mb-8 text-lg"
              style={{ fontFamily: 'var(--fonte-corpo)' }}
            >
              {descricao}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href={botaoUrl1}>
                <Button 
                  size="lg"
                  className="rounded-full gap-2"
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)',
                    color: 'white',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  <Home className="h-5 w-5" />
                  {botaoTexto1}
                </Button>
              </Link>
              
              <Link href={botaoUrl2}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full gap-2"
                  style={{ 
                    borderColor: 'var(--cor-primaria)',
                    color: 'var(--cor-primaria)',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  <Phone className="h-5 w-5" />
                  {botaoTexto2}
                </Button>
              </Link>
            </div>
            
            {/* Características em cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'white' }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--cor-primaria)' }}
                >
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Atendimento personalizado
                </h3>
                <p className="text-gray-600 text-sm">
                  Entendemos suas necessidades e buscamos o melhor para você.
                </p>
              </div>
              
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'white' }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--cor-primaria)' }}
                >
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Conhecimento local
                </h3>
                <p className="text-gray-600 text-sm">
                  Somos especialistas no mercado imobiliário da região.
                </p>
              </div>
            </div>
          </div>
          
          {/* Imagem */}
          <div className="relative">
            <div className="relative h-[500px] rounded-xl overflow-hidden shadow-xl">
              {imagemUrl ? (
                <Image
                  src={imagemUrl}
                  alt="Atendimento especializado"
                  fill
                  className="object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--cor-primaria)' }}
                >
                  <Home className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
            
            {/* Badge flutuante */}
            <div 
              className="absolute -bottom-6 -left-6 p-4 rounded-lg shadow-lg max-w-[200px]"
              style={{ backgroundColor: 'var(--cor-primaria)' }}
            >
              <p className="text-sm font-medium text-white mb-2">
                Agende uma visita
              </p>
              <p className="text-xs text-white/80">
                Estamos prontos para atender você e tirar todas as suas dúvidas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
