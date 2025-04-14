import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
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
  categorias: Categoria[];
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function GridCategorias1({
  titulo = "Explore por categorias",
  subtitulo = "Encontre imóveis por tipo e características",
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
      descricao: 'Apartamentos em diversos tamanhos e localizações',
      imagemUrl: '/images/categories/apartments.jpg',
      qtdImoveis: 23,
      url: '/imoveis?categoria=apartamento'
    },
    {
      id: '2',
      nome: 'Casas',
      descricao: 'Casas confortáveis para toda a família',
      imagemUrl: '/images/categories/houses.jpg',
      qtdImoveis: 18,
      url: '/imoveis?categoria=casa'
    },
    {
      id: '3',
      nome: 'Comercial',
      descricao: 'Salas e lojas para seu negócio',
      imagemUrl: '/images/categories/commercial.jpg',
      qtdImoveis: 12,
      url: '/imoveis?categoria=comercial'
    },
    {
      id: '4',
      nome: 'Terrenos',
      descricao: 'Terrenos para construir seu projeto',
      imagemUrl: '/images/categories/land.jpg',
      qtdImoveis: 8,
      url: '/imoveis?categoria=terreno'
    }
  ];

  const categoriasToShow = categorias.length > 0 ? categorias : defaultCategorias;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section 
      className={cn("py-16 md:py-24", className)}
      style={gridStyle}
    >
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              color: 'var(--cor-texto)', 
              fontFamily: 'var(--fonte-titulos)'
            }}
          >
            {titulo}
          </h2>
          
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--fonte-corpo)' }}
          >
            {subtitulo}
          </p>
        </div>
        
        {/* Grid de categorias */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {categoriasToShow.map((categoria) => (
            <motion.div 
              key={categoria.id}
              variants={item}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link 
                href={categoria.url}
                className="block h-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-52 w-full">
                  <Image
                    src={categoria.imagemUrl || `https://placehold.co/600x400/png?text=${categoria.nome}`}
                    alt={categoria.nome}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                    <h3 
                      className="text-xl font-semibold text-white mb-1"
                      style={{ fontFamily: 'var(--fonte-titulos)' }}
                    >
                      {categoria.nome}
                    </h3>
                    
                    <p className="text-sm text-gray-200 mb-2">{categoria.descricao}</p>
                    
                    <div 
                      className="inline-flex items-center text-sm font-medium"
                      style={{ color: 'var(--cor-primaria)' }}
                    >
                      {categoria.qtdImoveis} imóveis disponíveis
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
