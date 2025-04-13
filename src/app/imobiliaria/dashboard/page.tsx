'use client';

import { useState, useEffect, Fragment } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Activity,
  Loader2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos para os dados da API
interface DashboardStats {
  imoveisAtivos: number;
  corretoresAtivos: number;
  clientesAtivos: number;
  mensagensNaoLidas: number;
  crescimentoImoveis: number;
  crescimentoCorretores: number;
  crescimentoClientes: number;
  crescimentoFaturamento: number;
  tiposImoveis: { tipoImovel: string; _count: { id: number } }[];
  statusImoveis: { status: string; _count: { id: number } }[];
  imoveisRecentes: Imovel[];
  corretoresDestaque: CorretorDestaque[];
}

interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  valor: number;
  tipoOperacao: string;
  tipoImovel: string;
  status: string;
  fotoPrincipal?: string;
  endereco: string;
  cidade: string;
  estado: string;
  createdAt: string;
}

interface CorretorDestaque {
  id: string;
  nome: string;
  email: string;
  fotoPerfil?: string;
  totalImoveis: number;
}

// Cores para tipos de imóveis
const tipoImovelCores: Record<string, string> = {
  APARTAMENTO: 'bg-red-500',
  CASA: 'bg-blue-500',
  TERRENO: 'bg-green-500',
  COMERCIAL: 'bg-yellow-500',
  RURAL: 'bg-purple-500',
  GALPAO: 'bg-indigo-500',
  INDUSTRIAL: 'bg-pink-500',
  SALA_COMERCIAL: 'bg-orange-500',
  LOJA: 'bg-teal-500',
  COBERTURA: 'bg-cyan-500',
};

// Dados mockados como fallback
const dadosMockados = {
  visitasAgendadas: 42,
  visitasRealizadas: 36,
  propostas: 18,
  negociosFechados: 9,
  avaliacao: 4.8,
  faturamentoMensal: 38750.25,
  lembretesProximos: [
    { titulo: 'Reunião com corretores', data: '14/03 às 09:00', responsavel: 'Equipe Comercial' },
    { titulo: 'Lançamento Edifício Sky Gardens', data: '17/03 às 15:00', responsavel: 'Marketing' },
    { titulo: 'Avaliação de desempenho', data: '20/03 às 10:30', responsavel: 'RH' },
  ]
};



export default function DashboardImobiliaria() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch('/api/imobiliaria/stats');
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  // Renderiza o estado de erro caso ocorra algum problema ao buscar os dados
  if (error) {
    return (
      <PageContainer
        title="Visão Geral Imobiliária"
        subtitle="Acompanhe o desempenho da sua imobiliária"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Visão Geral Imobiliária"
      subtitle="Acompanhe o desempenho da sua imobiliária"
    >
      {loading && (
        <div className="w-full p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando dados do dashboard...</p>
        </div>
      )}
      
      {!loading && stats && (
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
                    <div className="text-2xl font-bold">{stats?.imoveisAtivos || 0}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{stats?.crescimentoImoveis || 0}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Corretores</h3>
                    <div className="text-2xl font-bold">{stats?.corretoresAtivos || 0}</div>
                  </div>
                  <div className="text-lg font-semibold flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span>{dadosMockados.avaliacao}</span>
                    <span className="text-sm text-muted-foreground ml-2">/5</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{stats?.crescimentoCorretores || 0}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Clientes</h3>
                    <div className="text-2xl font-bold">{stats?.clientesAtivos || 0}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{stats?.crescimentoClientes || 0}%</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Faturamento</h3>
                    <div className="text-2xl font-bold">R$ {dadosMockados.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="bg-primary/10 rounded-full p-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{stats?.crescimentoFaturamento || 0}%</span>
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
                      <span className="font-medium">{dadosMockados.visitasRealizadas}/{dadosMockados.visitasAgendadas}</span>
                    </div>
                    <Progress value={(dadosMockados.visitasRealizadas / dadosMockados.visitasAgendadas) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Propostas</span>
                      <span className="font-medium">{dadosMockados.propostas}/{dadosMockados.visitasRealizadas}</span>
                    </div>
                    <Progress value={(dadosMockados.propostas / dadosMockados.visitasRealizadas) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Negócios Fechados</span>
                      <span className="font-medium">{dadosMockados.negociosFechados}/{dadosMockados.propostas}</span>
                    </div>
                    <Progress value={(dadosMockados.negociosFechados / dadosMockados.propostas) * 100} className="h-2" />
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
                  {dadosMockados.lembretesProximos.map((lembrete: any, index: number) => (
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
                  {stats?.tiposImoveis?.map((tipo: any, index: number) => (
                    <div key={index} className="flex justify-between items-center mb-1 last:mb-0">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${tipoImovelCores[tipo.tipoImovel] || 'bg-gray-500'}`}></div>
                        <span className="text-sm">{tipo.tipoImovel.replace('_', ' ').toLowerCase()}</span>
                      </div>
                      <span className="text-sm font-medium">{tipo._count.id}</span>
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
                  {stats?.corretoresDestaque?.map((corretor: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center">
                          <Avatar className="w-10 h-10 rounded-full mr-3">
                            {corretor.fotoPerfil ? (
                              <AvatarImage src={corretor.fotoPerfil} alt={corretor.nome} />
                            ) : (
                              <AvatarFallback className="bg-primary/20">
                                <User className="h-5 w-5 text-primary" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{corretor.nome}</div>
                            <div className="text-sm text-muted-foreground">{corretor.totalImoveis} imóveis</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{corretor.email}</div>
                        </div>
                      </div>
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
      )}
    </PageContainer>
  );
}
