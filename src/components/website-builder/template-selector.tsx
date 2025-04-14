import React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Check, FileCode, Layout, LayoutGrid, ListOrdered, MenuSquare } from 'lucide-react';

interface TemplateSelectorProps {
  onHeaderSelect: (header: string) => void;
  onFooterSelect: (footer: string) => void;
  onCardSelect: (card: string) => void;
  onCtaSelect: (cta: string) => void;
  onGridSelect: (grid: string) => void;
  selectedHeader: string;
  selectedFooter: string;
  selectedCard: string;
  selectedCta: string;
  selectedGrid: string;
}

export function TemplateSelector({
  onHeaderSelect,
  onFooterSelect,
  onCardSelect,
  onCtaSelect,
  onGridSelect,
  selectedHeader,
  selectedFooter,
  selectedCard,
  selectedCta,
  selectedGrid
}: TemplateSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Escolha os templates do seu site</h2>
        <p className="text-muted-foreground">
          Selecione os modelos para cada componente do seu site. Você pode alterar essas escolhas posteriormente.
        </p>
      </div>
      
      <Tabs defaultValue="headers" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="headers" className="flex items-center gap-2">
            <MenuSquare className="h-4 w-4" />
            <span>Header</span>
          </TabsTrigger>
          <TabsTrigger value="footers" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span>Footer</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span>Cards</span>
          </TabsTrigger>
          <TabsTrigger value="ctas" className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4" />
            <span>CTAs</span>
          </TabsTrigger>
          <TabsTrigger value="grids" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Grids</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Headers */}
        <TabsContent value="headers">
          <RadioGroup 
            value={selectedHeader} 
            onValueChange={onHeaderSelect}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TemplateOption
              value="header-1"
              label="Header 1"
              description="Layout tradicional com logo à esquerda, menu ao centro e botões à direita."
              imageSrc="/images/templates/header-1.png"
              selected={selectedHeader === "header-1"}
            />
            
            <TemplateOption
              value="header-2"
              label="Header 2"
              description="Layout com barra superior para informações de contato e menu abaixo."
              imageSrc="/images/templates/header-2.png"
              selected={selectedHeader === "header-2"}
            />
          </RadioGroup>
        </TabsContent>
        
        {/* Footers */}
        <TabsContent value="footers">
          <RadioGroup 
            value={selectedFooter} 
            onValueChange={onFooterSelect}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TemplateOption
              value="footer-1"
              label="Footer 1"
              description="Layout tradicional com informações da empresa e links de navegação."
              imageSrc="/images/templates/footer-1.png"
              selected={selectedFooter === "footer-1"}
            />
            
            <TemplateOption
              value="footer-2"
              label="Footer 2"
              description="Layout mais elaborado com newsletter e links para redes sociais."
              imageSrc="/images/templates/footer-2.png"
              selected={selectedFooter === "footer-2"}
            />
          </RadioGroup>
        </TabsContent>
        
        {/* Cards */}
        <TabsContent value="cards">
          <RadioGroup 
            value={selectedCard} 
            onValueChange={onCardSelect}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TemplateOption
              value="card-1"
              label="Card 1"
              description="Design limpo focado nas informações essenciais do imóvel."
              imageSrc="/images/templates/card-1.png"
              selected={selectedCard === "card-1"}
            />
            
            <TemplateOption
              value="card-2"
              label="Card 2"
              description="Design premium com elementos visuais e detalhes aprimorados."
              imageSrc="/images/templates/card-2.png"
              selected={selectedCard === "card-2"}
            />
          </RadioGroup>
        </TabsContent>
        
        {/* CTAs */}
        <TabsContent value="ctas">
          <RadioGroup 
            value={selectedCta} 
            onValueChange={onCtaSelect}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TemplateOption
              value="cta-1"
              label="CTA 1"
              description="Banner com imagem de fundo e botão de ação centralizado."
              imageSrc="/images/templates/cta-1.png"
              selected={selectedCta === "cta-1"}
            />
            
            <TemplateOption
              value="cta-2"
              label="CTA 2"
              description="Layout com duas colunas, texto e benefícios à esquerda e imagem à direita."
              imageSrc="/images/templates/cta-2.png"
              selected={selectedCta === "cta-2"}
            />
          </RadioGroup>
        </TabsContent>
        
        {/* Grids */}
        <TabsContent value="grids">
          <RadioGroup 
            value={selectedGrid} 
            onValueChange={onGridSelect}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TemplateOption
              value="grid-1"
              label="Grid 1"
              description="Layout simétrico com cards de tamanho igual."
              imageSrc="/images/templates/grid-1.png"
              selected={selectedGrid === "grid-1"}
            />
            
            <TemplateOption
              value="grid-2"
              label="Grid 2"
              description="Layout assimétrico com categoria principal em destaque."
              imageSrc="/images/templates/grid-2.png"
              selected={selectedGrid === "grid-2"}
            />
          </RadioGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TemplateOptionProps {
  value: string;
  label: string;
  description: string;
  imageSrc: string;
  selected: boolean;
}

function TemplateOption({ value, label, description, imageSrc, selected }: TemplateOptionProps) {
  return (
    <Label 
      htmlFor={value} 
      className={cn(
        "cursor-pointer relative block rounded-lg overflow-hidden border-2 transition-all",
        selected ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-border hover:border-primary/50"
      )}
    >
      <div className="aspect-video relative">
        <Image
          src={imageSrc}
          alt={label}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <RadioGroupItem value={value} id={value} className="sr-only" />
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          
          {selected && (
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </Label>
  );
}
