import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

// Páginas disponíveis para seleção
const availablePages = [
  {
    id: 'home',
    title: 'Home',
    description: 'Página principal do seu site',
    required: true,
    default: true,
    aiGenerated: false
  },
  {
    id: 'imovel',
    title: 'Página de Imóvel',
    description: 'Página detalhada para cada imóvel',
    required: true,
    default: true,
    aiGenerated: false
  },
  {
    id: 'contato',
    title: 'Contato',
    description: 'Formulário de contato e informações',
    required: true,
    default: true,
    aiGenerated: false
  },
  {
    id: 'sobre',
    title: 'Sobre Nós',
    description: 'História e valores da imobiliária',
    required: false,
    default: true,
    aiGenerated: false
  },
  {
    id: 'avaliacoes',
    title: 'Avaliações',
    description: 'Depoimentos de clientes satisfeitos',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'parceiros',
    title: 'Parceiros',
    description: 'Lista de parceiros e colaboradores',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'corretores',
    title: 'Corretores',
    description: 'Equipe de profissionais da imobiliária',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'financiamento',
    title: 'Financiamento',
    description: 'Opções de financiamento para imóveis',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'privacidade',
    title: 'Política de Privacidade',
    description: 'Informações sobre uso de dados',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'termos',
    title: 'Termos e Condições',
    description: 'Termos legais de uso do site',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'cookies',
    title: 'Política de Cookies',
    description: 'Informações sobre uso de cookies',
    required: false,
    default: false,
    aiGenerated: true
  },
  {
    id: 'reembolso',
    title: 'Política de Reembolso',
    description: 'Política de cancelamento e reembolso',
    required: false,
    default: false,
    aiGenerated: true
  }
];

interface PagesSelectionStepProps {
  selectedPages: string[] | undefined;
  onSelectPages: (pages: string[]) => void;
}

export const PagesSelectionStep: React.FC<PagesSelectionStepProps> = ({ 
  selectedPages = [], 
  onSelectPages 
}) => {
  // Inicializa as páginas selecionadas se estiver vazio
  useEffect(() => {
    if (!selectedPages || selectedPages.length === 0) {
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
      <div className="flex flex-col w-full items-start gap-2">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">Páginas</h2>
        </div>
        <p className="text-sm text-gray-500">
          Selecione as páginas que deseja incluir no seu site
        </p>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium mb-2">Personalização de Páginas:</h3>
        <p className="text-sm text-muted-foreground">
          Selecione as páginas que deseja incluir no seu site. Quanto mais páginas, mais completo será seu site.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePages.map((page) => {
          const isSelected = selectedPages?.includes(page.id) || false;
          return (
            <div
              key={page.id}
              className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200'}`}
              onClick={() => handleTogglePage(page.id, !isSelected)}
            >
              <div className="flex flex-col h-full">
                <div className="p-4 flex gap-2 items-start">
                  <Checkbox
                    id={`page-${page.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleTogglePage(page.id, checked as boolean)}
                    disabled={page.required}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{page.title}</h4>
                      {page.required && (
                        <Badge variant="outline" className="text-xs">
                          Obrigatória
                        </Badge>
                      )}
                      {!page.required && page.default && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                          Recomendada
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{page.description}</p>
                    
                    {page.aiGenerated && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        <span>Conteúdo gerado por I.A.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {(selectedPages || []).map(pageId => {
          const page = availablePages.find(p => p.id === pageId);
          return (
            <Badge key={pageId} variant="secondary" className="flex items-center gap-1">
              {page?.title}
              {!page?.required && (
                <button 
                  className="ml-1 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePage(pageId, false);
                  }}
                >
                  &times;
                </button>
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
