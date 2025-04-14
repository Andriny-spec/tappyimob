'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar as CalendarIcon,
  Download,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  DollarSign,
  Eye,
  Clock,
  Printer,
  FileText,
  Filter,
  BarChart3,
  BarChart4,
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  Home,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

// Componente fictício para gráficos
function ChartPlaceholder({ 
  height = 300, 
  type = 'bar', 
  title = '', 
  color = 'blue' 
}) {
  return (
    <div 
      className={`w-full rounded-md border border-dashed border-${color}-500/50 bg-${color}-500/10 flex items-center justify-center`}
      style={{ height }}
    >
      <div className="text-center text-muted-foreground">
        <p className="text-sm">{title || `Gráfico ${type} será exibido aqui`}</p>
        <p className="text-xs">Dados sendo carregados...</p>
      </div>
    </div>
  );
}

// Dados fictícios para demonstração
const estatisticasGerais = [
  {
    titulo: 'Imóveis Ativos',
    valor: 142,
    comparacao: '+10.9%',
    tendencia: 'alta',
    icone: <Building2 className="h-6 w-6 text-blue-500" />,
    cor: 'bg-blue-500/10'
  },
  {
    titulo: 'Novos Leads',
    valor: 87,
    comparacao: '-16.3%',
    tendencia: 'baixa',
    icone: <Users className="h-6 w-6 text-purple-500" />,
    cor: 'bg-purple-500/10'
  },
  {
    titulo: 'Visualizações',
    valor: '9.458',
    comparacao: '+12.9%',
    tendencia: 'alta',
    icone: <Eye className="h-6 w-6 text-green-500" />,
    cor: 'bg-green-500/10'
  },
  {
    titulo: 'Tempo Médio',
    valor: '2m 36s',
    comparacao: '+18.2%',
    tendencia: 'alta',
    icone: <Clock className="h-6 w-6 text-amber-500" />,
    cor: 'bg-amber-500/10'
  }
];

const vendasPorMes = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Vendas',
      data: [145, 120, 190, 210, 180, 195, 220, 250, 280, 260, 270, 310]
    }
  ]
};

const imovelPorTipo = [
  { tipo: 'Apartamento', quantidade: 68, percentual: 48 },
  { tipo: 'Casa', quantidade: 42, percentual: 32 },
  { tipo: 'Terreno', quantidade: 16, percentual: 12 },
  { tipo: 'Comercial', quantidade: 12, percentual: 8 },
  { tipo: 'Rural', quantidade: 5, percentual: 4 }
];

const topImoveisMaisVistos = [
  { id: '1', titulo: 'Apartamento Novo no Centro', tipo: 'Apartamento', preco: 'R$ 450.000', visualizacoes: 1247 },
  { id: '2', titulo: 'Casa com 3 Quartos no Jardim Europa', tipo: 'Casa', preco: 'R$ 620.000', visualizacoes: 968 },
  { id: '3', titulo: 'Terreno 500m² em Condomínio', tipo: 'Terreno', preco: 'R$ 180.000', visualizacoes: 643 },
  { id: '4', titulo: 'Sala Comercial 50m²', tipo: 'Comercial', preco: 'R$ 330.000', visualizacoes: 512 },
  { id: '5', titulo: 'Cobertura Duplex com Vista', tipo: 'Apartamento', preco: 'R$ 1.250.000', visualizacoes: 489 }
];

