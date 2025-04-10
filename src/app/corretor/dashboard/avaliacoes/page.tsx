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
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  ThumbsDown,
  Clock,
  User,
  Home,
  BarChart4,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados fictícios para demonstração
const avaliacoes = [
  {
    id: 1,
    cliente: {
      id: 101,
      nome: 'Roberto Silva',
      avatar: '/avatars/roberto.jpg',
    },
    imovel: {
      id: 201,
      titulo: 'Apartamento em Jardins',
      tipo: 'venda'
    },
    avaliacao: 5,
    comentario: 'Excelente atendimento! O corretor foi muito atencioso e nos ajudou a encontrar o imóvel perfeito. Recomendo!',
    data: '10/03/2025',
    respondido: true,
    resposta: 'Obrigado pela avaliação, Roberto! Foi um prazer ajudar você e sua família a encontrar o lar dos sonhos.',
    dataResposta: '10/03/2025'
  },
  {
    id: 2,
    cliente: {
      id: 102,
      nome: 'Carla Mendes',
      avatar: '/avatars/carla.jpg',
    },
    imovel: {
      id: 202,
      titulo: 'Casa em Alphaville',
      tipo: 'venda'
    },
    avaliacao: 4,
    comentario: 'Bom atendimento e agilidade na negociação. Poderia ter oferecido mais opções de imóveis na região que solicitei.',
    data: '05/03/2025',
    respondido: false,
    resposta: '',
    dataResposta: null
  },
  {
    id: 3,
    cliente: {
      id: 103,
      nome: 'Paulo Santos',
      avatar: '',
    },
    imovel: {
      id: 203,
      titulo: 'Sala comercial na Paulista',
      tipo: 'locacao'
    },
    avaliacao: 5,
    comentario: 'Profissional muito competente! Entendeu exatamente o que eu precisava para minha empresa e apresentou ótimas opções.',
    data: '28/02/2025',
    respondido: true,
    resposta: 'Muito obrigado pela confiança, Paulo! Estou sempre à disposição para ajudá-lo em novos projetos.',
    dataResposta: '01/03/2025'
  },
  {
    id: 4,
    cliente: {
      id: 104,
      nome: 'Ana Costa',
      avatar: '/avatars/ana.jpg',
    },
    imovel: {
      id: 204,
      titulo: 'Studio no Centro',
      tipo: 'venda'
    },
    avaliacao: 3,
    comentario: 'Demorou para responder às mensagens e o processo de negociação foi mais lento do que eu esperava.',
    data: '25/02/2025',
    respondido: true,
    resposta: 'Ana, peço desculpas pela demora nas respostas. Agradeço o feedback e estou trabalhando para melhorar esse aspecto do atendimento.',
    dataResposta: '26/02/2025'
  },
  {
    id: 5,
    cliente: {
      id: 105,
      nome: 'Marcos Oliveira',
      avatar: '',
    },
    imovel: {
      id: 205,
      titulo: 'Terreno em Cotia',
      tipo: 'venda'
    },
    avaliacao: 5,
    comentario: 'Muito satisfeito com o atendimento. O corretor foi transparente durante todo o processo e me ajudou a conseguir um bom preço.',
    data: '20/02/2025',
    respondido: false,
    resposta: '',
    dataResposta: null
  }
];

// Estatísticas de avaliações
const estatisticasAvaliacoes = {
  mediaGeral: 4.4,
  total: 23,
  distribuicao: [
    { estrelas: 5, quantidade: 15, percentual: 65 },
    { estrelas: 4, quantidade: 5, percentual: 22 },
    { estrelas: 3, quantidade: 2, percentual: 9 },
    { estrelas: 2, quantidade: 1, percentual: 4 },
    { estrelas: 1, quantidade: 0, percentual: 0 }
  ],
  tendencia: 'positiva',
  comparacaoMesAnterior: '+0.2'
};

