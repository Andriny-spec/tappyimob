import React from 'react';
import { Check, Palette, Type } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const colorSchemes = [
  {
    id: 'azul',
    name: 'Azul Profissional',
    primary: 'bg-blue-600',
    secondary: 'bg-blue-200',
    accent: 'bg-sky-400',
    description: 'Transmite confiança e profissionalismo'
  },
  {
    id: 'verde',
    name: 'Verde Natureza',
    primary: 'bg-green-600',
    secondary: 'bg-green-200',
    accent: 'bg-emerald-400',
    description: 'Conecta sua marca com sustentabilidade e crescimento'
  },
  {
    id: 'roxo',
    name: 'Roxo Sofisticado',
    primary: 'bg-purple-600',
    secondary: 'bg-purple-200',
    accent: 'bg-violet-400',
    description: 'Ideal para imóveis de luxo e alto padrão'
  },
  {
    id: 'vermelho',
    name: 'Vermelho Energia',
    primary: 'bg-red-600',
    secondary: 'bg-red-200',
    accent: 'bg-rose-400',
    description: 'Destaca sua marca com energia e impacto'
  },
  {
    id: 'laranja',
    name: 'Laranja Criativo',
    primary: 'bg-orange-500',
    secondary: 'bg-orange-200',
    accent: 'bg-amber-400',
    description: 'Combinação vibrante e acolhedora'
  },
  {
    id: 'cinza',
    name: 'Cinza Elegante',
    primary: 'bg-slate-700',
    secondary: 'bg-slate-300',
    accent: 'bg-slate-500',
    description: 'Visual elegante e atemporal'
  }
];

const fontFamilies = [
  {
    id: 'montserrat',
    name: 'Montserrat',
    style: 'font-sans',
    description: 'Moderna e legível, ideal para conteúdo digital'
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    style: 'font-serif',
    description: 'Elegante e sofisticada, perfeita para imóveis de luxo'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    style: 'font-sans',
    description: 'Clean e versátil, excelente para qualquer tipo de site'
  },
  {
    id: 'lora',
    name: 'Lora',
    style: 'font-serif',
    description: 'Clássica com toque contemporâneo'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    style: 'font-sans',
    description: 'Geométrica e amigável, transmite modernidade'
  }
];

interface ColorFontSelectionStepProps {
  selectedColor: string;
  selectedFont: string;
  onSelectColor: (color: string) => void;
  onSelectFont: (font: string) => void;
}

export const ColorFontSelectionStep: React.FC<ColorFontSelectionStepProps> = ({ 
  selectedColor, 
  selectedFont, 
  onSelectColor, 
  onSelectFont 
}) => {
  return (
    <Tabs defaultValue="cores" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="cores" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Esquema de Cores
        </TabsTrigger>
        <TabsTrigger value="fontes" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Tipografia
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="cores" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorSchemes.map((scheme) => (
            <motion.div
              key={scheme.id}
              whileHover={{ y: -3 }}
              className={`relative rounded-lg border overflow-hidden cursor-pointer transition-all ${
                selectedColor === scheme.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelectColor(scheme.id)}
            >
              <div className="h-24 flex flex-col">
                <div className={`h-12 ${scheme.primary}`}></div>
                <div className="h-12 flex">
                  <div className={`flex-1 ${scheme.secondary}`}></div>
                  <div className={`flex-1 ${scheme.accent}`}></div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium mb-1">{scheme.name}</h3>
                <p className="text-xs text-slate-500">{scheme.description}</p>
              </div>
              
              {selectedColor === scheme.id && (
                <div className="absolute top-2 right-2 bg-white text-primary rounded-full p-1 shadow">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="fontes" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fontFamilies.map((font) => (
            <motion.div
              key={font.id}
              whileHover={{ y: -3 }}
              className={`relative border rounded-lg p-4 cursor-pointer ${
                selectedFont === font.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelectFont(font.id)}
            >
              <h3 className="font-medium mb-1">{font.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{font.description}</p>
              
              <div className={`${font.style}`}>
                <p className="text-xl font-bold mb-1">Imobiliária Exemplo</p>
                <p className="text-sm">Os melhores imóveis para você e sua família</p>
              </div>
              
              {selectedFont === font.id && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </TabsContent>
      
      {(selectedColor || selectedFont) && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <h3 className="font-medium mb-2">Sua seleção:</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {selectedColor && (
              <div className="flex-1">
                <p className="text-sm font-medium">Esquema de Cores:</p>
                <p className="text-sm text-slate-500">
                  {colorSchemes.find(c => c.id === selectedColor)?.name}
                </p>
              </div>
            )}
            {selectedFont && (
              <div className="flex-1">
                <p className="text-sm font-medium">Fonte Principal:</p>
                <p className="text-sm text-slate-500">
                  {fontFamilies.find(f => f.id === selectedFont)?.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Tabs>
  );
};
