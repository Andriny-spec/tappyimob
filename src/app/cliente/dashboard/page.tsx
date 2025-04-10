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
  Home,
  FileText,
  Calendar,
  Heart,
  Bell,
  Wallet,
  Building2,
  MessagesSquare,
  Clock,
  ChevronRight,
  Plus,
  Search,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function DashboardClientePage() {
  return (
    <PageContainer
      title="Visão Geral"
      subtitle="Acompanhe seus imóveis e atividades"
    >
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Imóveis Favoritos</h3>
                  <div className="text-2xl font-bold">8</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <Button variant="link" className="h-8 p-0 text-sm">
                  Ver favoritos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Imóveis Contratados</h3>
                  <div className="text-2xl font-bold">2</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <Button variant="link" className="h-8 p-0 text-sm">
                  Ver meus imóveis
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Documentos</h3>
                  <div className="text-2xl font-bold">5</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <Button variant="link" className="h-8 p-0 text-sm">
                  Ver documentos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Agendamentos</h3>
                  <div className="text-2xl font-bold">1</div>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <Button variant="link" className="h-8 p-0 text-sm">
                  Ver agenda
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Conteúdo principal */}
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="recomendados">Recomendados</TabsTrigger>
          </TabsList>
          
          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-4">
            {/* Próxima Visita */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Próxima Visita</CardTitle>
                <CardDescription>Seu próximo agendamento de visita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="w-full md:w-[120px] h-[120px] rounded-md bg-muted flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Apartamento Jardins</h3>
                    <p className="text-sm text-muted-foreground">Rua dos Pinheiros, 123 - Jardins, São Paulo</p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>18/06/2024</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>14:30</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MessagesSquare className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Carlos Oliveira (Corretor)</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Remarcar
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancelar
                      </Button>
                      <Button variant="default" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Status de Processos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Status de Processos</CardTitle>
                <CardDescription>
                  Acompanhamento dos seus processos ativos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Compra: Apartamento Vila Madalena</div>
                      <div className="text-xs text-muted-foreground">
                        Proposta aceita: 15/05/2024
                      </div>
                    </div>
                    <Badge className="bg-amber-500">Em andamento</Badge>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Proposta</span>
                    <span>Documentação</span>
                    <span>Contrato</span>
                    <span>Registro</span>
                    <span>Entrega</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Aluguel: Comercial Itaim Bibi</div>
                      <div className="text-xs text-muted-foreground">
                        Contrato assinado: 02/06/2024
                      </div>
                    </div>
                    <Badge className="bg-green-500">Concluído</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Proposta</span>
                    <span>Aprovação</span>
                    <span>Contrato</span>
                    <span>Vistoria</span>
                    <span>Entrega</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver todos os processos
                </Button>
              </CardFooter>
            </Card>
            
            {/* Documentos Pendentes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Documentos Pendentes</CardTitle>
                <CardDescription>
                  Documentos que precisam da sua atenção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 text-red-600 p-2 rounded-md">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Comprovante de Renda</div>
                      <div className="text-sm text-muted-foreground">
                        Necessário para processo de aluguel
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                    Pendente
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 text-amber-600 p-2 rounded-md">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Contrato de Compra e Venda</div>
                      <div className="text-sm text-muted-foreground">
                        Assinatura necessária até 20/06/2024
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                    Aguardando
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Gerenciar documentos
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Atividades */}
          <TabsContent value="atividades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Histórico das suas interações e notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="relative pl-6 border-l before:absolute before:left-[-4px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Agendamento confirmado</h4>
                      <span className="text-xs text-muted-foreground">Hoje, 11:45</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Visita ao Apartamento Jardins confirmada para 18/06/2024 às 14:30
                    </p>
                  </div>
                  
                  <div className="relative pl-6 border-l before:absolute before:left-[-4px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Documento recebido</h4>
                      <span className="text-xs text-muted-foreground">Ontem, 16:23</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Contrato de Compra e Venda enviado para sua aprovação e assinatura
                    </p>
                  </div>
                  
                  <div className="relative pl-6 border-l before:absolute before:left-[-4px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Proposta aceita</h4>
                      <span className="text-xs text-muted-foreground">15/05/2024</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Sua proposta para o Apartamento Vila Madalena foi aceita pelo proprietário
                    </p>
                  </div>
                  
                  <div className="relative pl-6 border-l before:absolute before:left-[-4px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Mensagem recebida</h4>
                      <span className="text-xs text-muted-foreground">10/05/2024</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Você recebeu uma nova mensagem do corretor Carlos Oliveira
                    </p>
                  </div>
                  
                  <div className="relative pl-6 border-l before:absolute before:left-[-4px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Documento enviado</h4>
                      <span className="text-xs text-muted-foreground">07/05/2024</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Você enviou seus documentos pessoais para análise
                    </p>
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
          
          {/* Recomendados */}
          <TabsContent value="recomendados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Imóveis Recomendados</CardTitle>
                <CardDescription>
                  Baseado nas suas preferências e histórico de buscas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <Card key={item} className="overflow-hidden border-0 shadow-sm">
                      <div className="relative">
                        <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          Novo
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute top-2 left-2 bg-background/80 hover:bg-background/90 h-8 w-8"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                              {item === 1 ? 'Venda' : item === 2 ? 'Aluguel' : 'Lançamento'}
                            </Badge>
                            <span className="text-sm font-medium">
                              {item === 1 ? 'R$ 850.000' : item === 2 ? 'R$ 3.800/mês' : 'R$ 1.200.000'}
                            </span>
                          </div>
                          <h3 className="font-medium">
                            {item === 1 ? 'Apartamento Pinheiros' : item === 2 ? 'Conjunto Comercial Itaim' : 'Casa Morumbi'}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {item === 1 ? 'Rua dos Pinheiros, 456 - Pinheiros' : 
                             item === 2 ? 'Av. Juscelino Kubitschek, 1800 - Itaim' : 
                             'Rua das Magnólias, 789 - Morumbi'}
                          </p>
                          <div className="flex text-xs text-muted-foreground gap-3">
                            <span>{item === 1 ? '2 quartos' : item === 2 ? '120m²' : '4 quartos'}</span>
                            <span>{item === 1 ? '1 vaga' : item === 2 ? '4 vagas' : '3 vagas'}</span>
                            <span>{item === 1 ? '68m²' : item === 2 ? 'Andar alto' : '280m²'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <Button variant="link" className="h-8 p-0">
                              Ver detalhes
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              <Eye className="h-3.5 w-3.5 mr-1.5" /> Agendar visita
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver mais recomendações
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Buscas Recentes</CardTitle>
                <CardDescription>
                  Imóveis que você visualizou recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={`busca-${item}`} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">
                            {item === 1 ? 'Apartamento Vila Olímpia' : item === 2 ? 'Cobertura Brooklin' : 'Sala Comercial Faria Lima'}
                          </h4>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {item === 1 ? '2 dias atrás' : item === 2 ? 'Ontem' : 'Hoje'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item === 1 ? 'R$ 780.000 · 2 quartos · 70m²' : 
                           item === 2 ? 'R$ 1.450.000 · 3 quartos · 140m²' : 
                           'R$ 12.000/mês · 85m² · 2 vagas'}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Lembretes e Notificações */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Lembretes e Notificações</CardTitle>
              <Badge>3 novas</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex p-3 border rounded-lg bg-muted/30">
              <div className="mr-3 bg-amber-500/10 text-amber-600 rounded-full p-2.5 h-max">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Vencimento de Aluguel</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  O pagamento do aluguel do Comercial Itaim vence em 3 dias. Evite juros.
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">Pagar agora</Button>
                </div>
              </div>
            </div>
            
            <div className="flex p-3 border rounded-lg">
              <div className="mr-3 bg-blue-500/10 text-blue-600 rounded-full p-2.5 h-max">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Vistoria Agendada</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Vistoria do Apartamento Vila Madalena agendada para 25/06/2024 às 10:00.
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">Ver detalhes</Button>
                </div>
              </div>
            </div>
            
            <div className="flex p-3 border rounded-lg">
              <div className="mr-3 bg-green-500/10 text-green-600 rounded-full p-2.5 h-max">
                <MessagesSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Nova Mensagem</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Você recebeu uma nova mensagem do seu corretor sobre o status da sua proposta.
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">Ler mensagem</Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todas as notificações
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
