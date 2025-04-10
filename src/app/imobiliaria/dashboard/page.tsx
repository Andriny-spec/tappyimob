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
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
  User,
  Home,
  CalendarClock,
  BarChart4,
  Bell,
  MessageSquare,
  RefreshCw,
  PieChart,
  Check,
  Star,
  Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Dados fictícios para demonstração
const metricas = {
  imoveisAtivos: 72,
  corretoresAtivos: 16,
  clientesAtivos: 128,
  faturamentoMensal: 38750.25,
  crescimentoImoveis: 12.4,
  crescimentoCorretores: 8.6,
  crescimentoClientes: 15.2,
  crescimentoFaturamento: 7.8,
  visitasAgendadas: 42,
  visitasRealizadas: 36,
  propostas: 18,
  negociosFechados: 9,
  avaliacao: 4.8,
  imoveisPorCategoria: [
    { categoria: 'Apartamentos', quantidade: 34, cor: 'bg-blue-500' },
    { categoria: 'Casas', quantidade: 21, cor: 'bg-green-500' },
    { categoria: 'Comercial', quantidade: 12, cor: 'bg-amber-500' },
    { categoria: 'Terrenos', quantidade: 5, cor: 'bg-purple-500' },
  ],
  lembretesProximos: [
    { titulo: 'Reunião com corretores', data: '14/03 às 09:00', responsavel: 'Equipe Comercial' },
    { titulo: 'Lançamento Edifício Sky Gardens', data: '17/03 às 15:00', responsavel: 'Marketing' },
    { titulo: 'Avaliação de desempenho', data: '20/03 às 10:30', responsavel: 'RH' },
  ],
  corretoresDestaque: [
    { nome: 'Ana Silva', vendas: 8, comissao: 12450.80 },
    { nome: 'Carlos Santos', vendas: 6, comissao: 9870.45 },
    { nome: 'Juliana Costa', vendas: 5, comissao: 8620.30 },
  ]
};

export default function DashboardImobiliaria() {
  return (
    <PageContainer
      title="Visão Geral Imobiliária"
      subtitle="Acompanhe o desempenho da sua imobiliária"
    >
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="corretores">Corretores</TabsTrigger>
          <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Imóveis Ativos</h3>
                    <div className="text-2xl font-bold">{metricas.imoveisAtivos}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{metricas.crescimentoImoveis}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Corretores</h3>
                    <div className="text-2xl font-bold">{metricas.corretoresAtivos}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{metricas.crescimentoCorretores}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Clientes</h3>
                    <div className="text-2xl font-bold">{metricas.clientesAtivos}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{metricas.crescimentoClientes}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Faturamento</h3>
                    <div className="text-2xl font-bold">R$ {metricas.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{metricas.crescimentoFaturamento}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Desempenho Mensal</CardTitle>
                <CardDescription>Progresso de vendas e conversões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <Activity className="h-16 w-16 text-muted-foreground" />
                  <div className="ml-4">
                    <p className="text-muted-foreground text-sm">Gráfico de Desempenho Mensal</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Visitas Realizadas</span>
                      <span className="font-medium">{metricas.visitasRealizadas}/{metricas.visitasAgendadas}</span>
                    </div>
                    <Progress value={(metricas.visitasRealizadas / metricas.visitasAgendadas) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Propostas</span>
                      <span className="font-medium">{metricas.propostas}/{metricas.visitasRealizadas}</span>
                    </div>
                    <Progress value={(metricas.propostas / metricas.visitasRealizadas) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Negócios Fechados</span>
                      <span className="font-medium">{metricas.negociosFechados}/{metricas.propostas}</span>
                    </div>
                    <Progress value={(metricas.negociosFechados / metricas.propostas) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Agenda & Eventos</CardTitle>
                <CardDescription>Próximos compromissos</CardDescription>
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
                          <span>{lembrete.responsavel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  Ver agenda completa
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Imóveis por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center mb-4">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <div className="space-y-4">
                  {metricas.imoveisPorCategoria.map((categoria, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{categoria.categoria}</span>
                        <span className="font-medium">{categoria.quantidade}</span>
                      </div>
                      <Progress 
                        value={(categoria.quantidade / metricas.imoveisAtivos) * 100} 
                        className={`h-2 ${categoria.cor}`} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Corretores Destaque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas.corretoresDestaque.map((corretor, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{corretor.nome}</p>
                            <p className="text-xs text-muted-foreground">{corretor.vendas} vendas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">R$ {corretor.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <p className="text-xs text-muted-foreground">comissão</p>
                        </div>
                      </div>
                      {index < metricas.corretoresDestaque.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos os corretores
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="corretores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Corretores</CardTitle>
              <CardDescription>Dados de produtividade e vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <BarChart4 className="h-16 w-16 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">Estatísticas detalhadas dos corretores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="imoveis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfólio de Imóveis</CardTitle>
              <CardDescription>Análise e distribuição de propriedades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <Building2 className="h-16 w-16 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">Estatísticas detalhadas de imóveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Financeiro</CardTitle>
              <CardDescription>Receitas, despesas e projeções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <DollarSign className="h-16 w-16 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">Relatórios financeiros detalhados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
