import React from 'react';
import { Header1 } from '../headers/header-1';
import { Header2 } from '../headers/header-2';
import { Footer1 } from '../footers/footer-1';
import { Footer2 } from '../footers/footer-2';
import { ContactForm } from '../dynamic/contact-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ImobiliariaInfo {
  telefone: string;
  endereco: string;
  cnpj: string;
  creci: string;
  descricao: string;
}

interface AtendimentoPageProps {
  // Informações da imobiliária
  imobiliariaInfo: ImobiliariaInfo;
  nomeSite: string;
  logoUrl: string;
  
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

export function AtendimentoPage({
  imobiliariaInfo,
  nomeSite,
  logoUrl,
  corPrimaria,
  corSecundaria,
  corAcentuacao,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  headerType = 'header-1',
  footerType = 'footer-1',
}: AtendimentoPageProps) {
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
            src="/images/contact-bg.jpg"
            alt="Atendimento"
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
              Atendimento
            </h1>
            <p className="text-lg text-gray-200">
              Entre em contato conosco para mais informações sobre nossos imóveis e serviços
            </p>
          </div>
        </div>
      </section>
      
      {/* Conteúdo principal */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informações de contato */}
            <div>
              <div className="mb-10">
                <h2 
                  className="text-2xl md:text-3xl font-bold mb-6"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Como podemos ajudar?
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Estamos à disposição para tirar suas dúvidas, fornecer informações sobre nossos imóveis e ajudar você a encontrar o imóvel ideal. Entre em contato conosco pelos canais abaixo ou preencha o formulário.
                </p>
                
                <div className="flex flex-col space-y-6">
                  {imobiliariaInfo.telefone && (
                    <div className="flex">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                        style={{ backgroundColor: 'var(--cor-secundaria)' }}
                      >
                        <Phone 
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
                          Telefone
                        </h3>
                        <p className="text-gray-600">{imobiliariaInfo.telefone}</p>
                        <a 
                          href={`tel:${imobiliariaInfo.telefone.replace(/\D/g, '')}`}
                          className="text-sm font-medium hover:underline inline-block mt-1"
                          style={{ color: 'var(--cor-primaria)' }}
                        >
                          Ligar agora
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: 'var(--cor-secundaria)' }}
                    >
                      <Mail 
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
                        E-mail
                      </h3>
                      <p className="text-gray-600">contato@{nomeSite.toLowerCase().replace(/\s/g, '')}.com.br</p>
                      <a 
                        href={`mailto:contato@${nomeSite.toLowerCase().replace(/\s/g, '')}.com.br`}
                        className="text-sm font-medium hover:underline inline-block mt-1"
                        style={{ color: 'var(--cor-primaria)' }}
                      >
                        Enviar e-mail
                      </a>
                    </div>
                  </div>
                  
                  {imobiliariaInfo.endereco && (
                    <div className="flex">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                        style={{ backgroundColor: 'var(--cor-secundaria)' }}
                      >
                        <MapPin 
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
                          Endereço
                        </h3>
                        <p className="text-gray-600">{imobiliariaInfo.endereco}</p>
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(imobiliariaInfo.endereco)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline inline-block mt-1"
                          style={{ color: 'var(--cor-primaria)' }}
                        >
                          Ver no mapa
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: 'var(--cor-secundaria)' }}
                    >
                      <Clock 
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
                        Horário de atendimento
                      </h3>
                      <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                      <p className="text-gray-600">Sábado: 8h às 12h</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botões de contato direto */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="gap-2"
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)',
                    color: 'white'
                  }}
                >
                  <Phone className="h-5 w-5" />
                  Ligar agora
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="gap-2"
                  style={{ 
                    borderColor: 'var(--cor-primaria)',
                    color: 'var(--cor-primaria)'
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </Button>
              </div>
              
              {/* Mídias sociais */}
              <div className="mt-12">
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Siga-nos nas redes sociais
                </h3>
                
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--cor-secundaria)', 
                      color: 'var(--cor-primaria)' 
                    }}
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--cor-secundaria)', 
                      color: 'var(--cor-primaria)' 
                    }}
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--cor-secundaria)', 
                      color: 'var(--cor-primaria)' 
                    }}
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--cor-secundaria)', 
                      color: 'var(--cor-primaria)' 
                    }}
                    aria-label="Website"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Formulário de contato */}
            <div>
              <ContactForm 
                imobiliariaId={imobiliariaInfo.id || ''}
                corPrimaria={corPrimaria}
                corSecundaria={corSecundaria}
                corTexto={corTexto}
                fonteTitulos={fonteTitulos}
                fonteCorpo={fonteCorpo}
                className="shadow-xl rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Mapa (se tiver endereço) */}
      {imobiliariaInfo.endereco && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 
              className="text-2xl font-bold mb-8 text-center"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              Nossa localização
            </h2>
            
            <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(imobiliariaInfo.endereco)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%" 
                height="100%" 
                style={{border: 0}}
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      )}
      
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
