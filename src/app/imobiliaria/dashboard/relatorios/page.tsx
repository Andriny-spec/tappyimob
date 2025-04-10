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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  ChevronRight,
  Coins
} from 'lucide-react';

// Componente fictício para gráficos
const ChartPlaceholder = ({ 
  height = 300, 
  type = 'bar', 
  title = '', 
  color = 'blue' 
}) => (
  <div 
    className={`w-full h-[${height}px] bg-muted/20 rounded-lg flex flex-col items-center justify-center p-4`}
    style={{ height: `${height}px` }}
  >
    {type === 'bar' && <BarChart3 className="h-12 w-12 text-muted-foreground mb-2" />}
    {type === 'line' && <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />}
    {type === 'pie' && <PieChart className="h-12 w-12 text-muted-foreground mb-2" />}
    <p className="text-sm text-muted-foreground">
      {title || 'Visualização de gráfico será renderizada aqui'}
    </p>
  </div>
);

// Dados fictícios para demonstração
const estatisticasGerais = [
  {
    titulo: 'Imóveis Ativos',
    valor: 127,
    comparacao: '+12%',
    tendencia: 'up',
    icon: Building2
  },
  {
    titulo: 'Novos Leads',
    valor: 32,
    comparacao: '+8%',
    tendencia: 'up',
    icon: Users
  },
  {
    titulo: 'Vendas no Mês',
    valor: 'R$ 2,4M',
    comparacao: '+15%',
    tendencia: 'up',
    icon: CircleDollarSign
  },
  {
    titulo: 'Conversão',
    valor: '18,5%',
    comparacao: '-3%',
    tendencia: 'down',
    icon: TrendingUp
  }
];

const vendasPorMes = [
  { mes: 'Jan', valor: 1200000 },
  { mes: 'Fev', valor: 980000 },
  { mes: 'Mar', valor: 1450000 },
  { mes: 'Abr', valor: 1600000 },
  { mes: 'Mai', valor: 1350000 },
  { mes: 'Jun', valor: 1800000 },
  { mes: 'Jul', valor: 2100000 },
  { mes: 'Ago', valor: 1950000 },
  { mes: 'Set', valor: 2300000 },
  { mes: 'Out', valor: 2400000 },
  { mes: 'Nov', valor: 0 },
  { mes: 'Dez', valor: 0 }
];

const topImoveisMaisVistos = [
  {
    id: 'IM005',
    titulo: 'Cobertura Duplex em Perdizes',
    tipo: 'Apartamento',
    preco: 'R$ 1.850.000',
    visualizacoes: 620
  },
  {
    id: 'IM002',
    titulo: 'Casa em Moema',
    tipo: 'Casa',
    preco: 'R$ 1.350.000',
    visualizacoes: 530
  },
  {
    id: 'IM007',
    titulo: 'Casa em Condomínio Fechado',
    tipo: 'Casa',
    preco: 'R$ 980.000',
    visualizacoes: 480
  },
  {
    id: 'IM001',
    titulo: 'Apartamento em Pinheiros',
    tipo: 'Apartamento',
    preco: 'R$ 850.000',
    visualizacoes: 345
  },
  {
    id: 'IM004',
    titulo: 'Apartamento na Vila Mariana',
    tipo: 'Apartamento',
    preco: 'R$ 750.000',
    visualizacoes: 290
  }
];

const imovelPorTipo = [
  { tipo: 'Apartamentos', quantidade: 52, percentual: 41 },
  { tipo: 'Casas', quantidade: 38, percentual: 30 },
  { tipo: 'Comercial', quantidade: 20, percentual: 16 },
  { tipo: 'Terrenos', quantidade: 12, percentual: 9 },
  { tipo: 'Rural', quantidade: 5, percentual: 4 }
];

