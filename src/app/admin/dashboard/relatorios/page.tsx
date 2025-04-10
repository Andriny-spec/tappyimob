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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Search, 
  Download, 
  Clock, 
  FileText, 
  Filter, 
  BarChart4, 
  Users, 
  Home, 
  TrendingUp, 
  Calendar as CalendarIcon2, 
  ArrowUpRight, 
  Mail,
  RefreshCw,
  FileCog,
  PanelLeft,
  Share2,
  Eye
} from 'lucide-react';

// Dados de exemplo para relatórios recentes
const relatoriosRecentes = [
  {
    id: '1',
    nome: 'Desempenho de Vendas - Junho 2023',
    tipo: 'vendas',
    formato: 'pdf',
    dataCriacao: '12/06/2023',
    tamanho: '2.4 MB',
    visualizacoes: 28
  },
  {
    id: '2',
    nome: 'Análise de Leads por Fonte - Q2 2023',
    tipo: 'leads',
    formato: 'xlsx',
    dataCriacao: '05/06/2023',
    tamanho: '1.8 MB',
    visualizacoes: 15
  },
  {
    id: '3',
    nome: 'Métricas de Visitas a Imóveis - Maio 2023',
    tipo: 'visitas',
    formato: 'pdf',
    dataCriacao: '02/06/2023',
    tamanho: '3.2 MB',
    visualizacoes: 42
  },
  {
    id: '4',
    nome: 'Análise de Conversão de Clientes',
    tipo: 'clientes',
    formato: 'pdf',
    dataCriacao: '28/05/2023',
    tamanho: '1.5 MB',
    visualizacoes: 19
  },
  {
    id: '5',
    nome: 'Relatório Financeiro - Maio 2023',
    tipo: 'financeiro',
    formato: 'xlsx',
    dataCriacao: '25/05/2023',
    tamanho: '4.1 MB',
    visualizacoes: 7
  }
];

// Dados de exemplo para relatórios agendados
const relatoriosAgendados = [
  {
    id: '1',
    nome: 'Relatório de Vendas',
    frequencia: 'Mensal',
    ultimaExecucao: '01/06/2023',
    proximaExecucao: '01/07/2023',
    destinatarios: ['admin@tappyimob.com', 'financeiro@tappyimob.com'],
    status: 'ativo'
  },
  {
    id: '2',
    nome: 'Análise de Leads',
    frequencia: 'Semanal',
    ultimaExecucao: '12/06/2023',
    proximaExecucao: '19/06/2023',
    destinatarios: ['marketing@tappyimob.com'],
    status: 'ativo'
  },
  {
    id: '3',
    nome: 'Desempenho de Corretores',
    frequencia: 'Quinzenal',
    ultimaExecucao: '05/06/2023',
    proximaExecucao: '20/06/2023',
    destinatarios: ['gerencia@tappyimob.com', 'rh@tappyimob.com'],
    status: 'ativo'
  },
  {
    id: '4',
    nome: 'Análise de Métricas do Site',
    frequencia: 'Mensal',
    ultimaExecucao: '01/06/2023',
    proximaExecucao: '01/07/2023',
    destinatarios: ['ti@tappyimob.com', 'marketing@tappyimob.com'],
    status: 'inativo'
  }
];

// Categorias de relatórios disponíveis
const categorias = [
  { id: 'todos', nome: 'Todos os Relatórios', icone: <FileText className="h-4 w-4" /> },
  { id: 'vendas', nome: 'Vendas e Receitas', icone: <BarChart4 className="h-4 w-4" /> },
  { id: 'clientes', nome: 'Clientes e Leads', icone: <Users className="h-4 w-4" /> },
  { id: 'imoveis', nome: 'Imóveis', icone: <Home className="h-4 w-4" /> },
  { id: 'marketing', nome: 'Marketing', icone: <TrendingUp className="h-4 w-4" /> }
];

// Dados de exemplo para gráficos
const dadosVendas = {
  meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  valores: [150000, 220000, 180000, 250000, 300000, 280000]
};

const dadosLeads = {
  meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  valores: [120, 145, 132, 190, 210, 250]
};

// Componente de mini gráfico para demonstração (placeholder)
function MiniChart({ tipo }: { tipo: string }) {
  return (
    <div className="h-12 flex items-end gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
        // Gerar alturas aleatórias para as barras do gráfico
        const height = Math.floor(Math.random() * 100);
        return (
          <div 
            key={index}
            className={`w-1.5 rounded-t-sm ${
              tipo === 'vendas' 
                ? 'bg-primary' 
                : tipo === 'leads' 
                  ? 'bg-amber-500' 
                  : 'bg-blue-500'
            }`}
            style={{ height: `${Math.max(15, height)}%` }}
          />
        );
      })}
    </div>
  );
}