export default function AvaliacoesCorretorPage() {
  const [filtroAvaliacao, setFiltroAvaliacao] = useState('todas');
  const [busca, setBusca] = useState('');
  
  // Filtro de avaliações
  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
    // Filtro por busca
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca === '' || 
      avaliacao.cliente.nome.toLowerCase().includes(termoBusca) || 
      avaliacao.imovel.titulo.toLowerCase().includes(termoBusca) ||
      avaliacao.comentario.toLowerCase().includes(termoBusca);
    
    // Filtro por avaliação
    let matchAvaliacao = filtroAvaliacao === 'todas';
    
    if (filtroAvaliacao === 'positivas') {
      matchAvaliacao = avaliacao.avaliacao >= 4;
    } else if (filtroAvaliacao === 'neutras') {
      matchAvaliacao = avaliacao.avaliacao === 3;
    } else if (filtroAvaliacao === 'negativas') {
      matchAvaliacao = avaliacao.avaliacao <= 2;
    } else if (filtroAvaliacao === 'nao-respondidas') {
      matchAvaliacao = !avaliacao.respondido;
    }
    
    return matchBusca && matchAvaliacao;
  });
  
  const renderEstrelas = (quantidade) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < quantidade ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} 
      />
    ));
  };
  
  return (
    <PageContainer
      title="Avaliações"
      subtitle="Gerencie e responda às avaliações dos seus clientes"
    >
      <div className="space-y-6">
        {/* Visão geral */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Acompanhe sua reputação e o feedback dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Estatísticas gerais */}
              <div>
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg space-y-3">
                  <div className="text-4xl font-bold text-primary">{estatisticasAvaliacoes.mediaGeral.toFixed(1)}</div>
                  <div className="flex">
                    {renderEstrelas(Math.round(estatisticasAvaliacoes.mediaGeral))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado em {estatisticasAvaliacoes.total} avaliações
                  </p>
                  <div className="flex items-center text-xs">
                    <TrendingUp className={`h-3.5 w-3.5 mr-1 ${estatisticasAvaliacoes.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}`} />
                    <span className={estatisticasAvaliacoes.tendencia === 'positiva' ? 'text-green-500' : 'text-destructive'}>
                      {estatisticasAvaliacoes.comparacaoMesAnterior} em relação ao mês anterior
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Distribuição de estrelas */}
              <div className="md:col-span-2">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-sm font-medium mb-4">Distribuição das avaliações</h3>
                  <div className="space-y-2">
                    {estatisticasAvaliacoes.distribuicao.map((item) => (
                      <div key={item.estrelas} className="flex items-center">
                        <div className="flex w-24 items-center">
                          <span className="text-sm mr-1">{item.estrelas}</span>
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        </div>
                        <div className="relative flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute h-full bg-amber-500 rounded-full"
                            style={{ width: `${item.percentual}%` }}
                          ></div>
                        </div>
                        <span className="text-sm ml-2 w-12">{item.percentual}%</span>
                        <span className="text-xs text-muted-foreground ml-2 w-10">({item.quantidade})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Filtro e busca */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente, imóvel ou comentário..."
                className="pl-8 w-full"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <BarChart4 className="h-4 w-4 mr-2" />
            Relatório Detalhado
          </Button>
        </div>
        
        {/* Listagem de avaliações */}
        <Tabs defaultValue="todas" onValueChange={setFiltroAvaliacao}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="positivas">Positivas</TabsTrigger>
            <TabsTrigger value="neutras">Neutras</TabsTrigger>
            <TabsTrigger value="negativas">Negativas</TabsTrigger>
            <TabsTrigger value="nao-respondidas">Não Respondidas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="mt-4">
            <Card>
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Avaliações de Clientes</CardTitle>
                  <Button variant="outline" size="sm" className="flex gap-1 text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Ordenar
                  </Button>
                </div>
                <CardDescription>
                  Total: {avaliacoesFiltradas.length} avaliações
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                {avaliacoesFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Star className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-center text-muted-foreground">
                      Nenhuma avaliação encontrada com os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {avaliacoesFiltradas.map((avaliacao) => (
                      <div key={avaliacao.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-muted/40">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={avaliacao.cliente.avatar} alt={avaliacao.cliente.nome} />
                                <AvatarFallback>{avaliacao.cliente.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-base">{avaliacao.cliente.nome}</h3>
                                <div className="flex items-center space-x-1">
                                  {renderEstrelas(avaliacao.avaliacao)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {avaliacao.data}
                              </div>
                              <div className="flex items-center mt-1 text-xs">
                                <Home className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">Imóvel: </span>
                                <span className="ml-1">{avaliacao.imovel.titulo}</span>
                                <Badge variant={avaliacao.imovel.tipo === 'venda' ? 'default' : 'secondary'} className="ml-2 px-1.5 py-0 text-[10px]">
                                  {avaliacao.imovel.tipo === 'venda' ? 'Venda' : 'Locação'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <p className="text-sm">{avaliacao.comentario}</p>
                        </div>
                        
                        {avaliacao.respondido && (
                          <div className="px-4 py-3 bg-muted/20 border-t">
                            <div className="flex items-start">
                              <div className="w-8 flex justify-center">
                                <MessageSquare className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium mb-1">Sua resposta • {avaliacao.dataResposta}</p>
                                <p className="text-sm">{avaliacao.resposta}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/10 border-t">
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={avaliacao.avaliacao >= 4 ? 'success' : avaliacao.avaliacao === 3 ? 'warning' : 'destructive'} 
                              className="px-2 py-0 h-5"
                            >
                              {avaliacao.avaliacao >= 4 ? (
                                <ThumbsUp className="h-3 w-3 mr-1" />
                              ) : avaliacao.avaliacao === 3 ? null : (
                                <ThumbsDown className="h-3 w-3 mr-1" />
                              )}
                              {avaliacao.avaliacao >= 4 
                                ? 'Positiva' 
                                : avaliacao.avaliacao === 3 
                                  ? 'Neutra' 
                                  : 'Negativa'}
                            </Badge>
                            
                            {!avaliacao.respondido && (
                              <Badge variant="outline" className="px-2 py-0 h-5 text-[10px]">
                                Aguardando resposta
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            {!avaliacao.respondido ? (
                              <Button variant="default" size="sm" className="h-7 px-3 text-xs">
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                Responder
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                Editar Resposta
                              </Button>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 px-2">
                                  •••
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                <DropdownMenuItem>Ver perfil do cliente</DropdownMenuItem>
                                <DropdownMenuItem>Ver histórico do imóvel</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Reportar avaliação
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {avaliacoesFiltradas.length} de {avaliacoes.length} avaliações
                </div>
                <div className="flex items-center space-x-6">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="positivas" className="mt-4">
            {/* Conteúdo da aba Positivas - carregado dinamicamente pelo filtro */}
          </TabsContent>
          
          <TabsContent value="neutras" className="mt-4">
            {/* Conteúdo da aba Neutras - carregado dinamicamente pelo filtro */}
          </TabsContent>
          
          <TabsContent value="negativas" className="mt-4">
            {/* Conteúdo da aba Negativas - carregado dinamicamente pelo filtro */}
          </TabsContent>
          
          <TabsContent value="nao-respondidas" className="mt-4">
            {/* Conteúdo da aba Não Respondidas - carregado dinamicamente pelo filtro */}
          </TabsContent>
        </Tabs>
        
        {/* Dicas para melhorar avaliações */}
        <Card>
          <CardHeader>
            <CardTitle>Melhores Práticas</CardTitle>
            <CardDescription>
              Dicas para melhorar suas avaliações e feedback dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Responda rapidamente às avaliações</h4>
                  <p className="text-sm text-muted-foreground">
                    Responder a todas as avaliações, especialmente as negativas, demonstra comprometimento com a satisfação do cliente.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Solicite avaliações após cada transação</h4>
                  <p className="text-sm text-muted-foreground">
                    Clientes satisfeitos geralmente deixam boas avaliações quando solicitados. Não perca a oportunidade!
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Aprenda com o feedback negativo</h4>
                  <p className="text-sm text-muted-foreground">
                    Use críticas como oportunidade para melhorar seu serviço. Identifique padrões e trabalhe para resolver problemas recorrentes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
