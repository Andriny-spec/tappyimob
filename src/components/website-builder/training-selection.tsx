import React from 'react';
import { Video, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const trainingOptions = [
  {
    id: 'video',
    name: 'Treinamento em Vídeo',
    description: 'Série de vídeos passo a passo para aprender a gerenciar seu site',
    icon: <Video className="h-10 w-10 text-primary" />,
    features: [
      'Tutoriais em vídeo detalhados',
      'Demonstrações práticas',
      'Disponível 24 horas por dia',
      'Possibilidade de pausar e rever',
      'Atualizado regularmente'
    ]
  },
  {
    id: 'texto',
    name: 'Manual em Texto',
    description: 'Documentação completa em formato de texto para consulta rápida',
    icon: <FileText className="h-10 w-10 text-primary" />,
    features: [
      'Guia detalhado passo a passo',
      'Pesquisa rápida de tópicos',
      'Exemplos práticos',
      'Facilidade para imprimir',
      'Atualizado regularmente'
    ]
  }
];

interface TrainingSelectionStepProps {
  selected: string;
  onSelect: (training: string) => void;
}

export const TrainingSelectionStep: React.FC<TrainingSelectionStepProps> = ({ 
  selected, 
  onSelect 
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <p className="text-sm">
          <span className="font-medium">Último passo:</span> Escolha como você prefere receber o treinamento para gerenciar seu novo site. Você pode alterar essa preferência posteriormente no painel administrativo.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainingOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ y: -5 }}
            className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
              selected === option.id
                ? 'ring-2 ring-primary ring-offset-2 border-primary/50'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                {option.icon}
              </div>
              
              <h3 className="text-xl font-medium mb-2">{option.name}</h3>
              <p className="text-sm text-slate-500 mb-4">
                {option.description}
              </p>
              
              <div className="space-y-2 text-left w-full">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {selected === option.id && (
              <div className="absolute top-4 right-4 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {selected && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <h3 className="font-medium mb-2">Você selecionou: {trainingOptions.find(t => t.id === selected)?.name}</h3>
          <p className="text-sm text-slate-500">
            {trainingOptions.find(t => t.id === selected)?.description}
          </p>
        </div>
      )}
    </div>
  );
};
