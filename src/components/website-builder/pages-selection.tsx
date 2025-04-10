import React from 'react';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const availablePages = [
  {
    id: 'home',
    name: 'Home',
    description: 'Página principal do seu site',
    default: true,
    required: true
  },
  {
    id: 'imoveis',
    name: 'Imóveis',
    description: 'Catálogo de imóveis com filtros de busca',
    default: true,
    required: true
  },
  {
    id: 'single-imovel',
    name: 'Página de Imóvel',
    description: 'Página detalhada para cada imóvel',
    default: true,
    required: true
  },
  {
    id: 'contato',
    name: 'Contato',
    description: 'Formulário de contato e informações',
    default: true,
    required: true
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Artigos e notícias sobre o mercado imobiliário',
    default: true,
    required: false
  },
  {
    id: 'parceiros',
    name: 'Parceiros',
    description: 'Lista de parceiros e colaboradores',
    default: false,
    required: false
  },
  {
    id: 'avaliacoes',
    name: 'Avaliações',
    description: 'Depoimentos de clientes satisfeitos',
    default: true,
    required: false
  },
  {
    id: 'sobre',
    name: 'Sobre Nós',
    description: 'História e valores da imobiliária',
    default: true,
    required: false
  },
  {
    id: 'corretores',
    name: 'Corretores',
    description: 'Equipe de profissionais da imobiliária',
    default: false,
    required: false
  },
  {
    id: 'financiamento',
    name: 'Financiamento',
    description: 'Opções de financiamento para imóveis',
    default: false,
    required: false
  },
  {
    id: 'privacidade',
    name: 'Política de Privacidade',
    description: 'Informações sobre uso de dados',
    default: false,
    required: false
  },
  {
    id: 'termos',
    name: 'Termos e Condições',
    description: 'Termos legais de uso do site',
    default: false,
    required: false
  },
  {
    id: 'cookies',
    name: 'Política de Cookies',
    description: 'Informações sobre uso de cookies',
    default: false,
    required: false
  },
  {
    id: 'reembolso',
    name: 'Política de Reembolso',
    description: 'Política de cancelamento e reembolso',
    default: false,
    required: false
  }
];

interface PagesSelectionStepProps {
  selectedPages: string[];
  onSelectPages: (pages: string[]) => void;
}

export const PagesSelectionStep: React.FC<PagesSelectionStepProps> = ({ 
  selectedPages, 
  onSelectPages 
}) => {
  // Inicializa as páginas selecionadas se estiver vazio
  React.useEffect(() => {
    if (selectedPages.length === 0) {
      const defaultPages = availablePages
        .filter(page => page.default || page.required)
        .map(page => page.id);
      onSelectPages(defaultPages);
    }
  }, [selectedPages, onSelectPages]);

  const handleTogglePage = (pageId: string, checked: boolean) => {
    const page = availablePages.find(p => p.id === pageId);
    
    // Não permite desmarcar páginas obrigatórias
    if (page?.required && !checked) return;
    
    if (checked) {
      onSelectPages([...selectedPages, pageId]);
    } else {
      onSelectPages(selectedPages.filter(id => id !== pageId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <p className="text-sm">
          <span className="font-medium">Personalização de Páginas:</span> Selecione as páginas que deseja incluir no seu site. Quanto mais páginas, mais completo será seu site.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePages.map((page) => {
          const isSelected = selectedPages.includes(page.id);
          return (
            <div
              key={page.id}
              className={`border rounded-lg p-4 ${
                isSelected
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-slate-200'
              } ${page.required ? 'opacity-80' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`page-${page.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleTogglePage(page.id, checked as boolean)
                  }
                  disabled={page.required}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <label
                      htmlFor={`page-${page.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {page.name}
                    </label>
                    {page.required && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Obrigatória
                      </Badge>
                    )}
                    {page.default && !page.required && (
                      <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                        Recomendada
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {page.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 border rounded-lg bg-slate-50">
        <h3 className="text-sm font-medium mb-2">Seu site terá {selectedPages.length} páginas</h3>
        <div className="flex flex-wrap gap-2">
          {selectedPages.map(pageId => {
            const page = availablePages.find(p => p.id === pageId);
            return (
              <Badge key={pageId} variant="secondary" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                {page?.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};
