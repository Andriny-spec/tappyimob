import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string;
  qtdImoveis: number;
  url: string;
}

interface GridCategoriasProps {
  titulo: string;
  subtitulo: string;
  verTodosUrl: string;
  categorias: Categoria[];
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function GridCategorias2({
  titulo = "Categorias em destaque",
  subtitulo = "Explore nossas opções de imóveis por categoria",
  verTodosUrl = "/imoveis",
  categorias = [],
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  className
}: GridCategoriasProps) {
  const gridStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  // Se não houver categorias, criar categorias padrão para demonstração
  const defaultCategorias: Categoria[] = [
    {
      id: '1',
      nome: 'Apartamentos',
      descricao: 'Apartamentos compactos e espaçosos para todos os estilos de vida',
      imagemUrl: '/images/categories/apartments.jpg',
      qtdImoveis: 23,
      url: '/imoveis?categoria=apartamento'
    },
    {
      id: '2',
      nome: 'Casas',
      descricao: 'Casas confortáveis com diversos tamanhos e acabamentos',
      imagemUrl: '/images/categories/houses.jpg',
      qtdImoveis: 18,
      url: '/imoveis?categoria=casa'
    },
    {
      id: '3',
      nome: 'Comercial',
      descricao: 'Espaços ideais para seu negócio crescer e prosperar',
      imagemUrl: '/images/categories/commercial.jpg',
      qtdImoveis: 12,
      url: '/imoveis?categoria=comercial'
    },
    {
      id: '4',
      nome: 'Alto Padrão',
      descricao: 'Imóveis de luxo com acabamentos sofisticados e localizações privilegiadas',
      imagemUrl: '/images/categories/luxury.jpg',
      qtdImoveis: 6,
      url: '/imoveis?categoria=alto-padrao'
    },
    {
      id: '5',
      nome: 'Rurais',
      descricao: 'Chácaras, sítios e fazendas para uma vida próxima à natureza',
      imagemUrl: '/images/categories/rural.jpg',
      qtdImoveis: 7,
      url: '/imoveis?categoria=rural'
    },
    {
      id: '6',
      nome: 'Terrenos',
      descricao: 'Terrenos em diversos tamanhos para construir sua casa dos sonhos',
      imagemUrl: '/images/categories/land.jpg',
      qtdImoveis: 9,
      url: '/imoveis?categoria=terreno'
    }
  ];

  const categoriasToShow = categorias.length > 0 ? categorias : defaultCategorias;

  return (
    <section 
      className={cn("py-16 md:py-24", className)}
      style={{
        ...gridStyle,
        backgroundColor: 'var(--cor-secundaria)',
      }}
    >
      <div className="container mx-auto px-4">
        {/* Cabeçalho com título e link "Ver todos" */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span 
              className="text-sm font-medium uppercase tracking-wider mb-3 inline-block"
              style={{ color: 'var(--cor-primaria)' }}
            >
              {subtitulo}
            </span>
            
            <h2 
              className="text-3xl md:text-4xl font-bold"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              {titulo}
            </h2>
          </div>
          
          <Link 
            href={verTodosUrl}
            className="inline-flex items-center mt-4 md:mt-0 text-base font-medium hover:underline"
            style={{ color: 'var(--cor-primaria)' }}
          >
            Ver todos os imóveis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        {/* Layout de categorias em formato de grade mista */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categoria principal em destaque */}
          {categoriasToShow.length > 0 && (
            <motion.div 
              className="md:col-span-2 md:row-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link 
                href={categoriasToShow[0].url}
                className="block h-full rounded-2xl overflow-hidden group relative"
              >
                <div className="relative h-96 md:h-full w-full">
                  <Image
                    src={categoriasToShow[0].imagemUrl || `https://placehold.co/800x800/png?text=${categoriasToShow[0].nome}`}
                    alt={categoriasToShow[0].nome}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div 
                      className="px-3 py-1 rounded-full text-sm inline-flex mb-3"
                      style={{ 
                        backgroundColor: 'var(--cor-primaria)',
                        color: 'white'
                      }}
                    >
                      {categoriasToShow[0].qtdImoveis} imóveis
                    </div>
                    
                    <h3 
                      className="text-2xl md:text-3xl font-bold text-white mb-2"
                      style={{ fontFamily: 'var(--fonte-titulos)' }}
                    >
                      {categoriasToShow[0].nome}
                    </h3>
                    
                    <p className="text-base text-gray-200 mb-4">
                      {categoriasToShow[0].descricao}
                    </p>
                    
                    <div 
                      className="inline-flex items-center font-medium text-white group-hover:underline"
                    >
                      Explorar categoria <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
          
          {/* Categorias secundárias */}
          {categoriasToShow.slice(1, 5).map((categoria, index) => (
            <motion.div 
              key={categoria.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link 
                href={categoria.url}
                className="block h-full rounded-2xl overflow-hidden group relative"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={categoria.imagemUrl || `https://placehold.co/600x400/png?text=${categoria.nome}`}
                    alt={categoria.nome}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                    <div 
                      className="px-2 py-0.5 rounded-full text-xs inline-flex mb-2"
                      style={{ 
                        backgroundColor: 'var(--cor-primaria)',
                        color: 'white'
                      }}
                    >
                      {categoria.qtdImoveis} imóveis
                    </div>
                    
                    <h3 
                      className="text-xl font-bold text-white mb-1"
                      style={{ fontFamily: 'var(--fonte-titulos)' }}
                    >
                      {categoria.nome}
                    </h3>
                    
                    <p className="text-sm text-gray-200 line-clamp-2 mb-2">
                      {categoria.descricao}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