export default function RelatoriosPage() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Filtragem de relatórios por categoria
  const relatoriosFiltrados = relatoriosRecentes.filter(relatorio => 
    categoriaSelecionada === 'todos' || relatorio.tipo === categoriaSelecionada
  );

  return (
    <PageContainer
      title="Relatórios"
      subtitle="Visualize e gere relatórios detalhados para análise do negócio"
    >
      {/* Tabs de tipos de relatórios */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
        </TabsList>

        {/* Tab de Dashboard */}
        <TabsContent value="dashboard" className="space-y-8">
          {/* Barra de filtros para dashboard */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Select defaultValue="30dias">
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                  <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                  <SelectItem value="12meses">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Período Personalizado</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: new Date(),
                      to: new Date(new Date().setDate(new Date().getDate() + 7))
                    }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Cartões de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas</p>
                    <h3 className="text-2xl font-bold">R$ 1.2M</h3>
                  </div>
                  <Badge variant="outline" className="text-green-600 bg-green-100 dark:bg-green-900/20">
                    +12.5%
                  </Badge>
                </div>
                <MiniChart tipo="vendas" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <h3 className="text-2xl font-bold">854</h3>
                  </div>
                  <Badge variant="outline" className="text-green-600 bg-green-100 dark:bg-green-900/20">
                    +8.2%
                  </Badge>
                </div>
                <MiniChart tipo="leads" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                    <h3 className="text-2xl font-bold">23.8%</h3>
                  </div>
                  <Badge variant="outline" className="text-amber-600 bg-amber-100 dark:bg-amber-900/20">
                    +1.3%
                  </Badge>
                </div>
                <MiniChart tipo="conversao" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Visitas a Imóveis</p>
                    <h3 className="text-2xl font-bold">435</h3>
                  </div>
                  <Badge variant="outline" className="text-red-600 bg-red-100 dark:bg-red-900/20">
                    -2.5%
                  </Badge>
                </div>
                <MiniChart tipo="visitas" />
              </CardContent>
            </Card>
          </div>

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Vendas por Período</CardTitle>
                  <Button variant="outline" size="sm" className="h-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Comparativo de vendas nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-[4/3] bg-muted/20 rounded-md flex items-center justify-center">
                  <BarChart4 className="h-16 w-16 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Leads por Fonte</CardTitle>
                  <Button variant="outline" size="sm" className="h-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Distribuição de leads por canal de origem
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-[4/3] bg-muted/20 rounded-md flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mais gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Imóveis por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/20 rounded-md flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desempenho de Corretores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/20 rounded-md flex items-center justify-center">
                  <BarChart className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engajamento no Site</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/20 rounded-md flex items-center justify-center">
                  <LineChart className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Relatórios */}
        <TabsContent value="relatorios" className="space-y-6">
          {/* Barra de ações e filtros */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex gap-2">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  placeholder="Buscar relatório..." 
                  className="w-full pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Novo Relatório
            </Button>
          </div>

          {/* Categorias de relatórios */}
          <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
            {categorias.map(categoria => (
              <Button
                key={categoria.id}
                variant={categoriaSelecionada === categoria.id ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => setCategoriaSelecionada(categoria.id)}
              >
                {categoria.icone}
                {categoria.nome}
              </Button>
            ))}
          </div>

          {/* Tabela de relatórios */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Visualize e baixe relatórios gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatoriosFiltrados.map(relatorio => (
                    <TableRow key={relatorio.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-muted">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          {relatorio.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {relatorio.formato.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{relatorio.dataCriacao}</TableCell>
                      <TableCell>{relatorio.tamanho}</TableCell>
                      <TableCell>{relatorio.visualizacoes}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Modelos de relatórios */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Modelos de Relatórios</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="bg-muted rounded p-2 w-fit">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base mt-2">Desempenho de Vendas</CardTitle>
                  <CardDescription>
                    Análise completa das vendas realizadas no período
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 pb-4">
                  <Button variant="outline" className="w-full">Gerar Relatório</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="bg-muted rounded p-2 w-fit">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base mt-2">Análise de Leads</CardTitle>
                  <CardDescription>
                    Dados sobre conversão de leads em diferentes canais
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 pb-4">
                  <Button variant="outline" className="w-full">Gerar Relatório</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="bg-muted rounded p-2 w-fit">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base mt-2">Imóveis mais Visitados</CardTitle>
                  <CardDescription>
                    Lista de imóveis com mais visitas e contatos
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 pb-4">
                  <Button variant="outline" className="w-full">Gerar Relatório</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="bg-muted rounded p-2 w-fit">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base mt-2">Marketing e Alcance</CardTitle>
                  <CardDescription>
                    Métricas de desempenho de campanhas e anúncios
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 pb-4">
                  <Button variant="outline" className="w-full">Gerar Relatório</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab de Relatórios Agendados */}
        <TabsContent value="agendados" className="space-y-6">
          {/* Barra de ações */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Relatórios Agendados</h3>
            <Button className="gap-2">
              <CalendarIcon2 className="h-4 w-4" />
              Agendar Novo Relatório
            </Button>
          </div>

          {/* Tabela de relatórios agendados */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Próxima Execução</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatoriosAgendados.map(relatorio => (
                    <TableRow key={relatorio.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarIcon2 className="h-4 w-4 text-primary" />
                          {relatorio.nome}
                        </div>
                      </TableCell>
                      <TableCell>{relatorio.frequencia}</TableCell>
                      <TableCell>{relatorio.ultimaExecucao}</TableCell>
                      <TableCell>{relatorio.proximaExecucao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{relatorio.destinatarios.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={relatorio.status === 'ativo' ? 'default' : 'secondary'}
                          className={relatorio.status === 'ativo' ? 'bg-green-500' : 'bg-muted'}
                        >
                          {relatorio.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileCog className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PanelLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card className="bg-muted/20 border-dashed">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="bg-background rounded-md p-4">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Agende Relatórios</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure relatórios para serem gerados automaticamente em intervalos personalizados.
                  </p>
                </div>
                
                <div className="bg-background rounded-md p-4">
                  <Mail className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Entrega Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione destinatários para receber relatórios por e-mail assim que forem gerados.
                  </p>
                </div>
                
                <div className="bg-background rounded-md p-4">
                  <Share2 className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Compartilhamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe relatórios diretamente com clientes e parceiros via links ou e-mails.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
