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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreHorizontal,
  Filter,
  Flag,
  CheckCircle2,
  Clock,
  BarChart4,
  ArrowUpRight,
  Share2,
  ChevronRight,
  User,
  Heart,
  Building2,
  Calendar,
  PenLine as Edit
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dados fictícios para demonstração
const avaliacoes = [
  {
    id: 1,
    cliente: 'João Silva',
    avatar: '',
    avaliacao: 5,
    titulo: 'Excelente atendimento!',
    comentario: 'Fui muito bem atendido pelo corretor Carlos. Ele entendeu exatamente o que eu procurava e me apresentou opções perfeitas. Consegui encontrar meu apartamento ideal em apenas duas visitas!',
    data: '2025-03-10',
    status: 'publicada',
    resposta: {
      texto: 'Obrigado pela avaliação, João! Ficamos muito felizes em poder ajudar na conquista do seu imóvel. Conte conosco para o que precisar!',
      data: '2025-03-11'
    },
    corretor: 'Carlos Silva',
    imovel: 'Apartamento - Jardins',
    curtidas: 3
  },
  {
    id: 2,
    cliente: 'Amanda Oliveira',
    avatar: '',
    avaliacao: 4,
    titulo: 'Ótimo serviço, mas demorou um pouco',
    comentario: 'A imobiliária tem excelentes opções e o corretor foi muito atencioso. Único ponto foi a demora para retornarem alguns contatos iniciais, mas depois que o processo começou tudo correu bem.',
    data: '2025-03-08',
    status: 'publicada',
    resposta: null,
    corretor: 'Ana Santos',
    imovel: 'Casa - Alphaville',
    curtidas: 1
  },
  {
    id: 3,
    cliente: 'Ricardo Pereira',
    avatar: '',
    avaliacao: 5,
    titulo: 'Serviço impecável!',
    comentario: 'Todo o processo de compra foi extremamente transparente e profissional. A documentação foi tratada com agilidade e não tive nenhuma surpresa. Recomendo fortemente esta imobiliária.',
    data: '2025-03-05',
    status: 'publicada',
    resposta: {
      texto: 'Ricardo, agradecemos sua confiança em nosso trabalho! Estamos sempre buscando oferecer o melhor serviço aos nossos clientes.',
      data: '2025-03-06'
    },
    corretor: 'Juliana Costa',
    imovel: 'Apartamento - Moema',
    curtidas: 5
  },
  {
    id: 4,
    cliente: 'Fernanda Lima',
    avatar: '',
    avaliacao: 3,
    titulo: 'Serviço ok, mas poderia melhorar',
    comentario: 'O atendimento foi bom, mas tive alguns problemas de comunicação durante o processo. Nem todas as informações sobre o imóvel estavam claras no início, o que gerou algumas idas e vindas desnecessárias.',
    data: '2025-03-02',
    status: 'publicada',
    resposta: {
      texto: 'Olá Fernanda, agradecemos seu feedback. Pedimos desculpas pelos problemas de comunicação e já estamos trabalhando para melhorar este aspecto do nosso atendimento. Ficamos à disposição para qualquer necessidade futura.',
      data: '2025-03-03'
    },
    corretor: 'Marcos Oliveira',
    imovel: 'Apartamento - Perdizes',
    curtidas: 0
  },
  {
    id: 5,
    cliente: 'Paulo Mendes',
    avatar: '',
    avaliacao: 1,
    titulo: 'Experiência muito frustrante',
    comentario: 'Infelizmente minha experiência foi péssima. O imóvel tinha vários problemas que não foram informados na visita e só descobri depois de fechar o contrato. Além disso, o suporte pós-venda é praticamente inexistente.',
    data: '2025-02-28',
    status: 'pendente',
    resposta: null,
    corretor: 'Roberto Almeida',
    imovel: 'Casa - Morumbi',
    curtidas: 0
  },
  {
    id: 6,
    cliente: 'Renata Sousa',
    avatar: '',
    avaliacao: 5,
    titulo: 'Melhor imobiliária da região!',
    comentario: 'Já é a segunda vez que fecho negócio com esta imobiliária e, novamente, fiquei extremamente satisfeita. Profissionais sérios, comprometidos e que realmente se preocupam com a satisfação do cliente.',
    data: '2025-02-25',
    status: 'publicada',
    resposta: {
      texto: 'Renata, muito obrigado pela confiança renovada! É um prazer poder atendê-la novamente e estamos felizes que tenha ficado satisfeita. Estamos sempre à disposição!',
      data: '2025-02-26'
    },
    corretor: 'Ana Santos',
    imovel: 'Apartamento - Vila Nova Conceição',
    curtidas: 4
  }
];

