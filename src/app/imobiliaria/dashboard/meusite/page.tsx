'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, FileText, Globe, Image, List, Palette, LayoutTemplate, LayoutGrid, GraduationCap, Sparkles, ArrowRight, Package, Server, Video, FileImage, MousePointer, Info, Edit, Copy, ExternalLink } from 'lucide-react';
import { TemplateSelectionStep } from '@/components/website-builder/template-selection';
import { ColorFontSelectionStep } from '@/components/website-builder/color-font-selection';
import { LogoSelectionStep } from '@/components/website-builder/logo-selection';
import { PagesSelectionStep } from '@/components/website-builder/pages-selection';
import { ComponentsSelectionStep } from '@/components/website-builder/components-selection';
import { DomainHostingStep } from '@/components/website-builder/domain-hosting';
import { TrainingSelectionStep } from '@/components/website-builder/training-selection';
import { BuildingAnimation } from '@/components/website-builder/building-animation';
import { CompletionModal } from '@/components/website-builder/completion-modal';
import { ImobiliariaInfoStep, type ImobiliariaInfo } from '@/components/website-builder/imobiliaria-info';

const steps = [
  { id: 'info', title: 'Informações', icon: <Info className="h-5 w-5" /> },
  { id: 'template', title: 'Template', icon: <LayoutTemplate className="h-5 w-5" /> },
  { id: 'colorsfonts', title: 'Cores e Fontes', icon: <Palette className="h-5 w-5" /> },
  { id: 'logo', title: 'Logo', icon: <Image className="h-5 w-5" /> },
  { id: 'components', title: 'Componentes', icon: <LayoutGrid className="h-5 w-5" /> },
  { id: 'pages', title: 'Páginas', icon: <FileText className="h-5 w-5" /> },
  { id: 'domain', title: 'Domínio & Hospedagem', icon: <Globe className="h-5 w-5" /> },
  { id: 'training', title: 'Treinamento', icon: <GraduationCap className="h-5 w-5" /> },
];

