import React from 'react';
import { Metadata } from 'next';
import { Inter, Montserrat, Poppins, Roboto, Open_Sans } from 'next/font/google';

// Declaração de fontes no escopo do módulo, como exigido pelo Next.js
const interFont = Inter({ subsets: ['latin'] });
const montserratFont = Montserrat({ subsets: ['latin'] });
const poppinsFont = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin']
});
const robotoFont = Roboto({ 
  weight: ['400', '500', '700'],
  subsets: ['latin']
});
const openSansFont = Open_Sans({ subsets: ['latin'] });

interface SiteRendererProps {
  site: {
    id: string;
    nome: string;
    subdominio: string;
    template: string;
    templateId: string;
    corPrimaria: string;
    corSecundaria: string;
    corAcentuacao?: string;
    corTexto?: string;
    fonteTitulos: string;
    fonteCorpo: string;
    logoUrl?: string;
    paginaAtual?: string;
    imobiliaria: {
      nome: string;
      telefone?: string;
      whatsapp?: string;
      email?: string;
      endereco?: string;
      cidade?: string;
      estado?: string;
    },
    paginas: Array<{
      id: string;
      titulo: string;
      slug: string;
      tipo: string;
      conteudo: any;
    }>,
    imoveis: Array<{
      id: string;
      titulo: string;
      descricao: string;
      precoVenda?: number;
      precoLocacao?: number;
      tipo: string;
      operacao: string;
      endereco: string;
      bairro: string;
      cidade: string;
      estado: string;
      quartos?: number;
      banheiros?: number;
      suites?: number;
      vagas?: number;
      areaTotal?: number;
      areaConstruida?: number;
      fotoPrincipal?: string;
      fotos: string[];
      adicionais: string[];
    }>
  };
}

// Mapeamento de fontes disponíveis
const fontes: {[key: string]: any} = {
  'Inter': interFont,
  'Montserrat': montserratFont,
  'Poppins': poppinsFont,
  'Roboto': robotoFont,
  'Open Sans': openSansFont
};

// Templates disponíveis
const templates = {
  'moderno': ModernoTemplate,
  'classico': ClassicoTemplate,
  'minimalista': MinimalistaTemplate,
  'luxo': LuxoTemplate,
  'padrao': PadraoTemplate
};

