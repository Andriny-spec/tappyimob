import React, { useState } from 'react';
import { Upload, Sparkles, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LogoSelectionStepProps {
  logo: any;
  onSelectLogo: (logo: any) => void;
}

export const LogoSelectionStep: React.FC<LogoSelectionStepProps> = ({ 
  logo, 
  onSelectLogo 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoName, setLogoName] = useState('');
  const [logoDescription, setLogoDescription] = useState('');
  const [generatedLogos, setGeneratedLogos] = useState([
    '/images/logos/gerado-1.jpg',
    '/images/logos/gerado-2.jpg',
    '/images/logos/gerado-3.jpg',
  ]);
  
  // Função para simular a geração de logos com IA
  const handleGenerateLogo = () => {
    if (!logoName || !logoDescription) return;
    
    setIsGenerating(true);
    
    // Simulando o tempo de geração
    setTimeout(() => {
      setIsGenerating(false);
      // Em produção, aqui seria a chamada à API de geração de imagem
    }, 3000);
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
  
  const handleSelectGeneratedLogo = (logoUrl: string) => {
    onSelectLogo({
      type: 'generated',
      src: logoUrl,
      name: logoName
    });
  };
  
  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Fazer Upload
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
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
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoName">Nome da Imobiliária</Label>
              <Input 
                id="logoName" 
                placeholder="Ex: Imobiliária Horizonte" 
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoDescription">Descreva como deseja sua logo</Label>
              <Input 
                id="logoDescription" 
                placeholder="Ex: Minimalista, moderna, com tons de azul" 
                value={logoDescription}
                onChange={(e) => setLogoDescription(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleGenerateLogo} 
              disabled={isGenerating || !logoName || !logoDescription}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Logos
                </>
              )}
            </Button>
          </div>
          
          {!isGenerating && generatedLogos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">
                Sugestões de logos para "{logoName || 'Sua Imobiliária'}"
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {generatedLogos.map((logoUrl, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-2 cursor-pointer hover:border-primary transition-all ${
                      logo && logo.type === 'generated' && logo.src === logoUrl
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    }`}
                    onClick={() => handleSelectGeneratedLogo(logoUrl)}
                  >
                    <div className="aspect-square bg-slate-100 rounded-md flex items-center justify-center">
                      <p className="text-xs text-center text-slate-400">Logo Exemplo {index + 1}</p>
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
