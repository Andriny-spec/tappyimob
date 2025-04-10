'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Settings, 
  ChevronRight, 
  Mail, 
  MessageSquare, 
  Bell, 
  Calendar, 
  XCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Eye,
  Copy,
  AlertTriangle,
  UserPlus,
  Calendar as CalendarIcon,
  Mail as MailIcon,
  MessageSquare as MessageSquareIcon,
  BellRing,
  Activity
} from 'lucide-react';

// Dados de exemplo para as automações
const automacoesData = [
  {
    id: '1',
    nome: 'E-mail de boas-vindas',
    descricao: 'Enviar e-mail de boas-vindas quando um novo cliente se registra',
    tipo: 'email',
    trigger: 'novo_cliente',
    status: 'ativo',
    estatisticas: {
      execucoes: 256,
      sucessos: 248,
      falhas: 8,
      ultimaExecucao: '10 min atrás'
    }
  },
  {
    id: '2',
    nome: 'Notificação de imóvel salvo',
    descricao: 'Enviar notificação ao corretor quando cliente salva um imóvel',
    tipo: 'notificacao',
    trigger: 'imovel_favorito',
    status: 'ativo',
    estatisticas: {
      execucoes: 1875,
      sucessos: 1875,
      falhas: 0,
      ultimaExecucao: '2 min atrás'
    }
  },
  {
    id: '3',
    nome: 'Lembrete de visita',
    descricao: 'Enviar lembrete 2h antes de uma visita agendada',
    tipo: 'whatsapp',
    trigger: 'agendamento',
    status: 'ativo',
    estatisticas: {
      execucoes: 142,
      sucessos: 138,
      falhas: 4,
      ultimaExecucao: '3h atrás'
    }
  },
  {
    id: '4',
    nome: 'Recuperação de carrinho',
    descricao: 'Enviar e-mail para clientes que abandonaram processo de reserva',
    tipo: 'email',
    trigger: 'reserva_abandonada',
    status: 'inativo',
    estatisticas: {
      execucoes: 28,
      sucessos: 20,
      falhas: 8,
      ultimaExecucao: '3d atrás'
    }
  },
  {
    id: '5',
    nome: 'Atualização de status do imóvel',
    descricao: 'Notificar clientes interessados quando status do imóvel mudar',
    tipo: 'notificacao',
    trigger: 'status_imovel',
    status: 'ativo',
    estatisticas: {
      execucoes: 567,
      sucessos: 545,
      falhas: 22,
      ultimaExecucao: '45 min atrás'
    }
  },
  {
    id: '6',
    nome: 'Recomendações semanais',
    descricao: 'Enviar e-mail com imóveis recomendados todas as segundas-feiras',
    tipo: 'email',
    trigger: 'agenda',
    status: 'ativo',
    estatisticas: {
      execucoes: 12520,
      sucessos: 12498,
      falhas: 22,
      ultimaExecucao: '2d atrás'
    }
  },
  {
    id: '7',
    nome: 'Alerta de baixa de preço',
    descricao: 'Alertar clientes quando houver redução no preço de imóveis salvos',
    tipo: 'notificacao',
    trigger: 'preco_imovel',
    status: 'inativo',
    estatisticas: {
      execucoes: 0,
      sucessos: 0,
      falhas: 0,
      ultimaExecucao: 'Nunca executado'
    }
  }
];

// Tipos de automações disponíveis
const tiposAutomacao = [
  { id: 'todos', nome: 'Todos', icone: <Zap className="h-4 w-4" /> },
  { id: 'email', nome: 'E-mail', icone: <MailIcon className="h-4 w-4" /> },
  { id: 'notificacao', nome: 'Notificação', icone: <BellRing className="h-4 w-4" /> },
  { id: 'whatsapp', nome: 'WhatsApp', icone: <MessageSquareIcon className="h-4 w-4" /> },
  { id: 'agenda', nome: 'Agendamento', icone: <CalendarIcon className="h-4 w-4" /> }
];

