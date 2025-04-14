import React from 'react';
import { Header1 } from '../headers/header-1';
import { Header2 } from '../headers/header-2';
import { Footer1 } from '../footers/footer-1';
import { Footer2 } from '../footers/footer-2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Building2, 
  Users, 
  Award, 
  Target, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ImobiliariaInfo {
  id?: string;
  nome: string;
  descricao: string;
  missao: string;
  visao: string;
  valores: string[];
  historia: string;
  telefone: string;
  endereco: string;
  cnpj: string;
  creci: string;
  anoFundacao?: number;
}

interface MembroEquipe {
  id: string;
  nome: string;
  cargo: string;
  foto: string;
  descricao?: string;
  contato?: {
    email?: string;
    telefone?: string;
    linkedin?: string;
  };
}

interface SobrePageProps {
  // Informações da imobiliária
  imobiliariaInfo: ImobiliariaInfo;
  nomeSite: string;
  logoUrl: string;
  equipe: MembroEquipe[];
  
  // Estilo
  corPrimaria: string;
  corSecundaria: string;
  corAcentuacao: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  
  // Componentes selecionados
  headerType: 'header-1' | 'header-2';
  footerType: 'footer-1' | 'footer-2';
}

export function SobrePage({
  imobiliariaInfo,
  nomeSite,
  logoUrl,
  equipe = [],
  corPrimaria,
  corSecundaria,
  corAcentuacao,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  headerType = 'header-1',
  footerType = 'footer-1',
}: SobrePageProps) {
  // Estilo global para a página
  const pageStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-acentuacao': corAcentuacao,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  // Renderiza o header baseado no tipo selecionado
  const renderHeader = () => {
    const headerProps = {
      logoUrl,
      nomeSite,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      telefone: imobiliariaInfo.telefone,
      endereco: imobiliariaInfo.endereco
    };

    return headerType === 'header-1' 
      ? <Header1 {...headerProps} /> 
      : <Header2 {...headerProps} />;
  };

  // Renderiza o footer baseado no tipo selecionado
  const renderFooter = () => {
    const footerProps = {
      logoUrl,
      nomeSite,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      telefone: imobiliariaInfo.telefone,
      endereco: imobiliariaInfo.endereco,
      creci: imobiliariaInfo.creci,
      cnpj: imobiliariaInfo.cnpj
    };

    return footerType === 'footer-1' 
      ? <Footer1 {...footerProps} /> 
      : <Footer2 {...footerProps} />;
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      {renderHeader()}
      
      {/* Banner com título da página */}
      <section className="relative py-16 bg-gray-900">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/about-bg.jpg"
            alt="Sobre nós"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              style={{ fontFamily: 'var(--fonte-titulos)' }}
            >
              Sobre Nós
            </h1>
            <p className="text-lg text-gray-200">
              Conheça nossa história, valores e a equipe por trás da {imobiliariaInfo.nome}
            </p>
          </div>
        </div>
      </section>
      
      {/* Seção Principal */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge
                className="mb-4 text-xs"
                style={{ 
                  backgroundColor: 'var(--cor-secundaria)',
                  color: 'var(--cor-primaria)'
                }}
              >
                NOSSA HISTÓRIA
              </Badge>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)' 
                }}
              >
                {imobiliariaInfo.nome}: Tradição e inovação no mercado imobiliário
              </h2>
              
              <div className="prose max-w-none text-gray-600 mb-8">
                <p>{imobiliariaInfo.historia || imobiliariaInfo.descricao}</p>
              </div>
              
              {/* Fundação e CRECI */}
              <div className="flex flex-col sm:flex-row gap-6">
                {imobiliariaInfo.anoFundacao && (
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: 'var(--cor-secundaria)' }}
                    >
                      <Building2 
                        className="h-5 w-5"
                        style={{ color: 'var(--cor-primaria)' }}
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-lg font-semibold mb-1"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          fontFamily: 'var(--fonte-titulos)'
                        }}
                      >
                        Ano de Fundação
                      </h3>
                      <p className="text-gray-600">{imobiliariaInfo.anoFundacao}</p>
                    </div>
                  </div>
                )}
                
                {imobiliariaInfo.creci && (
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: 'var(--cor-secundaria)' }}
                    >
                      <Award 
                        className="h-5 w-5"
                        style={{ color: 'var(--cor-primaria)' }}
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-lg font-semibold mb-1"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          fontFamily: 'var(--fonte-titulos)'
                        }}
                      >
                        CRECI
                      </h3>
                      <p className="text-gray-600">{imobiliariaInfo.creci}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-xl h-96">
                <Image
                  src="/images/about-image.jpg"
                  alt={imobiliariaInfo.nome}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div 
                className="absolute -bottom-6 -right-6 w-40 h-40 rounded-lg shadow-lg overflow-hidden hidden lg:block"
                style={{ 
                  backgroundColor: 'var(--cor-primaria)' 
                }}
              >
                <div className="p-6 text-white flex flex-col items-center justify-center h-full">
                  <span className="text-3xl font-bold block mb-1">
                    {imobiliariaInfo.anoFundacao 
                      ? new Date().getFullYear() - imobiliariaInfo.anoFundacao 
                      : 10}+
                  </span>
                  <span className="text-sm uppercase tracking-wider">
                    Anos de experiência
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Missão, Visão e Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Missão */}
            <div 
              className="bg-white p-8 rounded-xl shadow-md"
              style={{ borderTop: `4px solid ${corPrimaria}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-secundaria)' }}
              >
                <Target 
                  className="h-6 w-6"
                  style={{ color: 'var(--cor-primaria)' }}
                />
              </div>
              
              <h3 
                className="text-xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Nossa Missão
              </h3>
              
              <p className="text-gray-600">
                {imobiliariaInfo.missao || "Facilitar a realização do sonho da casa própria, oferecendo um atendimento personalizado e soluções imobiliárias que atendam às necessidades dos nossos clientes."}
              </p>
            </div>
            
            {/* Visão */}
            <div 
              className="bg-white p-8 rounded-xl shadow-md"
              style={{ borderTop: `4px solid ${corPrimaria}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-secundaria)' }}
              >
                <Star 
                  className="h-6 w-6"
                  style={{ color: 'var(--cor-primaria)' }}
                />
              </div>
              
              <h3 
                className="text-xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Nossa Visão
              </h3>
              
              <p className="text-gray-600">
                {imobiliariaInfo.visao || "Ser reconhecida como referência no mercado imobiliário, pela excelência no atendimento, transparência nas negociações e compromisso com a satisfação dos clientes."}
              </p>
            </div>
            
            {/* Valores */}
            <div 
              className="bg-white p-8 rounded-xl shadow-md"
              style={{ borderTop: `4px solid ${corPrimaria}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-secundaria)' }}
              >
                <BookOpen 
                  className="h-6 w-6"
                  style={{ color: 'var(--cor-primaria)' }}
                />
              </div>
              
              <h3 
                className="text-xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Nossos Valores
              </h3>
              
              <ul className="space-y-3">
                {(imobiliariaInfo.valores || [
                  "Ética e transparência",
                  "Compromisso com o cliente",
                  "Excelência no atendimento",
                  "Respeito às pessoas"
                ]).map((valor, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 
                      className="h-5 w-5 mr-2 flex-shrink-0"
                      style={{ color: 'var(--cor-primaria)' }}
                    />
                    <span className="text-gray-600">{valor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Equipe */}
          {equipe.length > 0 && (
            <div className="mb-20">
              <div className="text-center mb-12">
                <Badge
                  className="mb-4 text-xs"
                  style={{ 
                    backgroundColor: 'var(--cor-secundaria)',
                    color: 'var(--cor-primaria)'
                  }}
                >
                  NOSSA EQUIPE
                </Badge>
                <h2 
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)' 
                  }}
                >
                  Conheça os profissionais por trás da {imobiliariaInfo.nome}
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Nossa equipe é formada por profissionais capacitados e comprometidos em oferecer o melhor atendimento e as melhores soluções para nossos clientes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {equipe.map((membro) => (
                  <Card key={membro.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-64">
                      <Image
                        src={membro.foto || '/images/avatar-placeholder.jpg'}
                        alt={membro.nome}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 
                        className="text-lg font-semibold mb-1"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          fontFamily: 'var(--fonte-titulos)'
                        }}
                      >
                        {membro.nome}
                      </h3>
                      <p 
                        className="text-sm mb-3"
                        style={{ color: 'var(--cor-primaria)' }}
                      >
                        {membro.cargo}
                      </p>
                      
                      {membro.descricao && (
                        <p className="text-sm text-gray-600 mb-4">{membro.descricao}</p>
                      )}
                      
                      {/* Redes sociais */}
                      <div className="flex space-x-2">
                        <a 
                          href={`mailto:${membro.contato?.email || ''}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                          style={{ 
                            backgroundColor: 'var(--cor-secundaria)', 
                            color: 'var(--cor-primaria)' 
                          }}
                          aria-label="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        
                        {membro.contato?.linkedin && (
                          <a 
                            href={membro.contato.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                            style={{ 
                              backgroundColor: 'var(--cor-secundaria)', 
                              color: 'var(--cor-primaria)' 
                            }}
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Diferenciais */}
          <div>
            <div className="text-center mb-12">
              <Badge
                className="mb-4 text-xs"
                style={{ 
                  backgroundColor: 'var(--cor-secundaria)',
                  color: 'var(--cor-primaria)'
                }}
              >
                POR QUE NOS ESCOLHER
              </Badge>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)' 
                }}
              >
                Nossos diferenciais
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Combinamos experiência, tecnologia e atendimento personalizado para oferecer a melhor experiência aos nossos clientes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Diferencial 1 */}
              <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--cor-secundaria)' }}
                >
                  <Award 
                    className="h-6 w-6"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Credibilidade
                </h3>
                
                <p className="text-gray-600">
                  Somos uma empresa registrada e regularizada, com CRECI ativo e profissionais capacitados para garantir a segurança jurídica nas transações.
                </p>
              </div>
              
              {/* Diferencial 2 */}
              <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--cor-secundaria)' }}
                >
                  <Users 
                    className="h-6 w-6"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
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
                
                <p className="text-gray-600">
                  Entendemos que cada cliente tem necessidades específicas. Por isso, oferecemos um atendimento personalizado para encontrar o imóvel ideal para você.
                </p>
              </div>
              
              {/* Diferencial 3 */}
              <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--cor-secundaria)' }}
                >
                  <TrendingUp 
                    className="h-6 w-6"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Tecnologia avançada
                </h3>
                
                <p className="text-gray-600">
                  Utilizamos tecnologia de ponta para facilitar a busca por imóveis, com fotos de alta qualidade, tour virtual e informações detalhadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section 
        className="py-16"
        style={{ backgroundColor: 'var(--cor-primaria)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-6 text-white"
            style={{ fontFamily: 'var(--fonte-titulos)' }}
          >
            Pronto para encontrar o imóvel dos seus sonhos?
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Entre em contato conosco e descubra como podemos ajudar você a encontrar o imóvel ideal para suas necessidades.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/90 text-primary"
              style={{ 
                '--primary': 'var(--cor-primaria)',
                fontFamily: 'var(--fonte-titulos)'
              } as React.CSSProperties}
            >
              Ver imóveis
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              Fale conosco
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      {renderFooter()}
      
      {/* Badge conteúdo gerado por IA */}
      <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-full py-1 px-3 text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <Image src="/images/ai-badge.svg" alt="AI" width={16} height={16} />
        <span>Conteúdo gerado por I.A.</span>
      </div>
    </div>
  );
}
