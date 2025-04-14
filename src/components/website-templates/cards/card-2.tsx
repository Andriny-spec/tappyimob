import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HeartIcon, MapPin, Home, BedDouble, Bath, Maximize, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImovelCardProps {
  id: string;
  titulo: string;
  endereco: string;
  preco: number;
  tipo: 'venda' | 'aluguel';
  categoria: string;
  quartos?: number;
  banheiros?: number;
  areaTotal?: number;
  imagemUrl: string;
  destaque?: boolean;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function ImovelCard2({
  id,
  titulo,
  endereco,
  preco,
  tipo,
  categoria,
  quartos,
  banheiros,
  areaTotal,
  imagemUrl,
  destaque = false,
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  className
}: ImovelCardProps) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(preco);

  const cardStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      style={cardStyle}
      className={cn("overflow-hidden group", className)}
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg rounded-xl">
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
          <Image
            src={imagemUrl || 'https://placehold.co/600x400/png'}
            alt={titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Sobreposição escura com fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"></div>
          
          {/* Preço no canto superior */}
          <div 
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full font-semibold text-white"
            style={{ 
              backgroundColor: 'var(--cor-primaria)', 
              fontFamily: 'var(--fonte-titulos)'
            }}
          >
            {formattedPrice}
            {tipo === 'aluguel' && <span className="text-xs font-normal">/mês</span>}
          </div>
          
          {/* Tipo de imóvel */}
          <div className="absolute bottom-3 left-3">
            <Badge 
              className="font-medium text-xs px-2.5 py-0.5"
              style={{ 
                backgroundColor: 'white', 
                color: 'var(--cor-texto)',
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {tipo === 'venda' ? 'Venda' : 'Aluguel'}
            </Badge>
            
            {destaque && (
              <Badge 
                variant="outline"
                className="font-medium ml-2 text-xs px-2.5 py-0.5 bg-yellow-400 border-yellow-400 text-yellow-900"
              >
                Destaque
              </Badge>
            )}
          </div>
          
          {/* Favoritar */}
          <button 
            className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Adicionar aos favoritos"
          >
            <HeartIcon className="h-4 w-4 text-gray-500 hover:text-rose-500" />
          </button>
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-center mb-2">
            <Badge 
              variant="secondary" 
              className="px-2 py-0.5 text-xs"
              style={{ 
                backgroundColor: 'var(--cor-secundaria)', 
                color: 'var(--cor-texto)',
                fontFamily: 'var(--fonte-corpo)'
              }}
            >
              {categoria}
            </Badge>
          </div>
          
          <Link href={`/imoveis/${id}`}>
            <h3 
              className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-200"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)',
                ':hover': { color: 'var(--cor-primaria)' }
              } as React.CSSProperties}
            >
              {titulo}
            </h3>
          </Link>
          
          <div className="flex items-start mb-4">
            <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-500 line-clamp-1">{endereco}</p>
          </div>
          
          {/* Detalhes em grid */}
          <div className="grid grid-cols-3 gap-2 mb-4 border-t border-b py-3 border-gray-100">
            {quartos !== undefined && (
              <div className="flex flex-col items-center justify-center">
                <BedDouble className="h-5 w-5 mb-1" style={{ color: 'var(--cor-primaria)' }} />
                <div className="flex flex-col items-center">
                  <span className="text-base font-semibold text-gray-700">{quartos}</span>
                  <span className="text-xs text-gray-500">Quartos</span>
                </div>
              </div>
            )}
            
            {banheiros !== undefined && (
              <div className="flex flex-col items-center justify-center">
                <Bath className="h-5 w-5 mb-1" style={{ color: 'var(--cor-primaria)' }} />
                <div className="flex flex-col items-center">
                  <span className="text-base font-semibold text-gray-700">{banheiros}</span>
                  <span className="text-xs text-gray-500">Banheiros</span>
                </div>
              </div>
            )}
            
            {areaTotal !== undefined && (
              <div className="flex flex-col items-center justify-center">
                <Maximize className="h-5 w-5 mb-1" style={{ color: 'var(--cor-primaria)' }} />
                <div className="flex flex-col items-center">
                  <span className="text-base font-semibold text-gray-700">{areaTotal}</span>
                  <span className="text-xs text-gray-500">m²</span>
                </div>
              </div>
            )}
          </div>
          
          <Link 
            href={`/imoveis/${id}`}
            className="flex items-center justify-center w-full py-2.5 px-4 rounded-full transition-colors duration-200 font-medium text-center"
            style={{ 
              backgroundColor: 'var(--cor-primaria)',
              color: 'white',
              fontFamily: 'var(--fonte-titulos)'
            }}
          >
            <span>Ver detalhes</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
