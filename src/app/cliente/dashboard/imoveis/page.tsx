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
  Building2,
  Home,
  Search,
  Key,
  DollarSign,
  Calendar,
  MapPin,
  Landmark,
  ArrowUpDown,
  FileText,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Filter,
  Plus,
  Heart,
  MessagesSquare,
  Share,
  Camera,
  Wallet
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Dados simulados
const meusImoveis = [
  {
    id: 1,
    tipo: 'Apartamento',
    endereco: 'Rua Augusta, 789 - Consolação, São Paulo',
    status: 'alugado',
    valor: 'R$ 4.200/mês',
    inicioContrato: '15/01/2024',
    vencimento: '15/07/2024',
    area: '85m²',
    quartos: 2,
    vagas: 1,
    contrato: 'Aluguel',
    possuiPendencias: false,
    proximoPagamento: '15/06/2024'
  },
  {
    id: 2,
    tipo: 'Comercial',
    endereco: 'Av. Berrini, 120 - Brooklin, São Paulo',
    status: 'processo',
    valor: 'R$ 820.000',
    inicioContrato: '-',
    vencimento: '-',
    area: '120m²',
    quartos: 0,
    vagas: 2,
    contrato: 'Compra',
    possuiPendencias: true,
    proximoPagamento: '-'
  }
];

const imoveisFavoritos = [
  {
    id: 101,
    tipo: 'Apartamento',
    titulo: 'Apartamento Vila Olímpia',
    endereco: 'Rua Casa do Ator, 850 - Vila Olímpia, São Paulo',
    valor: 'R$ 960.000',
    area: '110m²',
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    operacao: 'Venda'
  },
  {
    id: 102,
    tipo: 'Casa',
    titulo: 'Casa Alto de Pinheiros',
    endereco: 'Rua Pedroso Alvarenga, 123 - Alto de Pinheiros, São Paulo',
    valor: 'R$ 1.850.000',
    area: '220m²',
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    operacao: 'Venda'
  },
  {
    id: 103,
    tipo: 'Apartamento',
    titulo: 'Loft Perdizes',
    endereco: 'Rua Cardoso de Almeida, 456 - Perdizes, São Paulo',
    valor: 'R$ 3.900/mês',
    area: '75m²',
    quartos: 1,
    banheiros: 1,
    vagas: 1,
    operacao: 'Aluguel'
  },
  {
    id: 104,
    tipo: 'Comercial',
    titulo: 'Conjunto Comercial Paulista',
    endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo',
    valor: 'R$ 9.800/mês',
    area: '95m²',
    quartos: 0,
    banheiros: 2,
    vagas: 2,
    operacao: 'Aluguel'
  },
  {
    id: 105,
    tipo: 'Apartamento',
    titulo: 'Studio Itaim',
    endereco: 'Rua João Cachoeira, 555 - Itaim Bibi, São Paulo',
    valor: 'R$ 650.000',
    area: '45m²',
    quartos: 1,
    banheiros: 1,
    vagas: 1,
    operacao: 'Venda'
  }
];

