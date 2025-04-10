'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Zap,
  Clock,
  Mail,
  MessageCircle,
  Calendar,
  BellRing,
  UserPlus,
  Settings,
  Plus,
  ChevronRight,
  PencilLine,
  Trash2,
  Play,
  Pause,
  Filter,
  Clock8,
  TimerReset,
  MailCheck,
  MessageSquare,
  CalendarCheck,
  BarChart3
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Dados fictícios para demonstração
const automacoes = [
  {
    id: 1,
    nome: 'Boas-vindas para novos leads',
    descricao: 'Envia uma mensagem automática para novos leads que entrarem em contato',
    gatilho: 'Novo lead cadastrado',
    acao: 'Enviar e-mail',
    destinatario: 'lead',
    status: 'ativo',
    ultimaExecucao: '10/03/2025 às 15:23',
    execucoes: 128,
    categoria: 'comunicacao'
  },
  {
    id: 2,
    nome: 'Lembrete de visita agendada',
    descricao: 'Envia um lembrete 24h antes de uma visita agendada',
    gatilho: '24h antes do agendamento',
    acao: 'Enviar WhatsApp',
    destinatario: 'cliente',
    status: 'ativo',
    ultimaExecucao: '09/03/2025 às 10:00',
    execucoes: 56,
    categoria: 'agendamento'
  },
  {
    id: 3,
    nome: 'Recontato de leads inativos',
    descricao: 'Envia uma mensagem para leads que não interagiram nos últimos 30 dias',
    gatilho: 'Lead inativo por 30 dias',
    acao: 'Enviar e-mail',
    destinatario: 'lead',
    status: 'inativo',
    ultimaExecucao: '05/02/2025 às 08:30',
    execucoes: 42,
    categoria: 'reengajamento'
  },
  {
    id: 4,
    nome: 'Pedido de avaliação após venda',
    descricao: 'Solicita uma avaliação do atendimento após a conclusão de uma venda',
    gatilho: '3 dias após conclusão da venda',
    acao: 'Enviar e-mail',
    destinatario: 'cliente',
    status: 'ativo',
    ultimaExecucao: '08/03/2025 às 12:15',
    execucoes: 31,
    categoria: 'pos-venda'
  },
  {
    id: 5,
    nome: 'Notificação de novos imóveis',
    descricao: 'Notifica clientes quando novos imóveis que correspondem aos seus interesses são cadastrados',
    gatilho: 'Novo imóvel cadastrado',
    acao: 'Enviar e-mail e WhatsApp',
    destinatario: 'cliente',
    status: 'ativo',
    ultimaExecucao: '10/03/2025 às 09:45',
    execucoes: 85,
    categoria: 'notificacao'
  }
];

// Dados de desempenho
const desempenhoAutomacoes = {
  totalExecucoes: 342,
  emailsEnviados: 255,
  whatsAppEnviados: 87,
  taxaAbertura: '68%',
  taxaResposta: '32%',
  conversoes: 15
};

// Templates disponíveis
const templatesDisponiveis = [
  {
    id: 101,
    nome: 'Boas-vindas para novos leads',
    categoria: 'comunicacao',
    descricao: 'Envia uma mensagem automática para novos leads',
    popular: true
  },
  {
    id: 102,
    nome: 'Lembrete de visita',
    categoria: 'agendamento',
    descricao: 'Envia lembretes antes de visitas agendadas',
    popular: true
  },
  {
    id: 103,
    nome: 'Follow-up após visita',
    categoria: 'pos-venda',
    descricao: 'Acompanhamento após uma visita a um imóvel',
    popular: false
  },
  {
    id: 104,
    nome: 'Reengajamento de leads frios',
    categoria: 'reengajamento',
    descricao: 'Tenta reconectar com leads inativos',
    popular: true
  },
  {
    id: 105,
    nome: 'Alerta de preço reduzido',
    categoria: 'notificacao',
    descricao: 'Notifica sobre reduções de preço em imóveis favoritos',
    popular: false
  },
  {
    id: 106,
    nome: 'Aniversário do cliente',
    categoria: 'comunicacao',
    descricao: 'Envia mensagem no aniversário do cliente',
    popular: false
  }
];

