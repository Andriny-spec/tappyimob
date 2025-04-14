'use client';

import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LogoSelectionStepProps {
  logo: any;
  logoUrl?: string;
  nomeSite?: string;
  onSelectLogo: (logoData: any, logoUrl?: string) => void;
  onNextStep?: () => void;
}

export const LogoSelectionStep: React.FC<LogoSelectionStepProps> = ({ 
  logo, 
  logoUrl,
  nomeSite = '',
  onSelectLogo,
  onNextStep
}) => {
  // Estados para simplicar a demonstração da interface
  const [isGenerating, setIsGenerating] = useState(false);

  // Estado para armazenar o nome da imobiliária
  const [nomeImobiliaria] = useState(nomeSite || '');
  
  // Estados para gerenciar o upload e erros
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controlar o tipo de tela (upload ou IA)
  const [activeScreen, setActiveScreen] = useState<'upload' | 'ai'>('upload');
  
  // Função para abrir o seletor de arquivo
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Função para fazer upload de logo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Verificar tipo e tamanho do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou SVG)');
      }
      
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('O arquivo é muito grande. O tamanho máximo é 2MB.');
      }
      
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Enviar arquivo para a API
      const response = await fetch('/api/imobiliaria/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
      }
      
      const data = await response.json();
      
      // Atualizar o estado com a URL do arquivo enviado
      onSelectLogo({
        type: 'upload',
        src: data.fileUrl,
        name: file.name,
        size: data.size
      }, data.fileUrl);
      
      // Se houver uma função para avançar, podemos acioná-la automaticamente
      if (onNextStep) {
        setTimeout(() => onNextStep(), 1000); // Dá um tempo para o usuário ver que o upload foi bem-sucedido
      }
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Ocorreu um erro ao enviar o arquivo');
      
      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } finally {
      setIsUploading(false);
    }
  };
  
  // Função para alternar entre as telas
  const switchScreen = (screen: 'upload' | 'ai') => {
    setActiveScreen(screen);
  };
  
  // Função para gerar logo com IA (simplificada, apenas para interface)
  const handleGenerateWithAI = () => {
    // Implementação a ser adicionada posteriormente quando o Leonardo AI estiver configurado
    alert('A função de geração com IA será implementada em breve!');
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col w-full items-start gap-2">
        <div className="flex items-center">
          <Upload className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-medium">Logo</h2>
        </div>
        <p className="text-sm text-gray-500">Faça upload da sua logo ou gere uma com IA</p>
      </div>
      
      {/* Opções principais */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button 
          variant={activeScreen === 'upload' ? "default" : "outline"} 
          className="flex items-center justify-center gap-2 h-14" 
          onClick={() => switchScreen('upload')}
        >
          <Upload className="h-4 w-4" />
          Fazer Upload
        </Button>
        
        <Button 
          variant={activeScreen === 'ai' ? "default" : "outline"} 
          className="flex items-center justify-center gap-2 h-14" 
          onClick={() => switchScreen('ai')}
        >
          <Sparkles className="h-4 w-4" />
          Gerar com IA
        </Button>
      </div>
      
      {/* Área de Upload */}
      {activeScreen === 'upload' && (
        <div>
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro no upload</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
          
          {logo && logo.type === 'upload' ? (
            <div className="border rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src={logo.src as string} 
                  alt="Logo carregada" 
                  className="h-32 object-contain"
                />
              </div>
              <p className="text-sm text-gray-500 mb-4">{logo.name}</p>
              <Button 
                variant="outline" 
                onClick={() => onSelectLogo(null)}
              >
                Alterar Logo
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer" onClick={openFileSelector}>
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="rounded-full bg-green-50 p-6">
                  <Upload className="h-6 w-6 text-green-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Arraste sua logo ou clique para fazer upload</h3>
                  <p className="text-sm text-gray-500">
                    Suporta JPG, PNG ou SVG. Tamanho máximo recomendado: 2MB.
                  </p>
                </div>
                
                <Button 
                  variant="default" 
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileSelector();
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Selecionar Arquivo'
                  )}
                </Button>
                
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Dica:</span> Envie uma imagem com fundo transparente para melhor integração com o design do site.
            </p>
          </div>
        </div>
      )}
      
      {/* Área de IA */}
      {activeScreen === 'ai' && (
        <div className="border rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Sparkles className="h-10 w-10 text-primary" />
            <h3 className="text-lg font-medium">Gerar logo com Inteligência Artificial</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Nosso assistente de IA criará um logo personalizado para sua imobiliária com base nas suas preferências.
            </p>
            <Button 
              className="w-full max-w-sm" 
              onClick={handleGenerateWithAI}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Logo com IA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