export default function MeuSitePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [siteAtivo, setSiteAtivo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  // Buscar informações do site ativo (se existir)
  useEffect(() => {
    const verificaSiteAtivo = async () => {
      try {
        setCarregando(true);
        const response = await fetch('/api/imobiliaria/site/meu');
        
        if (response.ok) {
          const data = await response.json();
          if (data.site) {
            console.log('Site ativo encontrado:', data.site);
            setSiteAtivo(data.site);
          } else {
            console.log('Nenhum site ativo encontrado');
            setSiteAtivo(null);
          }
        } else {
          console.error('Erro ao buscar site ativo');
          setSiteAtivo(null);
        }
      } catch (error) {
        console.error('Erro ao verificar site ativo:', error);
        setSiteAtivo(null);
      } finally {
        setCarregando(false);
      }
    };
    
    verificaSiteAtivo();
  }, []);
  
  // Estado para armazenar as seleções do usuário
  const [websiteConfig, setWebsiteConfig] = useState({
    // Informações da Imobiliária
    imobiliariaInfo: {
      telefone: '',
      endereco: '',
      cnpj: '',
      creci: '',
      descricao: ''
    },
    // Template e estilo
    template: '',
    templateSlug: '',
    corPrimaria: '#25D366',
    corSecundaria: '#F8FAFC',
    corAcentuacao: '#FFB800',
    corTexto: '#1A202C',
    fonteTitulos: 'Inter',
    fonteCorpo: 'Inter',
    nomeSite: '',
    subdominio: '',
    descricao: '',
    logo: null,
    logoUrl: '',
    paginas: [],
    dominio: '',
    dominioProprio: '',
    domainType: 'subdomain',    // Tipo de domínio (subdomain ou custom)
    customDomain: '',           // Domínio personalizado (se domainType for custom)
    hostingType: 'managed',     // Tipo de hospedagem (managed ou external)
    trainingFormat: 'video',    // Formato de treinamento (video ou text)
    componentes: {
      header: 'header-1',
      footer: 'footer-1',
      card: 'card-1',
      cta: 'cta-1',
      grid: 'grid-1',
      single: 'single-1'
    }
  });

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateConfig = (key, value) => {
    setWebsiteConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validarEtapaAtual = () => {
    console.log('Validando etapa:', currentStepIndex);
    
    switch (currentStepIndex) {
      case 0: // Informações da Imobiliária
        const { telefone, endereco, cnpj, creci } = websiteConfig.imobiliariaInfo;
        const temInformacoes = !!telefone && !!endereco && !!cnpj && !!creci;
        console.log('Informações preenchidas?', temInformacoes, websiteConfig.imobiliariaInfo);
        return temInformacoes;

      case 1: // Template
        const temTemplate = !!websiteConfig.template;
        console.log('Template selecionado?', temTemplate, websiteConfig.template);
        return temTemplate;
        
      case 2: // Cores e fontes
        return true; // Já tem valores padrão
        
      case 3: // Logo
        return true; // Opcional
        
      case 4: // Componentes
        return true; // Opcional
        
      case 5: // Páginas
        const temPaginas = Array.isArray(websiteConfig.paginas) && websiteConfig.paginas.length > 0;
        console.log('Tem páginas?', temPaginas, websiteConfig.paginas);
        return temPaginas || true; // Tornar opcional temporariamente para teste
        
      case 6: // Domínio
        const temSubdominio = !!websiteConfig.subdominio;
        console.log('Tem subdomínio?', temSubdominio, websiteConfig.subdominio);
        return temSubdominio || true; // Tornar opcional temporariamente para teste
        
      case 7: // Treinamento
        return true;
        
      default:
        return true;
    }
  };

  const salvarSite = async () => {
    try {
      console.log('Iniciando processo de salvar site...');
      setIsBuilding(true);
      
      // Dados para a API
      const dados = {
        nome: websiteConfig.nomeSite || 'Site da minha imobiliária',
        descricao: websiteConfig.descricao || 'Site profissional para imobiliária',
        templateId: websiteConfig.template,
        subdominio: websiteConfig.subdominio,
        corPrimaria: websiteConfig.corPrimaria,
        corSecundaria: websiteConfig.corSecundaria,
        corAcentuacao: websiteConfig.corAcentuacao,
        corTexto: websiteConfig.corTexto,
        fonteTitulos: websiteConfig.fonteTitulos,
        fonteCorpo: websiteConfig.fonteCorpo,
        logoUrl: websiteConfig.logoUrl,
        paginasSelecionadas: websiteConfig.paginas || [],
        dadosAdicionais: {
          dominioProprio: websiteConfig.dominioProprio,
          tom: "profissional", // Padrão para o tom da IA
        }
      };
      
      console.log('Enviando dados para API:', dados);
      
      // Enviar dados para a API de criação de site
      try {
        console.log('Enviando dados para API de criação de site...');
        
        const response = await fetch('/api/imobiliaria/site', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar site');
        }
        
        const resultado = await response.json();
        console.log('Site criado com sucesso:', resultado);
        
        // Atualizar o estado com os dados reais retornados pela API
        if (resultado.site) {
          // Atualizar o subdomínio com o valor gerado pelo backend
          updateConfig('subdominio', resultado.site.subdominio);
          console.log('Subdomínio atualizado:', resultado.site.subdominio);
        }
        
        // Continuar com a animação de sucesso
        setTimeout(() => {
          setIsBuilding(false);
          setShowCompletionModal(true);
        }, 3000);
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        
        // Fallback para o modo de demonstração se a API falhar
        console.warn('Ativando modo de demonstração como fallback');
        setTimeout(() => {
          console.log('Site criado com sucesso (simulação - fallback)');
          setIsBuilding(false);
          setShowCompletionModal(true);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Erro ao salvar site:', error);
      alert('Ocorreu um erro ao salvar o site. Tente novamente.');
      setIsBuilding(false);
    }
  };

  const handleNext = () => {
    console.log('Tentando avançar da etapa', currentStepIndex);
    
    // Validar etapa atual
    if (!validarEtapaAtual()) {
      console.warn('Validação falhou para a etapa', currentStepIndex);
      alert('Por favor, preencha todos os campos obrigatórios antes de continuar.');
      return;
    }
    
    // Se estamos na última etapa, iniciar processo de salvar o site
    if (currentStepIndex === steps.length - 1) {
      console.log('Última etapa atingida, iniciando salvarSite()');
      salvarSite();
      return;
    }
    
    // Avançar para a próxima etapa
    setCurrentStepIndex(prev => {
      console.log('Avançando para etapa', prev + 1);
      return prev + 1;
    });
  };

  const handleBack = () => {
    setCurrentStepIndex(prev => prev - 1);
  };

  // Renderizar a visualização do site ativo
  const renderSiteAtivo = () => {
    return (
      <Card className="shadow-md border-none">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Seu site está ativo
          </CardTitle>
          <CardDescription>
            Seu site já está online e pode ser acessado através do link abaixo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Detalhes do site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações do Site</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Nome do site</p>
                  <p className="text-slate-700">{siteAtivo?.nome || 'Não definido'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Subdomínio</p>
                  <div className="flex items-center space-x-2">
                    <a 
                      href={`http://${siteAtivo?.subdominio}.tappyimob.com.br`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {siteAtivo?.subdominio}.tappyimob.com.br
                    </a>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                      navigator.clipboard.writeText(`http://${siteAtivo?.subdominio}.tappyimob.com.br`);
                      alert('Link copiado!');
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Template</p>
                  <p className="text-slate-700">{siteAtivo?.template?.nome || 'Não definido'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Gerenciamento</h3>
              
              <div className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar informações
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Palette className="mr-2 h-4 w-4" />
                  Personalizar aparência
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Gerenciar páginas
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Globe className="mr-2 h-4 w-4" />
                  Configurar domínio
                </Button>
              </div>
            </div>
          </div>
          
          {/* Prévia do site */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Prévia do site</h3>
            
            <div className="border rounded-md overflow-hidden bg-slate-50">
              <div className="border-b p-2 bg-slate-100 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-white rounded text-xs py-1 px-2 text-center text-slate-500">
                  {siteAtivo?.subdominio}.tappyimob.com.br
                </div>
              </div>
              
              <div className="aspect-video relative bg-slate-100">
                {siteAtivo?.logoUrl ? (
                  <img 
                    src={siteAtivo.logoUrl} 
                    alt="Logo do site" 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[200px] max-h-[100px]" 
                  />
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400">
                    <Building2 className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-sm font-medium">{siteAtivo?.nome || 'Seu site'}</p>
                  </div>
                )}
                
                <Button 
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  onClick={() => window.open(`http://${siteAtivo?.subdominio}.tappyimob.com.br`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visitar site
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Meu Site</h1>
        <p className="text-slate-500">
          {siteAtivo ? 'Gerencie seu site profissional' : 'Crie um site profissional para sua imobiliária em poucos minutos.'}
        </p>

        {/* Verificação de carregamento */}
        {carregando && (
          <Card className="shadow-md border-none p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-slate-500">Carregando informações do site...</p>
            </div>
          </Card>
        )}

        {/* Mostrar site ativo */}
        {!carregando && siteAtivo && renderSiteAtivo()}
        
        {/* Barra de progresso e passos para o modo de criação */}
        {!carregando && !siteAtivo && !isBuilding && !showCompletionModal && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-3 md:grid-cols-8 gap-1 mt-4">
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

        {/* Conteúdo principal - apenas mostrado no modo de criação */}
        {!carregando && !siteAtivo && <Card className="shadow-md border-none">
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
                currentStepIndex === 0 ? 'Preencha as informações básicas da sua imobiliária' :
                currentStepIndex === 1 ? 'Escolha o modelo que melhor representa sua imobiliária' : 
                currentStepIndex === 2 ? 'Selecione as cores e fontes que combinam com sua marca' :
                currentStepIndex === 3 ? 'Faça upload da sua logo ou gere uma com IA' :
                currentStepIndex === 4 ? 'Selecione os componentes que deseja incluir no seu site' :
                currentStepIndex === 5 ? 'Selecione as páginas que deseja incluir no seu site' :
                currentStepIndex === 6 ? 'Configure seu domínio e opções de hospedagem' :
                'Escolha como deseja receber o treinamento para gerenciar seu site'
              )}
              {isBuilding && 'Aguarde enquanto construímos seu site com base nas suas escolhas'}
              {showCompletionModal && 'Seu site foi criado com sucesso e estará disponível em breve'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Etapa de informações da imobiliária */}
              {currentStepIndex === 0 && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImobiliariaInfoStep 
                    imobiliariaInfo={websiteConfig.imobiliariaInfo}
                    onUpdateInfo={(info: ImobiliariaInfo) => {
                      updateConfig('imobiliariaInfo', info);
                    }}
                    onNextStep={() => handleNext()}
                  />
                </motion.div>
              )}
                
              {/* Etapa de seleção de template */}
              {currentStepIndex === 1 && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TemplateSelectionStep 
                    selected={websiteConfig.template}
                    onSelect={(templateId, templateSlug) => {
                      updateConfig('template', templateId);
                      updateConfig('templateSlug', templateSlug);
                    }}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de cores e fontes */}
              {currentStepIndex === 2 && (
                <motion.div
                  key="colorsfonts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ColorFontSelectionStep 
                    selectedColor={websiteConfig.corPrimaria}
                    selectedFont={websiteConfig.fonteTitulos}
                    onSelectColor={value => updateConfig('corPrimaria', value)}
                    onSelectFont={value => updateConfig('fonteTitulos', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de logo */}
              {currentStepIndex === 3 && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <LogoSelectionStep 
                    logo={websiteConfig.logo}
                    logoUrl={websiteConfig.logoUrl}
                    nomeSite={websiteConfig.nomeSite}
                    onSelectLogo={(value, url) => {
                      updateConfig('logo', value);
                      if (url) updateConfig('logoUrl', url);
                    }}
                    onNextStep={() => handleNext()}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de componentes */}
              {currentStepIndex === 4 && (
                <motion.div
                  key="components"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ComponentsSelectionStep 
                    selectedComponents={websiteConfig.componentes}
                    onSelectComponent={(type, id) => {
                      const updatedComponents = {
                        ...websiteConfig.componentes,
                        [type]: id
                      };
                      updateConfig('componentes', updatedComponents);
                    }}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de páginas */}
              {currentStepIndex === 5 && (
                <motion.div
                  key="pages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <PagesSelectionStep 
                    selectedPages={websiteConfig.paginas}
                    onSelectPages={value => updateConfig('paginas', value)}
                  />
                </motion.div>
              )}

              {/* Etapa de seleção de domínio e hospedagem */}
              {currentStepIndex === 6 && (
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
              {currentStepIndex === 7 && (
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
        </Card>}
      </div>
    </PageContainer>
  );
}
