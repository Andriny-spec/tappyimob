'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  PenLine as Edit
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Interface para tipar as avaliações
interface Avaliacao {
  id: string;
  nome: string;
  email?: string;
  comentario: string;
  nota: number;
  imovelId?: string;
  imovel?: {
    id: string;
    titulo: string;
    endereco: string;
  };
  status: 'pendente' | 'publicada' | 'rejeitada';
  resposta?: {
    texto: string;
    data: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

// Estado inicial vazio - sem dados mockados
const initialAvaliacoes: Avaliacao[] = [];

export default function AvaliacoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(initialAvaliacoes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar avaliações da API
  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/avaliacoes');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar avaliações');
        }
        
        const data = await response.json();
        setAvaliacoes(data.avaliacoes || []);
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err);
        setError('Não foi possível carregar as avaliações. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvaliacoes();
  }, []);
  
  // Métricas calculadas
  const totalAvaliacoes = avaliacoes.filter(a => a.status === 'publicada').length;
  
  const avaliacaoMedia = totalAvaliacoes 
    ? avaliacoes
        .filter(a => a.status === 'publicada')
        .reduce((acc, curr) => acc + curr.nota, 0) / totalAvaliacoes
    : 0;
  
  const avaliacoesPorEstrela = [5, 4, 3, 2, 1].map(estrela => {
    const quantidade = avaliacoes
      .filter(a => a.status === 'publicada' && a.nota === estrela)
      .length;
    const percentual = totalAvaliacoes ? (quantidade / totalAvaliacoes) * 100 : 0;
    return { estrela, quantidade, percentual };
  });
  
  const avaliacoesPendentes = avaliacoes.filter(a => a.status === 'pendente').length;
  const avaliacoesSemResposta = avaliacoes
    .filter(a => a.status === 'publicada' && !a.resposta)
    .length;
  
  // Formatador de data
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };
  
  // Renderizar estrelas
  const renderizarEstrelas = (avaliacao: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < avaliacao ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  // Filtrar avaliações baseado na busca e na aba ativa
  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    // Filtro de busca
    const matchesSearch = 
      avaliacao.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.imovel?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.imovel?.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    // Filtro de aba
    let matchesTab = true;
    if (activeTab === 'positivas') {
      matchesTab = avaliacao.nota >= 4;
    } else if (activeTab === 'medianas') {
      matchesTab = avaliacao.nota === 3;
    } else if (activeTab === 'negativas') {
      matchesTab = avaliacao.nota <= 2;
    } else if (activeTab === 'pendentes') {
      matchesTab = avaliacao.status === 'pendente';
    } else if (activeTab === 'sem-resposta') {
      matchesTab = avaliacao.status === 'publicada' && !avaliacao.resposta;
    }
    
    return matchesSearch && matchesTab;
  });

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie as avaliações de clientes sobre seus imóveis e serviços
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel esquerdo - Estatísticas */}
        <div className="space-y-6">
          {/* Card de resumo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumo das Avaliações</CardTitle>
              <CardDescription>
                Visão geral da satisfação dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {totalAvaliacoes === 0 ? '-' : avaliacaoMedia.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Nota média de {totalAvaliacoes} avaliações
                </div>
                <div className="flex justify-center mt-2">
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
                Ver Relatório
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
              <CardTitle>Métricas</CardTitle>
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
                    {avaliacoes.filter(a => a.status === 'publicada' && a.nota >= 4).length}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Erro</h3>
                  <p className="text-muted-foreground">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : filteredAvaliacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-muted-foreground max-w-md">
                    {searchTerm || activeTab !== 'todas' 
                      ? 'Nenhuma avaliação corresponde aos filtros aplicados. Tente outros critérios de busca.' 
                      : 'Você ainda não recebeu nenhuma avaliação. Quando os clientes avaliarem sua imobiliária ou imóveis, elas aparecerão aqui.'}
                  </p>
                  {searchTerm || activeTab !== 'todas' ? (
                    <Button variant="outline" className="mt-4" onClick={() => {
                      setSearchTerm('');
                      setActiveTab('todas');
                    }}>
                      Limpar filtros
                    </Button>
                  ) : null}
                </div>
              ) : (
                // Lista de avaliações
                filteredAvaliacoes.map((avaliacao) => (
                  <Card key={avaliacao.id} className="mb-4 overflow-hidden">
                    <CardHeader className="pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{avaliacao.nome?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{avaliacao.nome}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatarData(avaliacao.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < avaliacao.nota ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3 pt-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">
                          {avaliacao.imovel?.titulo ? `Avaliação para: ${avaliacao.imovel.titulo}` : 'Avaliação'}
                        </h4>
                        <Badge 
                          variant={avaliacao.status === 'publicada' ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {avaliacao.status === 'publicada' ? 'Publicada' : 'Pendente'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        {avaliacao.comentario}
                      </p>
                      
                      {avaliacao.imovel && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{avaliacao.imovel.endereco}</span>
                        </div>
                      )}
                    </CardContent>
                    
                    {avaliacao.resposta && (
                      <div className="bg-muted/30 px-6 py-3 mt-1">
                        <div className="flex gap-2 items-start">
                          <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <h5 className="text-sm font-medium">Resposta da imobiliária</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {avaliacao.resposta.texto}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              {formatarData(avaliacao.resposta.data)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <CardFooter className="border-t py-3 flex justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                          <Flag className="h-4 w-4 mr-1" />
                          <span className="text-xs">Denunciar</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {!avaliacao.resposta && (
                          <Button variant="outline" size="sm" className="h-8">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span className="text-xs">Responder</span>
                          </Button>
                        )}
                        {avaliacao.status === 'pendente' ? (
                          <>
                            <Button variant="outline" size="sm" className="h-8">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              <span className="text-xs">Rejeitar</span>
                            </Button>
                            <Button variant="default" size="sm" className="h-8">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span className="text-xs">Aprovar</span>
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
