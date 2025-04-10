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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  User,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Activity,
  Calendar,
  BarChart,
  PieChart,
  LineChart,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function DashboardAdminPage() {
  return (
    <PageContainer
      title="Painel Administrativo"
      subtitle="Visão geral e estatísticas do sistema"
    >
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Imobiliárias</h3>
                  <div className="text-2xl font-bold">128</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">12%</span>
                <span className="ml-1">em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Corretores</h3>
                  <div className="text-2xl font-bold">856</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">18%</span>
                <span className="ml-1">em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Clientes</h3>
                  <div className="text-2xl font-bold">2,456</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">24%</span>
                <span className="ml-1">em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Receita Mensal</h3>
                  <div className="text-2xl font-bold">R$ 86.500</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">8%</span>
                <span className="ml-1">em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Conteúdo principal */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="activity">Atividades</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>
          
          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Gráfico principal - Ocupando 4 colunas */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Crescimento</CardTitle>
                  <CardDescription>
                    Análise de novos cadastros nos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <div className="ml-4">
                      <p className="text-muted-foreground text-sm">Gráfico de Crescimento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Painel de planos - Ocupando 3 colunas */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Assinaturas por Plano</CardTitle>
                  <CardDescription>
                    Distribuição de planos ativos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex flex-col justify-center space-y-6">
                    <div className="flex items-center justify-center mb-2">
                      <PieChart className="h-16 w-16 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Plano Premium</span>
                          <span className="text-sm font-medium">42%</span>
                        </div>
                        <Progress value={42} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Plano Business</span>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                        <Progress value={28} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Plano Básico</span>
                          <span className="text-sm font-medium">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Estatísticas detalhadas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa de Conversão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.8%</div>
                  <p className="text-xs text-muted-foreground">
                    +4.1% em relação ao mês anterior
                  </p>
                  <div className="mt-4 h-[60px] flex items-center justify-center bg-muted/30 rounded-md">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Novas Inscrições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">132</div>
                  <p className="text-xs text-muted-foreground">
                    +12 em relação à semana passada
                  </p>
                  <div className="mt-4 h-[60px] flex items-center justify-center bg-muted/30 rounded-md">
                    <BarChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita Média por Imobiliária
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 675</div>
                  <p className="text-xs text-muted-foreground">
                    +R$ 45 em relação ao mês anterior
                  </p>
                  <div className="mt-4 h-[60px] flex items-center justify-center bg-muted/30 rounded-md">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Churn Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4%</div>
                  <p className="text-xs text-muted-foreground">
                    -0.8% em relação ao mês anterior
                  </p>
                  <div className="mt-4 h-[60px] flex items-center justify-center bg-muted/30 rounded-md">
                    <ArrowDown className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Aba de Atividades */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Últimas ações no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/10 rounded-full p-2">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nova imobiliária cadastrada</p>
                      <p className="text-xs text-muted-foreground">
                        Imobiliária Santos & Associados se cadastrou no plano Premium
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hoje às 10:23
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/10 rounded-full p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Novo corretor</p>
                      <p className="text-xs text-muted-foreground">
                        15 novos corretores foram adicionados à Imobiliária Central
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hoje às 09:15
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/10 rounded-full p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Renovação de plano</p>
                      <p className="text-xs text-muted-foreground">
                        Imobiliária Farias renovou assinatura do plano Business por mais 12 meses
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ontem às 16:45
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/10 rounded-full p-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pagamento recebido</p>
                      <p className="text-xs text-muted-foreground">
                        Recebimento de R$ 5.800 referente a assinaturas de 12 imobiliárias
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ontem às 14:30
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver todas as atividades
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Aba de Análises */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Desempenho</CardTitle>
                <CardDescription>
                  Comparativo de crescimento por região
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <div className="ml-4">
                    <p className="text-muted-foreground text-sm">Gráfico de Desempenho Regional</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Sudeste</span>
                      <span className="text-sm font-medium">58%</span>
                    </div>
                    <Progress value={58} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Sul</span>
                      <span className="text-sm font-medium">24%</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Nordeste</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Centro-Oeste</span>
                      <span className="text-sm font-medium">6%</span>
                    </div>
                    <Progress value={6} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Exportar relatório
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Próximas ações */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Próximas Ações</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reunião com equipe de marketing</p>
                    <p className="text-xs text-muted-foreground">
                      Amanhã às 10:00
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Revisão de dados financeiros</p>
                    <p className="text-xs text-muted-foreground">
                      Amanhã às 14:30
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lançamento da atualização v2.5</p>
                    <p className="text-xs text-muted-foreground">
                      15/06/2024 às 08:00
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button variant="outline" className="w-full">
              Ver agenda completa
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
