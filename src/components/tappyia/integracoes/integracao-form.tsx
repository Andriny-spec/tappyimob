'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  Globe, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Code, 
  Copy, 
  Terminal,
  ArrowRight
} from 'lucide-react';
import { MessageSquare as WhatsappIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IntegracaoFormProps {
  onIntegracaoCriada?: () => void;
}

export function IntegracaoForm({ onIntegracaoCriada }: IntegracaoFormProps) {
  // Estado para controlar a etapa atual do wizard
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [progressoEtapa, setProgressoEtapa] = useState(25); // 25%, 50%, 75%, 100%
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validandoCredenciais, setValidandoCredenciais] = useState(false);
  const [tab, setTab] = useState('whatsapp'); // Controla qual aba está ativa
  
  // Estado para armazenar os agentes disponíveis
  const [agentesDisponiveis, setAgentesDisponiveis] = useState<Array<{id: string, nome: string, emoji?: string}>>([]);
  const [carregandoAgentes, setCarregandoAgentes] = useState(false);
  
  // Efeito para buscar os agentes disponíveis
  useEffect(() => {
    const buscarAgentes = async () => {
      try {
        setCarregandoAgentes(true);
        setErrorMessage(null);
        
        const response = await fetch('/api/ia/agentes');
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar agentes: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.agentes && Array.isArray(data.agentes)) {
          setAgentesDisponiveis(data.agentes.map((agente: any) => ({
            id: agente.id,
            nome: agente.nome,
            emoji: agente.emoji || '🤖'
          })));
        } else {
          setAgentesDisponiveis([]);
        }
      } catch (error) {
        console.error('Erro ao buscar agentes:', error);
        // Não vamos mostrar erro ao usuário, apenas log no console
      } finally {
        setCarregandoAgentes(false);
      }
    };
    
    // Buscar agentes quando entrar na etapa 2 (configuração de agente)
    if (etapaAtual === 2) {
      buscarAgentes();
    }
  }, [etapaAtual]);
  
  const [formValues, setFormValues] = useState({
    tipoIntegracao: 'WHATSAPP',
    nomeIntegracao: '',
    ativoImediato: false,
    agenteSelecionado: '',
    credenciais: {
      whatsapp: {
        numero: '',
        token: '',
        verificado: false
      },
      facebook: {
        paginaId: '',
        token: '',
        verificado: false
      },
      instagram: {
        contaId: '',
        token: '',
        verificado: false
      },
      site: {
        url: '',
        cor: '#3b82f6',
        titulo: 'Assistente Virtual',
        verificado: true // Site não precisa de verificação externa
      }
    }
  });

  // Funções para navegar entre as etapas do wizard
  const proximaEtapa = () => {
    // Validação de acordo com a etapa atual
    if (etapaAtual === 1) {
      // Etapa 1: Seleção de canal - validar se um canal foi selecionado
      if (!formValues.tipoIntegracao) {
        setErrorMessage('Selecione um canal para continuar');
        return;
      }
    } else if (etapaAtual === 2) {
      // Etapa 2: Configuração básica - validar nome e agente selecionado
      if (!formValues.nomeIntegracao || !formValues.agenteSelecionado) {
        setErrorMessage('Preencha todos os campos obrigatórios');
        return;
      }
    } else if (etapaAtual === 3) {
      // Etapa 3: Credenciais - verificar se as credenciais estão preenchidas
      const tipoInteg = formValues.tipoIntegracao.toLowerCase() as keyof typeof formValues.credenciais;
      
      if (tipoInteg === 'whatsapp') {
        if (!formValues.credenciais.whatsapp.numero || !formValues.credenciais.whatsapp.token) {
          setErrorMessage('Preencha todos os campos de credenciais do WhatsApp');
          return;
        }
      } else if (tipoInteg === 'facebook') {
        if (!formValues.credenciais.facebook.paginaId || !formValues.credenciais.facebook.token) {
          setErrorMessage('Preencha todos os campos de credenciais do Facebook');
          return;
        }
      } else if (tipoInteg === 'instagram') {
        if (!formValues.credenciais.instagram.contaId || !formValues.credenciais.instagram.token) {
          setErrorMessage('Preencha todos os campos de credenciais do Instagram');
          return;
        }
      } else if (tipoInteg === 'site') {
        if (!formValues.credenciais.site.url) {
          setErrorMessage('Informe a URL do site');
          return;
        }
      }
    }
    
    // Se chegou aqui, não há erros
    setErrorMessage(null);
    setEtapaAtual(prev => Math.min(prev + 1, 4));
    setProgressoEtapa((etapaAtual + 1) * 25);
  };
  
  const etapaAnterior = () => {
    setEtapaAtual(prev => Math.max(prev - 1, 1));
    setProgressoEtapa((etapaAtual - 1) * 25);
    setErrorMessage(null);
  };

  // Verificar credenciais antes de finalizar
  const verificarCredenciais = async () => {
    setValidandoCredenciais(true);
    setErrorMessage(null);
    
    // Simular verificação de credenciais com API
    setTimeout(() => {
      const tipoInteg = formValues.tipoIntegracao.toLowerCase() as keyof typeof formValues.credenciais;
      
      if (tipoInteg === 'site') {
        // Site já é considerado verificado
        setFormValues(prev => ({
          ...prev,
          credenciais: {
            ...prev.credenciais,
            site: {
              ...prev.credenciais.site,
              verificado: true
            }
          }
        }));
      } else {
        // Para outros canais, simular uma verificação bem-sucedida
        setFormValues(prev => {
          const novaCredencial = {
            ...prev.credenciais,
            [tipoInteg]: {
              ...prev.credenciais[tipoInteg],
              verificado: true
            }
          };
          
          return {
            ...prev,
            credenciais: novaCredencial
          };
        });
      }
      
      setValidandoCredenciais(false);
      proximaEtapa(); // Avançar para a próxima etapa após verificação bem-sucedida
    }, 1500);
  };
  
  const handleChange = (field: string, value: any) => {
    // Se estiver alterando o tipo de integração, atualizar abas
    if (field === 'tipoIntegracao') {
      setTab(value.toLowerCase());
    }
    
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleCredentialsChange = (platform: string, field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      credenciais: {
        ...prev.credenciais,
        [platform]: {
          ...prev.credenciais[platform as keyof typeof prev.credenciais],
          [field]: value,
          // Resetar verificado quando as credenciais são alteradas
          verificado: platform === 'site' ? true : false
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica para salvar a integração
    console.log('Dados da integração:', formValues);
  };

  const submeterFormulario = async () => {
    try {
      // Estado de carregamento
      setValidandoCredenciais(true);
      setErrorMessage(null);
      
      // Preparar os dados para enviar para a API
      const tipoInteg = formValues.tipoIntegracao.toLowerCase() as keyof typeof formValues.credenciais;
      
      // Preencher agenteId simulado para teste
      // Na versão real isto seria substituído pelo ID do agente selecionado
      const agenteId = formValues.agenteSelecionado || 'agente-simulado-12345';
      
      const dadosParaAPI = {
        tipo: formValues.tipoIntegracao,
        nome: formValues.nomeIntegracao || `Integração ${formValues.tipoIntegracao}`,
        agenteId: agenteId,
        status: formValues.ativoImediato ? 'ATIVA' : 'CONFIGURANDO',
        // Enviar as credenciais como string já que a API espera uma string
        credenciais: JSON.stringify(formValues.credenciais[tipoInteg]),
        // Configurações adicionais em formato de string
        configuracoes: JSON.stringify({
          ativoImediato: formValues.ativoImediato,
          canal: formValues.tipoIntegracao
        })
      };
      
      // Chamar a API para criar a integração
      const response = await fetch('/api/ia/integracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaAPI)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensagem || 'Erro ao criar integração');
      }
      
      // Sucesso - Resetar o formulário
      setFormValues({
        tipoIntegracao: 'WHATSAPP',
        nomeIntegracao: '',
        ativoImediato: false,
        agenteSelecionado: '',
        credenciais: {
          whatsapp: {
            numero: '',
            token: '',
            verificado: false
          },
          facebook: {
            paginaId: '',
            token: '',
            verificado: false
          },
          instagram: {
            contaId: '',
            token: '',
            verificado: false
          },
          site: {
            url: '',
            cor: '#3b82f6',
            titulo: 'Assistente Virtual',
            verificado: true
          }
        }
      });
      
      // Voltar para a primeira etapa
      setEtapaAtual(1);
      setProgressoEtapa(25);
      
      // Notificar o componente pai que a integração foi criada com sucesso
      if (onIntegracaoCriada) {
        onIntegracaoCriada();
      }
    } catch (error) {
      console.error('Erro ao criar integração:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro ao criar a integração. Tente novamente.');
    } finally {
      setValidandoCredenciais(false);
    }
  };

  // Renderizar indicador de progresso do wizard
  const renderizarProgressoWizard = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <div className={`text-sm font-medium ${etapaAtual >= 1 ? 'text-primary' : 'text-slate-400'}`}>Selecionar Canal</div>
          <div className={`text-sm font-medium ${etapaAtual >= 2 ? 'text-primary' : 'text-slate-400'}`}>Configurar Agente</div>
          <div className={`text-sm font-medium ${etapaAtual >= 3 ? 'text-primary' : 'text-slate-400'}`}>Credenciais</div>
          <div className={`text-sm font-medium ${etapaAtual >= 4 ? 'text-primary' : 'text-slate-400'}`}>Revisar</div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progressoEtapa}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Renderizar a etapa atual do wizard
  const renderizarEtapaWizard = () => {
    switch(etapaAtual) {
      case 1:
        return renderizarEtapa1SelecionarCanal();
      case 2:
        return renderizarEtapa2ConfigurarAgente();
      case 3:
        return renderizarEtapa3Credenciais();
      case 4:
        return renderizarEtapa4Revisar();
      default:
        return null;
    }
  };
  
  // Etapa 2: Configuração do agente
  const renderizarEtapa2ConfigurarAgente = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Configure sua integração</h2>
        <p className="text-muted-foreground">Defina um nome para sua integração e selecione qual agente irá atender</p>
        
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="nome-integracao" className="text-base">Nome da Integração</Label>
                <Input 
                  id="nome-integracao" 
                  placeholder={`Ex: ${formValues.tipoIntegracao === 'WHATSAPP' ? 'WhatsApp Vendas' : 
                    formValues.tipoIntegracao === 'FACEBOOK' ? 'Facebook Imobiliária' : 
                    formValues.tipoIntegracao === 'INSTAGRAM' ? 'Instagram Direto' : 'Chat do Site Principal'}`} 
                  value={formValues.nomeIntegracao}
                  onChange={e => handleChange('nomeIntegracao', e.target.value)}
                  className="text-base" 
                />
                <p className="text-xs text-slate-500">Escolha um nome descritivo que identifique esta integração</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="agente" className="text-base">Agente Responsável</Label>
                <Select 
                  value={formValues.agenteSelecionado} 
                  onValueChange={value => handleChange('agenteSelecionado', value)}
                  disabled={carregandoAgentes}
                >
                  <SelectTrigger id="agente" className="text-base">
                    {carregandoAgentes ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Carregando agentes...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Selecione um agente" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {agentesDisponiveis.length > 0 ? (
                      agentesDisponiveis.map((agente) => (
                        <SelectItem key={agente.id} value={agente.id}>
                          {agente.emoji || '🤖'} {agente.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {carregandoAgentes ? 'Carregando...' : 'Nenhum agente encontrado'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Este agente será responsável por responder às mensagens neste canal</p>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Switch 
                  id="ativo-imediato" 
                  checked={formValues.ativoImediato}
                  onCheckedChange={value => handleChange('ativoImediato', value)}
                />
                <Label htmlFor="ativo-imediato" className="font-medium">Ativar imediatamente após configuração</Label>
              </div>
              <p className="text-xs text-slate-500 pl-7">Se ativado, a integração começará a funcionar assim que for configurada</p>
            </div>
          </CardContent>
        </Card>
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={etapaAnterior} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={proximaEtapa} className="gap-1.5">
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  // Etapa 3: Configuração de credenciais
  const renderizarEtapa3Credenciais = () => {
    // Determinar qual tipo de credencial mostrar com base no tipo de integração
    const renderizarFormularioCredenciais = () => {
      switch(formValues.tipoIntegracao) {
        case 'WHATSAPP':
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Configurações do WhatsApp</h3>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Para integrar com o WhatsApp Business, você precisa de uma conta WhatsApp Business API. 
                  Se você ainda não tem, <a href="#" className="text-primary underline">solicite acesso aqui</a>.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="numero-whatsapp">Número de Telefone</Label>
                  <Input 
                    id="numero-whatsapp" 
                    placeholder="Ex: +5511999999999" 
                    value={formValues.credenciais.whatsapp.numero}
                    onChange={e => handleCredentialsChange('whatsapp', 'numero', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Insira o número completo, incluindo código do país (ex: +55)</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="token-whatsapp">Token de Acesso</Label>
                  <Input 
                    id="token-whatsapp" 
                    type="password"
                    placeholder="Seu token de acesso da API do WhatsApp" 
                    value={formValues.credenciais.whatsapp.token}
                    onChange={e => handleCredentialsChange('whatsapp', 'token', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">O token pode ser obtido no painel da sua conta WhatsApp Business</p>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <h4 className="text-sm font-medium">Tutorial: Como obter seu token</h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-600">
                  <li>Acesse o painel da Meta for Developers</li>
                  <li>Crie ou selecione um aplicativo</li>
                  <li>Adicione a permissão WhatsApp Business</li>
                  <li>Copie o token temporário ou gere um token permanente</li>
                </ol>
              </div>
            </div>
          );
        case 'FACEBOOK':
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Configurações do Facebook</h3>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Para integrar com o Facebook Messenger, você precisa de uma página comercial no Facebook 
                  e permissões de desenvolvedor.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="pagina-id">ID da Página</Label>
                  <Input 
                    id="pagina-id" 
                    placeholder="ID da sua página do Facebook" 
                    value={formValues.credenciais.facebook.paginaId}
                    onChange={e => handleCredentialsChange('facebook', 'paginaId', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">O ID da sua página pode ser encontrado nas configurações da página</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="token-fb">Token de Acesso</Label>
                  <Input 
                    id="token-fb" 
                    type="password"
                    placeholder="Token de acesso da página" 
                    value={formValues.credenciais.facebook.token}
                    onChange={e => handleCredentialsChange('facebook', 'token', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">O token pode ser gerado no painel de desenvolvedor do Facebook</p>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <h4 className="text-sm font-medium">Tutorial: Como conectar sua página</h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-600">
                  <li>Acesse o Facebook Developer Dashboard</li>
                  <li>Crie ou selecione um aplicativo</li>
                  <li>Adicione o produto Messenger ao seu aplicativo</li>
                  <li>Gere um token de acesso para a página desejada</li>
                </ol>
              </div>
            </div>
          );
        case 'INSTAGRAM':
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Configurações do Instagram</h3>
              
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Em breve</AlertTitle>
                <AlertDescription>
                  A integração completa com Instagram estará disponível em breve. Por enquanto, você pode 
                  configurar os detalhes básicos da integração.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="instagram-id">ID da Conta</Label>
                  <Input 
                    id="instagram-id" 
                    placeholder="ID da sua conta comercial do Instagram"
                    value={formValues.credenciais.instagram.contaId}
                    onChange={e => handleCredentialsChange('instagram', 'contaId', e.target.value)} 
                  />
                  <p className="text-xs text-slate-500">O ID pode ser encontrado nas configurações da sua conta comercial</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="token-ig">Token de Acesso</Label>
                  <Input 
                    id="token-ig" 
                    type="password"
                    placeholder="Token de acesso do Instagram" 
                    value={formValues.credenciais.instagram.token}
                    onChange={e => handleCredentialsChange('instagram', 'token', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">O token será utilizado para conectar ao Instagram</p>
                </div>
              </div>
            </div>
          );
        case 'SITE':
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Configurações do Widget para Site</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="url-site">URL do Site</Label>
                  <Input 
                    id="url-site" 
                    placeholder="Ex: https://meusite.com.br" 
                    value={formValues.credenciais.site.url}
                    onChange={e => handleCredentialsChange('site', 'url', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Informe a URL do site onde o chat será exibido</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="titulo-chat">Título do Chat</Label>
                  <Input 
                    id="titulo-chat" 
                    placeholder="Ex: Assistente Virtual" 
                    value={formValues.credenciais.site.titulo}
                    onChange={e => handleCredentialsChange('site', 'titulo', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Este será o título exibido no cabeçalho do widget</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="cor-chat">Cor Principal</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="cor-chat" 
                    type="color"
                    className="w-16 p-1 h-10"
                    value={formValues.credenciais.site.cor}
                    onChange={e => handleCredentialsChange('site', 'cor', e.target.value)}
                  />
                  <Input 
                    type="text"
                    className="w-32"
                    placeholder="#3b82f6" 
                    value={formValues.credenciais.site.cor}
                    onChange={e => handleCredentialsChange('site', 'cor', e.target.value)}
                  />
                  <p className="text-sm">Esta cor será utilizada no tema do chat</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Preview do Widget</h4>
                <div className="border rounded-lg p-4 bg-slate-50 flex items-center justify-center">
                  <div className="w-64 h-96 border rounded-lg overflow-hidden shadow-lg bg-white">
                    <div className="h-12 flex items-center px-3 shadow-sm" style={{ backgroundColor: formValues.credenciais.site.cor }}>
                      <span className="text-white font-medium">{formValues.credenciais.site.titulo || 'Assistente Virtual'}</span>
                    </div>
                    <div className="p-4 flex-1 flex items-center justify-center">
                      <p className="text-slate-400 text-center text-sm">Preview do widget de chat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Configure as credenciais</h2>
        <p className="text-muted-foreground">Informe as credenciais necessárias para conectar ao {formValues.tipoIntegracao === 'WHATSAPP' ? 'WhatsApp' : formValues.tipoIntegracao === 'FACEBOOK' ? 'Facebook' : formValues.tipoIntegracao === 'INSTAGRAM' ? 'Instagram' : 'seu site'}</p>
        
        <Card>
          <CardContent className="pt-6">
            {renderizarFormularioCredenciais()}
          </CardContent>
        </Card>
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={etapaAnterior} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={verificarCredenciais} 
            disabled={validandoCredenciais} 
            className="gap-1.5"
          >
            {validandoCredenciais ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };
  
  // Etapa 4: Revisão e finalização
  const renderizarEtapa4Revisar = () => {
    const getIconeCanal = () => {
      switch(formValues.tipoIntegracao) {
        case 'WHATSAPP':
          return <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center"><WhatsappIcon className="h-5 w-5 text-green-600" /></div>;
        case 'FACEBOOK':
          return <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center"><Facebook className="h-5 w-5 text-blue-600" /></div>;
        case 'INSTAGRAM':
          return <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center"><Instagram className="h-5 w-5 text-pink-600" /></div>;
        case 'SITE':
          return <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center"><Globe className="h-5 w-5 text-purple-600" /></div>;
        default:
          return null;
      }
    };
    
    const getTipoIntegracaoFormatado = () => {
      switch(formValues.tipoIntegracao) {
        case 'WHATSAPP': return 'WhatsApp';
        case 'FACEBOOK': return 'Facebook';
        case 'INSTAGRAM': return 'Instagram';
        case 'SITE': return 'Site';
        default: return formValues.tipoIntegracao;
      }
    };
    
    // Mostrar informações específicas de cada tipo de integração
    const renderizarResumoCredenciais = () => {
      switch(formValues.tipoIntegracao) {
        case 'WHATSAPP':
          return (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Número:</span>
                <span className="font-medium">{formValues.credenciais.whatsapp.numero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token:</span>
                <span className="font-medium">••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status de verificação:</span>
                <span className="font-medium flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Verificado
                </span>
              </div>
            </div>
          );
        case 'FACEBOOK':
          return (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">ID da Página:</span>
                <span className="font-medium">{formValues.credenciais.facebook.paginaId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token:</span>
                <span className="font-medium">••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status de verificação:</span>
                <span className="font-medium flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Verificado
                </span>
              </div>
            </div>
          );
        case 'INSTAGRAM':
          return (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">ID da Conta:</span>
                <span className="font-medium">{formValues.credenciais.instagram.contaId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token:</span>
                <span className="font-medium">••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status de verificação:</span>
                <span className="font-medium flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Verificado
                </span>
              </div>
            </div>
          );
        case 'SITE':
          return (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">URL do site:</span>
                <span className="font-medium">{formValues.credenciais.site.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Título do chat:</span>
                <span className="font-medium">{formValues.credenciais.site.titulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cor principal:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formValues.credenciais.site.cor }}></div>
                  <span className="font-medium">{formValues.credenciais.site.cor}</span>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };
    
    // Código para o widget de site (se aplicável)
    const renderizarCodigoIntegracao = () => {
      if (formValues.tipoIntegracao === 'SITE') {
        return (
          <div className="space-y-3">
            <h3 className="text-md font-medium">Código para integração</h3>
            <div className="bg-slate-900 text-slate-50 p-3 rounded-md text-xs font-mono overflow-x-auto relative">
              &lt;script src="https://tappy.com.br/chatwidget.js" data-chat-id="YOUR_CHAT_ID"&gt;&lt;/script&gt;
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-2 h-8 w-8 p-0 bg-slate-800 hover:bg-slate-700"
                title="Copiar código"
              >
                <Copy className="h-4 w-4 text-slate-200" />
              </Button>
            </div>
            <p className="text-sm text-slate-500">
              Após salvar a integração, copie este código e cole-o antes da tag de fechamento &lt;/body&gt; do seu site.
            </p>
          </div>
        );
      }
      return null;
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Revise sua integração</h2>
        <p className="text-muted-foreground">Confirme os detalhes antes de finalizar a configuração</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getIconeCanal()}
                  <div>
                    <h3 className="font-medium">{formValues.nomeIntegracao}</h3>
                    <p className="text-sm text-slate-500">Canal: {getTipoIntegracaoFormatado()}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agente:</span>
                    <span className="font-medium">
                      {formValues.agenteSelecionado ? 
                        (() => {
                          const agenteSelecionado = agentesDisponiveis.find(a => a.id === formValues.agenteSelecionado);
                          return agenteSelecionado ? 
                            `${agenteSelecionado.emoji || '🤖'} ${agenteSelecionado.nome}` : 
                            formValues.agenteSelecionado;
                        })() : 
                        '(Nenhum agente selecionado)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ativo imediatamente:</span>
                    <span className="font-medium">{formValues.ativoImediato ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Credenciais</CardTitle>
            </CardHeader>
            <CardContent>
              {renderizarResumoCredenciais()}
            </CardContent>
          </Card>
        </div>
        
        {renderizarCodigoIntegracao()}
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={etapaAnterior} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={submeterFormulario} 
            className="gap-1.5 bg-green-600 hover:bg-green-700"
            disabled={validandoCredenciais}
          >
            {validandoCredenciais ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Finalizar Integração
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };
  
  // Etapa 1: Seleção de canal
  const renderizarEtapa1SelecionarCanal = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Selecione o canal de integração</h2>
        <p className="text-muted-foreground">Escolha o canal com o qual deseja integrar seu agente de IA</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-md ${formValues.tipoIntegracao === 'WHATSAPP' ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
            onClick={() => handleChange('tipoIntegracao', 'WHATSAPP')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <WhatsappIcon className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-medium mb-1">WhatsApp</h3>
              <p className="text-sm text-slate-500">Conecte seu agente ao WhatsApp Business API</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-md ${formValues.tipoIntegracao === 'FACEBOOK' ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
            onClick={() => handleChange('tipoIntegracao', 'FACEBOOK')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Facebook className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">Facebook</h3>
              <p className="text-sm text-slate-500">Conecte seu agente ao Facebook Messenger</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-md ${formValues.tipoIntegracao === 'INSTAGRAM' ? 'border-pink-500 bg-pink-50' : 'border-transparent'}`}
            onClick={() => handleChange('tipoIntegracao', 'INSTAGRAM')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Instagram className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="font-medium mb-1">Instagram</h3>
              <p className="text-sm text-slate-500">Conecte seu agente ao Instagram Direct</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-md ${formValues.tipoIntegracao === 'SITE' ? 'border-purple-500 bg-purple-50' : 'border-transparent'}`}
            onClick={() => handleChange('tipoIntegracao', 'SITE')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-medium mb-1">Site</h3>
              <p className="text-sm text-slate-500">Adicione o chat do agente em seu site</p>
            </CardContent>
          </Card>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end mt-6">
          <Button onClick={proximaEtapa} className="gap-1.5">
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {renderizarProgressoWizard()}
      {renderizarEtapaWizard()}
    </div>
  );
}
