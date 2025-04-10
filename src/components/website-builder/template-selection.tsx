import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const templates = [
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Design clean e moderno, ideal para imobiliárias que valorizam simplicidade.',
    image: '/images/templates/minimalista.jpg',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'completo',
    name: 'Completo',
    description: 'Todas as funcionalidades para uma imobiliária de grande porte.',
    image: '/images/templates/completo.jpg',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'corporativo',
    name: 'Corporativo',
    description: 'Visual profissional para imobiliárias focadas no mercado corporativo.',
    image: '/images/templates/corporativo.jpg',
    color: 'bg-slate-50 border-slate-200'
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    description: 'Perfeito para imobiliárias com foco em imóveis comerciais.',
    image: '/images/templates/empresarial.jpg',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Ideal para campanhas e captação de leads em uma única página.',
    image: '/images/templates/landing.jpg',
    color: 'bg-amber-50 border-amber-200'
  }
];

interface TemplateSelectionStepProps {
  selected: string;
  onSelect: (template: string) => void;
}

export const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({ 
  selected, 
  onSelect 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selected === template.id
                ? 'ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(template.id)}
          >
            {/* Placeholder para imagem do template (em produção seria uma imagem real) */}
            <div className={`h-40 ${template.color} flex items-center justify-center`}>
              <span className="text-lg font-semibold">{template.name}</span>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-slate-500">{template.description}</p>
            </div>
            
            {selected === template.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {selected && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <h3 className="font-medium mb-2">Você selecionou: {templates.find(t => t.id === selected)?.name}</h3>
          <p className="text-sm text-slate-500">
            {templates.find(t => t.id === selected)?.description}
          </p>
        </div>
      )}
    </div>
  );
};
