'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquareMore, 
  AlertCircle, 
  Loader2,
  Instagram, 
  Facebook, 
  MessageSquare, 
  Mail, 
  Send, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Settings,
  Linkedin
} from 'lucide-react';

// Tipos com base no schema Prisma
type TipoIntegracao = 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'SITE' | 'EMAIL' | 'SMS' | 'LINKEDIN';
type StatusIntegracao = 'ATIVA' | 'CONFIGURANDO' | 'PAUSADA' | 'ERRO';

interface Integracao {
  id: string;
  tipo: TipoIntegracao;
  nome: string;
  status: StatusIntegracao;
  urlWebhook?: string;
  agenteId: string;
  nomeAgente?: string;
  createdAt: string;
  updatedAt: string;
  ultimaMensagem?: string;
  ultimaAtividade?: string;
  mensagensEnviadas?: number;
  mensagensRecebidas?: number;
}

interface ListaIntegracoesProps {
  abrirFormularioIntegracao: () => void;
}

export function ListaIntegracoes({ abrirFormularioIntegracao }: ListaIntegracoesProps) {
  const { toast } = useToast();
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [integracaoDetalheId, setIntegracaoDetalheId] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  // Buscar dados reais de integrações
  useEffect(() => {
    buscarIntegracoes();
  }, []);

  const buscarIntegracoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ia/integracoes');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar integrações: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.integracoes && Array.isArray(data.integracoes)) {
        setIntegracoes(data.integracoes);
      } else {
        setIntegracoes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
      setError('Ocorreu um erro ao carregar as integrações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id: string, novoStatus: StatusIntegracao) => {
    try {
      setAtualizando(true);
      
      const response = await fetch(`/api/ia/integracoes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.statusText}`);
      }
      
      // Atualizar localmente
      setIntegracoes(prevIntegracoes => 
        prevIntegracoes.map(integracao => 
          integracao.id === id ? { ...integracao, status: novoStatus } : integracao
        )
      );
      
      toast({
        title: 'Status atualizado',
        description: `A integração foi ${novoStatus === 'ATIVA' ? 'ativada' : 
                                        novoStatus === 'PAUSADA' ? 'pausada' : 
                                        novoStatus === 'CONFIGURANDO' ? 'colocada em configuração' : 'marcada com erro'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status da integração. Tente novamente mais tarde.',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setAtualizando(false);
    }
  };

  // Filtrar as integrações conforme os filtros selecionados
  const integracoesFiltradas = integracoes.filter(integracao => {
    const tipoMatch = filtroTipo === 'todas' || integracao.tipo === filtroTipo;
    const statusMatch = filtroStatus === 'todas' || integracao.status === filtroStatus;
    return tipoMatch && statusMatch;
  });

  // Encontrar a integração selecionada para detalhes
  const integracaoSelecionada = integracaoDetalheId 
    ? integracoes.find(i => i.id === integracaoDetalheId) 
    : null;

  // Função para renderizar o ícone correto para o tipo de integração
  const getIconePorTipo = (tipo: TipoIntegracao) => {
    switch(tipo) {
      case 'WHATSAPP':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'FACEBOOK':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'INSTAGRAM':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'SITE':
        return <MessageSquareMore className="h-5 w-5 text-purple-600" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-amber-600" />;
      case 'SMS':
        return <Send className="h-5 w-5 text-slate-600" />;
      case 'LINKEDIN':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  // Função para obter nome amigável do tipo de integração
  const getTipoIntegracao = (tipo: TipoIntegracao): string => {
    switch(tipo) {
      case 'WHATSAPP': return 'WhatsApp';
      case 'FACEBOOK': return 'Facebook';
      case 'INSTAGRAM': return 'Instagram';
      case 'SITE': return 'Chat no Site';
      case 'EMAIL': return 'E-mail';
      case 'SMS': return 'SMS';
      case 'LINKEDIN': return 'LinkedIn';
      default: return tipo;
    }
  };

  // Função para obter a classe CSS do badge de status
  const getStatusBadgeClass = (status: StatusIntegracao): string => {
    switch(status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CONFIGURANDO':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PAUSADA':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'ERRO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return '';
    }
  };

  // Função para obter o texto amigável do status
  const getStatusText = (status: StatusIntegracao): string => {
    switch(status) {
      case 'ATIVA': return 'Ativa';
      case 'CONFIGURANDO': return 'Configurando';
      case 'PAUSADA': return 'Pausada';
      case 'ERRO': return 'Erro';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros e botões */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Tabs 
            defaultValue="todas" 
            value={filtroTipo} 
            onValueChange={setFiltroTipo}
            className="w-auto"
          >
            <TabsList className="bg-muted">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="WHATSAPP">WhatsApp</TabsTrigger>
              <TabsTrigger value="FACEBOOK">Facebook</TabsTrigger>
              <TabsTrigger value="INSTAGRAM">Instagram</TabsTrigger>
              <TabsTrigger value="SITE">Site</TabsTrigger>
              <TabsTrigger value="LINKEDIN">LinkedIn</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs 
            defaultValue="todas" 
            value={filtroStatus} 
            onValueChange={setFiltroStatus}
            className="w-auto"
          >
            <TabsList className="bg-muted">
              <TabsTrigger value="todas">Todos Status</TabsTrigger>
              <TabsTrigger value="ATIVA">Ativas</TabsTrigger>
              <TabsTrigger value="CONFIGURANDO">Configurando</TabsTrigger>
              <TabsTrigger value="PAUSADA">Pausadas</TabsTrigger>
              <TabsTrigger value="ERRO">Com Erro</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={buscarIntegracoes}
            disabled={loading || atualizando}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading || atualizando ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            size="sm" 
            onClick={abrirFormularioIntegracao}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova Integração
          </Button>
        </div>
      </div>
      
      {/* Estado de carregamento */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Carregando integrações...</p>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Lista de integrações */}
      {!loading && !error && (
        <>
          {integracoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-8 border border-dashed border-slate-200">
              <div className="bg-slate-100 rounded-full p-3 mb-4">
                <MessageSquareMore className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Nenhuma integração encontrada</h3>
              <p className="text-slate-500 text-center mb-4">
                {filtroTipo !== 'todas' || filtroStatus !== 'todas' ? 
                  'Tente ajustar os filtros ou ' : 
                  'Você ainda não possui integrações. '}
                Crie uma nova integração para conectar seu agente a canais externos.
              </p>
              <Button onClick={abrirFormularioIntegracao} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Nova Integração
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integracoesFiltradas.map((integracao) => (
                <Card key={integracao.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-slate-100">
                          {getIconePorTipo(integracao.tipo)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{integracao.nome}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">
                              {getTipoIntegracao(integracao.tipo)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-normal ${getStatusBadgeClass(integracao.status)}`}
                            >
                              {getStatusText(integracao.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setIntegracaoDetalheId(integracao.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    {integracao.status === 'ATIVA' && (
                      <div className="grid grid-cols-2 gap-2 mb-3 mt-2">
                        <div className="bg-slate-50 p-2 rounded text-center">
                          <p className="text-xs text-slate-500">Mensagens recebidas</p>
                          <p className="font-medium">{integracao.mensagensRecebidas || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded text-center">
                          <p className="text-xs text-slate-500">Mensagens enviadas</p>
                          <p className="font-medium">{integracao.mensagensEnviadas || 0}</p>
                        </div>
                      </div>
                    )}
                    
                    {integracao.ultimaMensagem && (
                      <div className="text-sm text-slate-600">
                        <p className="font-medium text-xs text-slate-500 mb-1">Última mensagem:</p>
                        <p className="truncate">{integracao.ultimaMensagem}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-4 pb-3 flex justify-between text-xs text-slate-500">
                    <span>
                      {integracao.ultimaAtividade 
                        ? `Última atividade: ${integracao.ultimaAtividade}` 
                        : `Criado em: ${new Date(integracao.createdAt).toLocaleDateString('pt-BR')}`}
                    </span>
                    <div className="flex gap-1">
                      {integracao.status !== 'ATIVA' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => atualizarStatus(integracao.id, 'ATIVA')}
                          disabled={atualizando}
                          title="Ativar integração"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      
                      {integracao.status !== 'PAUSADA' && integracao.status !== 'ERRO' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => atualizarStatus(integracao.id, 'PAUSADA')}
                          disabled={atualizando}
                          title="Pausar integração"
                        >
                          <XCircle className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Modal de detalhes da integração */}
      <Dialog open={!!integracaoDetalheId} onOpenChange={(open) => !open && setIntegracaoDetalheId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {integracaoSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getIconePorTipo(integracaoSelecionada.tipo)}
                  {integracaoSelecionada.nome}
                </DialogTitle>
                <DialogDescription>
                  Detalhes da integração {getTipoIntegracao(integracaoSelecionada.tipo)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge 
                    className={`px-2 py-1 ${getStatusBadgeClass(integracaoSelecionada.status)}`}
                  >
                    {getStatusText(integracaoSelecionada.status)}
                  </Badge>
                  <p className="text-sm text-slate-500">
                    Criado em: {new Date(integracaoSelecionada.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tipo de Integração</h4>
                    <p className="text-sm text-slate-600">{getTipoIntegracao(integracaoSelecionada.tipo)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Agente Vinculado</h4>
                    <p className="text-sm text-slate-600">{integracaoSelecionada.nomeAgente || 'Agente padrão'}</p>
                  </div>
                </div>
                
                {integracaoSelecionada.urlWebhook && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">URL de Webhook</h4>
                    <p className="text-sm text-slate-600 break-all">{integracaoSelecionada.urlWebhook}</p>
                  </div>
                )}
                
                {integracaoSelecionada.status === 'ATIVA' && (
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg">
                    <div className="text-center">
                      <h4 className="text-xs text-slate-500 mb-1">Recebidas</h4>
                      <p className="text-xl font-semibold text-primary">{integracaoSelecionada.mensagensRecebidas || 0}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs text-slate-500 mb-1">Enviadas</h4>
                      <p className="text-xl font-semibold text-primary">{integracaoSelecionada.mensagensEnviadas || 0}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs text-slate-500 mb-1">Total</h4>
                      <p className="text-xl font-semibold text-primary">
                        {(integracaoSelecionada.mensagensRecebidas || 0) + (integracaoSelecionada.mensagensEnviadas || 0)}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4 border-t">
                  <div className="space-x-2">
                    {integracaoSelecionada.status !== 'ATIVA' && (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="gap-1"
                        onClick={() => {
                          atualizarStatus(integracaoSelecionada.id, 'ATIVA');
                          setIntegracaoDetalheId(null);
                        }}
                        disabled={atualizando}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Ativar
                      </Button>
                    )}
                    
                    {integracaoSelecionada.status === 'ATIVA' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1"
                        onClick={() => {
                          atualizarStatus(integracaoSelecionada.id, 'PAUSADA');
                          setIntegracaoDetalheId(null);
                        }}
                        disabled={atualizando}
                      >
                        <XCircle className="h-4 w-4" />
                        Pausar
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => {
                      // Aqui poderia ir para página de configuração da integração
                      setIntegracaoDetalheId(null);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Configurar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