// Função para obter o ícone baseado no tipo de automação
const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'email':
      return <MailIcon className="h-5 w-5 text-blue-500" />;
    case 'notificacao':
      return <BellRing className="h-5 w-5 text-amber-500" />;
    case 'whatsapp':
      return <MessageSquareIcon className="h-5 w-5 text-green-500" />;
    case 'agenda':
      return <CalendarIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <Zap className="h-5 w-5 text-primary" />;
  }
};

// Função para obter o ícone baseado no tipo de gatilho
const getTriggerIcon = (trigger: string) => {
  switch (trigger) {
    case 'novo_cliente':
      return <UserPlus className="h-4 w-4 text-primary" />;
    case 'imovel_favorito':
      return <Bell className="h-4 w-4 text-amber-500" />;
    case 'agendamento':
      return <CalendarIcon className="h-4 w-4 text-purple-500" />;
    case 'reserva_abandonada':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'status_imovel':
      return <Activity className="h-4 w-4 text-blue-500" />;
    case 'agenda':
      return <Clock className="h-4 w-4 text-indigo-500" />;
    case 'preco_imovel':
      return <RefreshCw className="h-4 w-4 text-green-500" />;
    default:
      return <Zap className="h-4 w-4 text-primary" />;
  }
};

export default function AutomacoesPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtragem das automações por tipo e busca
  const automacoesFiltradas = automacoesData
    .filter(automacao => {
      // Filtro por tipo
      if (tipoSelecionado !== 'todos' && automacao.tipo !== tipoSelecionado) {
        return false;
      }
      
      // Filtro por busca
      if (searchQuery && 
          !automacao.nome.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !automacao.descricao.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  // Cálculo de estatísticas para os cards de métricas
  const totalExecucoes = automacoesData.reduce((total, a) => total + a.estatisticas.execucoes, 0);
  const totalFalhas = automacoesData.reduce((total, a) => total + a.estatisticas.falhas, 0);
  const taxaSucesso = totalExecucoes > 0 
    ? Math.round(((totalExecucoes - totalFalhas) / totalExecucoes) * 100) 
    : 0;

  return (
    <PageContainer
      title="Automações"
      subtitle="Configure automações para melhorar a eficiência do seu negócio"
    >
      {/* Barra de ações e filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Buscar automação..." 
            className="w-full sm:w-80"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Automação
        </Button>
      </div>

      {/* Tipos de automações */}
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
        {tiposAutomacao.map(tipo => (
          <Button
            key={tipo.id}
            variant={tipoSelecionado === tipo.id ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => setTipoSelecionado(tipo.id)}
          >
            {tipo.icone}
            {tipo.nome}
          </Button>
        ))}
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-2xl font-bold">{automacoesData.length}</h4>
            <p className="text-sm text-muted-foreground">Total de Automações</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-green-500/10 rounded-full p-3 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {automacoesData.filter(a => a.status === 'ativo').length}
            </h4>
            <p className="text-sm text-muted-foreground">Automações Ativas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-blue-500/10 rounded-full p-3 mb-3">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <h4 className="text-2xl font-bold">{totalExecucoes.toLocaleString()}</h4>
            <p className="text-sm text-muted-foreground">Execuções Totais</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-amber-500/10 rounded-full p-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="text-2xl font-bold">{taxaSucesso}%</h4>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                Taxa de Sucesso
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalFalhas} falhas em {totalExecucoes.toLocaleString()} execuções
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de automações */}
      <div className="grid grid-cols-1 gap-4">
        {automacoesFiltradas.map(automacao => (
          <Card key={automacao.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={automacao.status === 'ativo' ? 'default' : 'secondary'}
                      className={automacao.status === 'ativo' ? 'bg-green-500' : 'bg-muted'}
                    >
                      {automacao.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Switch checked={automacao.status === 'ativo'} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="p-2 rounded-md bg-primary/10 flex-shrink-0">
                      {getTipoIcon(automacao.tipo)}
                    </div>
                    <div>
                      <CardTitle>{automacao.nome}</CardTitle>
                      <CardDescription>{automacao.descricao}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5 min-w-32">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Tipo:</span>
                      </div>
                      <Badge variant="outline" className="font-normal">
                        {automacao.tipo === 'email' && 'E-mail'}
                        {automacao.tipo === 'notificacao' && 'Notificação'}
                        {automacao.tipo === 'whatsapp' && 'WhatsApp'}
                        {automacao.tipo === 'agenda' && 'Agendamento'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5 min-w-32">
                        {getTriggerIcon(automacao.trigger)}
                        <span className="text-muted-foreground">Gatilho:</span>
                      </div>
                      <Badge variant="outline" className="font-normal">
                        {automacao.trigger === 'novo_cliente' && 'Novo cliente registrado'}
                        {automacao.trigger === 'imovel_favorito' && 'Imóvel salvo como favorito'}
                        {automacao.trigger === 'agendamento' && 'Visita agendada'}
                        {automacao.trigger === 'reserva_abandonada' && 'Reserva abandonada'}
                        {automacao.trigger === 'status_imovel' && 'Status do imóvel alterado'}
                        {automacao.trigger === 'agenda' && 'Agendamento periódico'}
                        {automacao.trigger === 'preco_imovel' && 'Preço do imóvel alterado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5 min-w-32">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Última execução:</span>
                      </div>
                      <span>{automacao.estatisticas.ultimaExecucao}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
              
              <Separator orientation="vertical" className="hidden md:block" />
              
              <div className="md:w-64 md:border-l border-t md:border-t-0 bg-muted/20">
                <div className="p-6">
                  <h4 className="text-sm font-medium mb-3">Estatísticas</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Taxa de sucesso</span>
                        <span className="font-medium">
                          {automacao.estatisticas.execucoes > 0
                            ? Math.round(
                                ((automacao.estatisticas.execucoes - automacao.estatisticas.falhas) / 
                                  automacao.estatisticas.execucoes) * 100
                              )
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={
                          automacao.estatisticas.execucoes > 0
                            ? ((automacao.estatisticas.execucoes - automacao.estatisticas.falhas) / 
                                automacao.estatisticas.execucoes) * 100
                            : 0
                        } 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-background rounded-md p-2">
                        <p className="text-xs text-muted-foreground">Executado</p>
                        <p className="text-lg font-medium">{automacao.estatisticas.execucoes}</p>
                      </div>
                      <div className="bg-background rounded-md p-2">
                        <p className="text-xs text-muted-foreground">Falhas</p>
                        <p className="text-lg font-medium text-red-500">{automacao.estatisticas.falhas}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-background border-t flex justify-between">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Log
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Card para adicionar nova automação */}
        <Card className="flex flex-col justify-center items-center border-dashed p-6">
          <div className="text-center">
            <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nova Automação</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Configure uma nova automação para o seu negócio
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Automação
            </Button>
          </div>
        </Card>
      </div>

      {/* Seção de ideias de automação */}
      <div className="mt-10">
        <h3 className="text-lg font-medium mb-6">Ideias de Automação</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="p-2 w-fit rounded-md bg-blue-500/10 mb-2">
                <MailIcon className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-base">Recuperação de Clientes</CardTitle>
              <CardDescription>
                Envie e-mails automáticos para clientes que não interagem há mais de 30 dias
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1">
                <Plus className="h-4 w-4" /> Implementar
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="p-2 w-fit rounded-md bg-green-500/10 mb-2">
                <MessageSquareIcon className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-base">Feedback Pós-Visita</CardTitle>
              <CardDescription>
                Solicite avaliações automáticas após visitas a imóveis
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1">
                <Plus className="h-4 w-4" /> Implementar
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="p-2 w-fit rounded-md bg-amber-500/10 mb-2">
                <BellRing className="h-5 w-5 text-amber-500" />
              </div>
              <CardTitle className="text-base">Alertas de Mercado</CardTitle>
              <CardDescription>
                Notifique seus clientes sobre tendências de mercado na região de interesse
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1">
                <Plus className="h-4 w-4" /> Implementar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
