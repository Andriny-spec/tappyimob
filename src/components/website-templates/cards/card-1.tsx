import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { HeartIcon, MapPin, Home, BedDouble, Bath, Maximize } from 'lucide-react';
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

export function ImovelCard1({
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
      className={cn("overflow-hidden", className)}
    >
      <Card className="h-full overflow-hidden border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow">
        <div className="relative w-full h-52 overflow-hidden">
          <Image
            src={imagemUrl || 'https://placehold.co/600x400/png'}
            alt={titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Badge de tipo */}
          <div className="absolute top-3 left-3">
            <Badge 
              className="font-medium"
              style={{ 
                backgroundColor: 'var(--cor-primaria)', 
                color: 'white',
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {tipo === 'venda' ? 'Venda' : 'Aluguel'}
            </Badge>
          </div>
          
          {/* Badge de destaque */}
          {destaque && (
            <div className="absolute top-3 right-3">
              <Badge 
                variant="outline"
                className="font-medium bg-white"
              >
                Destaque
              </Badge>
            </div>
          )}
          
          {/* Favoritar */}
          <button 
            className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Adicionar aos favoritos"
          >
            <HeartIcon className="h-5 w-5 text-gray-500 hover:text-rose-500" />
          </button>
        </div>
        
        <CardContent className="p-4 pb-2">
          <div className="flex items-center mb-2">
            <Badge 
              variant="secondary" 
              className="px-2 py-0 text-xs"
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
              className="text-lg font-semibold mb-1 line-clamp-1 hover:underline"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {titulo}
            </h3>
          </Link>
          
          <div className="flex items-start mb-3">
            <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-500 line-clamp-1">{endereco}</p>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div 
              className="text-xl font-bold"
              style={{ 
                color: 'var(--cor-primaria)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {formattedPrice}
              {tipo === 'aluguel' && <span className="text-sm font-normal text-gray-500">/mês</span>}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 border-t flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            {quartos !== undefined && (
              <div className="flex items-center">
                <BedDouble className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">{quartos}</span>
              </div>
            )}
            
            {banheiros !== undefined && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">{banheiros}</span>
              </div>
            )}
            
            {areaTotal !== undefined && (
              <div className="flex items-center">
                <Maximize className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">{areaTotal}m²</span>
              </div>
            )}
          </div>
          
          <div>
            <Link 
              href={`/imoveis/${id}`}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--cor-primaria)' }}
            >
              Detalhes
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
