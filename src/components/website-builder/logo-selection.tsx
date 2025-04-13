'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Trash2, Loader2, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface LogoSelectionStepProps {
  logo: any;
  logoUrl?: string;
  nomeSite?: string;
  onSelectLogo: (logoData: any, logoUrl?: string) => void;
}

export const LogoSelectionStep: React.FC<LogoSelectionStepProps> = ({ 
  logo, 
  logoUrl,
  nomeSite = '',
  onSelectLogo 
}) => {
  // Estados para controle da geração de logo
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generatedLogos, setGeneratedLogos] = useState<{url: string, id: string}[]>([]);
  
  // Estados para formulário de geração de logo
  const [nomeImobiliaria, setNomeImobiliaria] = useState(nomeSite || '');
  const [tipoLogo, setTipoLogo] = useState('completo');
  const [estiloLogo, setEstiloLogo] = useState('moderno');
  const [corLogo, setCorLogo] = useState('azul');
  
  // Checar o status da geração periodicamente
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (generationId && isGenerating) {
      // Função para verificar o status da geração
      const checkStatus = async () => {
        try {
          setIsChecking(true);
          const response = await fetch(`/api/imobiliaria/logo?generationId=${generationId}`);
          
          if (!response.ok) {
            throw new Error('Erro ao verificar status da geração');
          }
          
          const data = await response.json();
          
          // Se a geração estiver completa, parar o intervalo e mostrar as imagens
          if (data.complete) {
            setIsGenerating(false);
            setGeneratedLogos(data.images || []);
            clearInterval(intervalId);
          }
          
        } catch (error) {
          console.error('Erro ao verificar status:', error);
          setGenerationError('Erro ao verificar o status da geração. Tente novamente.');
          setIsGenerating(false);
          clearInterval(intervalId);
        } finally {
          setIsChecking(false);
        }
      };
      
      // Verificar imediatamente e depois a cada 3 segundos
      checkStatus();
      intervalId = setInterval(checkStatus, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [generationId, isGenerating]);
  
  // Função para gerar logos com Leonardo AI
  const handleGenerateLogo = async () => {
    if (!nomeImobiliaria) {
      setGenerationError('Preencha o nome da imobiliária');
      return;
    }
    
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGeneratedLogos([]);
      
      const response = await fetch('/api/imobiliaria/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeSite: nomeImobiliaria,
          tipo: tipoLogo,
          estilo: estiloLogo,
          cor: corLogo
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar logo');
      }
      
      const data = await response.json();
      setGenerationId(data.generationId);
      
    } catch (error: any) {
      console.error('Erro ao gerar logo:', error);
      setGenerationError(error.message || 'Erro ao solicitar geração de logo');
      setIsGenerating(false);
    }
  };
  
  // Função para simular o upload de logo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simulando o upload do arquivo
    // Em produção, aqui seria o upload para um serviço de armazenamento
    const reader = new FileReader();
    reader.onload = () => {
      onSelectLogo({
        type: 'upload',
        src: reader.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleSelectGeneratedLogo = (logoUrl: string, logoId: string) => {
    onSelectLogo({
      type: 'generated',
      src: logoUrl,
      id: logoId,
      name: nomeImobiliaria
    }, logoUrl);
  };
  
  const resetGeracao = () => {
    setGenerationId(null);
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedLogos([]);
  };
  
  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Fazer Upload
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2" onClick={resetGeracao}>
          <Sparkles className="h-4 w-4" />
          Gerar com IA
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="space-y-6">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            {logo && logo.type === 'upload' ? (
              <div className="space-y-4 w-full">
                <div className="flex justify-center">
                  <img 
                    src={logo.src as string} 
                    alt="Logo carregada" 
                    className="h-32 object-contain rounded-md"
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm text-slate-500">{logo.name}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onSelectLogo(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Arraste sua logo ou clique para fazer upload</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Suporta JPG, PNG ou SVG. Tamanho máximo recomendado: 2MB.
                  </p>
                </div>
                <div>
                  <Input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileSelect}
                  />
                  <Label htmlFor="logo-upload" asChild>
                    <Button>Selecionar Arquivo</Button>
                  </Label>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Dica:</span> Envie uma imagem com fundo transparente para melhor integração com o design do site.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="ai" className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Gerar logo com Inteligência Artificial</h3>
          
          {generationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao gerar logo</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nomeImobiliaria">Nome da imobiliária</Label>
              <Input 
                id="nomeImobiliaria" 
                placeholder="Ex: Imobiliária Horizonte" 
                value={nomeImobiliaria}
                onChange={(e) => setNomeImobiliaria(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de logo</Label>
              <RadioGroup 
                value={tipoLogo} 
                onValueChange={setTipoLogo}
                className="flex flex-col space-y-1"
                disabled={isGenerating}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completo" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">Completo (com nome)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simbolo" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer">Apenas símbolo</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estiloLogo">Estilo da logo</Label>
              <Select
                value={estiloLogo}
                onValueChange={setEstiloLogo}
                disabled={isGenerating}
              >
                <SelectTrigger id="estiloLogo">
                  <SelectValue placeholder="Selecione um estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderno">Moderno</SelectItem>
                  <SelectItem value="minimalista">Minimalista</SelectItem>
                  <SelectItem value="luxo">Luxo</SelectItem>
                  <SelectItem value="corporativo">Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="corLogo">Cor predominante</Label>
              <Select
                value={corLogo}
                onValueChange={setCorLogo}
                disabled={isGenerating}
              >
                <SelectTrigger id="corLogo">
                  <SelectValue placeholder="Selecione uma cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                  <SelectItem value="laranja">Laranja</SelectItem>
                  <SelectItem value="roxo">Roxo</SelectItem>
                  <SelectItem value="cinza">Cinza</SelectItem>
                  <SelectItem value="preto">Preto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleGenerateLogo} 
              disabled={isGenerating || !nomeImobiliaria}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isChecking ? 'Verificando progresso...' : 'Gerando logos...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Logos com IA
                </>
              )}
            </Button>
          </div>
          
          {!isGenerating && generatedLogos.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">
                  Logos geradas para "{nomeImobiliaria}"
                </h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateLogo}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Gerar mais opções
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {generatedLogos.map((img) => (
                  <div
                    key={img.id}
                    className={`border rounded-lg p-3 cursor-pointer hover:border-primary transition-all ${
                      logo && logo.type === 'generated' && logo.id === img.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    }`}
                    onClick={() => handleSelectGeneratedLogo(img.url, img.id)}
                  >
                    <div className="aspect-square bg-white rounded-md flex items-center justify-center overflow-hidden">
                      {logo && logo.type === 'generated' && logo.id === img.id && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 z-10">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <img 
                        src={img.url} 
                        alt={`Logo gerada para ${nomeImobiliaria}`} 
                        className="max-h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
