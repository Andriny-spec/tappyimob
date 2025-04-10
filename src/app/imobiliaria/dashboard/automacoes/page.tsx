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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Zap,
  Search,
  Plus,
  Clock,
  Mail,
  MessageSquare,
  BellRing,
  Users,
  Calendar,
  Building2,
  Cog,
  ChevronRight,
  MoreHorizontal,
  PanelLeft,
  Smartphone,
  Globe,
  Edit,
  Trash,
  Save,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dados fictícios para demonstração
const automacoes = [
  {
    id: 1,
    nome: 'Boas-vindas para novos leads',
    tipo: 'E-mail',
    status: 'Ativo',
    gatilho: 'Quando um novo lead é cadastrado',
    ultimaExecucao: '10/03/2025 às 14:32',
    totalExecucoes: 142
  },
  {
    id: 2,
    nome: 'Lembrete de visita agendada',
    tipo: 'SMS',
    status: 'Ativo',
    gatilho: '24h antes da visita agendada',
    ultimaExecucao: '11/03/2025 às 08:15',
    totalExecucoes: 89
  },
  {
    id: 3,
    nome: 'Follow-up após visita',
    tipo: 'WhatsApp',
    status: 'Ativo',
    gatilho: '2h após a conclusão da visita',
    ultimaExecucao: '10/03/2025 às 17:45',
    totalExecucoes: 76
  },
  {
    id: 4,
    nome: 'Notificação de proposta pendente',
    tipo: 'E-mail',
    status: 'Inativo',
    gatilho: 'Quando uma proposta fica 3 dias sem resposta',
    ultimaExecucao: '05/03/2025 às 10:20',
    totalExecucoes: 38
  },
  {
    id: 5,
    nome: 'Atualização de status do imóvel',
    tipo: 'Notificação',
    status: 'Ativo',
    gatilho: 'Quando o status de um imóvel muda',
    ultimaExecucao: '09/03/2025 às 16:05',
    totalExecucoes: 213
  }
];

const gatilhosDisponiveis = [
  { id: 1, nome: 'Lead cadastrado', categoria: 'Leads', icone: Users },
  { id: 2, nome: 'Visita agendada', categoria: 'Agendamentos', icone: Calendar },
  { id: 3, nome: 'Visita concluída', categoria: 'Agendamentos', icone: Clock },
  { id: 4, nome: 'Proposta recebida', categoria: 'Negociações', icone: MessageSquare },
  { id: 5, nome: 'Proposta sem resposta', categoria: 'Negociações', icone: Clock },
  { id: 6, nome: 'Status do imóvel alterado', categoria: 'Imóveis', icone: Building2 },
  { id: 7, nome: 'Aniversário do cliente', categoria: 'Clientes', icone: Users },
  { id: 8, nome: 'Contrato próximo de vencer', categoria: 'Contratos', icone: Clock }
];

