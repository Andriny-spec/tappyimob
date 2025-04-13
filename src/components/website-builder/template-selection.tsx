'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface Template {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  tipo: string;
  previewUrl: string;
  destaques: string[];
  ativo: boolean;
}

// Cores para os diferentes tipos de templates
const templateColors: Record<string, string> = {
  'MODERNO': 'bg-blue-50 border-blue-200',
  'TRADICIONAL': 'bg-purple-50 border-purple-200',
  'LUXO': 'bg-amber-50 border-amber-200',
  'MINIMALISTA': 'bg-slate-50 border-slate-200',
  'TECH': 'bg-emerald-50 border-emerald-200'
};

interface TemplateSelectionStepProps {
  selected: string;
  onSelect: (templateId: string, templateSlug: string) => void;
  corPrimaria?: string;
  corSecundaria?: string;
  corAcentuacao?: string;
  corTexto?: string;
  fonteTitulos?: string;
  fonteCorpo?: string;
}

export function TemplateSelectionStep({ 
  selected, 
  onSelect
}: TemplateSelectionStepProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  useEffect(() => {
    const buscarTemplates = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        const response = await fetch('/api/imobiliaria/site/templates');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar templates');
        }
        
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        console.error('Erro ao buscar templates:', error);
        setErro('Não foi possível carregar os templates. Tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    };
    
    buscarTemplates();
  }, [selected]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onSelect(templateId, template.slug);
    }
  };

  // Componente de carregamento
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando templates...</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mensagem de erro
  if (erro) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 mb-2 font-medium">Ops! Tivemos um problema.</p>
        <p className="text-gray-600">{erro}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  

  
  return (
    <div className="space-y-6">      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selected === template.id
                ? 'border-2 border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            {/* Placeholder colorido para o tipo de template */}
            <div className={`h-40 flex items-center justify-center ${templateColors[template.tipo] || 'bg-slate-50'}`}>
              <span className="text-lg font-semibold">{template.nome}</span>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium mb-1">{template.nome}</h3>
              <p className="text-sm text-slate-500">{template.descricao}</p>
            </div>
            
            {selected === template.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {templates.length === 0 && !carregando && !erro && (
        <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-600">Nenhum template disponível no momento.</p>
        </div>
      )}
      
      {selected && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <h3 className="font-medium mb-2">
            Você selecionou: {templates.find(t => t.id === selected)?.nome}
          </h3>
          <div className="text-sm text-slate-600">
            <p className="mb-2">{templates.find(t => t.id === selected)?.descricao}</p>
            <ul className="space-y-1 mt-2">
              {templates.find(t => t.id === selected)?.destaques.map((destaque, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>{destaque}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
