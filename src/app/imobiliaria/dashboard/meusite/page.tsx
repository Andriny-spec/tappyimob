'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, Palette, FileCode, Image, List, Package, Globe, Server, Video, FileText, ArrowRight, Sparkles, FileImage } from 'lucide-react';
import { TemplateSelectionStep } from '@/components/website-builder/template-selection';
import { ColorFontSelectionStep } from '@/components/website-builder/color-font-selection';
import { LogoSelectionStep } from '@/components/website-builder/logo-selection';
import { PagesSelectionStep } from '@/components/website-builder/pages-selection';
import { BuildingAnimation } from '@/components/website-builder/building-animation';
import { DomainHostingStep } from '@/components/website-builder/domain-hosting';
import { TrainingSelectionStep } from '@/components/website-builder/training-selection';
import { CompletionModal } from '@/components/website-builder/completion-modal';

const steps = [
  { id: 'template', title: 'Template', icon: <FileCode className="h-5 w-5" /> },
  { id: 'colorsfonts', title: 'Cores e Fontes', icon: <Palette className="h-5 w-5" /> },
  { id: 'logo', title: 'Logo', icon: <Image className="h-5 w-5" /> },
  { id: 'pages', title: 'Páginas', icon: <List className="h-5 w-5" /> },
  { id: 'domain', title: 'Domínio & Hospedagem', icon: <Globe className="h-5 w-5" /> },
  { id: 'training', title: 'Treinamento', icon: <FileText className="h-5 w-5" /> },
];

export default function MeuSitePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Estado para armazenar as seleções do usuário
  const [websiteConfig, setWebsiteConfig] = useState({
    template: '',
    colorScheme: '',
    fontFamily: '',
    logo: null,
    pages: [],
    domainType: '',
    customDomain: '',
    hostingType: '',
    trainingFormat: '',
  });

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateConfig = (key, value) => {
    setWebsiteConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (currentStepIndex === steps.length - 1) {
      // Iniciar processo de construção
      setIsBuilding(true);
      
      // Simular tempo de construção
      setTimeout(() => {
        setIsBuilding(false);
        setShowCompletionModal(true);
      }, 5000);
      
      return;
    }
    
    setCurrentStepIndex(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStepIndex(prev => prev - 1);
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Meu Site</h1>
        <p className="text-slate-500">
          Crie um site profissional para sua imobiliária em poucos minutos.
        </p>

        {/* Barra de progresso e passos */}
        {!isBuilding && !showCompletionModal && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 p-2 ${
                    index === currentStepIndex
                      ? 'text-primary'
                      : index < currentStepIndex
                      ? 'text-slate-400'
                      : 'text-slate-300'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      index === currentStepIndex
                        ? 'bg-primary/10 text-primary'
                        : index < currentStepIndex
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-slate-50 text-slate-300'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <Card className="shadow-md border-none">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              {!isBuilding && !showCompletionModal && (
                <>
                  <Building2 className="h-5 w-5 text-primary" />
                  {currentStep.title}
                </>
              )}
              {isBuilding && (
                <>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Construindo seu site
                </>
              )}
              {showCompletionModal && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Seu site está pronto!
                </>
              )}
            </CardTitle>
            <CardDescription>
              {!isBuilding && !showCompletionModal && (
                currentStepIndex === 0 ? 'Escolha o modelo que melhor representa sua imobiliária' : 
                currentStepIndex === 1 ? 'Selecione as cores e fontes que combinam com sua marca' :
                currentStepIndex === 2 ? 'Faça upload da sua logo ou gere uma com IA' :
                currentStepIndex === 3 ? 'Selecione as páginas que deseja incluir no seu site' :
                currentStepIndex === 4 ? 'Configure seu domínio e opções de hospedagem' :
                'Escolha como deseja receber o treinamento para gerenciar seu site'
              )}
              {isBuilding && 'Aguarde enquanto construímos seu site com base nas suas escolhas'}
              {showCompletionModal && 'Seu site foi criado com sucesso e estará disponível em breve'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Etapa de seleção de template */}
              {currentStepIndex === 0 && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TemplateSelectionStep 
                    selected={websiteConfig.template}
                    onSelect={value => updateConfig('template', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de cores e fontes */}
              {currentStepIndex === 1 && (
                <motion.div
                  key="colorsfonts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ColorFontSelectionStep 
                    selectedColor={websiteConfig.colorScheme}
                    selectedFont={websiteConfig.fontFamily}
                    onSelectColor={value => updateConfig('colorScheme', value)}
                    onSelectFont={value => updateConfig('fontFamily', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de logo */}
              {currentStepIndex === 2 && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <LogoSelectionStep 
                    logo={websiteConfig.logo}
                    onSelectLogo={value => updateConfig('logo', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de páginas */}
              {currentStepIndex === 3 && (
                <motion.div
                  key="pages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <PagesSelectionStep 
                    selectedPages={websiteConfig.pages}
                    onSelectPages={value => updateConfig('pages', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de domínio e hospedagem */}
              {currentStepIndex === 4 && (
                <motion.div
                  key="domain"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <DomainHostingStep 
                    domainType={websiteConfig.domainType}
                    customDomain={websiteConfig.customDomain}
                    hostingType={websiteConfig.hostingType}
                    onSelectDomainType={value => updateConfig('domainType', value)}
                    onCustomDomainChange={value => updateConfig('customDomain', value)}
                    onSelectHostingType={value => updateConfig('hostingType', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de treinamento */}
              {currentStepIndex === 5 && (
                <motion.div
                  key="training"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrainingSelectionStep 
                    selected={websiteConfig.trainingFormat}
                    onSelect={value => updateConfig('trainingFormat', value)}
                  />
                </motion.div>
              )}

              {/* Animação de construção */}
              {isBuilding && (
                <motion.div
                  key="building"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <BuildingAnimation />
                </motion.div>
              )}

              {/* Modal de conclusão */}
              {showCompletionModal && (
                <motion.div
                  key="completion"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CompletionModal 
                    config={websiteConfig}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de navegação */}
            {!isBuilding && !showCompletionModal && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                >
                  Voltar
                </Button>
                <Button onClick={handleNext}>
                  {currentStepIndex === steps.length - 1 ? 'Construir Site' : 'Próximo'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