export default function AutomacoesPage() {
  const [tabAtiva, setTabAtiva] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  
  return (
    <PageContainer
      title="Automações"
      subtitle="Configure fluxos automatizados para otimizar suas operações"
      actions={
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Automação
        </Button>
      }
    >
      {/* Filtros e Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Tabs defaultValue="todas" className="w-full" onValueChange={setTabAtiva}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center w-full">
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="ativas">Ativas</TabsTrigger>
              <TabsTrigger value="inativas">Inativas</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar automação..."
                className="pl-8"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
          </div>
        </Tabs>
      </div>
      
      {/* Lista de Automações */}
      <div className="grid grid-cols-1 gap-4">
        {automacoes
          .filter(automacao => 
            (tabAtiva === 'todas' || 
             (tabAtiva === 'ativas' && automacao.status === 'Ativo') ||
             (tabAtiva === 'inativas' && automacao.status === 'Inativo')) &&
            (pesquisa === '' || 
             automacao.nome.toLowerCase().includes(pesquisa.toLowerCase()))
          )
          .map(automacao => (
            <Card key={automacao.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{automacao.nome}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={automacao.tipo === 'E-mail' ? 'default' : 
                                       automacao.tipo === 'SMS' ? 'secondary' : 
                                       automacao.tipo === 'WhatsApp' ? 'success' : 'outline'}>
                          {automacao.tipo}
                        </Badge>
                        <Badge variant={automacao.status === 'Ativo' ? 'success' : 'secondary'}>
                          {automacao.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-3 sm:mt-0">
                    <Switch 
                      id={`automacao-status-${automacao.id}`} 
                      checked={automacao.status === 'Ativo'}
                    />
                    <Label htmlFor={`automacao-status-${automacao.id}`} className="ml-2 text-sm mr-4">
                      {automacao.status === 'Ativo' ? 'Ativado' : 'Desativado'}
                    </Label>
                    
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Gatilho</h4>
                    <p className="text-sm">{automacao.gatilho}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Última execução</h4>
                    <p className="text-sm">{automacao.ultimaExecucao}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Total de execuções</h4>
                    <p className="text-sm">{automacao.totalExecucoes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      
      {/* Criação/Edição de Automação */}
      {modoEdicao && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Criar Nova Automação</CardTitle>
            <CardDescription>Configure os detalhes e parâmetros da automação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome-automacao">Nome da automação</Label>
                  <Input id="nome-automacao" placeholder="Ex: Boas-vindas para novos leads" />
                </div>
                
                <div>
                  <Label>Tipo de ação</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                      <Mail className="h-6 w-6 text-primary" />
                      <span className="text-sm">E-mail</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                      <Smartphone className="h-6 w-6 text-primary" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <span className="text-sm">WhatsApp</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                      <BellRing className="h-6 w-6 text-primary" />
                      <span className="text-sm">Notificação</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                      <PanelLeft className="h-6 w-6 text-primary" />
                      <span className="text-sm">CRM</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                      <Globe className="h-6 w-6 text-primary" />
                      <span className="text-sm">API</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Gatilho</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {gatilhosDisponiveis.slice(0, 4).map(gatilho => (
                      <div key={gatilho.id} className="flex items-center space-x-3 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {React.createElement(gatilho.icone, { className: "h-4 w-4 text-primary" })}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{gatilho.nome}</div>
                          <div className="text-xs text-muted-foreground">{gatilho.categoria}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-automacao">Status inicial</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="status-automacao" />
                    <Label htmlFor="status-automacao">Ativar automação imediatamente</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurar Conteúdo</h3>
              <p className="text-sm text-muted-foreground">Defina o conteúdo que será enviado quando esta automação for acionada</p>
              
              <div className="border rounded-md p-4">
                <Label htmlFor="assunto">Assunto</Label>
                <Input id="assunto" placeholder="Assunto da mensagem" className="mb-4" />
                
                <Label htmlFor="conteudo">Conteúdo</Label>
                <div className="border rounded-md p-2 min-h-[200px] mt-2">
                  {/* Aqui entraria um editor de rich text */}
                  <p className="text-muted-foreground text-sm p-2">
                    Editor de conteúdo (rich text) para personalizar a mensagem que será enviada...
                  </p>
                </div>
                
                <div className="mt-4">
                  <Label>Variáveis Disponíveis</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="cursor-pointer">{{nome_cliente}}</Badge>
                    <Badge variant="outline" className="cursor-pointer">{{email_cliente}}</Badge>
                    <Badge variant="outline" className="cursor-pointer">{{telefone_cliente}}</Badge>
                    <Badge variant="outline" className="cursor-pointer">{{data_agendamento}}</Badge>
                    <Badge variant="outline" className="cursor-pointer">{{endereco_imovel}}</Badge>
                    <Badge variant="outline" className="cursor-pointer">{{link_proposta}}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setModoEdicao(false)}>Cancelar</Button>
            <Button className="gap-1.5">
              <Save className="h-4 w-4" />
              Salvar Automação
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Template de Sugestão */}
      {!modoEdicao && (
        <Card className="mt-6 border-dashed border-primary/50 bg-primary/5">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Templates de Automação</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Economize tempo utilizando nossos templates pré-configurados para as automações mais comuns do mercado imobiliário.
            </p>
            <Button variant="outline" className="gap-1.5">
              <Zap className="h-4 w-4" />
              Ver Templates
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
