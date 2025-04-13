'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TemplatePreviewProps {
  templateSlug: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corAcentuacao?: string;
  corTexto?: string;
  fonteTitulos?: string;
  fonteCorpo?: string;
  altura?: number;
  className?: string;
}

export function TemplatePreview({
  templateSlug,
  corPrimaria = '#25D366',
  corSecundaria = '#F8FAFC',
  corAcentuacao = '#FFB800',
  corTexto = '#1A202C',
  fonteTitulos = 'Inter',
  fonteCorpo = 'Inter',
  altura = 400,
  className
}: TemplatePreviewProps) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Classes de CSS customizadas baseadas nas propriedades
  const estilosCustomizados = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-acentuacao': corAcentuacao,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  useEffect(() => {
    // Simula carregamento do preview
    const timer = setTimeout(() => {
      setCarregando(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [templateSlug]);

  // Determina qual imagem de preview mostrar baseado no slug do template
  const imagemPreview = `/images/templates/${templateSlug}.jpg`;

  // Componente de placeholder durante carregamento
  const PlaceholderLoading = () => (
    <div 
      className="w-full h-full animate-pulse bg-slate-200 rounded-md flex items-center justify-center"
      style={{ height: altura }}
    >
      <div className="text-slate-400">Carregando preview...</div>
    </div>
  );

  // Componente de erro
  const ErroPreview = () => (
    <div 
      className="w-full h-full bg-red-50 border border-red-200 rounded-md flex items-center justify-center"
      style={{ height: altura }}
    >
      <div className="text-red-500 text-center p-4">
        <p className="font-medium mb-2">Não foi possível carregar o preview</p>
        <p className="text-sm">{erro || 'Tente novamente mais tarde'}</p>
      </div>
    </div>
  );

  // Componente de preview mockado (apenas para demonstração)
  // Em produção, você pode implementar um iframe ou componente mais sofisticado
  const PreviewTemplate = () => {
    // Simulando diferentes layouts base para templates
    const layouts = {
      'moderno-minimalista': (
        <div className="w-full h-full relative flex flex-col overflow-hidden rounded-md border shadow-sm" style={estilosCustomizados}>
          {/* Header */}
          <header style={{ backgroundColor: 'var(--cor-primaria)' }} className="p-4 flex justify-between items-center">
            <div className="text-white font-bold" style={{ fontFamily: 'var(--fonte-titulos)' }}>LOGO</div>
            <nav className="hidden md:flex space-x-4">
              {['Home', 'Imóveis', 'Sobre', 'Contato'].map(item => (
                <div key={item} className="text-white text-sm hover:opacity-80" style={{ fontFamily: 'var(--fonte-corpo)' }}>{item}</div>
              ))}
            </nav>
          </header>
          
          {/* Hero */}
          <div className="flex-1 bg-slate-200 flex items-center justify-center p-8 relative overflow-hidden" style={{ backgroundColor: 'var(--cor-secundaria)' }}>
            <div className="absolute inset-0 bg-slate-300 opacity-25"></div>
            <div className="relative z-10 text-center max-w-lg">
              <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-texto)' }}>
                Encontre o Imóvel dos Seus Sonhos
              </h1>
              <p className="mb-4" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>
                Oferecemos as melhores opções de imóveis em toda a região
              </p>
              <button className="px-6 py-2 rounded-md text-white" style={{ backgroundColor: 'var(--cor-acentuacao)', fontFamily: 'var(--fonte-corpo)' }}>
                Ver Imóveis
              </button>
            </div>
          </div>
          
          {/* Cards de Imóveis */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-white">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-md overflow-hidden shadow-sm border">
                <div className="h-20 bg-slate-300"></div>
                <div className="p-2">
                  <h3 className="font-semibold text-xs" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-texto)' }}>Apartamento {i}</h3>
                  <p className="text-[10px]" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>Localização</p>
                  <p className="text-[10px] font-bold" style={{ color: 'var(--cor-primaria)' }}>R$ 500.000</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <footer className="p-3 text-center text-[10px] bg-slate-100" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>
            © 2025 Imobiliária - Todos os direitos reservados
          </footer>
        </div>
      ),
      
      'tradicional': (
        <div className="w-full h-full relative flex flex-col overflow-hidden rounded-md border shadow-sm" style={estilosCustomizados}>
          {/* Header */}
          <header className="p-4 bg-slate-100 flex justify-between items-center">
            <div className="font-bold" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-primaria)' }}>LOGO</div>
            <nav className="hidden md:flex space-x-4">
              {['Home', 'Imóveis', 'Sobre', 'Contato'].map(item => (
                <div key={item} className="text-sm hover:opacity-80" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>{item}</div>
              ))}
            </nav>
          </header>
          
          {/* Hero */}
          <div className="flex-1 bg-white flex items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-200 opacity-30"></div>
            <div className="relative z-10 text-center max-w-lg border-4 p-6" style={{ borderColor: 'var(--cor-primaria)' }}>
              <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-texto)' }}>
                Tradição em Imóveis desde 1980
              </h1>
              <p className="mb-4 text-sm" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>
                Qualidade e confiança há mais de 40 anos
              </p>
              <button className="px-6 py-2 text-white" style={{ backgroundColor: 'var(--cor-primaria)', fontFamily: 'var(--fonte-corpo)' }}>
                Conheça Nossos Imóveis
              </button>
            </div>
          </div>
          
          {/* Categorias */}
          <div className="grid grid-cols-4 bg-white">
            {['Apartamentos', 'Casas', 'Terrenos', 'Comercial'].map(cat => (
              <div key={cat} className="p-2 text-center">
                <div className="rounded-full w-8 h-8 mx-auto mb-1" style={{ backgroundColor: 'var(--cor-secundaria)' }}></div>
                <div className="text-xs font-medium" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>{cat}</div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <footer className="p-3 text-center text-[10px]" style={{ backgroundColor: 'var(--cor-primaria)', color: 'white', fontFamily: 'var(--fonte-corpo)' }}>
            © 2025 Imobiliária Tradicional - CRECI 12345
          </footer>
        </div>
      ),
      
      'luxo': (
        <div className="w-full h-full relative flex flex-col overflow-hidden rounded-md border shadow-sm bg-black" style={estilosCustomizados}>
          {/* Header */}
          <header className="p-4 flex justify-center items-center border-b" style={{ borderColor: 'var(--cor-acentuacao)' }}>
            <div className="font-bold tracking-widest" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-acentuacao)' }}>LUXO IMÓVEIS</div>
          </header>
          
          {/* Nav */}
          <nav className="hidden md:flex justify-center space-x-6 py-2 px-4">
            {['Home', 'Propriedades', 'Exclusivos', 'Contato'].map(item => (
              <div key={item} className="text-sm tracking-wider" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-secundaria)' }}>{item}</div>
            ))}
          </nav>
          
          {/* Hero */}
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900 opacity-90"></div>
            <div className="relative z-10 text-center max-w-lg border p-8" style={{ borderColor: 'var(--cor-acentuacao)' }}>
              <h1 className="text-3xl font-light tracking-widest mb-4" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-acentuacao)' }}>
                EXCLUSIVIDADE
              </h1>
              <p className="mb-4 text-sm" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-secundaria)' }}>
                Imóveis de alto padrão para clientes exigentes
              </p>
              <button className="px-6 py-2 border tracking-wider text-xs" style={{ borderColor: 'var(--cor-acentuacao)', color: 'var(--cor-acentuacao)', fontFamily: 'var(--fonte-corpo)' }}>
                EXPLORAR
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="p-3 text-center text-[10px] border-t" style={{ borderColor: 'var(--cor-acentuacao)', color: 'var(--cor-secundaria)', fontFamily: 'var(--fonte-corpo)' }}>
            © 2025 Luxo Imóveis - Todos os direitos reservados
          </footer>
        </div>
      ),
      
      'ultra-minimalista': (
        <div className="w-full h-full relative flex flex-col overflow-hidden rounded-md border shadow-sm bg-white" style={estilosCustomizados}>
          {/* Header */}
          <header className="p-4 flex justify-between items-center">
            <div className="font-bold" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-texto)' }}>imob</div>
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className="block w-full h-0.5" style={{ backgroundColor: 'var(--cor-texto)' }}></span>
              <span className="block w-full h-0.5" style={{ backgroundColor: 'var(--cor-texto)' }}></span>
            </div>
          </header>
          
          {/* Hero */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-texto)' }}>
                Simples.<br />Direto.<br />Eficiente.
              </h1>
              <div className="h-1 w-12 mb-6" style={{ backgroundColor: 'var(--cor-primaria)' }}></div>
              <p className="mb-6" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>
                Encontre seu imóvel sem complicações.
              </p>
              <button className="px-6 py-2 text-white" style={{ backgroundColor: 'var(--cor-primaria)', fontFamily: 'var(--fonte-corpo)' }}>
                Ver imóveis
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="p-4 text-xs" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-texto)' }}>
            © 2025
          </footer>
        </div>
      ),
      
      'tech': (
        <div className="w-full h-full relative flex flex-col overflow-hidden rounded-md border shadow-sm" style={{ ...estilosCustomizados, backgroundColor: '#121212' }}>
          {/* Header */}
          <header className="p-4 flex justify-between items-center border-b border-opacity-10" style={{ borderColor: 'var(--cor-primaria)' }}>
            <div className="font-bold text-xs tracking-widest" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-primaria)' }}>TECH·IMOB</div>
            <nav className="hidden md:flex space-x-4">
              {['Home', 'Buscar', 'VR Tour', 'Smart Home'].map(item => (
                <div key={item} className="text-xs" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-secundaria)' }}>{item}</div>
              ))}
            </nav>
          </header>
          
          {/* Hero */}
          <div className="flex-1 flex items-center p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l" style={{ from: 'rgba(0,0,0,0)', to: '#121212' }}></div>
            <div className="relative z-10 max-w-xs">
              <div className="text-xs font-medium mb-2" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-primaria)' }}>SMART LIVING</div>
              <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-secundaria)' }}>
                O Futuro da Moradia é Agora
              </h1>
              <p className="mb-4 text-xs" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-secundaria)', opacity: 0.7 }}>
                Imóveis com tecnologia integrada para uma vida mais conectada
              </p>
              <div className="flex space-x-2">
                <button className="px-4 py-1.5 text-xs rounded-sm" style={{ backgroundColor: 'var(--cor-primaria)', color: '#121212', fontFamily: 'var(--fonte-corpo)' }}>
                  Explorar
                </button>
                <button className="px-4 py-1.5 text-xs rounded-sm border border-opacity-50" style={{ borderColor: 'var(--cor-primaria)', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-corpo)' }}>
                  VR Tour
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 border-t border-opacity-10" style={{ borderColor: 'var(--cor-primaria)' }}>
            {[
              { num: '300+', label: 'Imóveis' },
              { num: '24/7', label: 'Suporte' },
              { num: '100%', label: 'Digital' }
            ].map(stat => (
              <div key={stat.label} className="p-2 text-center">
                <div className="text-sm font-bold" style={{ fontFamily: 'var(--fonte-titulos)', color: 'var(--cor-primaria)' }}>{stat.num}</div>
                <div className="text-[10px]" style={{ fontFamily: 'var(--fonte-corpo)', color: 'var(--cor-secundaria)', opacity: 0.7 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    };
    
    // Seleciona o layout apropriado ou usa um padrão se não existir
    const LayoutTemplate = layouts[templateSlug as keyof typeof layouts] || layouts['moderno-minimalista'];
    
    return (
      <div className="w-full overflow-hidden rounded-md" style={{ height: altura }}>
        {LayoutTemplate}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {carregando ? <PlaceholderLoading /> : erro ? <ErroPreview /> : <PreviewTemplate />}
    </div>
  );
}
