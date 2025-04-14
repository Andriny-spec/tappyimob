'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  LayoutGrid, 
  LayoutTemplate, 
  Image, 
  MousePointer, 
  Home,
  ExternalLink,
  DraftingCompass
} from 'lucide-react';

// Tipos de componentes
type ComponentType = 'header' | 'footer' | 'card' | 'cta' | 'grid' | 'single';

// Interface para a opção de componente
interface ComponentOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  price?: number;
}

// Interface para categoria de componente
interface ComponentCategory {
  id: ComponentType;
  name: string;
  icon: React.ReactNode;
  description: string;
  options: ComponentOption[];
}

// Props do componente
interface ComponentsSelectionStepProps {
  selectedComponents: Record<ComponentType, string>;
  onSelectComponent: (type: ComponentType, id: string) => void;
}

// Dados dos componentes disponíveis
const componentCategories: ComponentCategory[] = [
  {
    id: 'header',
    name: 'Cabeçalho',
    icon: <LayoutTemplate className="h-5 w-5" />,
    description: 'Escolha o estilo de cabeçalho que será exibido no topo do seu site',
    options: [
      {
        id: 'header-1',
        name: 'Moderno',
        description: 'Design limpo com menu horizontal e destaque para o logotipo',
        preview: '/images/components/header-1.jpg',
      },
      {
        id: 'header-2',
        name: 'Completo',
        description: 'Com menu expandido, busca de imóveis e botões de contato',
        preview: '/images/components/header-2.jpg',
      }
    ]
  },
  {
    id: 'footer',
    name: 'Rodapé',
    icon: <LayoutGrid className="h-5 w-5" />,
    description: 'Escolha o estilo de rodapé que será exibido no final do seu site',
    options: [
      {
        id: 'footer-1',
        name: 'Simples',
        description: 'Design minimalista com logo, links e redes sociais',
        preview: '/images/components/footer-1.jpg',
      },
      {
        id: 'footer-2',
        name: 'Completo',
        description: 'Com seções para navegação, informações de contato e newsletter',
        preview: '/images/components/footer-2.jpg',
      }
    ]
  },
  {
    id: 'card',
    name: 'Cards de Imóveis',
    icon: <Home className="h-5 w-5" />,
    description: 'Escolha o estilo de cards para exibir seus imóveis',
    options: [
      {
        id: 'card-1',
        name: 'Clássico',
        description: 'Card com foto principal, título, preço e características básicas',
        preview: '/images/components/card-1.jpg',
      },
      {
        id: 'card-2',
        name: 'Carrossel',
        description: 'Card com múltiplas fotos em carrossel e informações detalhadas',
        preview: '/images/components/card-2.jpg',
        price: 50
      }
    ]
  },
  {
    id: 'cta',
    name: 'Chamadas para Ação',
    icon: <MousePointer className="h-5 w-5" />,
    description: 'Escolha o estilo de CTAs para conversão',
    options: [
      {
        id: 'cta-1',
        name: 'Básico',
        description: 'Banner simples com imagem, texto e botão',
        preview: '/images/components/cta-1.jpg',
      },
      {
        id: 'cta-2',
        name: 'Avançado',
        description: 'Seção interativa com formulário e elementos visuais',
        preview: '/images/components/cta-2.jpg',
        price: 30
      }
    ]
  },
  {
    id: 'grid',
    name: 'Grade de Categorias',
    icon: <LayoutGrid className="h-5 w-5" />,
    description: 'Escolha como as categorias de imóveis serão exibidas',
    options: [
      {
        id: 'grid-1',
        name: 'Grade Simples',
        description: 'Exibição em grade com ícones e nomes das categorias',
        preview: '/images/components/grid-1.jpg',
      },
      {
        id: 'grid-2',
        name: 'Grade com Imagens',
        description: 'Categorias com imagens de destaque e contagem de imóveis',
        preview: '/images/components/grid-2.jpg',
        price: 40
      }
    ]
  },
  {
    id: 'single',
    name: 'Página de Imóvel',
    icon: <DraftingCompass className="h-5 w-5" />,
    description: 'Escolha o layout da página de detalhes do imóvel',
    options: [
      {
        id: 'single-1',
        name: 'Padrão',
        description: 'Layout com galeria de fotos, descrição e informações básicas',
        preview: '/images/components/single-1.jpg',
      },
      {
        id: 'single-2',
        name: 'Premium',
        description: 'Layout avançado com tour virtual, plantas e formulário de contato',
        preview: '/images/components/single-2.jpg',
        price: 80
      }
    ]
  }
];

export const ComponentsSelectionStep: React.FC<ComponentsSelectionStepProps> = ({
  selectedComponents,
  onSelectComponent
}) => {
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<ComponentType>('header');

  // Componente atual baseado na aba ativa
  const currentCategory = componentCategories.find(cat => cat.id === activeTab);

  // Função para calcular o valor adicional dos componentes premium
  const calculateAdditionalValue = () => {
    let total = 0;
    if (!selectedComponents) return total;
    
    Object.entries(selectedComponents).forEach(([type, id]) => {
      const category = componentCategories.find(cat => cat.id === type);
      if (category) {
        const option = category.options.find(opt => opt.id === id);
        if (option?.price) {
          total += option.price;
        }
      }
    });
    
    return total;
  };

  const additionalValue = calculateAdditionalValue();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha os componentes</h2>
        <p className="text-muted-foreground">
          Personalize os elementos visuais do seu site para criar uma experiência única
        </p>
      </div>
      
      {additionalValue > 0 && (
        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Valor adicional de componentes premium</h3>
              <p className="text-sm text-muted-foreground">
                Você selecionou componentes premium que acrescentam ao valor final
              </p>
            </div>
            <div className="text-xl font-bold text-primary">
              + R$ {additionalValue.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ComponentType)} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          {componentCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex flex-col items-center gap-1 py-2"
            >
              <div className="mb-1">{category.icon}</div>
              <span className="text-xs">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {componentCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>

            <RadioGroup
              value={selectedComponents?.[category.id] || category.options[0].id}
              onValueChange={(value) => onSelectComponent(category.id, value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {category.options.map((option) => (
                <div key={option.id} className="relative">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex flex-col h-full border-2 rounded-lg p-4 cursor-pointer hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="mb-3">
                      <div className="font-medium flex items-center gap-2">
                        {option.name}
                        {option.price && (
                          <Badge variant="outline" className="ml-1 font-normal">
                            + R$ {option.price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="relative aspect-video rounded-md bg-muted overflow-hidden mt-auto border">
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                          <p className="text-xs text-muted-foreground">
                            Prévia (imagem ilustrativa)
                          </p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ComponentsSelectionStep;