export default function AutomacoesCorretorPage() {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  
  // Filtro de automações
  const automacoesFiltradas = automacoes.filter(automacao => {
    // Filtro por busca
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca === '' || 
      automacao.nome.toLowerCase().includes(termoBusca) || 
      automacao.descricao.toLowerCase().includes(termoBusca);
    
    // Filtro por categoria
    const matchCategoria = filtroCategoria === 'todas' || automacao.categoria === filtroCategoria;
    
    // Filtro por status
    const matchStatus = filtroStatus === 'todos' || automacao.status === filtroStatus;
    
    return matchBusca && matchCategoria && matchStatus;
  });
  
  // Ícone com base na categoria
  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'comunicacao':
        return <Mail className="h-4 w-4" />;
      case 'agendamento':
        return <Calendar className="h-4 w-4" />;
      case 'reengajamento':
        return <TimerReset className="h-4 w-4" />;
      case 'pos-venda':
        return <MailCheck className="h-4 w-4" />;
      case 'notificacao':
        return <BellRing className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };
  
  return (
    <PageContainer
      title="Automações"
      subtitle="Configure fluxos automáticos para otimizar seu trabalho"
    >
      <div className="space-y-6">
        {/* Visão geral de desempenho */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Desempenho das Automações</CardTitle>
                <CardDescription>
                  Estatísticas de utilização dos últimos 30 dias
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Total Execuções</p>
                    <p className="text-3xl font-bold mt-1">{desempenhoAutomacoes.totalExecucoes}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">E-mails</p>
                    <p className="text-3xl font-bold mt-1">{desempenhoAutomacoes.emailsEnviados}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">WhatsApp</p>
                    <p className="text-3xl font-bold mt-1">{desempenhoAutomacoes.whatsAppEnviados}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Taxa Abertura</p>
                    <p className="text-3xl font-bold mt-1">{desempenhoAutomacoes.taxaAbertura}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Taxa Resposta</p>
                    <p className="text-3xl font-bold mt-1">{desempenhoAutomacoes.taxaResposta}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Conversões</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{desempenhoAutomacoes.conversoes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Filtro e Nova Automação */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 sm:max-w-xs">
            <Input
              type="search"
              placeholder="Buscar automação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Automação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Automação</DialogTitle>
                  <DialogDescription>
                    Selecione um modelo ou crie uma automação personalizada
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="templates" className="mt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="templates" className="flex-1">Usar Template</TabsTrigger>
                    <TabsTrigger value="personalizada" className="flex-1">Personalizada</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="templates" className="mt-4 space-y-4">
                    <div className="grid gap-3">
                      {templatesDisponiveis.map((template) => (
                        <div 
                          key={template.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:border-primary cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center">
                              {getCategoriaIcon(template.categoria)}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                {template.nome}
                                {template.popular && (
                                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">
                                    Popular
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-xs text-muted-foreground">{template.descricao}</p>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Usar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="personalizada" className="mt-4 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nome da Automação</label>
                        <Input placeholder="Ex: Boas-vindas para novos leads" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Quando esta automação deve ser acionada?</label>
                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Selecione um gatilho</option>
                          <option value="novo_lead">Quando um novo lead for cadastrado</option>
                          <option value="agendamento">Quando uma visita for agendada</option>
                          <option value="inatividade">Quando um lead ficar inativo por X dias</option>
                          <option value="conclusao_venda">Quando uma venda for concluída</option>
                          <option value="aniversario">No aniversário do cliente</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Qual ação deve ser executada?</label>
                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Selecione uma ação</option>
                          <option value="email">Enviar e-mail</option>
                          <option value="whatsapp">Enviar mensagem WhatsApp</option>
                          <option value="notificacao">Criar notificação no sistema</option>
                          <option value="tarefa">Criar tarefa</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Para quem?</label>
                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Selecione o destinatário</option>
                          <option value="todos_leads">Todos os leads</option>
                          <option value="leads_qualificados">Apenas leads qualificados</option>
                          <option value="todos_clientes">Todos os clientes</option>
                          <option value="clientes_compradores">Apenas clientes compradores</option>
                          <option value="clientes_vendedores">Apenas clientes vendedores</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Conteúdo da mensagem</label>
                        <textarea 
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Digite o conteúdo da mensagem aqui..."
                        ></textarea>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Criar Automação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Lista de automações */}
        <Tabs defaultValue="todas" onValueChange={setFiltroCategoria}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="comunicacao">Comunicação</TabsTrigger>
            <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
            <TabsTrigger value="reengajamento">Reengajamento</TabsTrigger>
            <TabsTrigger value="pos-venda">Pós-venda</TabsTrigger>
            <TabsTrigger value="notificacao">Notificação</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-end mt-2">
            <Tabs defaultValue="todos" onValueChange={setFiltroStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos" className="text-xs px-3">Todos</TabsTrigger>
                <TabsTrigger value="ativo" className="text-xs px-3">Ativos</TabsTrigger>
                <TabsTrigger value="inativo" className="text-xs px-3">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <TabsContent value="todas" className="mt-4">
            <Card>
              <CardContent className="px-6 py-4">
                {automacoesFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-center text-muted-foreground">
                      Nenhuma automação encontrada com os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {automacoesFiltradas.map((automacao) => (
                      <div key={automacao.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-full h-9 w-9 flex items-center justify-center mt-0.5">
                            {getCategoriaIcon(automacao.categoria)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-y-1">
                              <h3 className="font-medium text-base">{automacao.nome}</h3>
                              <Badge 
                                variant={automacao.status === 'ativo' ? 'default' : 'secondary'} 
                                className="ml-2"
                              >
                                {automacao.status === 'ativo' ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{automacao.descricao}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <BellRing className="h-3.5 w-3.5 mr-1.5" />
                                <span>Gatilho: {automacao.gatilho}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                <span>Ação: {automacao.acao}</span>
                              </div>
                              <div className="flex items-center">
                                <TimerReset className="h-3.5 w-3.5 mr-1.5" />
                                <span>Última execução: {automacao.ultimaExecucao || 'Nunca'}</span>
                              </div>
                              <div className="flex items-center">
                                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                                <span>Total execuções: {automacao.execucoes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          <div className="flex items-center mr-2">
                            <Switch 
                              id={`status-${automacao.id}`}
                              checked={automacao.status === 'ativo'}
                            />
                          </div>
                          
                          <Button variant="outline" size="sm">
                            <PencilLine className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Conteúdo das outras abas - carregado dinamicamente pelo filtro */}
        </Tabs>
        
        {/* Dicas de uso */}
        <Card>
          <CardHeader>
            <CardTitle>Melhores Práticas</CardTitle>
            <CardDescription>
              Dicas para maximizar os resultados com automações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Defina o melhor momento para cada automação</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha cuidadosamente o momento para acionar automações. Por exemplo, lembretes de visita são mais eficazes 24h antes do agendamento.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Personalize suas mensagens</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilize campos dinâmicos como nome do cliente e detalhes do imóvel para criar mensagens personalizadas que geram mais engajamento.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Monitore o desempenho e ajuste conforme necessário</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe regularmente as estatísticas de abertura e resposta de suas automações, fazendo ajustes para melhorar a eficácia.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