// Template padrão para uso quando o template especificado não existe
function PadraoTemplate({ site }: SiteRendererProps) {
  const fonteTitulos = fontes[site.fonteTitulos as keyof typeof fontes] || fontes.Montserrat;
  const fonteCorpo = fontes[site.fonteCorpo as keyof typeof fontes] || fontes.Inter;

  return (
    <div className="site-container" style={{
      '--cor-primaria': site.corPrimaria,
      '--cor-secundaria': site.corSecundaria,
      '--cor-acentuacao': site.corAcentuacao || '#ffb800',
      '--cor-texto': site.corTexto || '#1A202C',
    } as React.CSSProperties}>
      <header className="site-header">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="logo-container">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.nome} className="h-12 w-auto" />
            ) : (
              <h1 className={`text-2xl font-bold ${fonteTitulos.className}`} style={{color: site.corPrimaria}}>
                {site.nome}
              </h1>
            )}
          </div>
          
          <nav className="main-navigation">
            <ul className="flex space-x-6">
              {site.paginas
                .filter(pagina => pagina.slug !== 'termos' && pagina.slug !== 'privacidade')
                .map(pagina => (
                <li key={pagina.id}>
                  <a 
                    href={`/${pagina.slug}`} 
                    className={`${fonteCorpo.className} hover:text-primary transition-colors`}
                  >
                    {pagina.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      
      <main className={`site-main ${fonteCorpo.className}`}>
        <section className="hero bg-secondary py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${fonteTitulos.className}`} style={{color: site.corPrimaria}}>
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="text-xl mb-8">
              {site.imobiliaria.cidade && site.imobiliaria.estado 
                ? `Os melhores imóveis em ${site.imobiliaria.cidade}/${site.imobiliaria.estado}`
                : 'Os melhores imóveis para você e sua família'}
            </p>
            <div className="search-container bg-white rounded-lg p-6 shadow-lg max-w-3xl mx-auto">
              <h2 className={`text-2xl font-semibold mb-4 ${fonteTitulos.className}`}>
                Busque seu imóvel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select className="w-full p-2 border rounded">
                    <option>Todos os tipos</option>
                    <option>Apartamento</option>
                    <option>Casa</option>
                    <option>Terreno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bairro</label>
                  <select className="w-full p-2 border rounded">
                    <option>Todos os bairros</option>
                    {/* Lista de bairros únicos dos imóveis */}
                    {Array.from(new Set(site.imoveis.map(imovel => imovel.bairro))).map(bairro => (
                      <option key={bairro}>{bairro}</option>
                    ))}
                  </select>
                </div>
                <div className="md:self-end">
                  <button className="w-full p-2 text-white rounded" style={{backgroundColor: site.corPrimaria}}>
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="featured-properties py-16">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold mb-10 text-center ${fonteTitulos.className}`}>
              Imóveis em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {site.imoveis.slice(0, 6).map(imovel => (
                <div key={imovel.id} className="property-card bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="property-image h-48 relative">
                    {imovel.fotoPrincipal ? (
                      <img 
                        src={imovel.fotoPrincipal} 
                        alt={imovel.titulo} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 bg-primary text-white py-1 px-3 m-2 rounded">
                      {imovel.operacao}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`text-xl font-semibold mb-2 ${fonteTitulos.className}`}>{imovel.titulo}</h3>
                    <p className="text-gray-600 mb-3">{imovel.bairro}, {imovel.cidade}</p>
                    <div className="flex justify-between mb-3">
                      {imovel.quartos && (
                        <span className="text-sm">
                          {imovel.quartos} {imovel.quartos === 1 ? 'Quarto' : 'Quartos'}
                        </span>
                      )}
                      {imovel.banheiros && (
                        <span className="text-sm">
                          {imovel.banheiros} {imovel.banheiros === 1 ? 'Banheiro' : 'Banheiros'}
                        </span>
                      )}
                      {imovel.areaTotal && (
                        <span className="text-sm">{imovel.areaTotal}m²</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      {imovel.precoVenda ? (
                        <div className="text-xl font-bold" style={{color: site.corPrimaria}}>
                          R$ {imovel.precoVenda.toLocaleString('pt-BR')}
                        </div>
                      ) : imovel.precoLocacao ? (
                        <div className="text-xl font-bold" style={{color: site.corPrimaria}}>
                          R$ {imovel.precoLocacao.toLocaleString('pt-BR')}/mês
                        </div>
                      ) : (
                        <div className="text-xl font-bold" style={{color: site.corPrimaria}}>
                          Sob consulta
                        </div>
                      )}
                      <a 
                        href={`/imovel/${imovel.id}`}
                        className="text-primary text-sm font-medium"
                        style={{color: site.corPrimaria}}
                      >
                        Detalhes →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a 
                href="/imoveis" 
                className="inline-block py-3 px-6 rounded-lg text-white font-medium"
                style={{backgroundColor: site.corPrimaria}}
              >
                Ver todos os imóveis
              </a>
            </div>
          </div>
        </section>
        
        <section className="about-section py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className={`text-3xl font-bold mb-6 ${fonteTitulos.className}`} style={{color: site.corPrimaria}}>
                Sobre {site.imobiliaria.nome}
              </h2>
              <p className="text-lg mb-8">
                Somos uma imobiliária comprometida em oferecer as melhores opções de imóveis para nossos clientes.
                Com anos de experiência no mercado, nossa equipe trabalha para proporcionar um atendimento 
                personalizado e de qualidade.
              </p>
              <a 
                href="/sobre" 
                className="inline-block py-2 px-6 border-2 rounded-lg font-medium transition-colors"
                style={{
                  borderColor: site.corPrimaria,
                  color: site.corPrimaria,
                  backgroundColor: 'transparent'
                }}
              >
                Conheça nossa história
              </a>
            </div>
          </div>
        </section>
        
        <section className="contact-cta py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className={`text-3xl font-bold mb-6 ${fonteTitulos.className}`}>
              Entre em contato
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Não encontrou o que procura? Nossa equipe está pronta para ajudar a encontrar o imóvel perfeito para você.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {site.imobiliaria.whatsapp && (
                <a 
                  href={`https://wa.me/${site.imobiliaria.whatsapp.replace(/\D/g, '')}`}
                  className="inline-flex items-center py-3 px-6 rounded-lg text-white font-medium"
                  style={{backgroundColor: '#25D366'}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.497 3.504C18.236 1.237 15.218 0 12.044 0 5.508 0 0.102 5.406 0.102 12.042c0 2.124 0.55 4.198 1.601 6.031l-1.703 6.22 6.355-1.666c1.763 0.958 3.751 1.461 5.774 1.461h0.006c6.521 0 11.82-5.39 11.82-12.03 0-3.207-1.24-6.217-3.458-8.475" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.085 7.116a.723.723 0 0 0-.527.245l-1.174 1.312h-.41l.111-.657a.69.69 0 0 0-.693-.833H5.179a.65.65 0 0 0-.477.186.664.664 0 0 0-.176.506l.46 2.726-1.176-.504a.692.692 0 0 0-.939.355l-.695 1.633a.696.696 0 0 0 .345.912l11.045 5.211a.672.672 0 0 0 .887-.28l1.4-2.677a.649.649 0 0 0-.284-.878l-1.475-.704-1.52 2.435a.806.806 0 0 1-1.106.263L4.47 10.954l.046-.273a.76.76 0 0 1 .764-.633h5.77a.787.787 0 0 1 .777.922l-.385 2.274c-.052.301.163.588.462.645a.67.67 0 0 0 .602-.27l2.165-3.237a.673.673 0 0 0 .083-.673.672.672 0 0 0-.542-.417l-5.127-.825" fill="white" />
                  </svg>
                  WhatsApp
                </a>
              )}
              {site.imobiliaria.telefone && (
                <a 
                  href={`tel:${site.imobiliaria.telefone.replace(/\D/g, '')}`}
                  className="inline-flex items-center py-3 px-6 rounded-lg text-white font-medium"
                  style={{backgroundColor: site.corPrimaria}}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  Telefone
                </a>
              )}
              <a 
                href="/contato"
                className="inline-flex items-center py-3 px-6 rounded-lg font-medium transition-colors"
                style={{
                  borderColor: site.corPrimaria,
                  color: site.corPrimaria,
                  backgroundColor: 'transparent',
                  border: `2px solid ${site.corPrimaria}`
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Formulário de Contato
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="site-footer py-10 text-white" style={{backgroundColor: site.corPrimaria}}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className={`text-xl font-bold mb-4 ${fonteTitulos.className}`}>
                {site.nome}
              </h3>
              {site.imobiliaria.endereco && (
                <p className="mb-2">{site.imobiliaria.endereco}</p>
              )}
              {site.imobiliaria.cidade && site.imobiliaria.estado && (
                <p className="mb-4">{site.imobiliaria.cidade} - {site.imobiliaria.estado}</p>
              )}
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-4 ${fonteTitulos.className}`}>
                Navegação
              </h3>
              <ul className="space-y-2">
                {site.paginas.map(pagina => (
                  <li key={pagina.id}>
                    <a href={`/${pagina.slug}`} className="hover:underline">
                      {pagina.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-4 ${fonteTitulos.className}`}>
                Contato
              </h3>
              {site.imobiliaria.telefone && (
                <p className="mb-2">
                  Telefone: {site.imobiliaria.telefone}
                </p>
              )}
              {site.imobiliaria.email && (
                <p className="mb-2">
                  E-mail: {site.imobiliaria.email}
                </p>
              )}
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} {site.nome}. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">
              <a href="/privacidade" className="hover:underline mr-4">Política de Privacidade</a>
              <a href="/termos" className="hover:underline">Termos de Uso</a>
            </p>
            <p className="text-xs mt-4">
              Desenvolvido com 💚 por <a href="https://tappy.id" className="hover:underline" target="_blank" rel="noopener noreferrer">Tappy ID</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Outros templates podem ser implementados aqui
function ModernoTemplate({ site }: SiteRendererProps) {
  // Implementação específica do template moderno
  return <PadraoTemplate site={site} />;
}

function ClassicoTemplate({ site }: SiteRendererProps) {
  // Implementação específica do template clássico
  return <PadraoTemplate site={site} />;
}

function MinimalistaTemplate({ site }: SiteRendererProps) {
  // Implementação específica do template minimalista
  return <PadraoTemplate site={site} />;
}

function LuxoTemplate({ site }: SiteRendererProps) {
  // Implementação específica do template de luxo
  return <PadraoTemplate site={site} />;
}

export default function SiteRenderer({ site }: SiteRendererProps) {
  // Selecionar o template adequado baseado na configuração do site
  const Template = templates[site.template as keyof typeof templates] || PadraoTemplate;
  
  return <Template site={site} />;
}