export default function RelatoriosPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [relatorioData, setRelatorioData] = useState({
    estatisticasGerais: estatisticasGerais,
    vendasPorMes: vendasPorMes,
    imoveisPorTipo: imovelPorTipo,
    imoveisMaisVistos: topImoveisMaisVistos
  });

  // Função para buscar dados da API
  async function buscarDadosRelatorios(periodo = 'mes') {
    setIsLoading(true);
    setError(false);
    
    try {
      const response = await fetch(`/api/imobiliarias/relatorios?periodo=${periodo}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de relatórios');
      }
      
      const data = await response.json();
      setRelatorioData(data);
      toast.success('Dados atualizados com sucesso');
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
      setError(true);
      toast.error('Não foi possível carregar os dados dos relatórios');
      // Mantém os dados de fallback que já estavam carregados
    } finally {
      setIsLoading(false);
    }
  }

  // Buscar dados quando o componente for montado ou quando o período mudar
  useEffect(() => {
    buscarDadosRelatorios(periodoSelecionado);
  }, [periodoSelecionado]);
  
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho e analise métricas importantes do seu negócio
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Erro ao carregar dados</p>
            <Button onClick={() => buscarDadosRelatorios(periodoSelecionado)}>Tentar novamente</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filtros de período e exportação */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex gap-2 items-center">
              <div className="w-40">
                <Select defaultValue="mes" onValueChange={setPeriodoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mês</SelectItem>
                    <SelectItem value="trimestre">Este trimestre</SelectItem>
                    <SelectItem value="ano">Este ano</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {periodoSelecionado === 'personalizado' && (
                <div className="flex items-center space-x-2">
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[160px] justify-start text-left font-normal px-3">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Data inicial</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <span className="text-muted-foreground">até</span>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[160px] justify-start text-left font-normal px-3">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Data final</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
              
              <Button variant="ghost" size="icon" className="ml-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Select defaultValue="pdf">
                <SelectTrigger className="w-[140px]">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Exportar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">Exportar PDF</SelectItem>
                  <SelectItem value="xlsx">Exportar Excel</SelectItem>
                  <SelectItem value="csv">Exportar CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {relatorioData.estatisticasGerais.map((estatistica, index) => (
              <Card key={index}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className={`p-2 rounded-full ${estatistica.cor}`}>
                      {estatistica.icone}
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`text-xs font-semibold ${
                        estatistica.tendencia === 'alta' 
                          ? 'text-green-500' 
                          : estatistica.tendencia === 'baixa' 
                            ? 'text-red-500' 
                            : 'text-amber-500'
                      }`}>
                        {estatistica.comparacao}
                      </span>
                      <div className={`ml-1 rounded-full p-0.5 ${
                        estatistica.tendencia === 'alta' 
                          ? 'bg-green-100 text-green-500' 
                          : estatistica.tendencia === 'baixa' 
                            ? 'bg-red-100 text-red-500' 
                            : 'bg-amber-100 text-amber-500'
                      }`}>
                        {estatistica.tendencia === 'alta' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : estatistica.tendencia === 'baixa' ? (
                          <ArrowDownRight className="h-3 w-3" />
                        ) : (
                          <span>−</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold">{estatistica.valor}</h3>
                    <p className="text-sm text-muted-foreground">{estatistica.titulo}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Tabs de conteúdo */}
          <Tabs defaultValue="visao-geral">
            <TabsList className="mb-4">
              <TabsTrigger value="visao-geral" className="gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="imoveis" className="gap-1">
                <Building2 className="h-4 w-4" />
                <span>Imóveis</span>
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-1">
                <UserCheck className="h-4 w-4" />
                <span>Leads</span>
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="gap-1">
                <DollarSign className="h-4 w-4" />
                <span>Financeiro</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visao-geral" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Vendas</CardTitle>
                      <CardDescription>Performance mensal de vendas de imóveis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartPlaceholder height={300} type="bar" />
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Imóveis por Tipo</CardTitle>
                        <CardDescription>Distribuição por categoria</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartPlaceholder height={240} type="pie" color="green" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversão de Leads</CardTitle>
                        <CardDescription>Taxa de conversão por origem</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartPlaceholder height={240} type="line" color="purple" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Imóveis Mais Visitados</CardTitle>
                      <CardDescription>Os mais acessados pelos clientes</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <div className="space-y-1">
                        {relatorioData.imoveisMaisVistos.map((imovel, index) => (
                          <div 
                            key={imovel.id}
                            className={`flex items-center justify-between p-3 ${
                              index < relatorioData.imoveisMaisVistos.length - 1 ? 'border-b' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-muted rounded-md w-8 h-8 flex items-center justify-center font-medium text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{imovel.titulo}</p>
                                <div className="flex gap-2 items-center text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="px-1 py-0 h-5 rounded-sm">
                                    {imovel.tipo}
                                  </Badge>
                                  <span>{imovel.preco}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{imovel.visualizacoes}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="w-full gap-1">
                        <ArrowRight className="h-4 w-4" />
                        <span>Ver Todos os Imóveis</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Relatório Resumido</CardTitle>
                      <CardDescription>Métricas principais</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <div className="px-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Imóveis Publicados</span>
                          </div>
                          <Badge>142</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Vendas Concluídas</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50">32</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Visualizações</span>
                          </div>
                          <Badge variant="outline" className="bg-purple-50">9.458</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">Taxa de Conversão</span>
                          </div>
                          <Badge variant="outline" className="bg-amber-50">3.6%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="p-6 flex items-center gap-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Relatório Detalhado</h4>
                        <p className="text-sm text-muted-foreground">Análise completa</p>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <Button className="w-full">Gerar Relatório</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 rounded-full p-3">
                        <Share2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Compartilhar</h4>
                        <p className="text-sm text-muted-foreground">Enviar por email</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Download className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Relatório Mensal</h4>
                        <p className="text-sm text-muted-foreground">Resumo do período</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="imoveis">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Imóveis</CardTitle>
                  <CardDescription>
                    Análise detalhada do seu portfólio imobiliário
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium mb-1">Dados detalhados de imóveis</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Aqui você poderá analisar o desempenho individual e coletivo dos seus imóveis, incluindo métricas de visualização, contatos gerados e valor médio.
                      </p>
                      <Button className="mt-4">Carregar Relatório de Imóveis</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Leads</CardTitle>
                  <CardDescription>
                    Análise da captação e conversão de clientes potenciais
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <UserCheck className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium mb-1">Dados detalhados de leads</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Aqui você poderá analisar o desempenho do seu funil de vendas, desde a captação até o fechamento, com métricas de conversão e tempo médio em cada etapa.
                      </p>
                      <Button className="mt-4">Carregar Relatório de Leads</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financeiro">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Financeiro</CardTitle>
                  <CardDescription>
                    Análise de receitas, despesas e projeções financeiras
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <DollarSign className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium mb-1">Dados financeiros detalhados</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Aqui você poderá analisar o desempenho financeiro da sua imobiliária, com análises de receita, comissões, despesas e projeções para os próximos períodos.
                      </p>
                      <Button className="mt-4">Carregar Relatório Financeiro</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </PageContainer>
  );
}