export default function RelatoriosPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  
  return (
    <PageContainer
      title="Relatórios"
      subtitle="Acompanhe o desempenho e analise métricas importantes do seu negócio"
    >
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
            <div className="flex gap-2 items-center">
              <div className="w-40">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Selecionar</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-sm text-muted-foreground">até</span>
              <div className="w-40">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Selecionar</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filtros avançados
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>
      
      {/* Cartões de métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {estatisticasGerais.map((estatistica, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{estatistica.titulo}</p>
                  <h3 className="text-2xl font-bold mt-1">{estatistica.valor}</h3>
                  <div className={`flex items-center mt-1 ${
                    estatistica.tendencia === 'up' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {estatistica.tendencia === 'up' 
                      ? <ArrowUpRight className="h-4 w-4 mr-1" /> 
                      : <ArrowDownRight className="h-4 w-4 mr-1" />
                    }
                    <span className="text-sm">{estatistica.comparacao} vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <estatistica.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Abas de categorias de relatórios */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="leads">Leads/Contatos</TabsTrigger>
          <TabsTrigger value="imoveis">Portfólio de Imóveis</TabsTrigger>
          <TabsTrigger value="corretores">Corretores</TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba Visão Geral */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Desempenho de Vendas</CardTitle>
                <CardDescription>
                  Volume mensal de vendas em 2024
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={300} type="bar" title="Gráfico de barras mostrando vendas mensais" />
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  Ver relatório completo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Imóveis por Tipo</CardTitle>
                <CardDescription>
                  Distribuição do portfólio atual
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="pie" title="Gráfico de pizza mostrando tipos de imóveis" />
                
                <div className="mt-4 space-y-2">
                  {imovelPorTipo.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.tipo}</span>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">{item.quantidade} imóveis</span>
                        <span className="font-medium">{item.percentual}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Leads por Fonte</CardTitle>
                <CardDescription>
                  Origem dos contatos de potenciais clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="pie" title="Gráfico de origem dos leads" />
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Imóveis Mais Vistos</CardTitle>
                <CardDescription>
                  Imóveis com maior número de visualizações
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-0">
                <div className="space-y-4">
                  {topImoveisMaisVistos.map((imovel, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted w-12 h-12 rounded flex items-center justify-center">
                          <Home className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{imovel.titulo}</span>
                            <Badge variant="outline" className="text-xs">
                              {imovel.tipo}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {imovel.preco}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-sm">
                          <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{imovel.visualizacoes}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  Ver todos os imóveis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Conteúdo da aba Vendas */}
        <TabsContent value="vendas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Vendas</CardTitle>
                <CardDescription>
                  Evolução mensal das vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="line" title="Gráfico de linha mostrando evolução de vendas" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Vendas por Corretor</CardTitle>
                <CardDescription>
                  Desempenho individual da equipe
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando vendas por corretor" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Previsão de vendas para os próximos meses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartPlaceholder height={250} type="line" title="Gráfico de linha mostrando tendências e previsões" />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba Leads */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Novos Leads</CardTitle>
                <CardDescription>
                  Quantidade de novos leads adquiridos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="line" title="Gráfico de linha mostrando novos leads" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Taxa de Conversão</CardTitle>
                <CardDescription>
                  Percentual de leads convertidos em negócios
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="line" title="Gráfico de linha mostrando taxa de conversão" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Leads por Origem</CardTitle>
              <CardDescription>
                Canais que geram mais contatos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando origem dos leads" />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba Imóveis */}
        <TabsContent value="imoveis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Imóveis por Status</CardTitle>
                <CardDescription>
                  Distribuição dos imóveis por situação
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="pie" title="Gráfico de pizza mostrando status dos imóveis" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Imóveis por Localização</CardTitle>
                <CardDescription>
                  Distribuição geográfica dos imóveis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando localização dos imóveis" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tempo Médio de Venda</CardTitle>
              <CardDescription>
                Dias para vender por tipo de imóvel
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando tempo médio de venda" />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba Corretores */}
        <TabsContent value="corretores" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Desempenho dos Corretores</CardTitle>
                <CardDescription>
                  Volume de vendas por corretor
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando vendas por corretor" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Comissões Pagas</CardTitle>
                <CardDescription>
                  Total de comissões por corretor
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando comissões pagas" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Taxa de Conversão por Corretor</CardTitle>
              <CardDescription>
                Percentual de leads convertidos em vendas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartPlaceholder height={250} type="bar" title="Gráfico de barras mostrando taxa de conversão por corretor" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Relatórios disponíveis */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Relatórios Disponíveis</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Relatório de Vendas</h4>
                  <p className="text-sm text-muted-foreground">Análise detalhada das vendas</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Leads e Conversões</h4>
                  <p className="text-sm text-muted-foreground">Análise do funil de vendas</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Portfólio de Imóveis</h4>
                  <p className="text-sm text-muted-foreground">Análise do catálogo atual</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Desempenho da Equipe</h4>
                  <p className="text-sm text-muted-foreground">Avaliação dos corretores</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Financeiro</h4>
                  <p className="text-sm text-muted-foreground">Receitas e despesas</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Calendar className="h-5 w-5 text-primary" />
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
      </div>
    </PageContainer>
  );
}
