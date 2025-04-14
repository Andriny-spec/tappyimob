import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CtaProps {
  titulo: string;
  subtitulo: string;
  botaoTexto: string;
  botaoUrl: string;
  imagemFundo?: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function Cta1({
  titulo = "Encontre o imóvel dos seus sonhos",
  subtitulo = "Conte com nossa experiência para encontrar a propriedade ideal para você e sua família",
  botaoTexto = "Ver imóveis disponíveis",
  botaoUrl = "/imoveis",
  imagemFundo = "/images/cta-bg.jpg",
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  className
}: CtaProps) {
  const ctaStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  return (
    <section 
      className={cn("relative py-16 md:py-24 overflow-hidden", className)}
      style={ctaStyle}
    >
      {/* Imagem de fundo com sobreposição */}
      <div className="absolute inset-0 z-0">
        {imagemFundo ? (
          <Image
            src={imagemFundo}
            alt="Background"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800"></div>
        )}
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      
      {/* Conteúdo */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white"
            style={{ fontFamily: 'var(--fonte-titulos)' }}
          >
            {titulo}
          </h2>
          
          <p 
            className="text-lg md:text-xl text-gray-200 mb-8"
            style={{ fontFamily: 'var(--fonte-corpo)' }}
          >
            {subtitulo}
          </p>
          
          <Link 
            href={botaoUrl}
            className="inline-flex items-center justify-center"
          >
            <Button 
              size="lg"
              className="rounded-full px-8 py-6 text-lg gap-2 hover:translate-y-[-2px] transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--cor-primaria)',
                color: 'white',
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {botaoTexto}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