export default function ImoveisClientePage() {
  const [visualizacao, setVisualizacao] = useState('meus-imoveis');
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  
  return (
    <PageContainer
      title="Meus Imóveis"
      subtitle="Gerencie seus imóveis contratados e favoritos"
    >
      <div className="space-y-6">
        {/* Tabs principais */}
        <Tabs 
          value={visualizacao} 
          onValueChange={setVisualizacao}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList className="mb-0">
              <TabsTrigger value="meus-imoveis">Meus Imóveis</TabsTrigger>
              <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
              <TabsTrigger value="buscar">Buscar Imóveis</TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar imóveis..."
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Meus Imóveis */}
          <TabsContent value="meus-imoveis" className="space-y-4">
            {/* Filtro de status */}
            <div className="flex overflow-auto pb-2 gap-2">
              <Button 
                variant={statusFiltro === 'todos' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFiltro('todos')}
              >
                Todos
              </Button>
              <Button 
                variant={statusFiltro === 'alugados' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFiltro('alugados')}
              >
                Alugados
              </Button>
              <Button 
                variant={statusFiltro === 'proprios' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFiltro('proprios')}
              >
                Próprios
              </Button>
              <Button 
                variant={statusFiltro === 'processo' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFiltro('processo')}
              >
                Em Processo
              </Button>
              <Button 
                variant={statusFiltro === 'pendencias' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFiltro('pendencias')}
              >
                Com Pendências
              </Button>
            </div>
            
            {/* Lista de imóveis */}
            {meusImoveis.length > 0 ? (
              <div className="space-y-4">
                {meusImoveis.map((imovel) => (
                  <Card key={imovel.id}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-[200px] h-[200px] md:h-full bg-muted flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                        
                        <div className="p-6 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">{imovel.tipo}</h3>
                                <Badge 
                                  className={
                                    imovel.status === 'alugado' ? 'bg-blue-500' :
                                    imovel.status === 'processo' ? 'bg-amber-500' :
                                    'bg-green-500'
                                  }
                                >
                                  {imovel.status === 'alugado' ? 'Alugado' :
                                   imovel.status === 'processo' ? 'Em Processo' :
                                   'Próprio'}
                                </Badge>
                                {imovel.possuiPendencias && (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                                    Pendência
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">{imovel.endereco}</p>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold">{imovel.valor}</div>
                              <div className="text-sm text-muted-foreground">
                                Contrato: {imovel.contrato}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Início do Contrato</span>
                              <span className="font-medium">{imovel.inicioContrato}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Vencimento</span>
                              <span className="font-medium">{imovel.vencimento}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Próximo Pagamento</span>
                              <span className="font-medium">{imovel.proximoPagamento}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{imovel.area}</span>
                            </div>
                            {imovel.quartos > 0 && (
                              <div className="flex items-center text-sm">
                                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{imovel.quartos} {imovel.quartos === 1 ? 'quarto' : 'quartos'}</span>
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <Key className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{imovel.vagas} {imovel.vagas === 1 ? 'vaga' : 'vagas'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button>
                              Ver Detalhes
                            </Button>
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              Documentos
                            </Button>
                            <Button variant="outline">
                              <Wallet className="h-4 w-4 mr-2" />
                              Financeiro
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <MessagesSquare className="h-4 w-4 mr-2" />
                                  Contatar Corretor
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Agendar Visita
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Camera className="h-4 w-4 mr-2" />
                                  Solicitar Vistoria
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Reportar Problema
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">Nenhum imóvel encontrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Você ainda não possui imóveis cadastrados.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Buscar Imóveis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Favoritos */}
          <TabsContent value="favoritos" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imoveisFavoritos.map((imovel) => (
                <Card key={imovel.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 h-8 w-8 text-red-500"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`
                          ${imovel.operacao === 'Venda' 
                            ? 'bg-blue-500/10 text-blue-600 border-blue-200' 
                            : 'bg-green-500/10 text-green-600 border-green-200'}`
                        }>
                          {imovel.operacao}
                        </Badge>
                        <span className="text-sm font-medium">
                          {imovel.valor}
                        </span>
                      </div>
                      
                      <h3 className="font-medium">{imovel.titulo}</h3>
                      <p className="text-xs text-muted-foreground">
                        {imovel.endereco}
                      </p>
                      
                      <div className="flex text-xs text-muted-foreground gap-3 pt-1">
                        <span>{imovel.area}</span>
                        {imovel.quartos > 0 && (
                          <span>{imovel.quartos} {imovel.quartos === 1 ? 'quarto' : 'quartos'}</span>
                        )}
                        <span>{imovel.vagas} {imovel.vagas === 1 ? 'vaga' : 'vagas'}</span>
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
          </TabsContent>
          
          {/* Buscar Imóveis */}
          <TabsContent value="buscar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Busca Avançada</CardTitle>
                <CardDescription>
                  Encontre o imóvel ideal para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Operação</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Todos</option>
                      <option value="compra">Compra</option>
                      <option value="aluguel">Aluguel</option>
                      <option value="temporada">Temporada</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Imóvel</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Todos</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="comercial">Comercial</option>
                      <option value="terreno">Terreno</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Localização</label>
                    <Input type="text" placeholder="Bairro, cidade ou região" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Mínimo</label>
                    <Input type="text" placeholder="R$" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Máximo</label>
                    <Input type="text" placeholder="R$" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Área Mínima</label>
                    <Input type="text" placeholder="m²" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quartos</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Qualquer</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vagas de Garagem</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Qualquer</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Características</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Selecione</option>
                      <option value="piscina">Piscina</option>
                      <option value="academia">Academia</option>
                      <option value="churrasqueira">Churrasqueira</option>
                      <option value="pet">Aceita Pet</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Limpar Filtros
                </Button>
                <Button className="w-full sm:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Imóveis
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recomendações para você</CardTitle>
                <CardDescription>
                  Imóveis selecionados com base no seu perfil
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
                              {item === 1 ? 'R$ 750.000' : item === 2 ? 'R$ 4.500/mês' : 'R$ 1.100.000'}
                            </span>
                          </div>
                          <h3 className="font-medium">
                            {item === 1 ? 'Apartamento Moema' : item === 2 ? 'Casa Vila Madalena' : 'Cobertura Brooklin'}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {item === 1 ? 'Alameda dos Nhambiquaras, 1200 - Moema' : 
                             item === 2 ? 'Rua Girassol, 555 - Vila Madalena' : 
                             'Rua Michigan, 789 - Brooklin'}
                          </p>
                          <div className="flex text-xs text-muted-foreground gap-3">
                            <span>{item === 1 ? '3 quartos' : item === 2 ? '4 quartos' : '3 quartos'}</span>
                            <span>{item === 1 ? '2 vagas' : item === 2 ? '3 vagas' : '3 vagas'}</span>
                            <span>{item === 1 ? '98m²' : item === 2 ? '190m²' : '150m²'}</span>
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
                  Ver mais imóveis
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
