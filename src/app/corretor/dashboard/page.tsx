'use client';

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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  CalendarClock,
  BarChart4,
  Bell,
  MessageSquare,
  RefreshCw,
  PieChart,
  Check,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Dados fictícios para demonstração
const metricas = {
  imoveisAtivos: 28,
  clientesAtivos: 42,
  faturamentoMensal: 12650.75,
  comissaoPrevista: 4880.20,
  crescimentoMensal: 8.3,
  crescimentoClientes: 14.5,
  visitasAgendadas: 15,
  visitasRealizadas: 12,
  propostas: 7,
  negociosFechados: 3,
  avaliacao: 4.7,
  imoveisPorCategoria: [
    { categoria: 'Apartamentos', quantidade: 14, cor: 'bg-blue-500' },
    { categoria: 'Casas', quantidade: 9, cor: 'bg-green-500' },
    { categoria: 'Comercial', quantidade: 3, cor: 'bg-amber-500' },
    { categoria: 'Terrenos', quantidade: 2, cor: 'bg-purple-500' },
  ],
  lembretesProximos: [
    { titulo: 'Visita - Ap. 302 Jardins', data: '14/03 às 14:00', cliente: 'Carlos Silva' },
    { titulo: 'Renovação contrato', data: '15/03 às 10:00', cliente: 'Ana Costa' },
    { titulo: 'Avaliação de imóvel', data: '16/03 às 09:30', cliente: 'Pedro Almeida' },
  ],
  leads: [
    { nome: 'Juliana Martins', interesse: 'Ap. 2 quartos', status: 'Novo', contato: '11 99876-5432' },
    { nome: 'Roberto Dias', interesse: 'Casa em condomínio', status: 'Em andamento', contato: '11 98765-4321' },
    { nome: 'Fernanda Lima', interesse: 'Sala comercial', status: 'Aguardando visita', contato: '11 97654-3210' },
  ]
};

export default function DashboardCorretor() {
  return (
    <PageContainer
      title="Visão Geral"
      subtitle="Acompanhe o seu desempenho e atividades do dia"
    >
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">Imóveis Ativos</p>
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-2xl font-bold">{metricas.imoveisAtivos}</h4>
                  <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                    {metricas.crescimentoMensal > 0 ? '+' : ''}{metricas.crescimentoMensal}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-2xl font-bold">{metricas.clientesAtivos}</h4>
                  <Badge variant={metricas.crescimentoClientes > 0 ? "outline" : "destructive"} className={metricas.crescimentoClientes > 0 ? "bg-primary/10 text-primary text-xs" : "text-xs"}>
                    {metricas.crescimentoClientes > 0 ? '+' : ''}{metricas.crescimentoClientes}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">Comissão Prevista</p>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline">
                  <h4 className="text-2xl font-bold">R$ {metricas.comissaoPrevista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">Avaliação</p>
                  <Star className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline">
                  <h4 className="text-2xl font-bold">{metricas.avaliacao}</h4>
                  <div className="ml-2 flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(metricas.avaliacao) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Progresso Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Visitas Agendadas</span>
                      <span className="font-medium">{metricas.visitasRealizadas}/{metricas.visitasAgendadas}</span>
                    </div>
                    <Progress value={(metricas.visitasRealizadas / metricas.visitasAgendadas) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Propostas</span>
                      <span className="font-medium">{metricas.propostas}</span>
                    </div>
                    <Progress value={(metricas.propostas / metricas.visitasRealizadas) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Negócios Fechados</span>
                      <span className="font-medium">{metricas.negociosFechados}</span>
                    </div>
                    <Progress value={(metricas.negociosFechados / metricas.propostas) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Próximos Compromissos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas.lembretesProximos.map((lembrete, index) => (
                    <div key={index} className="flex items-center space-x-3 rounded-md border p-3">
                      <CalendarClock className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{lembrete.titulo}</p>
                        <div className="flex text-xs text-muted-foreground">
                          <span>{lembrete.data}</span>
                          <span className="mx-1">•</span>
                          <span>{lembrete.cliente}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos os compromissos
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Novos Leads</CardTitle>
                <CardDescription>Clientes potenciais para follow-up</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas.leads.map((lead, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{lead.nome}</p>
                        <p className="text-xs text-muted-foreground">Interesse: {lead.interesse}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={lead.status === 'Novo' ? 'default' : 'outline'} className="mb-1">
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{lead.contato}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos os leads
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Imóveis atualmente sob sua gestão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas.imoveisPorCategoria.map((categoria, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${categoria.cor}`} />
                      <div className="ml-2 flex-1">
                        <div className="text-sm font-medium">{categoria.categoria}</div>
                      </div>
                      <div>{categoria.quantidade} imóveis</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  Ver análise detalhada
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Acompanhe seus últimos negócios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Venda de Apartamento - Jardins</p>
                      <p className="text-xs text-muted-foreground">Cliente: Roberto e Maria Silva</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">R$ 850.000,00</p>
                      <p className="text-xs text-muted-foreground">Comissão: R$ 21.250,00</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-muted-foreground">Finalizado em 10/03/2025</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Pago</Badge>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Locação de Sala Comercial - Centro</p>
                      <p className="text-xs text-muted-foreground">Cliente: Tech Solutions Ltda.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">R$ 3.500,00/mês</p>
                      <p className="text-xs text-muted-foreground">Comissão: R$ 3.500,00</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-muted-foreground">Finalizado em 02/03/2025</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Pago</Badge>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Venda de Casa - Alphaville</p>
                      <p className="text-xs text-muted-foreground">Cliente: João Mendes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">R$ 1.200.000,00</p>
                      <p className="text-xs text-muted-foreground">Comissão: R$ 30.000,00</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 mr-1 text-amber-500" />
                      <span className="text-muted-foreground">Em andamento</span>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">Pendente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                Ver todas as transações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agenda da Semana</CardTitle>
              <CardDescription>Seus compromissos para os próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-2">
                  <h3 className="mb-2 px-2 text-sm font-medium">Hoje - 11/03/2025</h3>
                  <div className="space-y-2">
                    <div className="rounded-md bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">10:00 - Reunião com cliente</p>
                          <p className="text-xs text-muted-foreground">Paulo Santos - Visita Apartamento Centro</p>
                        </div>
                        <Badge variant="outline">Confirmado</Badge>
                      </div>
                    </div>
                    <div className="rounded-md bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">15:30 - Assinatura de contrato</p>
                          <p className="text-xs text-muted-foreground">Ricardo e Ana Ferreira - Venda Casa</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Importante</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-2">
                  <h3 className="mb-2 px-2 text-sm font-medium">Amanhã - 12/03/2025</h3>
                  <div className="space-y-2">
                    <div className="rounded-md bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">09:00 - Fotografar imóvel</p>
                          <p className="text-xs text-muted-foreground">Rua das Flores, 123 - Apto 501</p>
                        </div>
                        <Badge variant="outline">Agendado</Badge>
                      </div>
                    </div>
                    <div className="rounded-md bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">14:00 - Call com lead</p>
                          <p className="text-xs text-muted-foreground">Marina Costa - Interessada em investimentos</p>
                        </div>
                        <Badge variant="outline">Agendado</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-2">
                  <h3 className="mb-2 px-2 text-sm font-medium">14/03/2025</h3>
                  <div className="space-y-2">
                    <div className="rounded-md bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">14:00 - Visita Ap. 302 Jardins</p>
                          <p className="text-xs text-muted-foreground">Carlos Silva - Cliente interessado</p>
                        </div>
                        <Badge variant="outline">Confirmado</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                Gerenciar agenda completa
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