export default function AvaliacoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');
  
  // Métricas calculadas
  const avaliacaoMedia = avaliacoes
    .filter(a => a.status === 'publicada')
    .reduce((acc, curr) => acc + curr.avaliacao, 0) / 
    avaliacoes.filter(a => a.status === 'publicada').length;
  
  const totalAvaliacoes = avaliacoes.filter(a => a.status === 'publicada').length;
  const avaliacoesPorEstrela = [5, 4, 3, 2, 1].map(estrela => {
    const quantidade = avaliacoes
      .filter(a => a.status === 'publicada' && a.avaliacao === estrela)
      .length;
    const percentual = totalAvaliacoes ? (quantidade / totalAvaliacoes) * 100 : 0;
    return { estrela, quantidade, percentual };
  });
  
  const avaliacoesPendentes = avaliacoes.filter(a => a.status === 'pendente').length;
  const avaliacoesSemResposta = avaliacoes
    .filter(a => a.status === 'publicada' && !a.resposta)
    .length;
  
  // Filtrar avaliações baseado na busca e na aba ativa
  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    // Filtro de busca
    const matchesSearch = 
      avaliacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.comentario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.corretor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.imovel.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de aba
    let matchesTab = true;
    if (activeTab === 'positivas') {
      matchesTab = avaliacao.avaliacao >= 4;
    } else if (activeTab === 'medianas') {
      matchesTab = avaliacao.avaliacao === 3;
    } else if (activeTab === 'negativas') {
      matchesTab = avaliacao.avaliacao <= 2;
    } else if (activeTab === 'pendentes') {
      matchesTab = avaliacao.status === 'pendente';
    } else if (activeTab === 'sem-resposta') {
      matchesTab = avaliacao.status === 'publicada' && !avaliacao.resposta;
    }
    
    return matchesSearch && matchesTab;
  });

  // Função para formatador de data
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Renderizar estrelas
  const renderizarEstrelas = (avaliacao: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < avaliacao ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} 
      />
    ));
  };

  return (
    <PageContainer
      title="Avaliações"
      subtitle="Gerencie as avaliações dos clientes sobre sua imobiliária"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel esquerdo - Resumo e métricas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de pontuação geral */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pontuação Geral</CardTitle>
              <CardDescription>
                Baseada em {totalAvaliacoes} avaliações
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center flex-col mb-6">
                <div className="text-5xl font-bold flex items-center">
                  {avaliacaoMedia.toFixed(1)}
                  <Star className="h-10 w-10 text-amber-500 fill-amber-500 ml-2" />
                </div>
                <div className="flex mt-2">
                  {renderizarEstrelas(Math.round(avaliacaoMedia))}
                </div>
              </div>
              
              <div className="space-y-3">
                {avaliacoesPorEstrela.map((item) => (
                  <div key={item.estrela} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">{item.estrela}</span>
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500 ml-1" />
                      </div>
                      <span className="text-muted-foreground">{item.quantidade} avaliações</span>
                    </div>
                    <Progress value={item.percentual} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" className="gap-1">
                <BarChart4 className="h-4 w-4" />
                Ver Relatório Completo
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de métricas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Métricas de Avaliações</CardTitle>
              <CardDescription>
                Resumo do desempenho recente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-green-500/10">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Avaliações Positivas</div>
                      <div className="text-sm text-muted-foreground">4-5 estrelas</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {avaliacoes.filter(a => a.status === 'publicada' && a.avaliacao >= 4).length}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md bg-amber-500/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="font-medium">Avaliações Pendentes</div>
                      <div className="text-sm text-muted-foreground">Aguardando aprovação</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {avaliacoesPendentes}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md bg-red-500/10">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">Sem Resposta</div>
                      <div className="text-sm text-muted-foreground">Precisam de atenção</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {avaliacoesSemResposta}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">
                Solicitar Avaliações
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de melhores corretores */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Melhores Avaliados</CardTitle>
              <CardDescription>
                Corretores com melhor desempenho
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {['Carlos Silva', 'Ana Santos', 'Juliana Costa'].map((corretor, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{corretor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{corretor}</div>
                        <div className="flex items-center">
                          {renderizarEstrelas(5 - index * 0.3)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Painel direito - Lista de avaliações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho com pesquisa e botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 mb-0 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar avaliações..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Criar Campanha
              </Button>
            </div>
          </div>
          
          {/* Abas e conteúdo principal */}
          <Tabs defaultValue="todas" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="positivas">Positivas</TabsTrigger>
              <TabsTrigger value="medianas">Medianas</TabsTrigger>
              <TabsTrigger value="negativas">Negativas</TabsTrigger>
              <TabsTrigger value="pendentes" className="relative">
                Pendentes
                {avaliacoesPendentes > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {avaliacoesPendentes}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sem-resposta">Sem Resposta</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredAvaliacoes.length > 0 ? (
                <div className="space-y-6">
                  {filteredAvaliacoes.map((avaliacao) => (
                    <Card key={avaliacao.id} className={
                      avaliacao.status === 'pendente' ? 'border-amber-200' :
                      avaliacao.avaliacao >= 4 ? 'border-green-200' :
                      avaliacao.avaliacao <= 2 ? 'border-red-200' : ''
                    }>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{avaliacao.cliente.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{avaliacao.cliente}</div>
                              <div className="flex text-sm text-muted-foreground">
                                <span>{formatarData(avaliacao.data)}</span>
                                {avaliacao.status === 'pendente' && (
                                  <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
                                    Pendente
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex">
                              {renderizarEstrelas(avaliacao.avaliacao)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">{avaliacao.titulo}</h3>
                            <p className="text-sm mt-1">{avaliacao.comentario}</p>
                          </div>
                          
                          {avaliacao.resposta && (
                            <div className="bg-muted/50 p-3 rounded-md border-l-4 border-primary">
                              <p className="text-sm">{avaliacao.resposta.texto}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Respondido em {formatarData(avaliacao.resposta.data)}
                                </span>
                                <span className="text-xs font-medium">Sua Imobiliária</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="flex text-xs text-muted-foreground gap-3">
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{avaliacao.corretor}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                <span>{avaliacao.imovel}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-xs gap-3">
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>{avaliacao.curtidas}</span>
                              </button>
                              <button className="text-muted-foreground hover:text-foreground">
                                <Flag className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        {!avaliacao.resposta ? (
                          <Button size="sm" className="gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Responder
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Editar Resposta
                          </Button>
                        )}
                        
                        <div className="flex gap-1">
                          {avaliacao.status === 'pendente' && (
                            <>
                              <Button variant="outline" size="sm" className="gap-1">
                                <ThumbsDown className="h-4 w-4" />
                                Rejeitar
                              </Button>
                              <Button size="sm" className="gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                Aprovar
                              </Button>
                            </>
                          )}
                          {avaliacao.status === 'publicada' && (
                            <>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Share2 className="h-4 w-4" />
                                Compartilhar
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma avaliação encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      {activeTab === 'todas' 
                        ? 'Não há avaliações que correspondam à sua busca.'
                        : activeTab === 'pendentes'
                          ? 'Não há avaliações pendentes no momento.'
                          : activeTab === 'sem-resposta'
                            ? 'Todas as avaliações foram respondidas.'
                            : `Não há avaliações ${activeTab} que correspondam à sua busca.`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
