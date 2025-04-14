import React from 'react';
import { CheckCircle2, ExternalLink, DownloadCloud, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CompletionModalProps {
  config: {
    template?: string;
    templateSlug?: string;
    colorScheme?: string;
    fontFamily?: string;
    corPrimaria?: string;
    corSecundaria?: string;
    logo?: any;
    logoUrl?: string;
    pages?: string[];
    paginas?: string[];
    domainType?: string;
    customDomain?: string;
    dominio?: string;
    subdominio?: string;
    dominioProprio?: string;
    hostingType?: string;
    trainingFormat?: string;
  };
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ config }) => {
  // Calcular o valor aproximado do site
  const calculatePrice = () => {
    let basePrice = 0;
    
    // Preço base pelo template
    basePrice += 250;
    
    // Verificar se temos páginas para calcular o adicional
    const pages = config.paginas || config.pages || [];
    const extraPages = Math.max(0, pages.length - 5);
    basePrice += extraPages * 50;
    
    // Adicional para domínio personalizado
    if (config.dominioProprio || config.domainType === 'custom') {
      basePrice += 90; // Custo anual do domínio
    }
    
    // Adicional para hospedagem gerenciada (padrão para sim)
    basePrice += 50; // Custo mensal da hospedagem
    
    return basePrice;
  };
  
  const price = calculatePrice();
  
  // Determinar o domínio a ser exibido
  let domain = 'imob.tappy.id/exemplo/home';
  
  if (config.dominioProprio) {
    domain = config.dominioProprio || 'seudominio.com.br';
  } else if (config.subdominio) {
    domain = `${config.subdominio}.tappy.imob.br`;
  } else if (config.domainType === 'custom') {
    domain = config.customDomain || 'seudominio.com.br';
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="flex justify-center mb-4"
        >
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-2">Seu Site Está Pronto!</h2>
          <p className="text-slate-500">
            Seu site está sendo implementado e estará disponível em breve no endereço:
          </p>
          <div className="mt-2 mb-6">
            <span className="font-medium text-primary">https://{domain}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button 
              onClick={() => {
                // Link para visualização local do site (usando a nova estrutura de rotas)
                const subdomain = config.subdominio || 'exemplo';
                window.open(`/${subdomain}/home`, '_blank');
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver meu site agora
            </Button>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg border p-4">
          <h3 className="font-medium mb-3">Resumo da sua solução</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">Template escolhido:</span>
              <span className="font-medium">
                {config.templateSlug || config.template ? 
                  (config.templateSlug || config.template || 'Padrão').charAt(0).toUpperCase() + 
                  (config.templateSlug || config.template || 'Padrão').slice(1) : 
                  'Moderno'
                }
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Cor primária:</span>
              <span className="font-medium">
                {config.corPrimaria || 
                  (config.colorScheme ? 
                    config.colorScheme.charAt(0).toUpperCase() + config.colorScheme.slice(1) : 
                    'Verde')
                }
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Fonte principal:</span>
              <span className="font-medium">
                {config.fontFamily ? 
                  config.fontFamily.charAt(0).toUpperCase() + config.fontFamily.slice(1) : 
                  'Inter'
                }
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Número de páginas:</span>
              <span className="font-medium">
                {(config.paginas?.length || config.pages?.length || 5)} páginas
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Domínio:</span>
              <span className="font-medium">
                {config.dominioProprio ? 'Personalizado' : 
                 (config.subdominio ? 'Subdomínio' : 
                 (config.domainType === 'custom' ? 'Personalizado' : 'Subdomínio'))}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Hospedagem:</span>
              <span className="font-medium">Tappy Gerenciada</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Formato de treinamento:</span>
              <span className="font-medium">
                {config.trainingFormat === 'video' ? 'Vídeos' : 'Texto e Vídeos'}
              </span>
            </li>
          </ul>
        </div>
        
        <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
          <h3 className="font-medium mb-3">Valor da sua solução</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Valor total estimado:</span>
              <span className="text-xl font-bold text-primary">R$ {price.toFixed(2)}</span>
            </div>
            
            <div className="text-sm text-slate-500">
              {config.domainType === 'custom' && (
                <p>• Inclui domínio personalizado: R$ 89,90/ano</p>
              )}
              {config.hostingType === 'managed' && (
                <p>• Inclui hospedagem gerenciada: R$ 49,90/mês</p>
              )}
              <p>• Suporte técnico disponível 24/7</p>
              <p>• Atualizações gratuitas de segurança</p>
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-500">
                Entre em contato com nosso suporte para mais detalhes sobre planos e pagamentos.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button className="flex-1">
          <DownloadCloud className="mr-2 h-4 w-4" />
          Baixar Material de Treinamento
        </Button>
        
        <Button variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar Resultado
        </Button>
        
        <Button variant="outline" className="flex-1">
          <ExternalLink className="mr-2 h-4 w-4" />
          Visitar Dashboard
        </Button>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800">
        <p className="text-sm">
          <span className="font-medium">Informação importante:</span> Seu site está em processo de 
          implementação e estará completamente funcional em até 24 horas. Você receberá um e-mail 
          quando estiver disponível para acesso.
        </p>
      </div>
    </div>
  );
};
