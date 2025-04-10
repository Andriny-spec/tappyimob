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
import {
  BarChart,
  PieChart,
  LineChart,
  Download,
  ChevronDown,
  Calendar,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Printer,
  FileText,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Dados fictícios para demonstração
const dadosVendas = [
  { mes: 'Jan', valor: 250000 },
  { mes: 'Fev', valor: 320000 },
  { mes: 'Mar', valor: 180000 },
  { mes: 'Abr', valor: 420000 },
  { mes: 'Mai', valor: 380000 },
  { mes: 'Jun', valor: 490000 },
  { mes: 'Jul', valor: 520000 },
  { mes: 'Ago', valor: 390000 },
  { mes: 'Set', valor: 450000 },
  { mes: 'Out', valor: 580000 },
  { mes: 'Nov', valor: 620000 },
  { mes: 'Dez', valor: 490000 }
];

const indicadoresDesempenho = {
  vendas: {
    valor: 'R$ 4.890.000',
    tendencia: 'positiva',
    comparativo: '+12,5%'
  },
  visitas: {
    valor: '68',
    tendencia: 'positiva',
    comparativo: '+8,2%'
  },
  leads: {
    valor: '124',
    tendencia: 'positiva',
    comparativo: '+15,3%'
  },
  conversao: {
    valor: '6,2%',
    tendencia: 'negativa',
    comparativo: '-0,8%'
  },
  tempoMedio: {
    valor: '45 dias',
    tendencia: 'positiva',
    comparativo: '-5 dias'
  },
  ticketMedio: {
    valor: 'R$ 720.000',
    tendencia: 'positiva',
    comparativo: '+8,4%'
  }
};

const tiposImoveis = [
  { tipo: 'Apartamento', quantidade: 8, percentual: 54 },
  { tipo: 'Casa', quantidade: 3, percentual: 23 },
  { tipo: 'Terreno', quantidade: 2, percentual: 15 },
  { tipo: 'Comercial', quantidade: 1, percentual: 8 }
];

const regioes = [
  { nome: 'Jardins', valor: 'R$ 2.150.000', quantidade: 3 },
  { nome: 'Vila Nova Conceição', valor: 'R$ 1.840.000', quantidade: 2 },
  { nome: 'Moema', valor: 'R$ 920.000', quantidade: 2 },
  { nome: 'Brooklin', valor: 'R$ 780.000', quantidade: 1 },
  { nome: 'Perdizes', valor: 'R$ 640.000', quantidade: 1 },
  { nome: 'Outras', valor: 'R$ 480.000', quantidade: 5 }
];

export default function RelatoriosCorretorPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  
  return (
    <PageContainer
      title="Relatórios"
      subtitle="Acompanhe seu desempenho e análise de vendas"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            
            <Tabs defaultValue={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <TabsList>
                <TabsTrigger value="mes">Mês</TabsTrigger>
                <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
                <TabsTrigger value="ano">Ano</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
        
        {/* Indicadores de Desempenho */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Indicadores de Desempenho</CardTitle>
            <CardDescription>
              Visão geral do seu desempenho no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volume de Vendas</p>
                      <p className="text-2xl font-bold">{indicadoresDesempenho.vendas.valor}</p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-2.5">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    {indicadoresDesempenho.vendas.tendencia === 'positiva' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                    )}
                    <span className={indicadoresDesempenho.vendas.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {indicadoresDesempenho.vendas.comparativo}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">em relação ao período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Visitas Realizadas</p>
                      <p className="text-2xl font-bold">{indicadoresDesempenho.visitas.valor}</p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-2.5">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    {indicadoresDesempenho.visitas.tendencia === 'positiva' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                    )}
                    <span className={indicadoresDesempenho.visitas.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {indicadoresDesempenho.visitas.comparativo}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">em relação ao período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Leads Captados</p>
                      <p className="text-2xl font-bold">{indicadoresDesempenho.leads.valor}</p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-2.5">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    {indicadoresDesempenho.leads.tendencia === 'positiva' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                    )}
                    <span className={indicadoresDesempenho.leads.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {indicadoresDesempenho.leads.comparativo}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">em relação ao período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-2xl font-bold">{indicadoresDesempenho.conversao.valor}</p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-2.5">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    {indicadoresDesempenho.conversao.tendencia === 'positiva' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                    )}
                    <span className={indicadoresDesempenho.conversao.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {indicadoresDesempenho.conversao.comparativo}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">em relação ao período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tempo Médio de Venda</p>
                      <p className="text-2xl font-bold">{indicadoresDesempenho.tempoMedio.valor}</p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-2.5">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    {indicadoresDesempenho.tempoMedio.tendencia === 'positiva' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                    )}
                    <span className={indicadoresDesempenho.tempoMedio.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {indicadoresDesempenho.tempoMedio.comparativo}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">em relação ao período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-2xl font-bold">{indicadoresDesempenho.ticketMedio.valor}</p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-2.5">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    {indicadoresDesempenho.ticketMedio.tendencia === 'positiva' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                    )}
                    <span className={indicadoresDesempenho.ticketMedio.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {indicadoresDesempenho.ticketMedio.comparativo}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">em relação ao período anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Evolução de vendas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evolução de Vendas</CardTitle>
                <CardDescription>
                  Volume de vendas ao longo do período
                </CardDescription>
              </div>
              <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option value="valor">Valor (R$)</option>
                <option value="quantidade">Quantidade</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full border-b border-l flex items-end justify-between relative">
              {dadosVendas.map((item, index) => (
                <div key={index} className="flex flex-col items-center relative w-full">
                  <div 
                    className="bg-primary w-4/5 hover:bg-primary/90 transition-colors"
                    style={{ 
                      height: `${(item.valor / 620000) * 250}px`,
                    }}
                  ></div>
                  <div className="mt-2 text-xs text-muted-foreground">{item.mes}</div>
                </div>
              ))}
              
              {/* Eixo Y (valores) - Simplificado */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                <div className="transform -translate-y-1/2 -translate-x-1">R$ 600k</div>
                <div className="transform -translate-y-1/2 -translate-x-1">R$ 400k</div>
                <div className="transform -translate-y-1/2 -translate-x-1">R$ 200k</div>
                <div className="transform -translate-y-1/2 -translate-x-1">R$ 0</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex w-full justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-primary w-3 h-3"></div>
                <span>Volume de Vendas</span>
              </div>
              <Button variant="ghost" className="text-xs h-8 px-2">
                Ver detalhes
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Duas colunas - Tipos de Imóveis e Regiões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipos de imóveis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Vendas por Tipo de Imóvel</CardTitle>
              <CardDescription>
                Distribuição de vendas por categoria de imóvel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  {/* Gráfico de pizza simplificado */}
                  <div className="relative h-48 w-48">
                    <div className="absolute inset-0 rounded-full border-8 border-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-amber-500" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0 100%, 0 50%)' }}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tiposImoveis.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className={`w-3 h-3 mr-2 rounded-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                        ></div>
                        <span className="text-sm">{item.tipo}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{item.quantidade}</span>
                        <span className="text-sm text-muted-foreground w-10 text-right">{item.percentual}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Regiões */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Vendas por Região</CardTitle>
              <CardDescription>
                Distribuição de vendas por bairro ou região
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regioes.map((regiao, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{regiao.nome}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          {regiao.quantidade} {regiao.quantidade === 1 ? 'imóvel' : 'imóveis'}
                        </Badge>
                        <span className="text-sm font-medium">{regiao.valor}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${(regiao.quantidade / 14) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Relatórios disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>
              Acesse relatórios específicos para análises detalhadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Desempenho Financeiro</h3>
                    <p className="text-sm text-muted-foreground">
                      Análise completa de receitas, comissões e projeções financeiras.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Ver relatório
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Atividade de Clientes</h3>
                    <p className="text-sm text-muted-foreground">
                      Análise da captação, engajamento e conversão de leads e clientes.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Ver relatório
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Documento Fiscal</h3>
                    <p className="text-sm text-muted-foreground">
                      Relatórios para fins fiscais e declaração de imposto de renda.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Ver relatório
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todos os relatórios disponíveis
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
