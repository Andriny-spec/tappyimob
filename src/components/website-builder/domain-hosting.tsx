import React from 'react';
import { Globe, Server, ExternalLink, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface DomainHostingStepProps {
  domainType: string;
  customDomain: string;
  hostingType: string;
  onSelectDomainType: (type: string) => void;
  onCustomDomainChange: (domain: string) => void;
  onSelectHostingType: (type: string) => void;
}

export const DomainHostingStep: React.FC<DomainHostingStepProps> = ({
  domainType,
  customDomain,
  hostingType,
  onSelectDomainType,
  onCustomDomainChange,
  onSelectHostingType
}) => {
  const handleDomainCheck = () => {
    // Aqui seria implementada a validação real do domínio
    alert(`O domínio ${customDomain} está disponível para registro!`);
  };

  return (
    <Tabs defaultValue="dominio" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="dominio" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Domínio
        </TabsTrigger>
        <TabsTrigger value="hospedagem" className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          Hospedagem
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dominio" className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Escolha do domínio</h3>
              <p className="text-xs text-slate-500">
                O domínio é o endereço onde seu site será acessado (ex: suaimobiliaria.com.br).
                Você pode usar nosso subdomínio gratuitamente ou registrar seu próprio domínio.
              </p>
            </div>
          </div>
        </div>
        
        <RadioGroup
          value={domainType}
          onValueChange={onSelectDomainType}
          className="space-y-4"
        >
          <div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="subdomain" id="subdomain" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="subdomain" className="text-base font-medium">
                  Usar subdomínio gratuito
                </Label>
                <p className="text-sm text-slate-500 mt-1">
                  Seu site estará disponível em: suaimobiliaria.tappy.imob.br
                </p>
                <div className="mt-3 bg-white border rounded-md p-3 flex items-center">
                  <span className="text-slate-400">https://</span>
                  <span className="text-slate-800 font-medium">suaimobiliaria</span>
                  <span className="text-slate-600">.tappy.imob.br</span>
                </div>
              </div>
              <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium">
                Grátis
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="custom" className="text-base font-medium">
                  Usar domínio personalizado
                </Label>
                <p className="text-sm text-slate-500 mt-1">
                  Registre seu próprio domínio para uma presença web mais profissional
                </p>
                <div className="mt-3 flex">
                  <div className="flex items-center border rounded-l-md px-3 bg-slate-50">
                    <span className="text-slate-500">https://</span>
                  </div>
                  <Input 
                    placeholder="suaimobiliaria.com.br" 
                    className="rounded-l-none"
                    value={customDomain}
                    onChange={(e) => onCustomDomainChange(e.target.value)}
                    disabled={domainType !== 'custom'}
                  />
                </div>
                {domainType === 'custom' && (
                  <div className="mt-2 flex">
                    <Button variant="outline" size="sm" onClick={handleDomainCheck}>
                      Verificar disponibilidade
                    </Button>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">
                R$ 89,90/ano
              </div>
            </div>
          </div>
        </RadioGroup>
      </TabsContent>
      
      <TabsContent value="hospedagem" className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Opções de hospedagem</h3>
              <p className="text-xs text-slate-500">
                A hospedagem é onde seu site ficará armazenado. Escolha entre nossa hospedagem gerenciada ou use sua própria solução.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -5 }}
            className={`border rounded-lg p-5 cursor-pointer ${
              hostingType === 'managed' ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            onClick={() => onSelectHostingType('managed')}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">Hospedagem Tappy</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Hospedagem gerenciada com suporte 24/7
                </p>
              </div>
              <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium">
                Recomendado
              </div>
            </div>
            
            <ul className="mt-4 space-y-2">
              {[
                'Velocidade otimizada',
                'Certificado SSL incluso',
                'Backup diário',
                'Proteção contra ataques',
                'Suporte técnico especializado'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="mt-4 border-t pt-4">
              <div className="text-primary font-medium">R$ 49,90/mês</div>
              <div className="text-xs text-slate-500">Incluso no pacote Imobiliária Digital</div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className={`border rounded-lg p-5 cursor-pointer ${
              hostingType === 'external' ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            onClick={() => onSelectHostingType('external')}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">Hospedagem Externa</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Use seu próprio provedor de hospedagem
                </p>
              </div>
              <div className="bg-slate-50 text-slate-700 rounded-full px-3 py-1 text-xs font-medium">
                Avançado
              </div>
            </div>
            
            <ul className="mt-4 space-y-2">
              {[
                'Controle total da hospedagem',
                'Configuração manual necessária',
                'Compatível com qualquer provedor',
                'Guia de implementação disponível',
                'Possibilidade de usar infraestrutura própria'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="mt-4 border-t pt-4">
              <Button variant="outline" size="sm" className="mt-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                Mais informações
              </Button>
            </div>
          </motion.div>
        </div>
      </TabsContent>
      
      {(domainType || hostingType) && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <h3 className="font-medium mb-2">Resumo da sua seleção:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {domainType && (
              <div>
                <p className="text-sm font-medium">Domínio:</p>
                <p className="text-sm text-slate-500">
                  {domainType === 'subdomain' 
                    ? 'Subdomínio Tappy (Grátis)' 
                    : 'Domínio Personalizado'}
                </p>
                {domainType === 'custom' && customDomain && (
                  <p className="text-xs text-primary mt-1">
                    {customDomain}
                  </p>
                )}
              </div>
            )}
            {hostingType && (
              <div>
                <p className="text-sm font-medium">Hospedagem:</p>
                <p className="text-sm text-slate-500">
                  {hostingType === 'managed' 
                    ? 'Hospedagem Tappy Gerenciada' 
                    : 'Hospedagem Externa'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Tabs>
  );
};
